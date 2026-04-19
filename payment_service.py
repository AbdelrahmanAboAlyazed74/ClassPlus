"""
NAIB — Egyptian Payment Gateway Service
========================================
Supports: Paymob (primary) · Fawry · InstaPay

All gateways follow the same PaymentGateway interface.
Swap providers by changing ACTIVE_GATEWAY in config.
"""

from __future__ import annotations
import hashlib
import hmac
import json
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────────
# Shared Types
# ─────────────────────────────────────────────

class PaymentStatus(str, Enum):
    PENDING   = "pending"
    SUCCESS   = "success"
    FAILED    = "failed"
    REFUNDED  = "refunded"


@dataclass
class PaymentRequest:
    booking_id:     str
    teacher_id:     str
    amount_egp:     float           # Total amount to pay teacher
    teacher_phone:  str             # For Fawry / InstaPay
    teacher_iban:   Optional[str]   # For bank transfer
    description:    str = ""


@dataclass
class PaymentResponse:
    status:         PaymentStatus
    transaction_id: str
    gateway:        str
    amount_egp:     float
    message:        str
    raw_response:   Optional[dict] = None


# ─────────────────────────────────────────────
# Abstract Base
# ─────────────────────────────────────────────

class PaymentGateway(ABC):
    """All gateways must implement these two methods."""

    @abstractmethod
    def initiate_payout(self, request: PaymentRequest) -> PaymentResponse:
        """Send money to the teacher after session completion."""
        ...

    @abstractmethod
    def verify_webhook(self, payload: dict, signature: str) -> bool:
        """Verify incoming webhook authenticity."""
        ...


# ─────────────────────────────────────────────
# Paymob Gateway  (Primary — most widely used in Egypt)
# https://developers.paymob.com
# ─────────────────────────────────────────────

class PaymobGateway(PaymentGateway):
    """
    Paymob Accept — used for both collections and disbursements.
    In production, set these via environment variables:
        PAYMOB_API_KEY, PAYMOB_HMAC_SECRET, PAYMOB_DISBURSE_PROFILE_ID
    """

    BASE_URL = "https://accept.paymob.com/api"

    def __init__(
        self,
        api_key:       str,
        hmac_secret:   str,
        profile_id:    str,   # Disbursement profile ID from Paymob dashboard
    ):
        self.api_key     = api_key
        self.hmac_secret = hmac_secret
        self.profile_id  = profile_id

    def _authenticate(self) -> str:
        """Step 1 of Paymob flow — get auth token."""
        # PRODUCTION: POST https://accept.paymob.com/api/auth/tokens
        # Returns: {"token": "<jwt>"}
        # STUB for MVP:
        return "PAYMOB_AUTH_TOKEN_STUB"

    def initiate_payout(self, request: PaymentRequest) -> PaymentResponse:
        """
        Paymob Disbursement API:
        POST /acceptance/disbursements
        """
        auth_token = self._authenticate()

        payload = {
            "profile_id":   self.profile_id,
            "amount_cents": int(request.amount_egp * 100),
            "currency":     "EGP",
            "description":  f"NAIB Payout - Booking {request.booking_id}",
            "receiver": {
                "type":  "mobile_wallet",
                "phone": request.teacher_phone,
            },
            "metadata": {
                "booking_id": request.booking_id,
                "teacher_id": request.teacher_id,
            }
        }

        # ── STUB (replace with httpx/requests call in production) ──
        print(f"[Paymob] Initiating payout: {json.dumps(payload, indent=2)}")
        # response = httpx.post(f"{self.BASE_URL}/acceptance/disbursements",
        #                       json=payload,
        #                       headers={"Authorization": f"Bearer {auth_token}"})
        # data = response.json()

        # Simulated success:
        return PaymentResponse(
            status         = PaymentStatus.SUCCESS,
            transaction_id = f"paymob_{int(time.time())}",
            gateway        = "Paymob",
            amount_egp     = request.amount_egp,
            message        = "Payout initiated successfully",
            raw_response   = payload,
        )

    def verify_webhook(self, payload: dict, signature: str) -> bool:
        """
        Paymob HMAC verification.
        Concatenate specific fields in the exact order Paymob specifies,
        then HMAC-SHA512 with your secret.
        """
        fields = [
            str(payload.get("amount_cents", "")),
            str(payload.get("created_at", "")),
            str(payload.get("currency", "")),
            str(payload.get("error_occured", "")),
            str(payload.get("has_parent_transaction", "")),
            str(payload.get("id", "")),
            str(payload.get("integration_id", "")),
            str(payload.get("is_3d_secure", "")),
            str(payload.get("is_auth", "")),
            str(payload.get("is_capture", "")),
            str(payload.get("is_refunded", "")),
            str(payload.get("is_standalone_payment", "")),
            str(payload.get("is_voided", "")),
            str(payload.get("order", "")),
            str(payload.get("owner", "")),
            str(payload.get("pending", "")),
            str(payload.get("source_data_pan", "")),
            str(payload.get("source_data_sub_type", "")),
            str(payload.get("source_data_type", "")),
            str(payload.get("success", "")),
        ]
        concat = "".join(fields)
        expected = hmac.new(
            self.hmac_secret.encode(), concat.encode(), hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(expected, signature)


# ─────────────────────────────────────────────
# Fawry Gateway
# https://developer.fawrystaging.com
# ─────────────────────────────────────────────

class FawryGateway(PaymentGateway):
    """
    Fawry Pay-by-code or Wallet disbursement.
    Primarily used for teachers without bank accounts.
    """

    BASE_URL = "https://www.atfawry.com/ECommerceWeb/Fawry/payments"

    def __init__(self, merchant_code: str, security_key: str):
        self.merchant_code = merchant_code
        self.security_key  = security_key

    def _sign(self, data: str) -> str:
        """Fawry uses SHA-256 of concatenated fields + security key."""
        return hashlib.sha256((data + self.security_key).encode()).hexdigest()

    def initiate_payout(self, request: PaymentRequest) -> PaymentResponse:
        """
        Fawry Disbursement / refund API.
        Teachers receive cash at any Fawry kiosk using a reference code.
        """
        ref_number = f"NAIB{request.booking_id[:8].upper()}"
        signature  = self._sign(f"{self.merchant_code}{ref_number}{int(request.amount_egp * 100)}")

        payload = {
            "merchantCode":    self.merchant_code,
            "referenceNumber": ref_number,
            "amount":          request.amount_egp,
            "customerMobile":  request.teacher_phone,
            "signature":       signature,
            "description":     f"NAIB Teacher Payout",
        }

        # STUB — replace with actual HTTP call
        print(f"[Fawry] Payout payload: {json.dumps(payload, indent=2)}")

        return PaymentResponse(
            status         = PaymentStatus.PENDING,
            transaction_id = ref_number,
            gateway        = "Fawry",
            amount_egp     = request.amount_egp,
            message        = f"Teacher can collect cash at any Fawry kiosk using code: {ref_number}",
        )

    def verify_webhook(self, payload: dict, signature: str) -> bool:
        data = f"{payload.get('merchantCode','')}{payload.get('referenceNumber','')}{payload.get('paymentAmount','')}{payload.get('paymentStatus','')}"
        return self._sign(data) == signature


# ─────────────────────────────────────────────
# InstaPay Gateway (Central Bank of Egypt — IPS)
# ─────────────────────────────────────────────

class InstaPayGateway(PaymentGateway):
    """
    InstaPay — Egypt's instant transfer network (CBE).
    Transfers happen via IPA (InstaPay Address, like a phone-linked alias).
    Currently no public API; routed via bank SDK or aggregator.
    This class wraps an aggregator (e.g., Paymob's IPS endpoint).
    """

    def __init__(self, aggregator_api_key: str):
        self.aggregator_api_key = aggregator_api_key

    def initiate_payout(self, request: PaymentRequest) -> PaymentResponse:
        payload = {
            "ipa":          request.teacher_phone,  # Phone as IPA alias
            "amount_egp":   request.amount_egp,
            "reference":    request.booking_id,
            "narration":    f"NAIB session payment",
        }
        print(f"[InstaPay] Transfer payload: {json.dumps(payload, indent=2)}")

        return PaymentResponse(
            status         = PaymentStatus.SUCCESS,
            transaction_id = f"ips_{int(time.time())}",
            gateway        = "InstaPay",
            amount_egp     = request.amount_egp,
            message        = "InstaPay transfer submitted",
        )

    def verify_webhook(self, payload: dict, signature: str) -> bool:
        # IPS webhooks depend on aggregator — implement per provider
        return True


# ─────────────────────────────────────────────
# Payment Service (Facade — used by the rest of the app)
# ─────────────────────────────────────────────

class PaymentService:
    """
    Usage:
        svc = PaymentService(gateway="paymob")
        result = svc.pay_teacher(booking_id, teacher, amount)
    """

    def __init__(self, gateway: str = "paymob"):
        self.gateway_name = gateway
        self.gateway: PaymentGateway = self._build_gateway(gateway)

    @staticmethod
    def _build_gateway(name: str) -> PaymentGateway:
        import os
        if name == "paymob":
            return PaymobGateway(
                api_key     = os.getenv("PAYMOB_API_KEY",     "STUB_KEY"),
                hmac_secret = os.getenv("PAYMOB_HMAC_SECRET", "STUB_SECRET"),
                profile_id  = os.getenv("PAYMOB_PROFILE_ID",  "STUB_PROFILE"),
            )
        elif name == "fawry":
            return FawryGateway(
                merchant_code = os.getenv("FAWRY_MERCHANT_CODE", "STUB_MERCHANT"),
                security_key  = os.getenv("FAWRY_SECURITY_KEY",  "STUB_SECURITY"),
            )
        elif name == "instapay":
            return InstaPayGateway(
                aggregator_api_key = os.getenv("INSTAPAY_API_KEY", "STUB_KEY"),
            )
        raise ValueError(f"Unknown gateway: {name}")

    def pay_teacher(
        self,
        booking_id:    str,
        teacher_id:    str,
        amount_egp:    float,
        teacher_phone: str,
        teacher_iban:  Optional[str] = None,
    ) -> PaymentResponse:
        req = PaymentRequest(
            booking_id    = booking_id,
            teacher_id    = teacher_id,
            amount_egp    = amount_egp,
            teacher_phone = teacher_phone,
            teacher_iban  = teacher_iban,
        )
        response = self.gateway.initiate_payout(req)
        print(f"[PaymentService] {response}")
        return response

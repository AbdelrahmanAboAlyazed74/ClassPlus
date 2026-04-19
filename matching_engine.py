"""
NAIB Matching Engine
====================
Finds the optimal substitute teacher for an urgent school booking request.

Scoring Formula:
    score = (proximity_score * 0.50) + (subject_score * 0.35) + (rating_score * 0.15)
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────────
# Data Models (mirrors DB schema)
# ─────────────────────────────────────────────

class SubjectArea(str, Enum):
    MATHEMATICS       = "Mathematics"
    PHYSICS           = "Physics"
    CHEMISTRY         = "Chemistry"
    BIOLOGY           = "Biology"
    ENGLISH           = "English"
    ARABIC            = "Arabic"
    COMPUTER_SCIENCE  = "Computer_Science"
    HISTORY           = "History"
    GEOGRAPHY         = "Geography"
    ECONOMICS         = "Economics"
    BUSINESS          = "Business"

class CurriculumType(str, Enum):
    IGCSE    = "IGCSE"
    AMERICAN = "American"
    NATIONAL = "National"
    IB       = "IB"
    STEM     = "STEM"


@dataclass
class Location:
    lat: float
    lng: float


@dataclass
class BookingRequest:
    school_id:          str
    school_location:    Location
    subject_needed:     SubjectArea
    curriculum_needed:  CurriculumType
    start_time:         datetime
    duration_hours:     float = 1.0
    max_distance_km:    float = 20.0    # Only consider teachers within this radius
    max_results:        int   = 5


@dataclass
class TeacherCandidate:
    id:                 str
    name:               str
    subjects:           list[SubjectArea]
    curricula:          list[CurriculumType]
    current_location:   Location
    is_available_now:   bool
    rating_avg:         float            # 0.0 – 5.0
    hourly_rate_egp:    float
    years_experience:   int
    # Computed during matching
    distance_km:        float = 0.0
    match_score:        float = 0.0
    score_breakdown:    dict  = field(default_factory=dict)


# ─────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────

class MatchingEngine:
    """
    Weights:
        proximity  50% — closer teachers are strongly preferred (urgent bookings)
        subject    35% — exact match + curriculum match
        rating     15% — quality signal
    """

    PROXIMITY_WEIGHT = 0.50
    SUBJECT_WEIGHT   = 0.35
    RATING_WEIGHT    = 0.15

    def __init__(self, max_distance_km: float = 20.0):
        self.max_distance_km = max_distance_km

    # ── Haversine Distance ──────────────────────
    @staticmethod
    def haversine_km(loc_a: Location, loc_b: Location) -> float:
        """Great-circle distance between two GPS coordinates."""
        R = 6371.0
        lat1, lng1 = math.radians(loc_a.lat), math.radians(loc_a.lng)
        lat2, lng2 = math.radians(loc_b.lat), math.radians(loc_b.lng)
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        return R * 2 * math.asin(math.sqrt(a))

    # ── Scoring Sub-functions ───────────────────
    def _proximity_score(self, distance_km: float) -> float:
        """
        Score 1.0 at distance=0, decays to 0.0 at max_distance_km.
        Uses exponential decay for more realistic urgency weighting.
        """
        if distance_km >= self.max_distance_km:
            return 0.0
        # Exponential decay: score = e^(-k*d), k tuned so score≈0.1 at max_distance
        k = -math.log(0.1) / self.max_distance_km
        return math.exp(-k * distance_km)

    @staticmethod
    def _subject_score(
        teacher: TeacherCandidate,
        request: BookingRequest,
    ) -> float:
        """
        1.0  — subject matches AND curriculum matches
        0.6  — subject matches, curriculum does NOT match
        0.0  — subject does not match at all
        """
        subject_match   = request.subject_needed  in teacher.subjects
        curriculum_match = request.curriculum_needed in teacher.curricula

        if not subject_match:
            return 0.0
        return 1.0 if curriculum_match else 0.6

    @staticmethod
    def _rating_score(rating_avg: float) -> float:
        """Normalize 0–5 rating to 0.0–1.0."""
        return max(0.0, min(rating_avg / 5.0, 1.0))

    # ── Main Match Function ─────────────────────
    def find_optimal_teachers(
        self,
        request:    BookingRequest,
        candidates: list[TeacherCandidate],
    ) -> list[TeacherCandidate]:
        """
        Filters, scores, and ranks candidate teachers for a booking request.

        Returns the top-N matched teachers, sorted by composite score DESC.
        """
        scored: list[TeacherCandidate] = []

        for teacher in candidates:
            # ── Hard Filters ──────────────────
            if not teacher.is_available_now:
                continue

            distance_km = self.haversine_km(
                request.school_location, teacher.current_location
            )
            if distance_km > self.max_distance_km:
                continue

            # Subject must at least partially match
            if request.subject_needed not in teacher.subjects:
                continue

            # ── Soft Scores ───────────────────
            teacher.distance_km = round(distance_km, 2)

            p = self._proximity_score(distance_km)
            s = self._subject_score(teacher, request)
            r = self._rating_score(teacher.rating_avg)

            teacher.match_score = round(
                p * self.PROXIMITY_WEIGHT
                + s * self.SUBJECT_WEIGHT
                + r * self.RATING_WEIGHT,
                4,
            )
            teacher.score_breakdown = {
                "proximity":  round(p, 3),
                "subject":    round(s, 3),
                "rating":     round(r, 3),
                "distance_km": teacher.distance_km,
            }
            scored.append(teacher)

        # Sort by composite score, highest first
        scored.sort(key=lambda t: t.match_score, reverse=True)
        return scored[: request.max_results]


# ─────────────────────────────────────────────
# QR Code Check-In Logic
# ─────────────────────────────────────────────

import uuid
import hashlib


class AttendanceService:
    """
    Token-based QR check-in.
    The QR code encodes:  booking_id + secret_token
    On scan, we verify the token hasn't expired and mark check-in.
    """

    TOKEN_EXPIRY_MINUTES = 30

    @staticmethod
    def generate_qr_payload(booking_id: str, qr_token: str) -> str:
        """Returns the string to be encoded in the QR image."""
        return f"naib://checkin?booking={booking_id}&token={qr_token}"

    @staticmethod
    def verify_checkin(
        booking_id:      str,
        provided_token:  str,
        stored_token:    str,
        booking_start:   datetime,
        now:             Optional[datetime] = None,
    ) -> dict:
        """
        Returns {"valid": bool, "reason": str}
        """
        now = now or datetime.utcnow()

        # 1. Token match
        if provided_token != stored_token:
            return {"valid": False, "reason": "Invalid QR token"}

        # 2. Time window: teacher can check in 15 min early → 30 min after start
        minutes_diff = (now - booking_start).total_seconds() / 60
        if minutes_diff < -15:
            return {"valid": False, "reason": "Too early — school not yet open for this booking"}
        if minutes_diff > 30:
            return {"valid": False, "reason": "QR code expired"}

        return {"valid": True, "reason": "Check-in successful"}


# ─────────────────────────────────────────────
# Demo / Smoke Test
# ─────────────────────────────────────────────

if __name__ == "__main__":
    # New Cairo school looking for a Physics teacher (IGCSE)
    request = BookingRequest(
        school_id        = "school-001",
        school_location  = Location(lat=30.0236, lng=31.4880),   # New Cairo
        subject_needed   = SubjectArea.PHYSICS,
        curriculum_needed = CurriculumType.IGCSE,
        start_time       = datetime.utcnow(),
    )

    candidates = [
        TeacherCandidate(
            id="t1", name="Ahmed Hassan",
            subjects=[SubjectArea.PHYSICS, SubjectArea.MATHEMATICS],
            curricula=[CurriculumType.IGCSE, CurriculumType.IB],
            current_location=Location(lat=30.0300, lng=31.4900),  # ~0.8 km away
            is_available_now=True, rating_avg=4.8, hourly_rate_egp=200, years_experience=7,
        ),
        TeacherCandidate(
            id="t2", name="Sara El-Sayed",
            subjects=[SubjectArea.PHYSICS],
            curricula=[CurriculumType.AMERICAN],                  # wrong curriculum
            current_location=Location(lat=30.0260, lng=31.4850),  # ~0.4 km
            is_available_now=True, rating_avg=4.5, hourly_rate_egp=180, years_experience=4,
        ),
        TeacherCandidate(
            id="t3", name="Mohamed Tarek",
            subjects=[SubjectArea.CHEMISTRY],                     # wrong subject
            curricula=[CurriculumType.IGCSE],
            current_location=Location(lat=30.0400, lng=31.5100),  # 2.5 km
            is_available_now=True, rating_avg=4.9, hourly_rate_egp=220, years_experience=10,
        ),
        TeacherCandidate(
            id="t4", name="Nour Mahmoud",
            subjects=[SubjectArea.PHYSICS, SubjectArea.BIOLOGY],
            curricula=[CurriculumType.IGCSE],
            current_location=Location(lat=30.0500, lng=31.5200),  # 4 km
            is_available_now=False,                                # unavailable
            rating_avg=4.7, hourly_rate_egp=190, years_experience=6,
        ),
    ]

    engine  = MatchingEngine(max_distance_km=20.0)
    results = engine.find_optimal_teachers(request, candidates)

    print("\n🏫  NAIB Matching Engine — Results\n" + "=" * 40)
    for rank, t in enumerate(results, 1):
        print(f"\n#{rank} {t.name}")
        print(f"   Score      : {t.match_score:.4f}")
        print(f"   Distance   : {t.distance_km} km")
        print(f"   Rate       : {t.hourly_rate_egp} EGP/hr")
        print(f"   Breakdown  : {t.score_breakdown}")

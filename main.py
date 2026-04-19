"""
NAIB — FastAPI Backend
======================
Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from matching_engine import (
    MatchingEngine, BookingRequest, TeacherCandidate,
    Location, SubjectArea, CurriculumType
)
from payment_service import PaymentService, PaymentResponse

app = FastAPI(
    title="NAIB API",
    description="B2B Substitute Teacher Marketplace — Egypt",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

payment_service = PaymentService(gateway="paymob")
engine          = MatchingEngine(max_distance_km=25.0)


# ─────────────────────────────────────────────
# In-Memory Store (replace with DB in production)
# ─────────────────────────────────────────────

TEACHERS_DB: dict[str, dict] = {
    "t1": {
        "id": "t1", "name": "Ahmed Hassan", "phone": "01001234567",
        "subjects": ["Physics", "Mathematics"], "curricula": ["IGCSE", "IB"],
        "lat": 30.0300, "lng": 31.4900, "is_available": True,
        "rating": 4.8, "rate": 200, "experience": 7, "verified": True,
    },
    "t2": {
        "id": "t2", "name": "Sara El-Sayed", "phone": "01112345678",
        "subjects": ["Physics"], "curricula": ["American"],
        "lat": 30.0260, "lng": 31.4850, "is_available": True,
        "rating": 4.5, "rate": 180, "experience": 4, "verified": True,
    },
    "t3": {
        "id": "t3", "name": "Nour Mahmoud", "phone": "01223456789",
        "subjects": ["Biology", "Chemistry"], "curricula": ["IGCSE", "National"],
        "lat": 30.0400, "lng": 31.5100, "is_available": True,
        "rating": 4.9, "rate": 220, "experience": 10, "verified": True,
    },
}

BOOKINGS_DB: dict[str, dict] = {}


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class UrgentBookingRequest(BaseModel):
    school_id:         str
    school_lat:        float
    school_lng:        float
    subject_needed:    str
    curriculum_needed: str
    grade_level:       Optional[str] = None
    duration_hours:    float = 1.0
    notes:             Optional[str] = None


class MatchedTeacherResponse(BaseModel):
    id:           str
    name:         str
    subjects:     List[str]
    distance_km:  float
    match_score:  float
    hourly_rate:  float
    rating:       float
    phone:        str


class BookingConfirmRequest(BaseModel):
    booking_id:  str
    teacher_id:  str


class CheckInRequest(BaseModel):
    booking_id: str
    token:      str


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "NAIB API", "timestamp": datetime.utcnow()}


# ── Matching ────────────────────────────────

@app.post("/api/bookings/match", response_model=List[MatchedTeacherResponse])
def match_teachers(req: UrgentBookingRequest):
    """
    Core matching endpoint. Returns ranked list of available substitute teachers.
    Called when school admin clicks 'Request Urgent Sub'.
    """
    try:
        subject    = SubjectArea(req.subject_needed)
        curriculum = CurriculumType(req.curriculum_needed)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    booking_req = BookingRequest(
        school_id         = req.school_id,
        school_location   = Location(lat=req.school_lat, lng=req.school_lng),
        subject_needed    = subject,
        curriculum_needed = curriculum,
        start_time        = datetime.utcnow(),
        duration_hours    = req.duration_hours,
    )

    # Build candidates from DB
    candidates = [
        TeacherCandidate(
            id               = t["id"],
            name             = t["name"],
            subjects         = [SubjectArea(s) for s in t["subjects"]],
            curricula        = [CurriculumType(c) for c in t["curricula"]],
            current_location = Location(lat=t["lat"], lng=t["lng"]),
            is_available_now = t["is_available"],
            rating_avg       = t["rating"],
            hourly_rate_egp  = t["rate"],
            years_experience = t["experience"],
        )
        for t in TEACHERS_DB.values()
    ]

    matches = engine.find_optimal_teachers(booking_req, candidates)

    # Create a pending booking record
    booking_id = str(uuid.uuid4())
    BOOKINGS_DB[booking_id] = {
        "id":         booking_id,
        "school_id":  req.school_id,
        "subject":    req.subject_needed,
        "curriculum": req.curriculum_needed,
        "status":     "Pending",
        "created_at": datetime.utcnow().isoformat(),
        "teacher_id": None,
        "qr_token":   str(uuid.uuid4()),
    }

    return [
        MatchedTeacherResponse(
            id          = t.id,
            name        = t.name,
            subjects    = [s.value for s in t.subjects],
            distance_km = t.distance_km,
            match_score = t.match_score,
            hourly_rate = t.hourly_rate_egp,
            rating      = t.rating_avg,
            phone       = TEACHERS_DB[t.id]["phone"],
        )
        for t in matches
    ]


# ── Booking Confirmation ────────────────────

@app.post("/api/bookings/confirm")
def confirm_booking(req: BookingConfirmRequest):
    """School admin selects a teacher from the matched list."""
    booking = BOOKINGS_DB.get(req.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    teacher = TEACHERS_DB.get(req.teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    booking["teacher_id"] = req.teacher_id
    booking["status"]     = "Confirmed"

    return {
        "booking_id":   req.booking_id,
        "status":       "Confirmed",
        "teacher_name": teacher["name"],
        "qr_token":     booking["qr_token"],
        "qr_payload":   f"naib://checkin?booking={req.booking_id}&token={booking['qr_token']}",
    }


# ── QR Check-In ─────────────────────────────

@app.post("/api/bookings/checkin")
def checkin(req: CheckInRequest):
    """Teacher scans QR at school gate to record attendance."""
    booking = BOOKINGS_DB.get(req.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if req.token != booking["qr_token"]:
        raise HTTPException(status_code=403, detail="Invalid QR token")

    if booking["status"] not in ("Confirmed", "Teacher_EnRoute"):
        raise HTTPException(status_code=400, detail=f"Cannot check in with status: {booking['status']}")

    booking["status"]       = "Checked_In"
    booking["checked_in_at"] = datetime.utcnow().isoformat()

    return {"message": "Check-in successful", "booking_id": req.booking_id, "checked_in_at": booking["checked_in_at"]}


# ── Session Completion & Payout ─────────────

@app.post("/api/bookings/{booking_id}/complete")
def complete_booking(booking_id: str):
    """Mark session as complete and trigger teacher payout."""
    booking = BOOKINGS_DB.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    teacher_id = booking.get("teacher_id")
    if not teacher_id:
        raise HTTPException(status_code=400, detail="No teacher assigned")

    teacher = TEACHERS_DB[teacher_id]
    amount  = teacher["rate"] * 1.0  # 1-hour default for demo

    booking["status"]        = "Completed"
    booking["checked_out_at"] = datetime.utcnow().isoformat()

    # Trigger payout
    payout = payment_service.pay_teacher(
        booking_id    = booking_id,
        teacher_id    = teacher_id,
        amount_egp    = amount,
        teacher_phone = teacher["phone"],
    )

    return {
        "booking_id":     booking_id,
        "status":         "Completed",
        "payout_status":  payout.status,
        "payout_tx_id":   payout.transaction_id,
        "amount_paid_egp": amount,
    }


# ── Teacher Location Update ─────────────────

class LocationUpdate(BaseModel):
    teacher_id: str
    lat:        float
    lng:        float
    available:  bool

@app.post("/api/teachers/location")
def update_location(upd: LocationUpdate):
    """Mobile app pings this to update teacher's live GPS location."""
    if upd.teacher_id not in TEACHERS_DB:
        raise HTTPException(status_code=404, detail="Teacher not found")
    TEACHERS_DB[upd.teacher_id]["lat"]         = upd.lat
    TEACHERS_DB[upd.teacher_id]["lng"]         = upd.lng
    TEACHERS_DB[upd.teacher_id]["is_available"] = upd.available
    return {"status": "updated"}


# ── List Bookings (for dashboard) ───────────

@app.get("/api/bookings")
def list_bookings(school_id: str):
    return [b for b in BOOKINGS_DB.values() if b["school_id"] == school_id]


@app.get("/api/teachers")
def list_teachers():
    return list(TEACHERS_DB.values())

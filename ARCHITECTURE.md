# NAIB — Architecture Overview
## B2B Substitute Teacher Marketplace · Egypt

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        NAIB Platform                             │
├────────────────┬──────────────────────┬──────────────────────────┤
│  School Web    │   Teacher Mobile App  │   Admin Dashboard        │
│  (Next.js)     │   (React Native)      │   (Next.js)              │
└────────┬───────┴──────────┬────────────┴───────────┬─────────────┘
         │                  │                         │
         └──────────────────┼─────────────────────────┘
                            │  REST API (HTTPS)
                            ▼
              ┌─────────────────────────┐
              │   FastAPI Backend        │
              │   (Python 3.12)          │
              │                         │
              │  • Matching Engine       │
              │  • Auth (JWT)            │
              │  • Booking Manager       │
              │  • QR Verifier           │
              │  • Payment Dispatcher    │
              └──────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌─────────────┐ ┌────────────┐ ┌──────────────┐
  │ PostgreSQL  │ │  Redis     │ │  S3 / Cloudflare│
  │ + PostGIS   │ │  (cache /  │ │  R2 (docs,   │
  │ (primary DB)│ │  queues)   │ │  photos)     │
  └─────────────┘ └────────────┘ └──────────────┘
         │
         ▼
  ┌──────────────────────────┐
  │  Payment Gateways (EGP)  │
  │  • Paymob (primary)      │
  │  • Fawry (cash payout)   │
  │  • InstaPay (CBE IPS)    │
  └──────────────────────────┘
```

---

## Core Files

| File | Purpose |
|------|---------|
| `backend/schema.sql` | Full PostgreSQL schema with PostGIS extensions |
| `backend/matching_engine.py` | Scoring & ranking algorithm |
| `backend/payment_service.py` | Payment gateway integrations (Paymob, Fawry, InstaPay) |
| `backend/main.py` | FastAPI app — all REST endpoints |
| `frontend/src/pages/dashboard.jsx` | School admin dashboard (Next.js) |

---

## Matching Engine — Scoring Formula

```
score = (proximity × 0.50) + (subject_match × 0.35) + (rating × 0.15)
```

| Component | Weight | Logic |
|-----------|--------|-------|
| **Proximity** | 50% | Exponential decay: score=1.0 at 0km → ~0.1 at 20km |
| **Subject match** | 35% | 1.0 = subject + curriculum match · 0.6 = subject only |
| **Rating** | 15% | Normalized 0–5 star average |

Hard filters applied before scoring:
- Teacher must be `is_available_now = true`
- Distance must be `≤ max_distance_km` (default 25km)
- Subject must appear in teacher's subject array

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/bookings/match` | Run matching engine, return ranked teachers |
| `POST` | `/api/bookings/confirm` | School confirms a teacher → status: Confirmed |
| `POST` | `/api/bookings/checkin` | Teacher QR scan → status: Checked_In |
| `POST` | `/api/bookings/{id}/complete` | Session done → triggers payout |
| `POST` | `/api/teachers/location` | Mobile app location ping |
| `GET`  | `/api/bookings?school_id=` | Booking history for school |
| `GET`  | `/api/teachers` | List all teachers (admin) |

---

## Payment Flow

```
Session Completed
      │
      ▼
PaymentService.pay_teacher()
      │
      ├── if teacher.payment_method == "paymob"
      │       → Paymob Disbursement API (mobile wallet)
      │
      ├── if teacher.payment_method == "fawry"
      │       → Fawry cash code (any kiosk)
      │
      └── if teacher.payment_method == "instapay"
              → CBE IPS transfer (instant, via aggregator)
```

---

## QR Check-In Flow

```
1. Booking confirmed  →  QR token generated (UUID)
2. School shows QR    →  naib://checkin?booking=X&token=Y
3. Teacher scans      →  POST /api/bookings/checkin
4. Server validates   →  token match + time window (−15min to +30min)
5. Status → Checked_In, timestamp recorded
6. After class ends   →  POST /api/bookings/{id}/complete → payout
```

---

## Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/naib
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-256-bit-secret

# Paymob
PAYMOB_API_KEY=...
PAYMOB_HMAC_SECRET=...
PAYMOB_PROFILE_ID=...

# Fawry
FAWRY_MERCHANT_CODE=...
FAWRY_SECURITY_KEY=...

# InstaPay
INSTAPAY_API_KEY=...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Test matching engine
python matching_engine.py

# Frontend
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

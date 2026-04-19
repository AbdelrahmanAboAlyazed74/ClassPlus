-- ============================================================
-- NAIB - Substitute Teacher Marketplace (Egypt)
-- Database Schema (PostgreSQL + PostGIS)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ─────────────────────────────────────────────
-- SCHOOLS
-- ─────────────────────────────────────────────
CREATE TYPE curriculum_type AS ENUM ('IGCSE', 'American', 'National', 'IB', 'STEM');

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    address         TEXT NOT NULL,
    city            VARCHAR(100) NOT NULL DEFAULT 'Cairo',
    governorate     VARCHAR(100) NOT NULL,
    curriculum      curriculum_type NOT NULL,
    contact_name    VARCHAR(150),
    contact_phone   VARCHAR(20),
    contact_email   VARCHAR(150) UNIQUE NOT NULL,
    location        GEOGRAPHY(POINT, 4326),   -- PostGIS lat/lng
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    password_hash   TEXT NOT NULL,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TEACHERS
-- ─────────────────────────────────────────────
CREATE TYPE subject_area AS ENUM (
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'Arabic', 'French', 'History', 'Geography',
    'Computer_Science', 'Art', 'Physical_Education', 'Music',
    'Economics', 'Business', 'Psychology'
);

CREATE TYPE verification_status AS ENUM ('Pending', 'Verified', 'Rejected', 'Suspended');

CREATE TABLE teachers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    phone               VARCHAR(20) UNIQUE NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    national_id         VARCHAR(14) UNIQUE,             -- Egyptian National ID
    profile_photo_url   TEXT,
    bio                 TEXT,
    years_experience    SMALLINT DEFAULT 0,
    hourly_rate_egp     DECIMAL(8, 2) NOT NULL DEFAULT 150.00,
    subjects            subject_area[] NOT NULL,        -- Array of subjects
    curricula           curriculum_type[] NOT NULL,     -- Curricula they can teach
    verification_status verification_status DEFAULT 'Pending',
    background_check    BOOLEAN DEFAULT FALSE,
    -- Live location (updated by mobile app)
    current_lat         DECIMAL(10, 8),
    current_lng         DECIMAL(11, 8),
    current_location    GEOGRAPHY(POINT, 4326),
    last_location_at    TIMESTAMPTZ,
    is_available_now    BOOLEAN DEFAULT FALSE,
    rating_avg          DECIMAL(3, 2) DEFAULT 0.00,
    total_sessions      INTEGER DEFAULT 0,
    -- Bank / Wallet for payouts
    payment_method      VARCHAR(50),                    -- 'instapay' | 'fawry_wallet' | 'bank'
    payment_identifier  VARCHAR(200),                   -- Account/phone/IBAN
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TEACHER AVAILABILITY SLOTS
-- ─────────────────────────────────────────────
CREATE TABLE availability_slots (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    CHECK (end_time > start_time)
);

-- ─────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────
CREATE TYPE booking_status AS ENUM (
    'Pending', 'Confirmed', 'Teacher_EnRoute',
    'Checked_In', 'Completed', 'Cancelled', 'No_Show'
);

CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id           UUID NOT NULL REFERENCES schools(id),
    teacher_id          UUID REFERENCES teachers(id),       -- NULL until matched
    subject_needed      subject_area NOT NULL,
    curriculum_needed   curriculum_type NOT NULL,
    grade_level         VARCHAR(50),                         -- e.g. "Grade 9", "Year 10"
    start_time          TIMESTAMPTZ NOT NULL,
    duration_hours      DECIMAL(4, 2) NOT NULL DEFAULT 1.0,
    hourly_rate_egp     DECIMAL(8, 2),
    total_amount_egp    DECIMAL(10, 2) GENERATED ALWAYS AS (hourly_rate_egp * duration_hours) STORED,
    status              booking_status DEFAULT 'Pending',
    notes               TEXT,
    -- QR Check-in
    qr_code_token       UUID DEFAULT uuid_generate_v4(),
    checked_in_at       TIMESTAMPTZ,
    checked_out_at      TIMESTAMPTZ,
    -- Payment
    payment_status      VARCHAR(50) DEFAULT 'Unpaid',       -- 'Unpaid'|'Paid'|'Failed'
    payment_reference   VARCHAR(200),
    -- Rating
    school_rating       SMALLINT CHECK (school_rating BETWEEN 1 AND 5),
    school_review       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_teachers_location    ON teachers USING GIST(current_location);
CREATE INDEX idx_schools_location     ON schools  USING GIST(location);
CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_bookings_school      ON bookings(school_id);
CREATE INDEX idx_bookings_teacher     ON bookings(teacher_id);
CREATE INDEX idx_availability_teacher ON availability_slots(teacher_id);
CREATE INDEX idx_teachers_subjects    ON teachers USING GIN(subjects);

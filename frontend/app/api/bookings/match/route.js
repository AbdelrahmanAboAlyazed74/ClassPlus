import { NextResponse } from "next/server";
import { TEACHERS_DB, BOOKINGS_DB } from "../../_data/store.js";
import { findOptimalTeachers } from "../../_data/matching.js";
import { randomUUID } from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { school_id, school_lat, school_lng, subject_needed, curriculum_needed, duration_hours = 1 } = body;

    if (!school_id || !school_lat || !school_lng || !subject_needed || !curriculum_needed) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
    }

    const matches = findOptimalTeachers(
      TEACHERS_DB, school_lat, school_lng,
      subject_needed, curriculum_needed
    );

    // Create pending booking
    const bookingId = `bk-${Date.now()}`;
    BOOKINGS_DB[bookingId] = {
      id: bookingId,
      school_id,
      subject: subject_needed,
      curriculum: curriculum_needed,
      status: "Pending",
      created_at: new Date().toISOString(),
      teacher_id: null,
      teacher_name: null,
      duration_hours,
      amount: 0,
      qr_token: randomUUID(),
    };

    return NextResponse.json({
      booking_id: bookingId,
      matches: matches.map(t => ({
        id: t.id, name: t.name, subjects: t.subjects,
        distance_km: t.distance_km, match_score: t.match_score,
        hourly_rate: t.rate, rating: t.rating, phone: t.phone,
        verified: t.verified, avatar: t.avatar, district: t.district,
        score_breakdown: t.score_breakdown,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { TEACHERS_DB, BOOKINGS_DB } from "../../_data/store.js";

export async function POST(request) {
  try {
    const { booking_id, teacher_id } = await request.json();
    const booking = BOOKINGS_DB[booking_id];
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const teacher = TEACHERS_DB[teacher_id];
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    booking.teacher_id   = teacher_id;
    booking.teacher_name = teacher.name;
    booking.status       = "Confirmed";
    booking.amount       = teacher.rate * (booking.duration_hours || 1);

    return NextResponse.json({
      booking_id,
      status: "Confirmed",
      teacher_name: teacher.name,
      qr_token: booking.qr_token,
      qr_payload: `naib://checkin?booking=${booking_id}&token=${booking.qr_token}`,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

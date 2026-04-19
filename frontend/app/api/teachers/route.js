import { NextResponse } from "next/server";
import { TEACHERS_DB } from "../_data/store.js";

export async function GET() {
  const teachers = Object.values(TEACHERS_DB).map(t => ({
    id: t.id, name: t.name, subjects: t.subjects, curricula: t.curricula,
    rating: t.rating, rate: t.rate, experience: t.experience,
    verified: t.verified, is_available: t.is_available,
    avatar: t.avatar, district: t.district, phone: t.phone,
  }));
  return NextResponse.json(teachers);
}

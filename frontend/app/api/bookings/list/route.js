import { NextResponse } from "next/server";
import { BOOKINGS_DB } from "../../_data/store.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const school_id = searchParams.get("school_id");
  const all = Object.values(BOOKINGS_DB);
  const filtered = school_id ? all.filter(b => b.school_id === school_id) : all;
  return NextResponse.json(filtered.sort((a, b) => b.created_at.localeCompare(a.created_at)));
}

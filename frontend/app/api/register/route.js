import { NextResponse } from "next/server";
import { TEACHERS_DB } from "../_data/store.js";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Simple ID generation
    const newId = `t${Object.keys(TEACHERS_DB).length + 1}`;
    
    // Add to our in-memory DB
    TEACHERS_DB[newId] = {
      id: newId,
      name: data.fullName,
      phone: data.phone || "",
      subjects: data.subjects || [],
      curricula: data.curricula || [],
      lat: 30.0300, // Default mock location
      lng: 31.4900,
      is_available: true,
      rating: 0, 
      rate: parseFloat(data.hourlyRate) || 150,
      experience: 0,
      verified: false,
      avatar: data.fullName.substring(0, 2).toUpperCase(),
      district: data.locationCity || "Unknown",
    };

    return NextResponse.json({ 
      success: true, 
      message: "Teacher registered successfully",
      teacher: TEACHERS_DB[newId]
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error parsing request" }, { status: 400 });
  }
}

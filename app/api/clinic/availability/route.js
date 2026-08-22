import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Availability from "../../../../backend/models/Availability.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

async function authenticateAndGetClinic() {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Invalid session");
  
  const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
  if (!clinic) throw new Error("Clinic not found");
  
  return clinic;
}

export async function GET() {
  try {
    const clinic = await authenticateAndGetClinic();
    const availability = await Availability.find({ clinicId: clinic._id }).sort({ dayOfWeek: 1 }).lean();
    return NextResponse.json({ success: true, availability }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const clinic = await authenticateAndGetClinic();
    const body = await req.json();
    const { schedule } = body; // Array of { dayOfWeek, startTime, endTime, isClosed }
    
    if (!Array.isArray(schedule)) {
      return NextResponse.json({ success: false, error: "Invalid schedule format" }, { status: 400 });
    }
    
    // Update each day
    for (const day of schedule) {
      await Availability.findOneAndUpdate(
        { clinicId: clinic._id, dayOfWeek: day.dayOfWeek },
        { 
          startTime: day.startTime,
          endTime: day.endTime,
          isClosed: day.isClosed
        },
        { upsert: true }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

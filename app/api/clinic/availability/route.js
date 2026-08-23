import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
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
    let availability = await Availability.find({ clinicId: clinic._id }).sort({ dayOfWeek: 1 }).lean();
    
    // Fallback for old documents that have isClosed but not isOpen
    availability = availability.map(day => {
      if (day.isOpen === undefined) {
        day.isOpen = day.isClosed !== undefined ? !day.isClosed : true;
      }
      return day;
    });

    return NextResponse.json({ success: true, availability }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const clinic = await authenticateAndGetClinic();
    const body = await req.json();
    const { schedule } = body;
    
    if (!Array.isArray(schedule)) {
      return NextResponse.json({ success: false, error: "Invalid schedule format" }, { status: 400 });
    }
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Update each of the 7 days
    for (const day of schedule) {
      const dayNum = Number(day.dayOfWeek);
      if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) continue;
      
      const dayName = day.dayName || dayNames[dayNum] || "Day";
      const isOpen = day.isOpen !== undefined ? Boolean(day.isOpen) : (day.isClosed !== undefined ? !day.isClosed : true);
      
      await Availability.findOneAndUpdate(
        { clinicId: clinic._id, dayOfWeek: dayNum },
        { 
          dayOfWeek: dayNum,
          dayName,
          startTime: day.startTime || "09:00",
          endTime: day.endTime || "17:00",
          isOpen
        },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

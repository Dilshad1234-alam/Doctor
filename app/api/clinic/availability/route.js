import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Availability from "../../../../backend/models/Availability.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
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
    
    // Default 7 days if not initialized
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (availability.length === 0) {
      availability = dayNames.map((name, idx) => ({
        dayOfWeek: idx,
        dayName: name,
        startTime: "09:00",
        endTime: "21:00",
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        eveningStartTime: "17:00",
        eveningEndTime: "21:00",
        slotDuration: 15,
        isOpen: idx !== 0, // Sunday closed by default
        isEmergencyClosed: false,
      }));
    } else {
      // Ensure all fields exist
      availability = availability.map(day => ({
        ...day,
        dayName: day.dayName || dayNames[day.dayOfWeek] || "Day",
        isOpen: day.isOpen !== undefined ? day.isOpen : (day.isClosed !== undefined ? !day.isClosed : true),
        morningStartTime: day.morningStartTime || "09:00",
        morningEndTime: day.morningEndTime || "13:00",
        eveningStartTime: day.eveningStartTime || "17:00",
        eveningEndTime: day.eveningEndTime || "21:00",
        slotDuration: day.slotDuration || 15,
        isEmergencyClosed: Boolean(day.isEmergencyClosed)
      }));
    }

    return NextResponse.json({ 
      success: true, 
      availability, 
      emergencyClosed: Boolean(clinic.emergencyClosed) 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const clinic = await authenticateAndGetClinic();
    const body = await req.json();
    const { schedule, emergencyClosed, shifts: incomingShifts } = body;
    
    if (emergencyClosed !== undefined) {
      await Clinic.findByIdAndUpdate(clinic._id, { $set: { emergencyClosed: Boolean(emergencyClosed) } });
    }

    const keyMap = { 0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday", 4: "thursday", 5: "friday", 6: "saturday" };
    const shiftsObj = incomingShifts || {};

    if (Array.isArray(schedule)) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      // Update each of the 7 days
      for (const day of schedule) {
        const dayNum = Number(day.dayOfWeek);
        if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) continue;
        
        const dayName = day.dayName || dayNames[dayNum] || "Day";
        const isOpen = day.isOpen !== undefined ? Boolean(day.isOpen) : (day.isClosed !== undefined ? !day.isClosed : true);
        const dayKey = keyMap[dayNum];

        shiftsObj[dayKey] = {
          isEnabled: isOpen,
          morningStart: day.morningStartTime || day.startTime || "",
          morningEnd: day.morningEndTime || day.endTime || "",
          eveningStart: day.eveningStartTime || "",
          eveningEnd: day.eveningEndTime || ""
        };

        await Availability.findOneAndUpdate(
          { clinicId: clinic._id, dayOfWeek: dayNum },
          { 
            dayOfWeek: dayNum,
            dayName,
            startTime: day.morningStartTime || day.startTime || "09:00",
            endTime: day.eveningEndTime || day.endTime || "21:00",
            morningStartTime: day.morningStartTime || "09:00",
            morningEndTime: day.morningEndTime || "13:00",
            eveningStartTime: day.eveningStartTime || "17:00",
            eveningEndTime: day.eveningEndTime || "21:00",
            slotDuration: Number(day.slotDuration) || 15,
            isOpen,
            isEmergencyClosed: day.isEmergencyClosed !== undefined ? Boolean(day.isEmergencyClosed) : false
          },
          { upsert: true, new: true }
        );
      }
    }

    // Persist shifts object to DoctorProfile
    await DoctorProfile.updateMany(
      { $or: [{ clinicId: clinic._id }, { userId: clinic.ownerId }] },
      { $set: { shifts: shiftsObj, opdAvailability: shiftsObj } }
    );
    
    return NextResponse.json({ 
      success: true, 
      shifts: shiftsObj,
      emergencyClosed: emergencyClosed !== undefined ? Boolean(emergencyClosed) : Boolean(clinic.emergencyClosed) 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

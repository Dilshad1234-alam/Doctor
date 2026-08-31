import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../../backend/config/db.js";
import { verifyToken } from "../../../../../backend/utils/jwt.js";
import Appointment from "../../../../../backend/models/Appointment.js";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    const { patientIds } = await req.json();

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ success: false, message: "No patient IDs provided" }, { status: 400 });
    }

    await connectDB();

    // Calculate tomorrow's date string (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    // Fetch the appointments to get patient details for WhatsApp simulation
    const appointmentsToShift = await Appointment.find({
      _id: { $in: patientIds }
    });

    // Update appointment date for all received patientIds to tomorrow's date
    await Appointment.updateMany(
      { _id: { $in: patientIds } },
      { 
        $set: { 
          date: tomorrowDateStr,
          status: 'CONFIRMED', // reset status so they aren't 'missed'
          queueStatus: 'WAITING'
        } 
      }
    );

    // Simulate Automated WhatsApp Notification Payload
    appointmentsToShift.forEach(app => {
      if (app.patientPhone) {
        const message = `Namaste ${app.patientName}, Dr. Alam ki aaj ki OPD consultation slots close ho chuki hain. Aapka appointment token kal ke liye priority queue me shift kar diya gaya hai. Kripya kal schedule par visit karein.`;
        // In a real application, you would integrate with a WhatsApp API provider (e.g. Twilio, Meta API) here.
        console.log(`[WhatsApp API Simulated Payload to ${app.patientPhone}]: ${message}`);
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: patientIds.length, 
      shiftedTo: tomorrowDateStr 
    }, { status: 200 });

  } catch (error) {
    console.error("Shift to tomorrow error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to shift appointments" },
      { status: 500 }
    );
  }
}

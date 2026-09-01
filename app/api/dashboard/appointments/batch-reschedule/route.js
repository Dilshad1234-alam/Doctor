import { NextResponse } from "next/server";
import connectDB from "../../../../../backend/config/db";
import Appointment from "../../../../../backend/models/Appointment";

export async function POST(req) {
  try {
    const { patientIds, doctorName, clinicName } = await req.json();

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No patient IDs provided" },
        { status: 400 }
      );
    }

    await connectDB();

    const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Simulating WhatsApp dispatch logging
    console.log(`[WhatsApp Dispatch Started] Rescheduling ${patientIds.length} patients to ${tomorrowDate}`);
    
    // Update appointments
    const result = await Appointment.updateMany(
      { _id: { $in: patientIds } },
      { 
        $set: { 
          date: tomorrowDate, 
          queueStatus: 'CONFIRMED',
          status: 'CONFIRMED'
        } 
      }
    );

    // Simulated individual WhatsApp notifications log
    for (const pid of patientIds) {
      // In a real implementation, you would fetch the patient's phone and name here
      console.log(`[WhatsApp Sent] to Patient ID ${pid}: "Namaste Patient, Dr. ${doctorName} ki aaj ki OPD consultation slots close ho chuki hain. Aapka appointment token kal (${tomorrowDate}) ke liye priority queue me shift kar diya gaya hai. Kripya kal clinic timing par visit karein. - ${clinicName}"`);
    }

    return NextResponse.json({ 
      success: true, 
      count: result.modifiedCount, 
      rescheduledDate: tomorrowDate 
    });
  } catch (error) {
    console.error("Batch reschedule error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

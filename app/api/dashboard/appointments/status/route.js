import { NextResponse } from "next/server";
import connectDB from "../../../../../backend/config/db.js";
import Clinic from "../../../../../backend/models/Clinic.js";
import Appointment from "../../../../../backend/models/Appointment.js";
import { verifyToken } from "../../../../../backend/utils/jwt.js";

// POST update appointment status
export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, clinicId: clinic._id },
      { status },
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment }, { status: 200 });

  } catch (error) {
    console.error("Update Appointment Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

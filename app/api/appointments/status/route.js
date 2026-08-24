import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Appointment from "../../../../backend/models/Appointment.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing appointment ID" }, { status: 400 });
    }

    const appointment = await Appointment.findById(id).lean();
    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: appointment.status,
      appointment
    }, { status: 200 });
  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

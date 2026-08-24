import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Appointment from "../../../../backend/models/Appointment.js";

export const dynamic = "force-dynamic";

export async function GET(req, props) {
  try {
    await connectDB();
    const params = await props.params;
    const { id } = params;

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
    console.error("Fetch Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, props) {
  try {
    await connectDB();
    const params = await props.params;
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    console.error("Update Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

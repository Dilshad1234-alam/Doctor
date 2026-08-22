import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Appointment from "../../../../backend/models/Appointment.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

// GET appointments with filters
export async function GET(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const date = searchParams.get("date"); // YYYY-MM-DD
    const search = searchParams.get("search");

    const query = { clinicId: clinic._id };

    if (status !== "ALL") {
      query.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: targetDate, $lte: endOfDay };
    }

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { patientPhone: { $regex: search, $options: "i" } }
      ];
    }

    const appointments = await Appointment.find(query).sort({ appointmentDate: 1, timeSlot: 1 }).lean();

    return NextResponse.json({ appointments }, { status: 200 });

  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH update appointment status
export async function PATCH(req) {
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

    // Ensure appointment belongs to doctor's clinic
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
    console.error("Update Appointment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

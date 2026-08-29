import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Appointment from "../../../../backend/models/Appointment.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Service from "../../../../backend/models/Service.js";
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
      if (status === "WAITING") {
        query.status = { $in: ["WAITING", "PENDING"] };
      } else {
        query.status = status;
      }
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
        { patientPhone: { $regex: search, $options: "i" } },
        { serviceName: { $regex: search, $options: "i" } }
      ];
    }

    const appointments = await Appointment.find(query).sort({ tokenNumber: 1, createdAt: 1 }).lean();

    return NextResponse.json({ appointments }, { status: 200 });

  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create walk-in patient appointment
export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();

    const body = await req.json();
    const { 
      patientName, 
      patientPhone, 
      patientAge, 
      patientGender, 
      serviceName, 
      serviceId, 
      price, 
      paymentMethod = "Cash",
      paymentStatus = "PAID_CASH",
      timeSlot,
      clinicalNotes = ""
    } = body;

    if (!patientName || !patientPhone) {
      return NextResponse.json({ error: "Patient Name and Phone are required" }, { status: 400 });
    }

    // Calculate today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Auto-calculate next token number for today
    const todaysAppointmentsCount = await Appointment.countDocuments({
      clinicId: clinic._id,
      appointmentDate: { $gte: today, $lte: endOfToday }
    });

    const nextTokenNumber = todaysAppointmentsCount + 1;

    let finalServiceName = serviceName || "General Consultation";
    let finalPrice = Number(price) || 500;

    if (serviceId) {
      const s = await Service.findById(serviceId).lean();
      if (s) {
        finalServiceName = s.name;
        finalPrice = s.price;
      }
    }

    const currentTimeString = timeSlot || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newAppointment = await Appointment.create({
      clinicId: clinic._id,
      doctorId: doctorProfile?._id || undefined,
      tokenNumber: nextTokenNumber,
      patientName,
      patientPhone,
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender: patientGender || "Other",
      serviceName: finalServiceName,
      price: finalPrice,
      appointmentDate: today,
      timeSlot: currentTimeString,
      status: "WAITING",
      paymentStatus: paymentStatus || (paymentMethod === "UPI / Online" ? "PAID_UPI" : "PAID_CASH"),
      paymentMethod: paymentMethod || "Cash",
      clinicalNotes,
      isWalkIn: true
    });

    return NextResponse.json({ success: true, appointment: newAppointment }, { status: 201 });
  } catch (error) {
    console.error("Create Walk-in Appointment Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PATCH update appointment status / payment / clinical notes
export async function PATCH(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const body = await req.json();
    const { appointmentId, status, paymentStatus, paymentMethod, clinicalNotes } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod;
    if (clinicalNotes !== undefined) updateFields.clinicalNotes = clinicalNotes;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, clinicId: clinic._id },
      { $set: updateFields },
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

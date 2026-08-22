import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/db.js";
import Clinic from "../../../backend/models/Clinic.js";
import DoctorProfile from "../../../backend/models/DoctorProfile.js";
import Appointment from "../../../backend/models/Appointment.js";
import Service from "../../../backend/models/Service.js";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { clinicSlug, serviceId, patientName, patientPhone, patientAge, patientGender, date, timeSlot } = body;

    const clinic = await Clinic.findOne({ slug: clinicSlug });
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id });
    if (!doctorProfile) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const service = await Service.findById(serviceId);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // Ensure slot is not double booked
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      clinicId: clinic._id,
      appointmentDate: { $gte: targetDate, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'CANCELLED' }
    });

    if (existing) {
      return NextResponse.json({ error: "Time slot is already booked" }, { status: 400 });
    }

    const appointment = await Appointment.create({
      clinicId: clinic._id,
      doctorId: doctorProfile._id,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      serviceName: service.name,
      price: service.price,
      appointmentDate: targetDate,
      timeSlot,
      status: 'CONFIRMED'
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });

  } catch (error) {
    console.error("Appointment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

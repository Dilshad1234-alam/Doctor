import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Appointment from "../../../../backend/models/Appointment.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status")?.toUpperCase() || "ALL";

    const [appointments, clinics, profiles] = await Promise.all([
      Appointment.find().sort({ createdAt: -1 }).lean(),
      Clinic.find().lean(),
      DoctorProfile.find().lean()
    ]);

    const clinicMap = new Map();
    clinics.forEach(c => clinicMap.set(c._id.toString(), c));

    const doctorMap = new Map();
    profiles.forEach(p => doctorMap.set(p._id.toString(), p));

    let items = appointments.map(apt => {
      const clinic = clinicMap.get(apt.clinicId?.toString());
      const doctor = doctorMap.get(apt.doctorId?.toString());

      return {
        _id: apt._id.toString(),
        patientName: apt.patientName || "Patient",
        patientPhone: apt.patientPhone || "N/A",
        patientAge: apt.patientAge || 32,
        patientGender: apt.patientGender || "Male",
        serviceName: apt.serviceName || "General Consultation",
        price: apt.price || 500,
        appointmentDate: apt.appointmentDate || new Date(),
        timeSlot: apt.timeSlot || "10:00 AM",
        status: apt.status || "PENDING",
        createdAt: apt.createdAt || new Date(),
        clinic: {
          name: clinic?.name || "DocPulse Medical Center",
          slug: clinic?.slug || "clinic-preview",
          phone: clinic?.phone || "N/A",
          city: clinic?.city || "Urban"
        },
        doctor: {
          name: doctor?.fullName || "Consulting Doctor",
          specialization: doctor?.specialization || "Physician"
        }
      };
    });

    if (search) {
      items = items.filter(a =>
        a.patientName.toLowerCase().includes(search) ||
        a.patientPhone.toLowerCase().includes(search) ||
        a.serviceName.toLowerCase().includes(search) ||
        a.clinic.name.toLowerCase().includes(search) ||
        a.doctor.name.toLowerCase().includes(search)
      );
    }

    if (status && status !== "ALL") {
      items = items.filter(a => a.status.toUpperCase() === status);
    }

    return NextResponse.json({
      success: true,
      appointments: items,
      total: items.length
    });
  } catch (error) {
    console.error("Admin Appointments API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch appointments"
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ success: false, message: "Appointment ID and status required" }, { status: 400 });
    }

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Appointment status changed to ${status}`, appointment: updated });
  } catch (error) {
    console.error("Admin Update Appointment Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

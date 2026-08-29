import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Appointment from "../../../../backend/models/Appointment.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

export const dynamic = "force-dynamic";

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
    const search = searchParams.get("search") || "";

    // Find all appointments for this clinic sorted by appointmentDate desc
    const appointments = await Appointment.find({ clinicId: clinic._id })
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    // Aggregate by patientPhone or patientName
    const patientMap = new Map();

    for (const apt of appointments) {
      const key = apt.patientPhone ? apt.patientPhone.trim() : apt.patientName.trim().toLowerCase();
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          patientKey: key,
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          patientAge: apt.patientAge || null,
          patientGender: apt.patientGender || "Other",
          totalVisits: 1,
          lastVisitDate: apt.appointmentDate || apt.createdAt,
          lastPrescribedNote: apt.clinicalNotes || "",
          latestAppointmentId: apt._id.toString(),
          visits: [
            {
              appointmentId: apt._id.toString(),
              serviceName: apt.serviceName,
              date: apt.appointmentDate || apt.createdAt,
              timeSlot: apt.timeSlot,
              status: apt.status,
              paymentStatus: apt.paymentStatus,
              clinicalNotes: apt.clinicalNotes || ""
            }
          ]
        });
      } else {
        const existing = patientMap.get(key);
        existing.totalVisits += 1;
        if (!existing.lastPrescribedNote && apt.clinicalNotes) {
          existing.lastPrescribedNote = apt.clinicalNotes;
        }
        existing.visits.push({
          appointmentId: apt._id.toString(),
          serviceName: apt.serviceName,
          date: apt.appointmentDate || apt.createdAt,
          timeSlot: apt.timeSlot,
          status: apt.status,
          paymentStatus: apt.paymentStatus,
          clinicalNotes: apt.clinicalNotes || ""
        });
      }
    }

    let patients = Array.from(patientMap.values());

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.patientName.toLowerCase().includes(q) ||
          p.patientPhone.includes(q) ||
          (p.lastPrescribedNote && p.lastPrescribedNote.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, patients }, { status: 200 });
  } catch (error) {
    console.error("Fetch Patients Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

    const body = await req.json();
    const { appointmentId, patientPhone, clinicalNotes } = body;

    if (!clinicalNotes) {
      return NextResponse.json({ error: "Clinical note cannot be empty" }, { status: 400 });
    }

    let updatedAppointment = null;
    if (appointmentId) {
      updatedAppointment = await Appointment.findOneAndUpdate(
        { _id: appointmentId, clinicId: clinic._id },
        { $set: { clinicalNotes } },
        { new: true }
      );
    } else if (patientPhone) {
      // update the most recent appointment for this patient
      updatedAppointment = await Appointment.findOneAndUpdate(
        { clinicId: clinic._id, patientPhone },
        { $set: { clinicalNotes } },
        { sort: { appointmentDate: -1, createdAt: -1 }, new: true }
      );
    }

    return NextResponse.json({ success: true, appointment: updatedAppointment }, { status: 200 });
  } catch (error) {
    console.error("Save Clinical Note Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Appointment from "../../../../backend/models/Appointment.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Fetch clinic and doctor profile
    const clinic = await Clinic.findOne({ ownerId: decoded.id });
    if (!clinic) {
      return NextResponse.json({ hasCompletedOnboarding: false }, { status: 200 });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: decoded.id });

    // Fetch today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      clinicId: clinic._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const todayAppointmentsCount = todayAppointments.length;
    const pendingCount = todayAppointments.filter(a => a.status === 'PENDING').length;
    const completedCount = todayAppointments.filter(a => a.status === 'COMPLETED').length;
    
    // Total revenue is sum of price of completed appointments for today
    const totalRevenue = todayAppointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.price || 0), 0);

    // Recent 5 appointments
    const recentAppointments = await Appointment.find({ clinicId: clinic._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('patientName patientPhone timeSlot serviceName status createdAt');

    return NextResponse.json({
      hasCompletedOnboarding: true,
      clinic: {
        id: clinic._id,
        name: clinic.name,
        slug: clinic.slug
      },
      doctor: {
        fullName: doctorProfile?.fullName || 'Doctor'
      },
      stats: {
        todayAppointmentsCount,
        pendingCount,
        completedCount,
        totalRevenue
      },
      recentAppointments
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

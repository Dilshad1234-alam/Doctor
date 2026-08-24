import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Appointment from "../../../../backend/models/Appointment.js";
import User from "../../../../backend/models/User.js";
import Subscription from "../../../../backend/models/Subscription.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    const [user, clinic] = await Promise.all([
      User.findById(decoded.id).select("name email phone").lean(),
      Clinic.findOne({ ownerId: decoded.id }).lean()
    ]);

    if (!clinic) {
      return NextResponse.json({ success: false, hasCompletedOnboarding: false }, { status: 200 });
    }

    const subscription = await Subscription.findOne({ 
      clinicId: clinic._id, 
      status: { $in: ['TRIAL', 'ACTIVE'] } 
    }).lean();

    if (!subscription) {
      return NextResponse.json({ 
        success: true, 
        requiresSubscription: true, 
        doctor: { name: user?.name || "Doctor", email: user?.email || clinic?.email || "" },
        clinic: { name: clinic.name, slug: clinic.slug } 
      }, { status: 200 });
    }

    // Fetch all appointments for this clinic
    const appointments = await Appointment.find({ clinicId: clinic._id })
      .sort({ createdAt: -1 })
      .lean();

    // Stats calculations across all current records
    const pendingCount = appointments.filter(
      (a) => a.status === "CONFIRMED" || a.status === "PENDING"
    ).length;

    const completedCount = appointments.filter(
      (a) => a.status === "COMPLETED"
    ).length;

    const todayAppointmentsCount = appointments.length;

    // Calculate revenue (₹500 default per completed if service price is not set)
    const totalRevenue = appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((sum, a) => {
        const p = a.price ?? 500;
        return sum + Number(p);
      }, 0);

    return NextResponse.json({
      success: true,
      hasCompletedOnboarding: true,
      requiresSubscription: false,
      doctor: { 
        name: user?.name || "Doctor", 
        email: user?.email || clinic?.email || "" 
      },
      clinic: { 
        name: clinic.name, 
        slug: clinic.slug,
        email: clinic.email || "",
        phone: clinic.phone || ""
      },
      subscription: {
        planId: subscription.planId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
      },
      stats: {
        todayAppointmentsCount,
        pendingCount,
        completedCount,
        totalRevenue,
      },
      recentAppointments: appointments.map((a) => ({
        _id: a._id.toString(),
        patientName: a.patientName,
        patientPhone: a.patientPhone,
        serviceName: a.serviceName || "OPD Consultation",
        timeSlot: a.timeSlot,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

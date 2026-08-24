import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Subscription from "../../../../backend/models/Subscription.js";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig.js";
import Appointment from "../../../../backend/models/Appointment.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const plan = searchParams.get("plan")?.toUpperCase() || "ALL";

    // Strictly query DOCTORS only, exclude ADMIN and SUPER_ADMIN users
    const [users, profiles, clinics, subscriptions, configs, appointments] = await Promise.all([
      User.find({ role: { $nin: ["ADMIN", "SUPER_ADMIN"] } }).sort({ createdAt: -1 }).lean(),
      DoctorProfile.find().lean(),
      Clinic.find().lean(),
      Subscription.find().lean(),
      WebsiteConfig.find().lean(),
      Appointment.find().lean()
    ]);

    const profileMap = new Map();
    profiles.forEach(p => profileMap.set(p.userId?.toString(), p));

    const clinicMap = new Map();
    clinics.forEach(c => clinicMap.set(c.ownerId?.toString(), c));

    const subMap = new Map();
    subscriptions.forEach(s => subMap.set(s.userId?.toString(), s));

    const configMap = new Map();
    configs.forEach(cfg => configMap.set(cfg.clinicId?.toString(), cfg));

    // Combine into rich doctor objects
    let doctorList = users.map(user => {
      const uId = user._id.toString();
      const profile = profileMap.get(uId);
      const clinic = clinicMap.get(uId);
      const sub = subMap.get(uId);
      const config = clinic ? configMap.get(clinic._id.toString()) : null;
      const doctorAppointments = clinic ? appointments.filter(a => a.clinicId?.toString() === clinic._id.toString()) : [];

      return {
        _id: uId,
        name: profile?.fullName || user.name || "Doctor",
        email: user.email,
        phone: user.phone || "N/A",
        role: user.role || "DOCTOR",
        hasCompletedOnboarding: user.hasCompletedOnboarding ?? true,
        specialization: profile?.specialization || "General Physician",
        qualification: profile?.qualification || "MBBS",
        experienceYrs: profile?.experienceYrs || 5,
        avatarUrl: profile?.avatarUrl || "",
        clinic: clinic ? {
          _id: clinic._id.toString(),
          name: clinic.name,
          slug: clinic.slug,
          city: clinic.city || "Urban Center",
          phone: clinic.phone || user.phone
        } : {
          name: "Clinic Not Set",
          slug: "preview-clinic",
          city: "Default City"
        },
        subscription: {
          planId: sub?.planId || "STARTER",
          status: sub?.status || "ACTIVE",
          billingCycle: sub?.billingCycle || "MONTHLY",
          price: sub?.price || 499,
          endDate: sub?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        websiteConfig: {
          isPublished: config?.isPublished ?? true,
          templateId: config?.templateId || "template-1",
          primaryColor: config?.primaryColor || "#164e63"
        },
        appointmentCount: doctorAppointments.length,
        createdAt: user.createdAt || new Date()
      };
    });

    // Apply filtering
    if (search) {
      doctorList = doctorList.filter(doc => 
        doc.name.toLowerCase().includes(search) ||
        doc.email.toLowerCase().includes(search) ||
        doc.phone.toLowerCase().includes(search) ||
        doc.clinic.name.toLowerCase().includes(search) ||
        doc.clinic.slug.toLowerCase().includes(search) ||
        doc.specialization.toLowerCase().includes(search)
      );
    }

    if (plan && plan !== "ALL") {
      doctorList = doctorList.filter(doc => doc.subscription.planId.toUpperCase() === plan);
    }

    return NextResponse.json({
      success: true,
      doctors: doctorList,
      total: doctorList.length
    });
  } catch (error) {
    console.error("Admin Doctors API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch doctors"
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, action, planId, status, isPublished } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    if (action === "toggle_publish") {
      const clinic = await Clinic.findOne({ ownerId: userId });
      if (clinic) {
        await WebsiteConfig.findOneAndUpdate(
          { clinicId: clinic._id },
          { $set: { isPublished: Boolean(isPublished) } },
          { upsert: true }
        );
      }
      return NextResponse.json({ success: true, message: "Website publication status updated" });
    }

    if (action === "update_plan" && planId) {
      await Subscription.findOneAndUpdate(
        { userId },
        { $set: { planId, status: status || "ACTIVE" } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, message: "Doctor plan updated successfully" });
    }

    if (action === "toggle_status") {
      const newStatus = status === "BLOCKED" ? "BLOCKED" : "ACTIVE";
      await Subscription.findOneAndUpdate(
        { userId },
        { $set: { status: newStatus } }
      );
      return NextResponse.json({ success: true, message: `Doctor status updated to ${newStatus}` });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin Doctor Action Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Doctor User ID required" }, { status: 400 });
    }

    const clinic = await Clinic.findOne({ ownerId: userId });
    if (clinic) {
      await Promise.all([
        Appointment.deleteMany({ clinicId: clinic._id }),
        WebsiteConfig.deleteOne({ clinicId: clinic._id }),
        Clinic.deleteOne({ _id: clinic._id })
      ]);
    }

    await Promise.all([
      DoctorProfile.deleteOne({ userId }),
      Subscription.deleteOne({ userId }),
      User.deleteOne({ _id: userId })
    ]);

    return NextResponse.json({ success: true, message: "Doctor and associated clinic deleted successfully" });
  } catch (error) {
    console.error("Admin Doctor Delete Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

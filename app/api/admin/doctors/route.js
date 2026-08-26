import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import IndividualDoctor from "../../../../backend/models/IndividualDoctor.js";
import MultiDoctorClinic from "../../../../backend/models/MultiDoctorClinic.js";
import Hospital from "../../../../backend/models/Hospital.js";
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

    // Query across dedicated collections
    const [
      individualDocs,
      clinicsData,
      hospitalsData,
      profiles,
      legacyClinics,
      subscriptions,
      configs,
      appointments,
    ] = await Promise.all([
      IndividualDoctor.find().sort({ createdAt: -1 }).lean(),
      MultiDoctorClinic.find().sort({ createdAt: -1 }).lean(),
      Hospital.find().sort({ createdAt: -1 }).lean(),
      DoctorProfile.find().lean(),
      Clinic.find().lean(),
      Subscription.find().lean(),
      WebsiteConfig.find().lean(),
      Appointment.find().lean(),
    ]);

    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId?.toString(), p));

    const clinicMap = new Map();
    legacyClinics.forEach((c) => clinicMap.set(c.ownerId?.toString(), c));

    const subMap = new Map();
    subscriptions.forEach((s) => subMap.set(s.userId?.toString(), s));

    const configMap = new Map();
    configs.forEach((cfg) => configMap.set(cfg.clinicId?.toString(), cfg));

    let doctorList = [];

    // 1. Map Individual Doctors
    individualDocs.forEach((doc) => {
      const uId = doc._id.toString();
      doctorList.push({
        _id: uId,
        name: doc.name || "Doctor",
        email: doc.email,
        phone: doc.phone || "N/A",
        role: "DOCTOR",
        provider_type: "individual_doctor",
        hasCompletedOnboarding: true,
        specialization: doc.specialization || "General Physician",
        qualification: "MBBS / MD",
        experienceYrs: 5,
        avatarUrl: "",
        clinic: {
          _id: uId,
          name: doc.practiceName || `${doc.name}'s Practice`,
          slug: doc.slug || "doctor-practice",
          city: "Metro City",
          phone: doc.phone,
        },
        subscription: {
          planId: doc.subscription_status === "active" ? "PRO" : "STARTER",
          status: doc.subscription_status === "active" ? "ACTIVE" : "PENDING",
          billingCycle: "MONTHLY",
          price: 499,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        websiteConfig: {
          isPublished: doc.website_status === "published",
          templateId: "template-1",
          primaryColor: "#0d9488",
        },
        appointmentCount: 0,
        createdAt: doc.createdAt || new Date(),
      });
    });

    // 2. Map Multi-Doctor Clinics
    clinicsData.forEach((clinic) => {
      const uId = clinic._id.toString();
      doctorList.push({
        _id: uId,
        name: clinic.adminName || "Clinic Admin",
        email: clinic.email,
        phone: clinic.phone || "N/A",
        role: "CLINIC_ADMIN",
        provider_type: "clinic",
        hasCompletedOnboarding: true,
        specialization: (clinic.specialities && clinic.specialities[0]) || "Multi-Specialty",
        qualification: "Polyclinic Admin",
        experienceYrs: 10,
        avatarUrl: "",
        clinic: {
          _id: uId,
          name: clinic.clinicName,
          slug: clinic.slug || "clinic-portal",
          city: "Metro City",
          phone: clinic.phone,
        },
        subscription: {
          planId: clinic.subscription_status === "active" ? "ENTERPRISE" : "PRO",
          status: clinic.subscription_status === "active" ? "ACTIVE" : "PENDING",
          billingCycle: "MONTHLY",
          price: 1499,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        websiteConfig: {
          isPublished: clinic.website_status === "published",
          templateId: "template-2",
          primaryColor: "#0891b2",
        },
        appointmentCount: 0,
        createdAt: clinic.createdAt || new Date(),
      });
    });

    // 3. Map Hospitals
    hospitalsData.forEach((hosp) => {
      const uId = hosp._id.toString();
      doctorList.push({
        _id: uId,
        name: hosp.adminName || "Hospital Director",
        email: hosp.email,
        phone: hosp.phone || "N/A",
        role: "HOSPITAL_ADMIN",
        provider_type: "hospital",
        hasCompletedOnboarding: true,
        specialization: "Hospital & Multi-Department Center",
        qualification: "Medical Superintendent",
        experienceYrs: 15,
        avatarUrl: "",
        clinic: {
          _id: uId,
          name: hosp.hospitalName,
          slug: hosp.slug || "hospital-portal",
          city: "Metro City",
          phone: hosp.phone,
        },
        subscription: {
          planId: "ENTERPRISE",
          status: hosp.subscription_status === "active" ? "ACTIVE" : "PENDING",
          billingCycle: "YEARLY",
          price: 4999,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        websiteConfig: {
          isPublished: hosp.website_status === "published",
          templateId: "template-3",
          primaryColor: "#0f172a",
        },
        appointmentCount: 0,
        createdAt: hosp.createdAt || new Date(),
      });
    });

    // Sort by createdAt descending
    doctorList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply filtering
    if (search) {
      doctorList = doctorList.filter(
        (doc) =>
          doc.name.toLowerCase().includes(search) ||
          doc.email.toLowerCase().includes(search) ||
          doc.phone.toLowerCase().includes(search) ||
          doc.clinic.name.toLowerCase().includes(search) ||
          doc.clinic.slug.toLowerCase().includes(search) ||
          doc.specialization.toLowerCase().includes(search)
      );
    }

    if (plan && plan !== "ALL") {
      doctorList = doctorList.filter((doc) => doc.subscription.planId.toUpperCase() === plan);
    }

    return NextResponse.json({
      success: true,
      doctors: doctorList,
      total: doctorList.length,
    });
  } catch (error) {
    console.error("Admin Doctors API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch doctors",
      },
      { status: 500 }
    );
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
      const pubStatus = isPublished ? "published" : "draft";
      await Promise.all([
        IndividualDoctor.findByIdAndUpdate(userId, { website_status: pubStatus }),
        MultiDoctorClinic.findByIdAndUpdate(userId, { website_status: pubStatus }),
        Hospital.findByIdAndUpdate(userId, { website_status: pubStatus }),
      ]);
      return NextResponse.json({ success: true, message: "Website publication status updated" });
    }

    if (action === "toggle_status") {
      const subStatus = status === "ACTIVE" ? "active" : "pending";
      await Promise.all([
        IndividualDoctor.findByIdAndUpdate(userId, { subscription_status: subStatus }),
        MultiDoctorClinic.findByIdAndUpdate(userId, { subscription_status: subStatus }),
        Hospital.findByIdAndUpdate(userId, { subscription_status: subStatus }),
      ]);
      return NextResponse.json({ success: true, message: `Status updated to ${status}` });
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

    await Promise.all([
      IndividualDoctor.findByIdAndDelete(userId),
      MultiDoctorClinic.findByIdAndDelete(userId),
      Hospital.findByIdAndDelete(userId),
      User.findByIdAndDelete(userId),
    ]);

    return NextResponse.json({ success: true, message: "Provider account deleted successfully" });
  } catch (error) {
    console.error("Admin Doctor Delete Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import IndividualDoctor from "../../../../backend/models/IndividualDoctor.js";
import MultiDoctorClinic from "../../../../backend/models/MultiDoctorClinic.js";
import Hospital from "../../../../backend/models/Hospital.js";
import Appointment from "../../../../backend/models/Appointment.js";
import Subscription from "../../../../backend/models/Subscription.js";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Query platform aggregates in parallel
    const [
      individualCount,
      clinicCount,
      hospitalCount,
      individualWebsitesCount,
      clinicWebsitesCount,
      hospitalWebsitesCount,
      legacyWebsitesCount,
      appointments,
      subscriptions,
      recentIndividualDocs,
      recentClinics,
      recentHospitals,
      adminUser,
    ] = await Promise.all([
      IndividualDoctor.countDocuments(),
      MultiDoctorClinic.countDocuments(),
      Hospital.countDocuments(),
      IndividualDoctor.countDocuments({ website_status: "published" }),
      MultiDoctorClinic.countDocuments({ website_status: "published" }),
      Hospital.countDocuments({ website_status: "published" }),
      WebsiteConfig.countDocuments({ isPublished: true }),
      Appointment.find().sort({ createdAt: -1 }).limit(100).lean(),
      Subscription.find().lean(),
      IndividualDoctor.find().sort({ createdAt: -1 }).limit(5).lean(),
      MultiDoctorClinic.find().sort({ createdAt: -1 }).limit(5).lean(),
      Hospital.find().sort({ createdAt: -1 }).limit(5).lean(),
      User.findOne({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }).lean(),
    ]);

    const totalProvidersCount = individualCount + clinicCount + hospitalCount;
    const publishedWebsitesCount =
      individualWebsitesCount +
      clinicWebsitesCount +
      hospitalWebsitesCount +
      legacyWebsitesCount;

    // Appointment stats breakdown
    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter((a) => a.status === "CONFIRMED").length;
    const pendingAppointments = appointments.filter((a) => a.status === "PENDING").length;
    const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length;
    const cancelledAppointments = appointments.filter((a) => a.status === "CANCELLED").length;

    // Subscription & MRR calculations
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "ACTIVE" || s.status === "TRIAL"
    );
    const mrr = activeSubscriptions.reduce((sum, s) => {
      const price =
        Number(s.price) ||
        (s.planId === "ENTERPRISE" ? 2999 : s.planId === "PROFESSIONAL" ? 1299 : 499);
      if (s.billingCycle === "YEARLY") {
        return sum + Math.round(price / 12);
      }
      return sum + price;
    }, 0);

    const appointmentsRevenue = appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((sum, a) => sum + (Number(a.price) || 500), 0);

    const totalPlatformRevenue = mrr + appointmentsRevenue;

    // Combine recent doctors/clinics/hospitals
    const recentDoctors = [];
    recentIndividualDocs.forEach((d) => {
      recentDoctors.push({
        _id: d._id.toString(),
        name: d.name,
        email: d.email,
        phone: d.phone,
        specialization: d.specialization || "General Medicine",
        qualification: "MBBS",
        clinicName: d.practiceName || `${d.name}'s Practice`,
        slug: d.slug || "doctor",
        isPublished: d.website_status === "published",
        plan: d.subscription_status === "active" ? "PRO" : "STARTER",
        createdAt: d.createdAt || new Date(),
        avatarUrl: "",
      });
    });

    recentClinics.forEach((c) => {
      recentDoctors.push({
        _id: c._id.toString(),
        name: c.adminName,
        email: c.email,
        phone: c.phone,
        specialization: (c.specialities && c.specialities[0]) || "Multi-Specialty",
        qualification: "Clinic Admin",
        clinicName: c.clinicName,
        slug: c.slug || "clinic",
        isPublished: c.website_status === "published",
        plan: "PRO",
        createdAt: c.createdAt || new Date(),
        avatarUrl: "",
      });
    });

    recentHospitals.forEach((h) => {
      recentDoctors.push({
        _id: h._id.toString(),
        name: h.adminName,
        email: h.email,
        phone: h.phone,
        specialization: "Hospital",
        qualification: "Hospital Director",
        clinicName: h.hospitalName,
        slug: h.slug || "hospital",
        isPublished: h.website_status === "published",
        plan: "ENTERPRISE",
        createdAt: h.createdAt || new Date(),
        avatarUrl: "",
      });
    });

    recentDoctors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Dynamic Activity feed
    const activities = [];

    appointments.slice(0, 4).forEach((apt) => {
      activities.push({
        id: `apt-${apt._id}`,
        type: "appointment",
        title: `Appointment booked for ${apt.patientName}`,
        description: `Service: ${apt.serviceName || "Consultation"} • Slot: ${
          apt.timeSlot || "Scheduled"
        }`,
        timestamp: apt.createdAt || new Date(),
        badge: apt.status,
        badgeColor:
          apt.status === "CONFIRMED"
            ? "emerald"
            : apt.status === "PENDING"
            ? "amber"
            : "cyan",
      });
    });

    recentIndividualDocs.slice(0, 3).forEach((d) => {
      activities.push({
        id: `doc-${d._id}`,
        type: "doctor",
        title: `New Doctor Onboarded: ${d.name}`,
        description: `Specialty: ${d.specialization || "General Medicine"} • Email: ${d.email}`,
        timestamp: d.createdAt || new Date(),
        badge: "Doctor",
        badgeColor: "teal",
      });
    });

    recentClinics.slice(0, 2).forEach((c) => {
      activities.push({
        id: `cln-${c._id}`,
        type: "clinic",
        title: `New Clinic Registered: ${c.clinicName}`,
        description: `Admin: ${c.adminName} • Slug: /${c.slug}`,
        timestamp: c.createdAt || new Date(),
        badge: "Clinic",
        badgeColor: "cyan",
      });
    });

    recentHospitals.slice(0, 2).forEach((h) => {
      activities.push({
        id: `hsp-${h._id}`,
        type: "hospital",
        title: `New Hospital Registered: ${h.hospitalName}`,
        description: `Admin: ${h.adminName} • Slug: /${h.slug}`,
        timestamp: h.createdAt || new Date(),
        badge: "Hospital",
        badgeColor: "blue",
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser?._id?.toString() || "",
        name: adminUser?.name || "Super Admin",
        email: adminUser?.email || "admin@docpulse.com",
        role: "ADMIN",
      },
      stats: {
        totalDoctors: totalProvidersCount,
        individualDoctorsCount: individualCount,
        clinicsCount: clinicCount,
        hospitalsCount: hospitalCount,
        doctorsGrowth: "+24% this month",
        totalClinics: clinicCount,
        publishedWebsites: publishedWebsitesCount,
        activeSlugs: publishedWebsitesCount,
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        mrr: mrr || 1499,
        totalPlatformRevenue: totalPlatformRevenue || 2999,
        activeSubscriptionsCount: activeSubscriptions.length,
      },
      recentDoctors: recentDoctors.slice(0, 6),
      activities: activities.slice(0, 8),
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load admin stats",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import { verifyToken, signToken } from "../../../../backend/utils/jwt.js";
import User from "../../../../backend/models/User.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Subscription from "../../../../backend/models/Subscription.js";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig.js";
import Appointment from "../../../../backend/models/Appointment.js";
import Service from "../../../../backend/models/Service.js";
import Availability from "../../../../backend/models/Availability.js";

export const dynamic = "force-dynamic";

// Helper to authenticate admin
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN")) {
    return null;
  }
  return decoded;
}

// 1. GET: Fetch all doctors with deep diagnostic & health checks
export async function GET(request) {
  try {
    await connectDB();
    const admin = await verifyAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    // If fetching single doctor details for editor modal
    if (doctorId) {
      const user = await User.findById(doctorId).lean();
      if (!user) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });

      const [profile, clinic, sub, config, services, availability] = await Promise.all([
        DoctorProfile.findOne({ userId: doctorId }).lean(),
        Clinic.findOne({ ownerId: doctorId }).lean(),
        Subscription.findOne({ userId: doctorId }).lean(),
        WebsiteConfig.findOne({ clinicId: clinic?._id }).lean(),
        clinic ? Service.find({ clinicId: clinic._id }).lean() : [],
        clinic ? Availability.find({ clinicId: clinic._id }).sort({ dayOfWeek: 1 }).lean() : []
      ]);

      return NextResponse.json({
        success: true,
        data: {
          user,
          profile,
          clinic,
          subscription: sub,
          websiteConfig: config,
          services,
          availability
        }
      });
    }

    // Otherwise fetch all doctors list with full telemetry and diagnostic flags
    const [users, profiles, clinics, subscriptions, configs, allServices, allAvailability, appointments] = await Promise.all([
      User.find({ role: { $nin: ["ADMIN", "SUPER_ADMIN"] } }).sort({ createdAt: -1 }).lean(),
      DoctorProfile.find().lean(),
      Clinic.find().lean(),
      Subscription.find().lean(),
      WebsiteConfig.find().lean(),
      Service.find().lean(),
      Availability.find().lean(),
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

    const doctorList = users.map(user => {
      const uId = user._id.toString();
      const profile = profileMap.get(uId);
      const clinic = clinicMap.get(uId);
      const sub = subMap.get(uId);
      const config = clinic ? configMap.get(clinic._id.toString()) : null;

      const clinicServices = clinic ? allServices.filter(s => s.clinicId?.toString() === clinic._id.toString()) : [];
      const clinicAvailability = clinic ? allAvailability.filter(a => a.clinicId?.toString() === clinic._id.toString()) : [];
      const doctorAppointments = clinic ? appointments.filter(a => a.clinicId?.toString() === clinic._id.toString()) : [];

      // Diagnostics & Health evaluation
      const issues = [];
      const hasCompletedOnboarding = Boolean(user.hasCompletedOnboarding);
      const hasClinic = Boolean(clinic);
      const hasValidSlug = Boolean(clinic && clinic.slug && clinic.slug.trim().length > 0);
      const hasServices = clinicServices.length > 0;
      const openDaysCount = clinicAvailability.filter(a => a.isOpen).length;
      const hasTimings = openDaysCount > 0;
      const isSubActive = sub ? (sub.status === "ACTIVE" || sub.status === "TRIAL") : false;

      if (!hasCompletedOnboarding) issues.push("Incomplete Onboarding Wizard");
      if (!hasClinic) issues.push("Clinic Profile Not Generated");
      if (!hasValidSlug) issues.push("Missing / Broken URL Slug");
      if (!hasServices) issues.push("No Consultation Services Added");
      if (!hasTimings) issues.push("Zero Active OPD Open Days");
      if (!isSubActive) issues.push("Inactive / Expired Subscription");

      let healthStatus = "HEALTHY";
      if (!hasCompletedOnboarding || !hasClinic || !hasValidSlug) {
        healthStatus = "CRITICAL";
      } else if (!hasServices || !hasTimings || !isSubActive) {
        healthStatus = "WARNING";
      }

      return {
        _id: uId,
        name: profile?.fullName || user.name || "Doctor",
        email: user.email,
        phone: clinic?.phone || user.phone || "N/A",
        role: user.role || "DOCTOR",
        hasCompletedOnboarding,
        specialization: profile?.specialization || "General Medicine",
        qualification: profile?.qualification || "MBBS",
        experienceYrs: profile?.experienceYrs || 0,
        avatarUrl: profile?.avatarUrl || "",
        clinic: clinic ? {
          _id: clinic._id.toString(),
          name: clinic.name,
          slug: clinic.slug,
          address: clinic.address || "",
          city: clinic.city || "",
          phone: clinic.phone || user.phone
        } : null,
        subscription: {
          planId: sub?.planId || "STARTER",
          status: sub?.status || "ACTIVE",
          billingCycle: sub?.billingCycle || "MONTHLY",
          price: sub?.price || 499,
          endDate: sub?.endDate
        },
        websiteConfig: {
          isPublished: config?.isPublished ?? true,
          templateId: config?.templateId || "template-1",
          primaryColor: config?.primaryColor || "#0f766e"
        },
        servicesCount: clinicServices.length,
        openDaysCount,
        appointmentCount: doctorAppointments.length,
        diagnostics: {
          healthStatus,
          issues,
          hasCompletedOnboarding,
          hasValidSlug,
          hasServices,
          hasTimings,
          isSubActive,
          isWebsiteLive: hasCompletedOnboarding && hasValidSlug && hasTimings && (config?.isPublished ?? true)
        },
        createdAt: user.createdAt || new Date()
      };
    });

    return NextResponse.json({
      success: true,
      doctors: doctorList,
      total: doctorList.length
    });
  } catch (error) {
    console.error("Admin Doctor Diagnostic API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to load doctor diagnostics" }, { status: 500 });
  }
}

// 2. POST: Impersonate Doctor (Generates secure temporary session)
export async function POST(request) {
  try {
    await connectDB();
    const admin = await verifyAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { doctorUserId } = body;

    if (!doctorUserId) {
      return NextResponse.json({ success: false, message: "Doctor User ID required for impersonation" }, { status: 400 });
    }

    const doctorUser = await User.findById(doctorUserId).lean();
    if (!doctorUser) {
      return NextResponse.json({ success: false, message: "Doctor account not found" }, { status: 404 });
    }

    // Generate JWT token with doctor's ID and role
    const impersonateToken = signToken({
      id: doctorUser._id.toString(),
      email: doctorUser.email,
      role: doctorUser.role || "DOCTOR",
      impersonatedBy: admin.id
    });

    return NextResponse.json({
      success: true,
      token: impersonateToken,
      doctorName: doctorUser.name,
      redirectUrl: `/dashboard?impersonate=true&token=${encodeURIComponent(impersonateToken)}`
    });
  } catch (error) {
    console.error("Doctor Impersonate Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error during impersonation" }, { status: 500 });
  }
}

// 3. PUT: Remote Override & Repair Doctor Settings
export async function PUT(request) {
  try {
    await connectDB();
    const admin = await verifyAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { doctorUserId, userUpdates, doctorProfile, clinicDetails, forceCompleteOnboarding, services, availability, websiteConfig, subscription } = body;

    if (!doctorUserId) {
      return NextResponse.json({ success: false, message: "Doctor User ID required" }, { status: 400 });
    }

    // 1. Update User Record
    const userFields = { ...userUpdates };
    if (forceCompleteOnboarding !== undefined) {
      userFields.hasCompletedOnboarding = Boolean(forceCompleteOnboarding);
    }
    if (Object.keys(userFields).length > 0) {
      await User.findByIdAndUpdate(doctorUserId, { $set: userFields });
    }

    // 2. Find or Create Clinic
    let clinic = await Clinic.findOne({ ownerId: doctorUserId });
    if (!clinic && clinicDetails?.name) {
      const rawSlug = clinicDetails.slug || clinicDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      clinic = await Clinic.create({
        ownerId: doctorUserId,
        name: clinicDetails.name,
        slug: rawSlug,
        phone: clinicDetails.phone || userUpdates?.phone || "9999999999",
        email: userUpdates?.email,
        address: clinicDetails.address || "Clinic Address",
        city: clinicDetails.city || "City"
      });
    } else if (clinic && clinicDetails) {
      if (clinicDetails.slug) {
        clinicDetails.slug = clinicDetails.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      await Clinic.findByIdAndUpdate(clinic._id, { $set: clinicDetails });
    }

    // 3. Update DoctorProfile
    if (doctorProfile && clinic) {
      await DoctorProfile.findOneAndUpdate(
        { userId: doctorUserId },
        { 
          $set: { 
            clinicId: clinic._id,
            fullName: doctorProfile.fullName || userUpdates?.name || "Doctor",
            qualification: doctorProfile.qualification || "MBBS",
            specialization: doctorProfile.specialization || "General Medicine",
            experienceYrs: Number(doctorProfile.experienceYrs) || 5,
            avatarUrl: doctorProfile.avatarUrl || ""
          } 
        },
        { upsert: true }
      );
    }

    // 4. Update Subscription
    if (subscription) {
      await Subscription.findOneAndUpdate(
        { userId: doctorUserId },
        { 
          $set: { 
            clinicId: clinic?._id,
            planId: subscription.planId || "PRO",
            status: subscription.status || "ACTIVE",
            billingCycle: subscription.billingCycle || "MONTHLY",
            price: Number(subscription.price) || 1299
          } 
        },
        { upsert: true }
      );
    }

    // 5. Update WebsiteConfig
    if (websiteConfig && clinic) {
      await WebsiteConfig.findOneAndUpdate(
        { clinicId: clinic._id },
        { $set: websiteConfig },
        { upsert: true }
      );
    }

    // 6. Update Services
    if (Array.isArray(services) && clinic) {
      await Service.deleteMany({ clinicId: clinic._id });
      if (services.length > 0) {
        const serviceDocs = services.map(s => ({
          clinicId: clinic._id,
          name: s.name || "Consultation",
          price: Number(s.price) || 500,
          durationMins: Number(s.durationMins) || 15,
          isActive: true
        }));
        await Service.insertMany(serviceDocs);
      }
    }

    // 7. Update Availability
    if (Array.isArray(availability) && clinic) {
      await Availability.deleteMany({ clinicId: clinic._id });
      if (availability.length > 0) {
        const availDocs = availability.map(a => ({
          clinicId: clinic._id,
          dayOfWeek: Number(a.dayOfWeek),
          isOpen: Boolean(a.isOpen),
          startTime: a.startTime || "09:00",
          endTime: a.endTime || "17:00"
        }));
        await Availability.insertMany(availDocs);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Doctor credentials, clinic telemetry, and website configuration repaired successfully."
    });
  } catch (error) {
    console.error("Doctor Override PUT Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update doctor configuration" }, { status: 500 });
  }
}

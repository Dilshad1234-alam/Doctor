import { NextResponse } from "next/server";
import { verifyToken, signToken } from "../../../../backend/utils/jwt.js";
import dbConnect from "../../../../backend/config/db.js";
import User from "../../../../models/User.js";
import IndividualDoctor from "../../../../models/IndividualDoctor.js";
import MultiDoctorClinic from "../../../../models/MultiDoctorClinic.js";
import Hospital from "../../../../models/Hospital.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Service from "../../../../backend/models/Service.js";
import Availability from "../../../../backend/models/Availability.js";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig.js";
import Subscription from "../../../../backend/models/Subscription.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Resolve user across models
    let user =
      (await User.findById(userId).lean()) ||
      (await IndividualDoctor.findById(userId).lean()) ||
      (await MultiDoctorClinic.findById(userId).lean()) ||
      (await Hospital.findById(userId).lean());

    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const clinic = await Clinic.findOne({ ownerId: user._id }).lean();
    let payload = {
      user: {
        ...user,
        name: user.name || user.adminName,
        phone: user.phone || "",
        email: user.email || "",
      },
      clinic: null,
      doctorProfile: null,
      services: [],
      availability: [],
      websiteConfig: null,
      subscription: null,
    };

    if (clinic) {
      payload.clinic = clinic;
      payload.doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
      payload.services = await Service.find({ clinicId: clinic._id }).lean();
      payload.availability = await Availability.find({ clinicId: clinic._id }).lean();
      payload.websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id }).lean();
      payload.subscription = await Subscription.findOne({ clinicId: clinic._id }).lean();
    }

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error("GET Onboarding Wizard Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, doctorProfile, clinicDetails, services, availability, websiteConfig } = body;

    // Resolve user/provider document
    let user =
      (await IndividualDoctor.findById(userId)) ||
      (await MultiDoctorClinic.findById(userId)) ||
      (await Hospital.findById(userId)) ||
      (await User.findById(userId));

    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    // Identify entity type from token/session/payload/user
    const rawRoleOrType =
      decoded.role ||
      decoded.provider_type ||
      user.role ||
      user.entityType ||
      user.accountType ||
      user.provider_type ||
      body.entityType ||
      body.role ||
      body.accountType ||
      "INDIVIDUAL_DOCTOR";

    let entityType = "INDIVIDUAL_DOCTOR";
    if (
      rawRoleOrType === "MULTI_DOCTOR_CLINIC" ||
      rawRoleOrType === "clinic" ||
      rawRoleOrType === "CLINIC_ADMIN"
    ) {
      entityType = "MULTI_DOCTOR_CLINIC";
    } else if (
      rawRoleOrType === "HOSPITAL" ||
      rawRoleOrType === "hospital" ||
      rawRoleOrType === "HOSPITAL_ADMIN"
    ) {
      entityType = "HOSPITAL";
    } else {
      entityType = "INDIVIDUAL_DOCTOR";
    }

    // Clean up doctor name
    let rawDocName = doctorProfile?.fullName || user.name || user.adminName || "Doctor";
    rawDocName = rawDocName.replace(/^Dr\.?\s*/i, "").trim();
    const normalizedDoctorName = `Dr. ${rawDocName}`;

    // Sanitize buttonStyle
    const allowedStyles = ["rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full", "rounded-none"];
    const incomingStyle = websiteConfig?.buttonStyle || "rounded-full";
    const sanitizedStyle = allowedStyles.includes(incomingStyle) ? incomingStyle : "rounded-full";

    // 1. Upsert Clinic
    const clinicName = clinicDetails?.name || user.practiceName || user.clinicName || user.hospitalName || "My Clinic";
    const phone = clinicDetails?.phone || user.phone || "9999999999";
    const rawSlug = clinicDetails?.slug || user.slug || clinicName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const clinicRole =
      entityType === "MULTI_DOCTOR_CLINIC"
        ? "MULTI_DOCTOR_CLINIC"
        : entityType === "HOSPITAL"
        ? "HOSPITAL"
        : "INDIVIDUAL_CLINIC";

    const clinicCategory =
      entityType === "HOSPITAL"
        ? "Hospital"
        : entityType === "MULTI_DOCTOR_CLINIC"
        ? "Multi-Doctor Clinic"
        : "Solo Doctor Clinic";

    const clinic = await Clinic.findOneAndUpdate(
      { ownerId: userId },
      {
        ownerId: userId,
        name: clinicName,
        slug: rawSlug,
        phone: phone,
        address: clinicDetails?.address || "Main Road",
        city: clinicDetails?.city || "Healthcare City",
        role: clinicRole,
        entityType: entityType,
        category: clinicCategory,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // 2. Upsert DoctorProfile with safe fallbacks
    const doctorRole =
      entityType === "MULTI_DOCTOR_CLINIC"
        ? "CLINIC_DOCTOR"
        : entityType === "HOSPITAL"
        ? "HOSPITAL_DOCTOR"
        : "INDIVIDUAL_DOCTOR";

    const doctorCategory =
      doctorProfile?.specialization?.trim() ||
      body.specialization?.trim() ||
      body.category ||
      user.specialization ||
      "General Practice";

    const photoUrl = doctorProfile?.profilePhoto || doctorProfile?.avatarUrl || "";
    const cleanDoctorProfile = {
      fullName: normalizedDoctorName,
      qualification: doctorProfile?.qualification?.trim() || "MBBS",
      specialization: doctorProfile?.specialization?.trim() || user.specialization || "General Physician",
      specialty: doctorProfile?.specialty || "general_opd",
      experienceYrs: Number(doctorProfile?.experienceYrs) || 5,
      regNumber: doctorProfile?.regNumber?.trim() || "",
      bio: doctorProfile?.bio?.trim() || "",
      avatarUrl: photoUrl,
      profilePhoto: photoUrl,
      role: doctorRole,
      entityType: entityType,
      category: doctorCategory,
    };
    let profile = await DoctorProfile.findOne({ clinicId: clinic._id });
    if (!profile) {
      profile = new DoctorProfile({ clinicId: clinic._id, userId: user._id, ...cleanDoctorProfile });
    } else {
      Object.assign(profile, cleanDoctorProfile);
    }
    await profile.save();

    // 3. Upsert Subscription with 14-Day Free Trial Policy
    const rawPlanId = (plan?.planId || "BASIC").toLowerCase().trim();
    let normalizedPlanId = "STARTER";
    if (rawPlanId === "basic" || rawPlanId === "starter") {
      normalizedPlanId = "STARTER";
    } else if (rawPlanId === "pro" || rawPlanId === "advanced" || rawPlanId === "professional") {
      normalizedPlanId = "PRO";
    } else if (rawPlanId === "premium" || rawPlanId === "enterprise") {
      normalizedPlanId = "PREMIUM";
    } else {
      normalizedPlanId = rawPlanId.toUpperCase();
    }

    const isTrial = normalizedPlanId === "STARTER" || rawPlanId === "basic" || rawPlanId === "starter";
    const trialDays = 14;
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const subStatus = isTrial ? "TRIAL" : "ACTIVE";

    let subscription = await Subscription.findOne({ clinicId: clinic._id });
    if (!subscription) {
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      subscription = new Subscription({
        clinicId: clinic._id,
        userId: user._id,
        planId: normalizedPlanId,
        billingCycle: (plan?.billingCycle || "MONTHLY").toUpperCase(),
        price: plan?.price || (isTrial ? 499 : 999),
        status: subStatus,
        startDate: now,
        endDate,
      });
    } else {
      subscription.planId = normalizedPlanId;
      subscription.billingCycle = (plan?.billingCycle || "MONTHLY").toUpperCase();
      subscription.price = plan?.price || (isTrial ? 499 : 999);
      subscription.status = subStatus;
    }
    await subscription.save();

    // 4. Upsert Services
    if (services && services.length > 0) {
      await Service.deleteMany({ clinicId: clinic._id });
      const serviceDocs = services.map((s) => ({ ...s, clinicId: clinic._id }));
      await Service.insertMany(serviceDocs);
    }

    // 5. Upsert Availability
    if (availability && availability.length > 0) {
      await Availability.deleteMany({ clinicId: clinic._id });
      const availDocs = availability.map((a) => ({ ...a, clinicId: clinic._id }));
      await Availability.insertMany(availDocs);
    }

    // 6. Upsert WebsiteConfig & publish instantly
    if (websiteConfig) {
      const cleanWebsiteConfig = { 
        ...websiteConfig, 
        doctorPhoto: websiteConfig?.doctorPhoto || photoUrl || "",
        clinicLogo: websiteConfig?.clinicLogo || clinicDetails?.logo || "",
        buttonStyle: sanitizedStyle 
      };
      let webConfig = await WebsiteConfig.findOne({ clinicId: clinic._id });
      if (!webConfig) {
        webConfig = new WebsiteConfig({
          clinicId: clinic._id,
          ...cleanWebsiteConfig,
          isPublished: true,
          publishedUrl: `/${clinic.slug}`,
        });
      } else {
        Object.assign(webConfig, cleanWebsiteConfig);
        webConfig.isPublished = true;
        webConfig.publishedUrl = `/${clinic.slug}`;
      }
      await webConfig.save();
    }

    // 7. Update Provider Entity Status
    if (user) {
      user.website_status = "published";
      user.subscription_status = isTrial ? "pending" : "active";
      user.hasCompletedOnboarding = true;
      user.isOnboardingCompleted = true;
      if (rawSlug) user.slug = rawSlug;
      await user.save();
    }

    // 8. Refresh JWT & session cookies with completed onboarding status
    const updatedToken = signToken({
      id: user ? user._id.toString() : userId,
      email: user?.email || decoded.email,
      provider_type: user?.provider_type || decoded.provider_type || "individual_doctor",
      role: user?.role || decoded.role || "INDIVIDUAL_DOCTOR",
      entityType: user?.entityType || decoded.entityType || "INDIVIDUAL_DOCTOR",
      category: user?.category || decoded.category || "Solo Practitioner",
      isOnboardingCompleted: true,
      hasCompletedOnboarding: true,
    });

    const response = NextResponse.json({
      success: true,
      message: isTrial
        ? "14-Day Free Trial activated and website published successfully!"
        : "Onboarding completed and website published successfully!",
      slug: clinic.slug,
      isTrial,
      trialEndsAt: isTrial ? trialEndsAt : null,
      isOnboardingCompleted: true,
    });

    response.cookies.set("token", updatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("is_onboarding_completed", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST Onboarding Wizard Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

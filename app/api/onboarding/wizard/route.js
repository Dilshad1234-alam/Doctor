import { NextResponse } from "next/server";
import { verifyToken } from "../../../../backend/utils/jwt";
import dbConnect from "../../../../backend/config/db";
import User from "../../../../backend/models/User";
import Clinic from "../../../../backend/models/Clinic";
import DoctorProfile from "../../../../backend/models/DoctorProfile";
import Service from "../../../../backend/models/Service";
import Availability from "../../../../backend/models/Availability";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig";
import Subscription from "../../../../backend/models/Subscription";

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

    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const clinic = await Clinic.findOne({ ownerId: user._id }).lean();
    let payload = { user, clinic: null, doctorProfile: null, services: [], availability: [], websiteConfig: null, subscription: null };

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

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    // Clean up doctor name to prevent duplicate "Dr." prefixes:
    let rawDocName = body.doctorProfile?.fullName || body.doctorName || "Doctor";
    rawDocName = rawDocName.replace(/^Dr\.?\s*/i, "").trim();
    const normalizedDoctorName = `Dr. ${rawDocName}`;

    // Sanitize buttonStyle before saving to prevent validation crashes:
    const allowedStyles = ['rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full', 'rounded-none'];
    const incomingStyle = body.websiteConfig?.buttonStyle || 'rounded-xl';
    const sanitizedStyle = allowedStyles.includes(incomingStyle) ? incomingStyle : 'rounded-xl';

    // 1. Upsert Clinic
    const clinicName = clinicDetails?.name || "My Clinic";
    const phone = clinicDetails?.phone || "9999999999";
    const rawSlug = clinicDetails?.slug || clinicName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const clinic = await Clinic.findOneAndUpdate(
      { ownerId: userId },
      {
        ownerId: userId,
        name: clinicName,
        slug: rawSlug,
        phone: phone,
        address: clinicDetails?.address || "Main Road",
        city: clinicDetails?.city || "Patna",
      },
      { upsert: true, new: true, runValidators: true }
    );

    // 2. Upsert DoctorProfile
    const cleanDoctorProfile = { ...doctorProfile, fullName: normalizedDoctorName };
    let profile = await DoctorProfile.findOne({ clinicId: clinic._id });
    if (!profile) {
      profile = new DoctorProfile({ clinicId: clinic._id, userId: user._id, ...cleanDoctorProfile });
    } else {
      Object.assign(profile, cleanDoctorProfile);
    }
    await profile.save();

    // 3. Upsert Subscription
    let subscription = await Subscription.findOne({ clinicId: clinic._id });
    if (!subscription) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // Mock 1 year
      
      subscription = new Subscription({
        clinicId: clinic._id,
        userId: user._id,
        planId: plan.planId,
        billingCycle: plan.billingCycle || 'MONTHLY',
        price: plan.price || 0,
        status: 'ACTIVE',
        startDate,
        endDate
      });
    } else {
      subscription.planId = plan.planId;
      subscription.billingCycle = plan.billingCycle || 'MONTHLY';
      subscription.price = plan.price || 0;
    }
    await subscription.save();

    // 4. Upsert Services
    if (services && services.length > 0) {
      await Service.deleteMany({ clinicId: clinic._id });
      const serviceDocs = services.map(s => ({ ...s, clinicId: clinic._id }));
      await Service.insertMany(serviceDocs);
    }

    // 5. Upsert Availability
    if (availability && availability.length > 0) {
      await Availability.deleteMany({ clinicId: clinic._id });
      const availDocs = availability.map(a => ({ ...a, clinicId: clinic._id }));
      await Availability.insertMany(availDocs);
    }

    // 6. Upsert WebsiteConfig
    if (websiteConfig) {
      const cleanWebsiteConfig = { ...websiteConfig, buttonStyle: sanitizedStyle };
      let webConfig = await WebsiteConfig.findOne({ clinicId: clinic._id });
      if (!webConfig) {
        webConfig = new WebsiteConfig({ clinicId: clinic._id, ...cleanWebsiteConfig, isPublished: true, publishedUrl: `/${clinic.slug}` });
      } else {
        Object.assign(webConfig, cleanWebsiteConfig);
        webConfig.isPublished = true;
        webConfig.publishedUrl = `/${clinic.slug}`;
      }
      await webConfig.save();
    }

    // 7. Mark User as onboarded
    user.hasCompletedOnboarding = true;
    await user.save();

    return NextResponse.json({ success: true, message: "Onboarding completed successfully!", slug: clinic.slug });

  } catch (error) {
    console.error("POST Onboarding Wizard Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyToken } from "../../../../backend/utils/jwt";
import dbConnect from "../../../../backend/config/db";
import User from "../../../../backend/models/User";
import Clinic from "../../../../backend/models/Clinic";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig";
import DoctorProfile from "../../../../backend/models/DoctorProfile";
import Subscription from "../../../../backend/models/Subscription";
import { cookies } from "next/headers";

import { getPlanTier } from "../../../../lib/planLimits";
import { getThemeConfig } from "../../../../lib/themeColors";

export const dynamic = "force-dynamic";

async function handleSaveWebsiteBuilder(req) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);
    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { 
      doctorPhoto, 
      profilePhoto, 
      image,
      avatarUrl,
      clinicLogo, 
      logo, 
      templateId, 
      themeColor, 
      primaryColor,
      buttonShape,
      buttonStyle,
      fontStyle,
      showSections,
      customDomain,
      hideBranding,
      videoBioUrl
    } = body;

    const photoUrl = doctorPhoto || profilePhoto || image || avatarUrl || "";
    const logoUrl = clinicLogo || logo || "";
    const requestedColor = themeColor || primaryColor || "teal";
    const requestedShape = buttonShape || buttonStyle || "curved";

    let clinic = await Clinic.findOne({ ownerId: userId });
    if (!clinic) {
      const doc = await DoctorProfile.findOne({ userId });
      if (doc?.clinicId) {
        clinic = await Clinic.findById(doc.clinicId);
      }
    }

    const clinicId = clinic ? clinic._id : userId;

    // Check subscription plan and retrieve tier limits
    const subscription = await Subscription.findOne({
      $or: [{ userId: userId }, { clinicId: clinicId }, { doctorId: userId }]
    }).lean();

    const planId = (subscription?.planId || "BASIC").toUpperCase();
    const isAdvanced = planId === "ADVANCED" || planId === "PRO" || planId === "PREMIUM";
    const isPremium = planId === "PREMIUM";
    const tierConfig = getPlanTier(planId);

    // 1. Strict Color Validation
    const mappedTheme = getThemeConfig(requestedColor);
    let finalColor = requestedColor;
    if (!tierConfig.allowedColors.includes(mappedTheme.id.toLowerCase())) {
      finalColor = 'teal'; // Fallback to basic allowed color
    }

    // 2. Strict Shape Validation
    let finalShape = requestedShape;
    if (!tierConfig.allowedShapes.includes(requestedShape.toLowerCase())) {
      finalShape = 'curved'; // Fallback to basic allowed shape
    }

    // 3. Strict Template Validation
    let finalTemplate = templateId || "template-1";
    if (!tierConfig.allowedTemplates.includes(finalTemplate.toLowerCase())) {
      finalTemplate = "template-1"; // Fallback to basic template
    }

    // 4. Feature Gating
    const finalCustomDomain = tierConfig.features.customDomain ? (customDomain || "") : "";
    const finalHideBranding = tierConfig.features.whiteLabel ? Boolean(hideBranding) : false;
    const finalVideoBioUrl = tierConfig.features.videoBio ? (videoBioUrl || "") : "";

    // 1. Sync & Permanently Save in DoctorProfile model
    await DoctorProfile.findOneAndUpdate(
      { $or: [{ userId: userId }, ...(clinic ? [{ clinicId: clinic._id }] : [])] },
      { 
        profilePhoto: photoUrl, 
        image: photoUrl, 
        avatarUrl: photoUrl 
      },
      { new: true, upsert: true }
    );

    // 2. Sync Clinic logo and customDomain if clinic exists
    if (clinic) {
      if (logoUrl !== undefined) clinic.logo = logoUrl;
      clinic.customDomain = finalCustomDomain;
      await clinic.save();
    }

    // 3. Update / Upsert WebsiteConfig model
    const configUpdate = {
      ...body,
      doctorId: userId,
      clinicId: clinicId,
      doctorPhoto: photoUrl,
      clinicLogo: logoUrl,
      primaryColor: finalColor,
      themeColor: finalColor,
      buttonShape: finalShape,
      buttonStyle: finalShape,
      templateId: finalTemplate,
      fontStyle: fontStyle || "Plus Jakarta Sans",
      hideBranding: finalHideBranding,
      videoBioUrl: finalVideoBioUrl,
      showSections: showSections || { about: true, services: true, timings: true, contact: true },
      isPublished: true,
      publishedUrl: clinic?.slug ? `/${clinic.slug}` : ""
    };

    const websiteConfig = await WebsiteConfig.findOneAndUpdate(
      { $or: [{ clinicId: clinicId }, { doctorId: userId }] },
      configUpdate,
      { upsert: true, returnDocument: 'after' }
    );

    const updatedDoctor = await DoctorProfile.findOne({ 
      $or: [{ userId: userId }, ...(clinic ? [{ clinicId: clinic._id }] : [])] 
    });

    return NextResponse.json({ 
      success: true, 
      websiteConfig, 
      clinic, 
      doctor: updatedDoctor,
      isAdvanced,
      isPremium,
      subscription 
    });
  } catch (error) {
    console.error("Website Builder save error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);
    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const clinic = await Clinic.findOne({ ownerId: userId });
    const doctor = await DoctorProfile.findOne({ 
      $or: [{ userId: userId }, ...(clinic ? [{ clinicId: clinic._id }] : [])] 
    });

    const subscription = await Subscription.findOne({
      $or: [{ userId: userId }, ...(clinic ? [{ clinicId: clinic._id }] : []), { doctorId: userId }]
    }).lean();

    const planId = (subscription?.planId || "BASIC").toUpperCase();
    const isAdvanced = planId === "ADVANCED" || planId === "PRO" || planId === "PREMIUM";
    const isPremium = planId === "PREMIUM";

    let websiteConfig = await WebsiteConfig.findOne({ 
      $or: [
        ...(clinic ? [{ clinicId: clinic._id }] : []), 
        { doctorId: userId }
      ] 
    });

    const currentPhoto = doctor?.profilePhoto || doctor?.image || doctor?.avatarUrl || "";
    const currentLogo = clinic?.logo || "";

    if (!websiteConfig && clinic) {
      websiteConfig = new WebsiteConfig({
        clinicId: clinic._id,
        doctorId: userId,
        templateId: "template-1",
        doctorPhoto: currentPhoto,
        clinicLogo: currentLogo,
        primaryColor: "#00A1AC",
        themeColor: "#00A1AC",
        fontStyle: "Plus Jakarta Sans",
        hideBranding: false,
        videoBioUrl: "",
        isPublished: true,
        showSections: { about: true, services: true, timings: true, contact: true }
      });
      await websiteConfig.save();
    } else if (websiteConfig && currentPhoto && !websiteConfig.doctorPhoto) {
      websiteConfig.doctorPhoto = currentPhoto;
      await websiteConfig.save();
    }

    return NextResponse.json({ 
      success: true, 
      clinic, 
      doctor, 
      websiteConfig, 
      slug: clinic?.slug || "",
      customDomain: clinic?.customDomain || "",
      isAdvanced,
      isPremium,
      subscription 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  return handleSaveWebsiteBuilder(req);
}

export async function POST(req) {
  return handleSaveWebsiteBuilder(req);
}

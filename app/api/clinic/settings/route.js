import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

import Subscription from "../../../../backend/models/Subscription.js";

export const dynamic = "force-dynamic";

async function authenticateAndGetIds() {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Invalid session");
  
  return decoded.id || decoded.userId || decoded._id;
}

export async function GET() {
  try {
    const userId = await authenticateAndGetIds();
    const clinic = await Clinic.findOne({ ownerId: userId }).lean();
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id }).lean() || 
                          await DoctorProfile.findOne({ userId: userId }).lean();
    const websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id }).lean();
    
    const subscription = await Subscription.findOne({
      $or: [{ userId: userId }, { clinicId: clinic._id }, { doctorId: userId }]
    }).lean();

    const planId = (subscription?.planId || "BASIC").toUpperCase();
    const isAdvanced = planId === "ADVANCED" || planId === "PRO" || planId === "PREMIUM";
    const isPremium = planId === "PREMIUM";

    return NextResponse.json({ 
      success: true, 
      clinic, 
      doctorProfile, 
      websiteConfig,
      subscription,
      planId,
      isAdvanced,
      isPremium
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const userId = await authenticateAndGetIds();
    const body = await req.json();
    const { 
      clinicName, phone, address, city, logo, clinicLogo,
      googleMapsUrl, whatsAppNotifications, whatsAppWebhookUrl,
      doctorName, qualification, specialization, experienceYrs, 
      profilePhoto, doctorPhoto, bio 
    } = body;

    const chosenLogo = clinicLogo !== undefined ? clinicLogo : (logo !== undefined ? logo : undefined);
    const chosenPhoto = profilePhoto !== undefined ? profilePhoto : (doctorPhoto !== undefined ? doctorPhoto : undefined);
    
    const clinicUpdate = {};
    if (clinicName !== undefined) clinicUpdate.name = clinicName;
    if (phone !== undefined) clinicUpdate.phone = phone;
    if (address !== undefined) clinicUpdate.address = address;
    if (city !== undefined) clinicUpdate.city = city;
    if (chosenLogo !== undefined) clinicUpdate.logo = chosenLogo;
    if (googleMapsUrl !== undefined) clinicUpdate.googleMapsUrl = googleMapsUrl;
    if (whatsAppNotifications !== undefined) clinicUpdate.whatsAppNotifications = Boolean(whatsAppNotifications);
    if (whatsAppWebhookUrl !== undefined) clinicUpdate.whatsAppWebhookUrl = whatsAppWebhookUrl;

    const clinic = await Clinic.findOneAndUpdate(
      { ownerId: userId },
      { $set: clinicUpdate },
      { new: true }
    );
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const doctorUpdate = { 
      clinicId: clinic._id,
      userId: userId
    };
    if (doctorName !== undefined) doctorUpdate.fullName = doctorName;
    if (qualification !== undefined) doctorUpdate.qualification = qualification;
    if (specialization !== undefined) doctorUpdate.specialization = specialization;
    if (experienceYrs !== undefined) doctorUpdate.experienceYrs = Number(experienceYrs) || 0;
    if (bio !== undefined) doctorUpdate.bio = bio;
    if (chosenPhoto !== undefined) {
      doctorUpdate.profilePhoto = chosenPhoto;
      doctorUpdate.avatarUrl = chosenPhoto;
    }

    const updatedDoctor = await DoctorProfile.findOneAndUpdate(
      { $or: [{ clinicId: clinic._id }, { userId: userId }] },
      { $set: doctorUpdate },
      { new: true, upsert: true }
    );

    // Also sync WebsiteConfig if exists or create
    let webConfig = await WebsiteConfig.findOne({ clinicId: clinic._id });
    if (webConfig) {
      if (chosenPhoto !== undefined) webConfig.doctorPhoto = chosenPhoto;
      if (chosenLogo !== undefined) webConfig.clinicLogo = chosenLogo;
      await webConfig.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      clinic, 
      doctorProfile: updatedDoctor,
      websiteConfig: webConfig 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

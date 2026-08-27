import { NextResponse } from "next/server";
import { verifyToken } from "../../../../backend/utils/jwt";
import dbConnect from "../../../../backend/config/db";
import Clinic from "../../../../backend/models/Clinic";
import DoctorProfile from "../../../../backend/models/DoctorProfile";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig";
import Service from "../../../../backend/models/Service";
import Subscription from "../../../../backend/models/Subscription";
import { cookies } from "next/headers";
import { getSpecialtyPreset } from "../../../../lib/specialtyPresets";
import { getPlanTier } from "../../../../lib/planLimits";
import { getThemeConfig } from "../../../../lib/themeColors";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);
    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { presetId, seedServices = false } = body;
    const preset = getSpecialtyPreset(presetId);

    let clinic = await Clinic.findOne({ ownerId: userId });
    let doctor = await DoctorProfile.findOne({ userId });
    if (!clinic && doctor?.clinicId) {
      clinic = await Clinic.findById(doctor.clinicId);
    }
    if (!clinic) {
      return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });
    }

    // Check subscription plan tier limits
    const subscription = await Subscription.findOne({
      $or: [{ userId: userId }, { clinicId: clinic._id }, { doctorId: userId }]
    }).lean();
    const planId = (subscription?.planId || "BASIC").toUpperCase();
    const tierConfig = getPlanTier(planId);

    // 1. Update Doctor Specialization
    const updatedDoctor = await DoctorProfile.findOneAndUpdate(
      { $or: [{ userId: userId }, { clinicId: clinic._id }] },
      { 
        specialization: preset.defaultSpecialization,
        specialty: preset.id
      },
      { new: true, upsert: true }
    );

    // 2. Validate Color for user's tier
    let allowedColor = preset.color;
    const mappedTheme = getThemeConfig(preset.color);
    if (!tierConfig.allowedColors.includes(mappedTheme.id.toLowerCase())) {
      allowedColor = tierConfig.allowedColors[0] || 'teal';
    }
    const colorHex = getThemeConfig(allowedColor).primary;

    // 3. Update WebsiteConfig with preset color & badge highlights
    const updatedConfig = await WebsiteConfig.findOneAndUpdate(
      { $or: [{ clinicId: clinic._id }, { doctorId: userId }] },
      {
        themeColor: allowedColor,
        primaryColor: colorHex,
        isPublished: true,
        publishedUrl: `/${clinic.slug}`
      },
      { new: true, upsert: true }
    );

    // 4. Seed Starter Services if requested or if clinic currently has 0 active services
    const existingServicesCount = await Service.countDocuments({ clinicId: clinic._id, isActive: true });
    let seededServices = [];

    if (seedServices || existingServicesCount === 0) {
      // Respect tier limit on services count (BASIC max 5 services)
      const maxToSeed = planId === 'BASIC' ? 5 : preset.services.length;
      const servicesToInsert = preset.services.slice(0, maxToSeed).map(s => ({
        clinicId: clinic._id,
        doctorId: updatedDoctor._id,
        name: s.name,
        description: s.description,
        price: s.price,
        durationMins: s.durationMins,
        isActive: true
      }));

      // If re-seeding explicitly requested, deactivate older services or append
      if (seedServices) {
        await Service.updateMany({ clinicId: clinic._id }, { isActive: false });
      }

      seededServices = await Service.insertMany(servicesToInsert);
    }

    const currentServices = await Service.find({ clinicId: clinic._id, isActive: true }).lean();

    return NextResponse.json({
      success: true,
      message: `Successfully applied ${preset.name} preset!`,
      preset,
      doctor: updatedDoctor,
      websiteConfig: updatedConfig,
      services: currentServices
    });

  } catch (err) {
    console.error("Error applying specialty preset:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to apply preset" }, { status: 500 });
  }
}

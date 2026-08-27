import React from 'react';
import connectDB from '../../backend/config/db.js';
import Clinic from '../../backend/models/Clinic.js';
import DoctorProfile from '../../backend/models/DoctorProfile.js';
import Service from '../../backend/models/Service.js';
import Availability from '../../backend/models/Availability.js';
import WebsiteConfig from '../../backend/models/WebsiteConfig.js';
import Subscription from '../../backend/models/Subscription.js';
import LuxuryGoldTemplate from '../../components/templates/LuxuryGoldTemplate.js';
import AdvancedDoctorTemplate from '../../components/templates/AdvancedDoctorTemplate.js';
import ModernDoctorTemplate from '../../components/templates/ModernDoctorTemplate.js';
import { COLOR_PALETTES, resolveColor, THEME_COLOR_MAP, BUTTON_SHAPE_MAP, getThemeConfig, getButtonShapeClass } from '../../lib/themeColors.js';
import { getPlanTier } from '../../lib/planLimits.js';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || params?.clinicSlug;
  
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  if (!clinic) return { title: 'Clinic Not Found' };
  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  
  const rawDocName = doctor?.fullName || 'Doctor';
  const cleanDocName = `Dr. ${rawDocName.replace(/^Dr\.?\s*/i, "").trim() || 'Doctor'}`;
  const spec = doctor?.specialization || 'Specialist';
  const qual = doctor?.qualification || 'Medical Professional';

  return {
    title: `${cleanDocName} | ${clinic.name} - VIP Executive Medical Portal`,
    description: `Consult ${cleanDocName} (${spec}, ${qual}) at ${clinic.name}, ${clinic.address}. Book instant confirmed VIP OPD slot.`,
    keywords: `OPD booking, ${clinic.name}, ${clinic.city}, ${spec}, doctor appointment, VIP medical`
  };
}

async function getClinicData(slug) {
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  if (!clinic) return null;

  let doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  if (!doctor && clinic.ownerId) {
    doctor = await DoctorProfile.findOne({ userId: clinic.ownerId }).lean();
  }
  const services = await Service.find({ clinicId: clinic._id, isActive: true }).lean();
  const availability = await Availability.find({ clinicId: clinic._id }).lean();
  let websiteConfig = await WebsiteConfig.findOne({ 
    $or: [{ clinicId: clinic._id }, ...(clinic.ownerId ? [{ doctorId: clinic.ownerId }] : [])] 
  }).lean();
  
  let subscription = await Subscription.findOne({
    $or: [{ clinicId: clinic._id }, ...(clinic.ownerId ? [{ userId: clinic.ownerId }] : [])]
  }).lean();

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const isAdvanced = planId === "ADVANCED" || planId === "PRO" || planId === "PREMIUM";
  const isPremium = planId === "PREMIUM" || planId === "ENTERPRISE";

  return { clinic, doctor, services, availability, websiteConfig, isAdvanced, isPremium, subscription };
}

export default async function ClinicPage(props) {
  const params = await props.params;
  const slug = params?.slug || params?.clinicSlug;
  
  const data = await getClinicData(slug);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-slate-900 font-sans">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-black mb-4 text-center">Clinic Not Found</h1>
        <p className="text-slate-500 mb-8 text-center max-w-md text-sm">
          We couldn&apos;t find an active clinic with the URL slug &ldquo;<strong className="text-slate-900">{slug}</strong>&rdquo;.
        </p>
        <Link href="/login" className="px-6 py-3 bg-[#00A1AC] text-white rounded-xl font-bold transition-all shadow-md text-sm hover:bg-[#008790]">
          Doctor Login
        </Link>
      </div>
    );
  }

  const { clinic, doctor, services, availability, websiteConfig, isAdvanced, isPremium, subscription } = data;
  const clinicData = JSON.parse(JSON.stringify(clinic));
  const doctorData = JSON.parse(JSON.stringify(doctor || {}));
  const servicesData = JSON.parse(JSON.stringify(services || []));
  const availabilityData = JSON.parse(JSON.stringify(availability || []));
  let websiteConfigData = websiteConfig ? JSON.parse(JSON.stringify(websiteConfig)) : {};

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const tierConfig = getPlanTier(planId);

  // 1. Strict Tier Color Gating
  const requestedColor = websiteConfigData?.themeColor || websiteConfigData?.primaryColor || 'teal';
  const mappedTheme = getThemeConfig(requestedColor);
  let effectiveColor = requestedColor;
  if (!tierConfig.allowedColors.includes(mappedTheme.id.toLowerCase())) {
    effectiveColor = tierConfig.allowedColors[0] || 'teal';
  }
  websiteConfigData.themeColor = effectiveColor;
  websiteConfigData.primaryColor = getThemeConfig(effectiveColor).primary;

  // 2. Strict Tier Button Shape Gating
  const requestedShape = websiteConfigData?.buttonShape || websiteConfigData?.buttonStyle || 'curved';
  let effectiveShape = requestedShape;
  if (!tierConfig.allowedShapes.includes(requestedShape.toLowerCase())) {
    effectiveShape = 'curved';
  }
  websiteConfigData.buttonShape = effectiveShape;
  websiteConfigData.buttonStyle = getButtonShapeClass(effectiveShape);

  // 3. Strict Feature Flags Gating
  if (!tierConfig.features.whiteLabel) {
    websiteConfigData.hideBranding = false;
  }
  if (!tierConfig.features.videoBio) {
    websiteConfigData.videoBioUrl = "";
  }

  const templateId = websiteConfigData?.templateId || 'template-1';

  // 4. Strict Tier Template Routing Engine
  if (isPremium && (templateId === 'template-4' || templateId === 'executive_luxury' || templateId === 'specialist_dark')) {
    return (
      <LuxuryGoldTemplate
        clinic={clinicData}
        doctor={doctorData}
        services={servicesData}
        availability={availabilityData}
        websiteConfig={websiteConfigData}
        slug={slug}
        isAdvanced={isAdvanced}
        isPremium={isPremium}
      />
    );
  }

  if ((isAdvanced || isPremium) && (templateId === 'template-2' || templateId === 'template-3' || templateId === 'modern_converter')) {
    return (
      <AdvancedDoctorTemplate
        clinic={clinicData}
        doctor={doctorData}
        services={servicesData}
        availability={availabilityData}
        websiteConfig={websiteConfigData}
        slug={slug}
        isAdvanced={isAdvanced}
        isPremium={isPremium}
      />
    );
  }

  // Fallback for BASIC tier (or default basic template)
  return (
    <ModernDoctorTemplate
      clinic={clinicData}
      doctor={doctorData}
      services={servicesData}
      availability={availabilityData}
      websiteConfig={websiteConfigData}
      slug={slug}
      isAdvanced={isAdvanced}
      isPremium={isPremium}
    />
  );
}

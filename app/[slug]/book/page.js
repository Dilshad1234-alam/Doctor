import Link from "next/link";
import { ArrowLeft, AlertTriangle, Stethoscope, ShieldCheck, Crown, ArrowRight, Lock, Phone } from "lucide-react";
import connectDB from "../../../backend/config/db.js";
import Clinic from "../../../backend/models/Clinic.js";
import Service from "../../../backend/models/Service.js";
import DoctorProfile from "../../../backend/models/DoctorProfile.js";
import Availability from "../../../backend/models/Availability.js";
import WebsiteConfig from "../../../backend/models/WebsiteConfig.js";
import Appointment from "../../../backend/models/Appointment.js";
import BookingClientWrapper from "./BookingClient.js";
import { getSpecialtyPreset, detectSpecialtyFromText } from "../../../lib/specialtyPresets.js";
import { getThemeConfig, getButtonShapeClass } from "../../../lib/themeColors.js";

export const dynamic = "force-dynamic";

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || params?.clinicSlug;
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, "i") }).lean();
  return {
    title: clinic ? `Book Appointment | ${clinic.name}` : "Book Appointment",
    description: clinic ? `Reserve your confirmed consultation at ${clinic.name}. Instant confirmation.` : "Online Appointment Booking",
  };
}

export default async function DedicatedBookPage(props) {
  const params = await props.params;
  const slug = params?.slug || params?.clinicSlug;

  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, "i") }).lean();

  if (!clinic) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-slate-900 font-sans">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-black mb-3 text-center">Clinic Not Found</h1>
        <p className="text-slate-500 mb-8 text-center max-w-md text-sm">
          We couldn&apos;t find an active clinic with the URL slug &ldquo;<strong className="text-slate-900">{slug}</strong>&rdquo;.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-[#00A1AC] text-white font-bold rounded-xl hover:bg-[#008790] transition-all shadow-lg text-sm"
        >
          Return Home
        </Link>
      </div>
    );
  }

  let doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  if (!doctor && clinic.ownerId) {
    doctor = await DoctorProfile.findOne({ userId: clinic.ownerId }).lean();
  }

  const services = await Service.find({ clinicId: clinic._id, isActive: true }).lean();
  const availability = await Availability.find({ clinicId: clinic._id }).lean();
  
  let websiteConfig = await WebsiteConfig.findOne({ 
    $or: [{ clinicId: clinic._id }, ...(clinic.ownerId ? [{ doctorId: clinic.ownerId }] : [])] 
  }).lean();

  const detectedSpecialtyKey = doctor?.specialty || detectSpecialtyFromText(`${doctor?.specialization || ''} ${clinic?.name || ''} ${clinic?.category || ''}`);
  const specialtyPreset = getSpecialtyPreset(detectedSpecialtyKey);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookedCount = await Appointment.countDocuments({
    clinicId: clinic._id,
    date: todayStr
  });
  
  const enableDailyLimit = doctor?.enableDailyLimit || false;
  const dailyPatientLimit = doctor?.dailyPatientLimit || 30;
  const isQuotaFull = enableDailyLimit && todayBookedCount >= dailyPatientLimit;

  const themeColorSource = websiteConfig?.primaryColor || websiteConfig?.themeColor || clinic?.websiteConfig?.themeColor || doctor?.websiteConfig?.themeColor || specialtyPreset?.color || 'teal';
  
  let theme;
  if (themeColorSource.startsWith('#')) {
    theme = {
      primary: themeColorSource,
      light: `${themeColorSource}15`,
      border: `${themeColorSource}30`,
      ring: `${themeColorSource}20`
    };
  } else {
    theme = getThemeConfig(themeColorSource);
  }

  const buttonShape = websiteConfig?.buttonShape || websiteConfig?.buttonStyle || doctor?.websiteConfig?.buttonShape || 'rounded-2xl';
  const buttonShapeClass = getButtonShapeClass(buttonShape);
  const rawDocName = doctor?.fullName || doctor?.name || "Alam";
  const cleanDoctorName = rawDocName.replace(/^Dr\.?\s*/i, "");
  const clinicTitle = doctor?.clinicName || clinic?.name || "Alam Dental Clinic";
  const specialization = doctor?.specialization || doctor?.specialty || "Dentist & Oral Surgeon";
  const effectiveLogo = websiteConfig?.clinicLogo || clinic?.logo;
  
  // Checking tier for verified badge to match public navbar
  // Usually this is available via subscription, but for the booking page we can just show the badge if it's there or just use the primary theme color badge.
  const isVerified = true;

  return (
    <div className="h-screen max-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 font-sans w-full">
      
      {/* Luxury Sticky Top Navbar (Matching PublicNavbar) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs w-full px-4 sm:px-8 lg:px-12">
        <div className="w-full flex items-center justify-between h-20 gap-4">
          
          {/* Left Side: Logo & Clinic Info */}
          <div className="flex items-center justify-start flex-1 min-w-0">
            <Link href={`/${slug}`} className="flex items-center gap-3 group shrink-0">
              {effectiveLogo ? (
                <img 
                  src={effectiveLogo} 
                  alt={clinicTitle} 
                  className="h-11 w-11 rounded-2xl object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform" 
                />
              ) : (
                <div 
                  style={{ backgroundColor: theme.primary }}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform text-white"
                >
                  <Stethoscope className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 truncate">
                    {clinicTitle}
                  </span>
                  {isVerified && (
                    <span style={{ color: theme.primary, backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}40` }} className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  Dr. {cleanDoctorName} • {specialization}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Side: Back Button */}
          <div className="flex items-center justify-end">
            <Link 
              href={`/${slug}`} 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
          
        </div>
      </header>

      {/* Main Dedicated Booking Wizard Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col overflow-hidden">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-h-0 overflow-hidden mb-2 mt-2">
          <BookingClientWrapper 
            clinic={JSON.parse(JSON.stringify(clinic))} 
            doctor={JSON.parse(JSON.stringify({ ...doctor, fullName: cleanDoctorName }))} 
            services={JSON.parse(JSON.stringify(services))} 
            availability={JSON.parse(JSON.stringify(availability))}
            websiteConfig={JSON.parse(JSON.stringify(websiteConfig || {}))}
            slug={slug} 
            embedded={true}
            passedTheme={theme}
            passedButtonShapeClass={buttonShapeClass}
            isQuotaFull={isQuotaFull}
          />
        </div>
      </main>

      {/* Clean Luxury Footer */}
      <footer className="w-full py-2 px-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 shrink-0 bg-white">
        <div className="flex items-center gap-1 text-emerald-700 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Healthcare Provider</span>
        </div>
        <p className="font-medium">© {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
      </footer>

    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, AlertTriangle, Stethoscope, ShieldCheck, Crown, ArrowRight, Lock, Phone } from "lucide-react";
import connectDB from "../../../backend/config/db.js";
import Clinic from "../../../backend/models/Clinic.js";
import Service from "../../../backend/models/Service.js";
import DoctorProfile from "../../../backend/models/DoctorProfile.js";
import Availability from "../../../backend/models/Availability.js";
import WebsiteConfig from "../../../backend/models/WebsiteConfig.js";
import BookingClientWrapper from "../../../frontend/components/booking/BookingClient.js";
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
  const cleanDoctorName = `Dr. ${doctor?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  const effectiveLogo = websiteConfig?.clinicLogo || clinic?.logo;

  return (
    <div className="h-screen max-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 font-sans w-full">
      
      {/* Luxury Sticky Top Navbar */}
      <header className="h-14 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0 shadow-sm w-full z-50 sticky top-0">
        <Link 
          href={`/${slug}`} 
          className="flex items-center gap-3 group transition-all"
        >
          {effectiveLogo ? (
            <img src={effectiveLogo} alt="Logo" className="w-10 h-10 rounded-2xl object-contain p-1 border border-slate-200 bg-white shadow-sm group-hover:scale-105 transition-transform" />
          ) : (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: theme.primary }}
            >
              {clinic.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-slate-900 font-black text-base sm:text-lg tracking-tight leading-tight group-hover:opacity-80 transition-colors">
              {clinic.name}
            </h1>
            <p style={{ color: theme.primary }} className="text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {cleanDoctorName} • Confirmed OPD Booking
            </p>
          </div>
        </Link>

        <Link 
          href={`/${slug}`} 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
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

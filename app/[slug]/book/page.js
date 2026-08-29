import Link from "next/link";
import { ArrowLeft, AlertTriangle, Stethoscope, ShieldCheck, Crown, ArrowRight, Lock, Phone } from "lucide-react";
import connectDB from "../../../backend/config/db.js";
import Clinic from "../../../backend/models/Clinic.js";
import Service from "../../../backend/models/Service.js";
import DoctorProfile from "../../../backend/models/DoctorProfile.js";
import Availability from "../../../backend/models/Availability.js";
import WebsiteConfig from "../../../backend/models/WebsiteConfig.js";
import BookingClientWrapper from "../../../frontend/components/booking/BookingClient.js";

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

  // Dynamic Brand Palette Configuration
  const colorMap = {
    teal: { primary: '#008790', light: '#E6F6F7', border: '#B2E3E6', ring: 'rgba(0,135,144,0.15)' },
    teal_cyan: { primary: '#008790', light: '#E6F6F7', border: '#B2E3E6', ring: 'rgba(0,135,144,0.15)' },
    blue: { primary: '#008790', light: '#E6F6F7', border: '#B2E3E6', ring: 'rgba(0,135,144,0.15)' },
    emerald: { primary: '#059669', light: '#ECFDF5', border: '#A7F3D0', ring: 'rgba(5,150,105,0.15)' },
    navy: { primary: '#1E293B', light: '#F1F5F9', border: '#CBD5E1', ring: 'rgba(30,41,59,0.15)' },
    rose: { primary: '#E11D48', light: '#FFF1F2', border: '#FECDD3', ring: 'rgba(225,29,72,0.15)' },
    indigo: { primary: '#4F46E5', light: '#EEF2FF', border: '#C7D2FE', ring: 'rgba(79,70,229,0.15)' },
    gold: { primary: '#D97706', light: '#FFFBEB', border: '#FDE68A', ring: 'rgba(217,119,6,0.15)' }
  };

  const activeThemeKey = websiteConfig?.themeColor || doctor?.websiteConfig?.themeColor || 'teal';
  const defaultTheme = { primary: '#008790', light: '#E6F6F7', border: '#B2E3E6', ring: 'rgba(0,135,144,0.15)' };
  const theme = colorMap[activeThemeKey] || defaultTheme;

  const buttonShape = websiteConfig?.buttonShape || websiteConfig?.buttonStyle || doctor?.websiteConfig?.buttonShape || 'rounded-xl';
  const cleanDoctorName = `Dr. ${doctor?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  const effectiveLogo = websiteConfig?.clinicLogo || clinic?.logo;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between p-0 m-0 overflow-x-hidden selection:bg-[#00A1AC] selection:text-white">
      
      {/* Luxury Sticky Top Navbar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 sm:px-12 lg:px-20 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-50">
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:opacity-80 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clinic
        </Link>
      </header>

      {/* Main Dedicated Booking Wizard Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-auto py-10">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div 
            style={{ color: theme.primary, backgroundColor: theme.light, borderColor: theme.border }} 
            className="px-4 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-2 uppercase tracking-wider shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRMED OPD RESERVATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Select Your Consultation Slot</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Direct 1-on-1 consultation with {cleanDoctorName}. Guaranteed zero wait time.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-4 sm:p-8 overflow-hidden">
          <BookingClientWrapper 
            clinic={JSON.parse(JSON.stringify(clinic))} 
            doctor={JSON.parse(JSON.stringify({ ...doctor, fullName: cleanDoctorName }))} 
            services={JSON.parse(JSON.stringify(services))} 
            availability={JSON.parse(JSON.stringify(availability))}
            websiteConfig={JSON.parse(JSON.stringify(websiteConfig || {}))}
            slug={slug} 
            embedded={true}
          />
        </div>
      </main>

      {/* Clean Luxury Footer */}
      <footer className="w-full py-5 px-6 sm:px-12 lg:px-20 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 bg-white">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Healthcare Provider • Confirmed Slot Reservation</span>
        </div>
        <p className="font-medium">© {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
      </footer>

    </div>
  );
}

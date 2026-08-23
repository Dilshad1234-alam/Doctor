import Link from "next/link";
import { ArrowLeft, AlertTriangle, Stethoscope, ShieldCheck } from "lucide-react";
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
  const slug = params?.slug;
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, "i") }).lean();
  return {
    title: clinic ? `Book Appointment | ${clinic.name}` : "Book Appointment",
    description: clinic ? `Schedule your consultation at ${clinic.name}. Instant confirmation.` : "Online Appointment Booking",
  };
}

export default async function DedicatedBookPage(props) {
  const params = await props.params;
  const slug = params?.slug;

  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, "i") }).lean();

  if (!clinic) {
    return (
      <div className="min-h-screen bg-[#0a1622] flex flex-col items-center justify-center p-4 text-white">
        <AlertTriangle className="w-16 h-16 text-amber-400 mb-6 animate-bounce" />
        <h1 className="text-3xl font-black mb-3 text-center">Clinic Not Found</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md text-sm">
          We couldn&apos;t find an active clinic with the URL slug &ldquo;<strong className="text-white">{slug}</strong>&rdquo;.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 font-bold transition-all shadow-lg text-sm"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  const services = await Service.find({ clinicId: clinic._id, isActive: true }).lean();
  const availability = await Availability.find({ clinicId: clinic._id }).lean();
  const websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id }).lean();

  // Clean doctor name to prevent duplicate "Dr." prefixes
  let cleanDoctorName = doctor?.fullName || "Specialist Doctor";
  cleanDoctorName = cleanDoctorName.replace(/^(?:Dr\.?\s*)+/gi, "Dr. ");
  if (!cleanDoctorName.startsWith("Dr. ")) {
    cleanDoctorName = `Dr. ${cleanDoctorName}`;
  }

  const primaryColor = websiteConfig?.primaryColor || clinic?.websiteConfig?.primaryColor || "#059669";
  const buttonStyle = websiteConfig?.buttonStyle || clinic?.websiteConfig?.buttonStyle || "rounded-xl";

  return (
    <div className="min-h-screen w-full bg-[#0a1622] font-sans flex flex-col justify-between p-0 m-0 overflow-x-hidden">
      
      {/* Full-Width White Navbar (Matching Main Clinic Style) */}
      <header className="w-full bg-white border-b border-slate-200 px-6 sm:px-12 lg:px-20 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <Link 
          href={`/${slug}`} 
          className="flex items-center gap-3 group transition-all"
        >
          <div 
            className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform`} 
            style={{ backgroundColor: primaryColor }}
          >
            {clinic.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-base tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
              {clinic.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-emerald-600" /> {cleanDoctorName}
            </p>
          </div>
        </Link>

        <Link 
          href={`/${slug}`} 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clinic
        </Link>
      </header>

      {/* Centered Booking Card Area */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-auto py-8">
        <BookingClientWrapper 
          clinic={JSON.parse(JSON.stringify(clinic))} 
          doctor={JSON.parse(JSON.stringify({ ...doctor, fullName: cleanDoctorName }))} 
          services={JSON.parse(JSON.stringify(services))} 
          availability={JSON.parse(JSON.stringify(availability))}
          websiteConfig={JSON.parse(JSON.stringify(websiteConfig || {}))}
          slug={slug} 
          embedded={true}
        />
      </main>

      {/* Full-Width Edge-to-Edge Footer */}
      <footer className="w-full py-4 px-6 sm:px-12 lg:px-20 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 bg-[#08121c]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Healthcare Provider • Instant Confirmation</span>
        </div>
        <p>© 2026 {clinic.name}. All rights reserved.</p>
      </footer>

    </div>
  );
}

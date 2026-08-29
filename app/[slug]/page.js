import React from 'react';
import connectDB from '../../backend/config/db.js';
import Clinic from '../../backend/models/Clinic.js';
import DoctorProfile from '../../backend/models/DoctorProfile.js';
import Service from '../../backend/models/Service.js';
import Availability from '../../backend/models/Availability.js';
import WebsiteConfig from '../../backend/models/WebsiteConfig.js';
import Subscription from '../../backend/models/Subscription.js';
import PublicNavbar from '../../components/public/Navbar.js';
import PublicFooter from '../../components/public/Footer.js';
import { SPECIALTY_PRESETS, getSpecialtyPreset, detectSpecialtyFromText } from '../../lib/specialtyPresets.js';
import { getPlanTier } from '../../lib/planLimits.js';
import { getThemeConfig, getButtonShapeClass } from '../../lib/themeColors.js';
import { 
  HeartPulse, Calendar, Clock, MapPin, Phone, CheckCircle2, 
  ShieldCheck, ArrowRight, Sparkles, Crown, 
  AlertTriangle, Stethoscope, PhoneCall
} from 'lucide-react';
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
  const cleanDocName = rawDocName.startsWith('Dr.') ? rawDocName : `Dr. ${rawDocName}`;
  const spec = doctor?.specialization || 'Consultant Specialist';

  return {
    title: `${cleanDocName} | ${clinic.name} - Online OPD Booking`,
    description: `Consult ${cleanDocName} (${spec}) at ${clinic.name}. Book instant token appointments with confirmed time slot.`,
  };
}

// Dynamic Shift Parser: If disabled or '00:00 - 00:00', renders CLOSED. Else formats 12hr AM/PM
function formatShiftDisplay(dayShift) {
  if (
    !dayShift ||
    dayShift.isEnabled === false ||
    dayShift.isOpen === false ||
    !dayShift.morningStart ||
    !dayShift.morningEnd ||
    (dayShift.morningStart === '00:00' && dayShift.morningEnd === '00:00') ||
    dayShift.morningStart === dayShift.morningEnd
  ) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100">CLOSED</span>;
  }

  // Convert 24hr to 12hr AM/PM format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = String(timeStr).trim().split(':');
    if (parts.length < 2) return '';
    let hour = parseInt(parts[0], 10);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${parts[1]} ${ampm}`;
  };

  const formattedStart = formatTime(dayShift.morningStart);
  const formattedEnd = formatTime(dayShift.morningEnd);

  if (!formattedStart || !formattedEnd) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100">CLOSED</span>;
  }

  return `${formattedStart} – ${formattedEnd}`;
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
  const availability = await Availability.find({ clinicId: clinic._id }).sort({ dayOfWeek: 1 }).lean();
  let websiteConfig = await WebsiteConfig.findOne({ 
    $or: [{ clinicId: clinic._id }, ...(clinic.ownerId ? [{ doctorId: clinic.ownerId }] : [])] 
  }).lean();
  
  let subscription = await Subscription.findOne({
    $or: [{ clinicId: clinic._id }, ...(clinic.ownerId ? [{ userId: clinic.ownerId }] : [])]
  }).lean();

  return JSON.parse(JSON.stringify({ 
    clinic, 
    doctor: doctor || {}, 
    services: services || [], 
    availability: availability || [], 
    websiteConfig: websiteConfig || {}, 
    subscription: subscription || {} 
  }));
}

export default async function PublicClinicPage(props) {
  const params = await props.params;
  const slug = params?.slug || params?.clinicSlug;
  
  const data = await getClinicData(slug);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <AlertTriangle className="w-14 h-14 text-amber-500 mb-4 animate-bounce" />
        <h1 className="text-2xl sm:text-3xl font-black mb-2 text-center">Clinic Not Found</h1>
        <p className="text-slate-500 mb-6 text-center max-w-md text-xs">
          No registered clinic found with URL slug &ldquo;<strong>{slug}</strong>&rdquo;.
        </p>
        <Link href="/login" className="px-6 py-2.5 bg-[#00A1AC] text-white rounded-xl font-bold text-xs hover:bg-[#008790]">
          Doctor Portal Login
        </Link>
      </div>
    );
  }

  const { clinic, doctor, services, availability, websiteConfig, subscription } = data;
  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const tier = getPlanTier(planId);
  const isPremium = tier.isPremium;
  const isAdvanced = tier.isAdvanced;

  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.startsWith('Dr.') ? rawDocName : `Dr. ${rawDocName}`;

  // Resolve specialty preset
  const detectedSpecialtyKey = doctor?.specialty || detectSpecialtyFromText(`${doctor?.specialization || ''} ${clinic?.name || ''} ${clinic?.category || ''}`);
  const specialtyPreset = getSpecialtyPreset(detectedSpecialtyKey);

  // Active theme and button shape mapping
  const activeTheme = getThemeConfig(websiteConfig?.primaryColor || websiteConfig?.themeColor || specialtyPreset?.color || 'teal');
  const buttonShapeClass = getButtonShapeClass(websiteConfig?.buttonShape || websiteConfig?.buttonStyle || 'rounded-2xl');

  // Dynamic Content with Dashboard Fallbacks
  const displayHeadline = websiteConfig?.headline || doctor?.headline || specialtyPreset.headline;
  const displayBio = doctor?.bio || websiteConfig?.bio || specialtyPreset.description;
  const displayDegree = doctor?.qualification || doctor?.degree || 'BDS, MDS - Oral Surgery';
  const displayExperience = doctor?.experienceYrs || doctor?.experience || doctor?.yearsOfExperience || '10+ Years Experience';
  const displaySpecialization = doctor?.specialization || doctor?.specialty || specialtyPreset.defaultSpecialization;
  const displayDoctorPhoto = websiteConfig?.doctorPhoto || doctor?.profilePhoto || doctor?.image || doctor?.avatarUrl || '';
  const clinicAddress = doctor?.address ? `${doctor.address}, ${doctor?.city || 'Patna'}` : (clinic?.address ? `${clinic.address}, ${clinic?.city || 'Patna'}` : 'Sultanganj, Patna');
  const clinicPhone = doctor?.phone || clinic?.phone || '1234567898';

  // Active services: Basic capped to 5 services, Advanced/Premium uncapped
  const activeServices = services.filter(s => s.isActive !== false);
  const displayServices = tier.isBasic ? activeServices.slice(0, 5) : activeServices;
  const fallbackServices = displayServices.length > 0 ? displayServices : specialtyPreset.services;

  // Day configuration: Monday first (1), Sunday last (0)
  const dayRows = [
    { id: "monday", name: "Monday", dayOfWeek: 1 },
    { id: "tuesday", name: "Tuesday", dayOfWeek: 2 },
    { id: "wednesday", name: "Wednesday", dayOfWeek: 3 },
    { id: "thursday", name: "Thursday", dayOfWeek: 4 },
    { id: "friday", name: "Friday", dayOfWeek: 5 },
    { id: "saturday", name: "Saturday", dayOfWeek: 6 },
    { id: "sunday", name: "Sunday", dayOfWeek: 0 }
  ];

  const todayDayIndex = new Date().getDay();
  const todayDayName = dayRows.find(d => d.dayOfWeek === todayDayIndex)?.name || "Saturday";

  // Build live shift lookup combining doctor.shifts, doctor.opdAvailability, and availability DB documents
  const keyMap = { 1: "monday", 2: "tuesday", 3: "wednesday", 4: "thursday", 5: "friday", 6: "saturday", 0: "sunday" };
  const rawDoctorShifts = doctor?.shifts || doctor?.opdAvailability || {};
  const resolvedShifts = { ...rawDoctorShifts };

  if (Array.isArray(availability)) {
    for (const a of availability) {
      const key = keyMap[Number(a.dayOfWeek)];
      if (key && !resolvedShifts[key]) {
        const isOpen = a.isOpen !== undefined ? Boolean(a.isOpen) : (a.isClosed !== undefined ? !a.isClosed : true);
        resolvedShifts[key] = {
          isEnabled: isOpen,
          morningStart: a.morningStartTime || a.startTime || "",
          morningEnd: a.morningEndTime || a.endTime || ""
        };
      }
    }
  }

  return (
    <div className="min-h-screen font-sans bg-[#f8fafc] text-slate-900">
      
      {/* 1. Standard Dynamic Public Navbar */}
      <PublicNavbar
        clinic={clinic}
        doctor={doctor}
        planId={planId}
        navbarType={tier.navbarType}
        slug={slug}
        activeTheme={activeTheme}
        buttonShapeClass={buttonShapeClass}
      />

      {/* Emergency Closed Alert Banner */}
      {clinic.emergencyClosed && (
        <div className="bg-rose-600 text-white px-4 py-3 text-center text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2 sticky top-20 z-40">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span>🚨 OPD CLOSED TODAY FOR EMERGENCY DUTY. Online appointments temporarily paused.</span>
        </div>
      )}

      {/* 2. Hero & About Section (#home & #about) */}
      <section id="home" className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Specialty & Degree Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {specialtyPreset.name}
                </span>

                {displayDegree && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {displayDegree}
                  </span>
                )}

                {displayExperience && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🩺 {displayExperience}
                  </span>
                )}
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
                {displayHeadline}
              </h1>

              {/* Bio */}
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-600">
                {displayBio}
              </p>

              {/* Trust Badges */}
              {specialtyPreset.badges && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {specialtyPreset.badges.map((badge, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 text-xs font-bold p-2.5 rounded-2xl border bg-white border-slate-200 text-slate-700 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: activeTheme.primary }} />
                      <span className="truncate">{badge}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 pt-4 flex-wrap">
                <Link
                  href={`/${slug}/book`}
                  style={{ backgroundColor: activeTheme.primary }}
                  className={`px-8 py-4 ${buttonShapeClass} font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5 text-white`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Confirmed OPD Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {clinicPhone && (
                  <a
                    href={`tel:${clinicPhone}`}
                    className={`px-6 py-4 ${buttonShapeClass} font-bold text-xs transition-all border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm flex items-center gap-2`}
                  >
                    <Phone className="w-4 h-4" style={{ color: activeTheme.primary }} />
                    <span>Call Clinic ({clinicPhone})</span>
                  </a>
                )}
              </div>

            </div>

            {/* Right Hero Image / Doctor Card */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xl relative">
                {/* Doctor Photo or Avatar */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-100 flex items-center justify-center border border-slate-200">
                  {(isAdvanced || isPremium) && displayDoctorPhoto ? (
                    <img
                      src={displayDoctorPhoto}
                      alt={cleanDocName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, #044E54)` }}
                      className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center"
                    >
                      <Stethoscope className="w-16 h-16 mb-2 opacity-80" />
                      <p className="font-black text-xl">{cleanDocName}</p>
                      <p className="text-xs text-teal-100 mt-1">{displaySpecialization}</p>
                    </div>
                  )}
                </div>

                {/* Doctor Details */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <h3 className="text-xl font-black text-slate-900">
                    {cleanDocName}
                  </h3>
                  <p className="text-xs font-bold" style={{ color: activeTheme.primary }}>
                    {displaySpecialization}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {clinic.name || 'Alam Dental Clinic'} • {clinicAddress}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Services & Fees Section (#services) */}
      <section id="services" className="py-16 sm:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span 
              style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
            >
              Services &amp; Rate Catalog
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Clinical Consultation &amp; Treatments
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Select a clinical service below to book an instant confirmed OPD slot with token number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fallbackServices.map((srv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg hover:border-slate-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">
                      {srv.name}
                    </span>
                    <span className="text-lg font-black" style={{ color: activeTheme.primary }}>
                      ₹{srv.price || srv.fee || 500}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-slate-600">
                    {srv.description || "Comprehensive clinical consultation with verified digital prescription."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {srv.durationMins || srv.duration || 15} mins duration
                  </span>

                  <Link
                    href={`/${slug}/book?service=${encodeURIComponent(srv.name)}`}
                    style={{ backgroundColor: activeTheme.primary }}
                    className={`px-4 py-2 ${buttonShapeClass} text-xs font-black transition-all text-white shadow-md hover:opacity-95`}
                  >
                    Select Slot →
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. OPD Schedule Section (#schedule - Live Synced with Doctor Dashboard Shifts) */}
      <section id="schedule" className="py-16 sm:py-24 border-b border-slate-200 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span 
              style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
            >
              Doctor Shift Timings
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Weekly OPD Consultation Schedule
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Live OPD timing telemetry with confirmed consulting shifts.
            </p>
          </div>

          {/* Symmetrical 2-Card Layout */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card: Clinic Consultation Info & Token Guarantee */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold"
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{clinic?.name || 'Alam Dental Clinic'}</h3>
                    <p className="text-xs text-slate-500">Direct Patient Walk-in &amp; Online Slots</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                  {clinicAddress && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: activeTheme.primary }} />
                      <span className="leading-relaxed">{clinicAddress}</span>
                    </div>
                  )}
                  {clinicPhone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 shrink-0" style={{ color: activeTheme.primary }} />
                      <span className="font-bold text-slate-800">{clinicPhone}</span>
                    </div>
                  )}
                </div>

                {/* Token Guarantee Card */}
                <div 
                  style={{ backgroundColor: `${activeTheme.primary}10`, borderColor: `${activeTheme.primary}25` }}
                  className="border rounded-xl p-3.5 my-4"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: activeTheme.primary }}>
                    ⚡ Instant Digital Token Confirmation
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Skip reception queues. Book online to reserve your direct clinical consultation slot.
                  </p>
                </div>
              </div>

              <a
                href="#services"
                style={{ backgroundColor: activeTheme.primary }}
                className={`w-full py-3.5 ${buttonShapeClass} font-bold text-xs transition-all shadow-sm hover:opacity-95 flex items-center justify-center gap-2 text-white mt-4 cursor-pointer`}
              >
                <span>Schedule Consultation →</span>
              </a>
            </div>

            {/* Right Card: Dynamic Day-by-Day Timings Table mapped to doctor.shifts */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    CONSULTING DAYS
                  </span>
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: activeTheme.primary }}>
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeTheme.primary }}></span>
                    <span>Today is {todayDayName}</span>
                  </span>
                </div>

                <div className="divide-y divide-slate-100 mt-1">
                  {dayRows.map((day) => {
                    const isToday = day.dayOfWeek === todayDayIndex;
                    const dayShift = resolvedShifts?.[day.id];
                    return (
                      <div
                        key={day.id}
                        className={`py-2.5 flex items-center justify-between transition-colors ${
                          isToday ? 'font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.primary }}></span>
                          )}
                          <span className={`text-xs ${isToday ? 'font-bold' : 'text-slate-700'}`} style={isToday ? { color: activeTheme.primary } : {}}>
                            {day.name}
                            {isToday && <span className="ml-1 text-[10px] uppercase font-bold" style={{ color: activeTheme.primary }}>(TODAY)</span>}
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-700 text-xs">
                            {formatShiftDisplay(dayShift)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Clean Balanced 2-Card Contact Section (#contact) */}
      <section id="contact" className="py-16 sm:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span 
              style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
            >
              Direct Contact &amp; Location
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Visit or Contact Our Clinic
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Walk-in consultations, confirmed digital token appointments, and direct assistance.
            </p>
          </div>

          {/* Balanced 2-Column Grid */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: Clinic Location & Directions */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Clinic Address</h3>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {doctor?.address || 'Sultanganj'}, {doctor?.city || 'Patna'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Direct Walk-ins &amp; In-Person OPD Consultation available during shift hours.
                  </p>
                </div>
              </div>
              <a
                href={doctor?.googleMapsUrl || "https://maps.google.com"}
                target="_blank"
                rel="noreferrer"
                style={{ color: activeTheme.primary }}
                className="inline-flex items-center gap-1 text-xs font-bold hover:underline mt-4"
              >
                ↗ Open in Google Maps
              </a>
            </div>

            {/* CARD 2: Direct Telephone Helpline */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Telephone Helpline</h3>
                </div>
                <div>
                  <p className="font-black text-slate-900 text-base">
                    {doctor?.phone || '1234567898'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Direct clinic line for instant slot confirmation and general inquiries.
                  </p>
                </div>
              </div>
              <a
                href={"tel:" + (doctor?.phone || "1234567898")}
                style={{ color: activeTheme.primary }}
                className="inline-flex items-center gap-1 text-xs font-bold hover:underline mt-4"
              >
                📞 Call Clinic Directly
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Refined & Balanced Minimal Footer */}
      <PublicFooter
        clinic={clinic}
        doctor={doctor}
        websiteConfig={websiteConfig}
        planId={planId}
      />

    </div>
  );
}

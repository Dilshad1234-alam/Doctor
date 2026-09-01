import React from 'react';
import connectDB from '../../backend/config/db.js';
import Clinic from '../../backend/models/Clinic.js';
import DoctorProfile from '../../backend/models/DoctorProfile.js';
import Service from '../../backend/models/Service.js';
import Availability from '../../backend/models/Availability.js';
import WebsiteConfig from '../../backend/models/WebsiteConfig.js';
import Subscription from '../../backend/models/Subscription.js';
import Appointment from '../../backend/models/Appointment.js';
import PublicNavbar from '../../components/public/Navbar.js';
import PublicFooter from '../../components/public/Footer.js';
import MinimalSolo from '../../components/public/templates/MinimalSolo.js';
import OceanicPro from '../../components/public/templates/OceanicPro.js';
import CareGrid from '../../components/public/templates/CareGrid.js';
import CleanClinic from '../../components/public/templates/CleanClinic.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { SPECIALTY_PRESETS, getSpecialtyPreset, detectSpecialtyFromText } from '../../lib/specialtyPresets.js';
import { getPlanTier } from '../../lib/planLimits.js';
import { getThemeConfig, getButtonShapeClass } from '../../lib/themeColors.js';
import { 
  HeartPulse, Calendar, Clock, MapPin, Phone, CheckCircle2, 
  ShieldCheck, ArrowRight, Sparkles, Crown, 
  AlertTriangle, Stethoscope, PhoneCall
} from 'lucide-react';
import Link from 'next/link';
import LiveSyncWatcher from './LiveSyncWatcher.js';


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

// Dynamic Shift Parser: If disabled or '00:00 - 00:00', returns closed state. Else parses 12hr AM/PM
function parseShiftDisplay(dayShift) {
  if (
    !dayShift ||
    dayShift.isEnabled === false ||
    dayShift.isOpen === false ||
    !dayShift.morningStart ||
    !dayShift.morningEnd ||
    (dayShift.morningStart === '00:00' && dayShift.morningEnd === '00:00') ||
    dayShift.morningStart === dayShift.morningEnd
  ) {
    return { closed: true };
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

  const mStart = formatTime(dayShift.morningStart);
  const mEnd = formatTime(dayShift.morningEnd);
  const eStart = formatTime(dayShift.eveningStart);
  const eEnd = formatTime(dayShift.eveningEnd);

  const hasMorning = Boolean(mStart && mEnd);
  const hasEvening = Boolean(eStart && eEnd && dayShift.eveningStart !== '00:00' && dayShift.eveningStart !== dayShift.eveningEnd);

  if (!hasMorning && !hasEvening) return { closed: true };

  return { closed: false, mStart, mEnd, eStart, eEnd, hasMorning, hasEvening };
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookedCount = await Appointment.countDocuments({
    clinicId: clinic._id,
    date: todayStr
  });

  return JSON.parse(JSON.stringify({ 
    clinic, 
    doctor: doctor || {}, 
    services: services || [], 
    availability: availability || [], 
    websiteConfig: websiteConfig || {}, 
    subscription: subscription || {},
    todayBookedCount
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

  const { clinic, doctor, services, availability, websiteConfig, subscription, todayBookedCount = 0 } = data;
  const currentTier = (subscription?.planId || "BASIC").toUpperCase();
  const tier = getPlanTier(currentTier);
  const isBasic = currentTier === "BASIC";
  const isAdvanced = currentTier === "ADVANCED";
  const isPremium = currentTier === "PREMIUM" || currentTier === "ENTERPRISE" || currentTier === "PRO";
  const isAdvancedOrHigher = isAdvanced || isPremium;
  const isWhatsappEnabled = !isBasic && websiteConfig?.enableWhatsappChat !== false;
  const isEmergencyActive = Boolean(websiteConfig?.emergencyDayOff);

  const enableDailyLimit = doctor?.enableDailyLimit || false;
  const dailyPatientLimit = doctor?.dailyPatientLimit || 30;
  const isQuotaFull = enableDailyLimit && todayBookedCount >= dailyPatientLimit;
  const availableSlots = enableDailyLimit ? Math.max(0, dailyPatientLimit - todayBookedCount) : null;
  
  // Base Container class enforcement
  const containerClass = isBasic ? "max-w-6xl mx-auto px-4 md:px-6" : "w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16";

  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.startsWith('Dr.') ? rawDocName : `Dr. ${rawDocName}`;

  // Resolve specialty preset
  const detectedSpecialtyKey = doctor?.specialty || detectSpecialtyFromText(`${doctor?.specialization || ''} ${clinic?.name || ''} ${clinic?.category || ''}`);
  const specialtyPreset = getSpecialtyPreset(detectedSpecialtyKey);

  // Extract the saved config with safe fallbacks
  const config = websiteConfig || {};
  const themeColor = config.primaryColor || config.themeColor || '#0A8692';
  const isDarkMode = isBasic ? false : (config.previewMode === 'dark' || config.mockupTheme === 'dark');
  const isSerif = isBasic ? false : (config.fontStyle === 'serif' || config.typography === 'executive-serif');
  const buttonRadius = config.buttonStyle || 
    (config.buttonShape === 'pill' ? 'rounded-full' : 
     config.buttonShape === 'sharp' ? 'rounded-none' : 
     'rounded-2xl');

  // Active theme mapping (kept for backward compatibility where activeTheme.primary is used)
  const activeTheme = getThemeConfig(config.themeColor || specialtyPreset?.color || 'teal');
  const rawTemplate = (doctor?.websiteConfig?.template || config.templateId || 'minimal-solo').toLowerCase();
  const activeTemplate = (rawTemplate === 'clean-clinic' || rawTemplate === 'clean_clinic') ? 'clean-clinic' : 'minimal-solo';
  const themeHex = doctor?.websiteConfig?.themeColor || config.themeColor || '#0A8692';
  const selectedButtonStyle = doctor?.websiteConfig?.buttonStyle || config.buttonStyle || 'pill';

  const getButtonShapeClass = (style) => {
    switch (style) {
      case 'sharp':
        return 'rounded-none';
      case 'soft':
        return 'rounded-xl';
      case 'block':
        return 'rounded-md';
      case 'slight':
        return 'rounded-sm';
      case 'circle':
      case 'pill':
      default:
        return 'rounded-full';
    }
  };

  const buttonShapeClass = getButtonShapeClass(selectedButtonStyle);
  const btnRadius = buttonShapeClass;

  // Dynamic Content with Dashboard Fallbacks
  const displayHeadline = websiteConfig?.headline || doctor?.headline || specialtyPreset.headline;
  const displayBio = websiteConfig?.bio || doctor?.bio || specialtyPreset.description;
  const displayDegree = doctor?.qualification || doctor?.degree || 'BDS, MDS - Oral Surgery';
  let displayExperience = doctor?.experienceYrs || doctor?.experience || doctor?.yearsOfExperience || '10+ Years Experience';
  if (typeof displayExperience === 'number' || /^\d+$/.test(String(displayExperience).trim())) {
    displayExperience = `${displayExperience}+ Years Experience`;
  }
  const displaySpecialization = doctor?.specialization || doctor?.specialty || specialtyPreset.defaultSpecialization;
  const displayDoctorPhoto = websiteConfig?.doctorPhoto || doctor?.profilePhoto || doctor?.image || doctor?.avatarUrl || '';
  const clinicAddress = doctor?.address ? `${doctor.address}, ${doctor?.city || 'Patna'}` : (clinic?.address ? `${clinic.address}, ${clinic?.city || 'Patna'}` : 'Sultanganj, Patna');
  const clinicPhone = doctor?.phone || clinic?.phone || '1234567898';

  // Active services: Basic capped to 5 services, Advanced/Premium uncapped
  const activeServices = services.filter(s => s.isActive !== false);
  const displayServices = isBasic ? activeServices.slice(0, 5) : activeServices;
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
          morningEnd: a.morningEndTime || a.endTime || "",
          eveningStart: a.eveningStartTime || "",
          eveningEnd: a.eveningEndTime || ""
        };
      }
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'} ${isSerif ? 'font-serif' : 'font-sans'}`}>
      <LiveSyncWatcher />
      
      {/* Emergency Notice Banner */}
      {isEmergencyActive && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <span>⚠️ Urgent Clinic Notice:</span>
          <span>OPD is temporarily paused for emergency maintenance today. Online bookings are on hold.</span>
        </div>
      )}

      {isQuotaFull && !isEmergencyActive && (
        <div className="bg-rose-600 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>Today's OPD Quota is Full ({dailyPatientLimit}/{dailyPatientLimit} Tokens Issued).</span>
          <span className="opacity-80">Next available tokens are for tomorrow.</span>
        </div>
      )}

      {enableDailyLimit && !isQuotaFull && !isEmergencyActive && availableSlots <= 5 && availableSlots > 0 && (
        <div className="bg-amber-100 text-amber-800 border-b border-amber-200 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <Clock className="w-4 h-4" />
          <span>Only {availableSlots} {availableSlots === 1 ? 'token' : 'tokens'} left for today's OPD!</span>
        </div>
      )}

      {isBasic ? (
        <>
          <PublicNavbar 
            clinic={clinic} 
            doctor={doctor} 
            planId={currentTier} 
            navbarType={tier?.navbarType || 'basic'} 
            slug={slug} 
            activeTheme={activeTheme} 
            buttonShapeClass={btnRadius} 
          />
          
          {/* ===================== HERO SECTION ===================== */}
          {activeTemplate === 'clean-clinic' ? (
             /* --- TEMPLATE 2: CLEAN CLINIC (Centered Clinical Hero) --- */
             <section id="home" className="w-full max-w-4xl mx-auto px-4 py-12 text-center transition-all duration-200">
               {/* Doctor Avatar Bubble & Badges */}
               <div className="flex flex-col items-center justify-center mb-5">
                 <div className="w-24 h-24 rounded-full p-1 border-2 shadow-md mb-3 bg-white" style={{ borderColor: themeHex }}>
                   <img 
                     src={displayDoctorPhoto || '/images/default-doctor.jpg'} 
                     alt={cleanDocName || 'Doctor'} 
                     className="w-full h-full object-cover rounded-full"
                   />
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: `${themeHex}15`, color: themeHex }}>
                     {doctor?.specialty || 'Dentistry & Oral Surgery'}
                   </span>
                   <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                     {displayExperience || '5+ Yrs Exp'}
                   </span>
                 </div>
               </div>

               {/* Centered Headline & Bio */}
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3 max-w-2xl mx-auto">
                 {displayHeadline || 'Modern, Painless Dental Care & Precision Smile Aesthetics'}
               </h1>
               <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
                 {displayBio || 'Comprehensive clinical care with verified digital appointments and zero queue wait times.'}
               </p>

               {/* Centered Action Buttons */}
               <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                 <a 
                   href={`/${slug}/book`} 
                   className={`px-7 py-3.5 ${btnRadius} text-white font-bold text-sm shadow-md transition-all hover:opacity-95`} 
                   style={{ backgroundColor: themeHex }}
                 >
                   📅 Book Confirmed OPD Slot →
                 </a>
                 <a 
                   href={`tel:${doctor?.phone || clinicPhone}`} 
                   className={`px-6 py-3.5 ${btnRadius} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all`}
                 >
                   📞 Call Clinic
                 </a>
               </div>

               {/* Centered 4-Pill Highlights Strip */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 max-w-3xl mx-auto">
                 {['Autoclave Sterilized', 'Painless Care', 'Digital RVG X-Ray', 'Zero Wait Token'].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                     <span className="text-emerald-500 font-black">✓</span>
                     <span className="truncate">{item}</span>
                   </div>
                 ))}
               </div>
             </section>
          ) : (
            /* --- TEMPLATE 1: MINIMAL SOLO (Classic 2-Column Split Hero - Default Fallback) --- */
            <section id="home" className="w-full max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 transition-all duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Headline, Bio & CTAs */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${themeHex}15`, color: themeHex }}>
                      {doctor?.specialty || 'Dentistry & Oral Surgery'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {displayDegree || 'BDS, MDS'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {displayExperience || '5+ Years Experience'}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {displayHeadline || 'Modern, Painless Dental Care & Precision Smile Aesthetics'}
                  </h1>

                  <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">
                    {displayBio || 'Dental refers to anything relating to the teeth, gums, and overall oral cavity, including healthcare services, diagnostics, and treatments provided by a dentist.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
                    {['100% Autoclave Sterilized', 'Painless Anesthesia', 'Digital RVG X-Ray', 'Zero Wait Token'].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold text-slate-700">
                        <span className="text-emerald-600 font-black">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a 
                      href={`/${slug}/book`} 
                      className={`px-6 py-3.5 ${btnRadius} text-white font-bold text-sm shadow-md transition-all hover:opacity-95`} 
                      style={{ backgroundColor: themeHex }}
                    >
                      📅 Book Confirmed OPD Slot →
                    </a>
                    <a 
                      href={`tel:${doctor?.phone || clinicPhone}`} 
                      className={`px-5 py-3.5 ${btnRadius} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all`}
                    >
                      📞 Call Clinic
                    </a>
                  </div>
                </div>

                {/* Right Column: Doctor Photo Card */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xl">
                    <div className="relative w-full aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                      <img 
                        src={displayDoctorPhoto || '/images/default-doctor.jpg'} 
                        alt={cleanDocName || 'Doctor'} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="text-center pb-2">
                      <h3 className="text-lg font-black text-slate-900">{cleanDocName || 'Alam'}</h3>
                      <p className="text-xs font-bold mt-0.5" style={{ color: themeHex }}>{doctor?.specialty || 'Dentist & Oral Surgeon'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{clinic?.name || 'Alam Dental Clinic'} • {doctor?.city || clinic?.city || 'Patna'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}
        </>
      ) : (
        (() => {
          const templateProps = {
            clinic, doctor, websiteConfig, currentTier, tier, slug,
            activeTheme, buttonShapeClass, isDarkMode, containerClass, specialtyPreset,
            isQuotaFull, availableSlots
          };
          
          switch (config.templateId) {
            case 'oceanic-pro':
              return <OceanicPro {...templateProps} />;
            case 'care-grid':
              return <CareGrid {...templateProps} />;
            case 'clean-clinic':
              return <CleanClinic {...templateProps} />;
            case 'minimal-solo':
            default:
              return <MinimalSolo {...templateProps} />;
          }
        })()
      )}

      {/* 3. Services & Fees Section (#services) */}
      <section id="services" className={`py-12 sm:py-16 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className={`${containerClass} space-y-12`}>
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span 
              style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              className="inline-block mb-4 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
            >
              Services &amp; Rate Catalog
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
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
                className={`p-8 min-h-[220px] rounded-3xl border flex flex-col justify-between space-y-4 transition-all hover:shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
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
      <section id="schedule" className={`py-12 sm:py-16 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50/80'}`}>
        <div className={`${containerClass} space-y-12`}>
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span 
              style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              className="inline-block mb-4 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
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

          {/* Premium Symmetrical 2-Card Layout */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Card: Premium CTA Card */}
            <div 
              style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, #0f172a)` }}
              className="lg:col-span-5 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden text-white"
            >
              {/* Decorative background icon */}
              <Clock className="absolute -bottom-12 -right-8 w-64 h-64 text-white opacity-5 pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold border border-white/20 shadow-inner">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{clinic?.name || 'Alam Dental Clinic'}</h3>
                    <p className="text-sm text-white/80 font-medium">Walk-in &amp; Online Slots Available</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  {clinicAddress && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed text-white/90 pt-1.5">{clinicAddress}</span>
                    </div>
                  )}
                  {clinicPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-base font-bold text-white pt-1">{clinicPhone}</span>
                    </div>
                  )}
                </div>

                {/* Token Guarantee Card */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mt-4">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Instant Digital Token Confirmation
                  </div>
                  <p className="text-xs text-white/80 mt-2 leading-relaxed font-medium">
                    Skip the reception queues. Book online to reserve your direct clinical consultation slot immediately.
                  </p>
                </div>
              </div>

              <a
                href="#services"
                className={`w-full py-4 ${buttonShapeClass} font-black text-sm transition-all flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 shadow-xl mt-8 relative z-10`}
                style={{ color: activeTheme.primary }}
              >
                <span>Schedule Consultation Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right Card: Dynamic Day-by-Day Timings Table mapped to doctor.shifts */}
            <div className={`lg:col-span-7 rounded-3xl border p-8 sm:p-10 shadow-lg flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div>
                {/* Header Row */}
                <div className="pb-4 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="w-[30%]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      CONSULTING DAYS
                    </span>
                  </div>
                  <div className="w-[70%] flex items-center justify-end gap-10 sm:gap-16 pr-2 sm:pr-8">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center w-32">
                      MORNING SHIFT
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center w-32">
                      EVENING SHIFT
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100/80">
                  {dayRows.map((day) => {
                    const isToday = day.dayOfWeek === todayDayIndex;
                    const dayShift = resolvedShifts?.[day.id];
                    const parsedShift = parseShiftDisplay(dayShift);
                    
                    return (
                      <div
                        key={day.id}
                        className={`py-3.5 flex items-center justify-between transition-colors ${
                          isToday ? 'bg-slate-50/50 rounded-xl px-3 -mx-3' : ''
                        }`}
                      >
                        {/* Day Column */}
                        <div className="w-[30%] flex items-center gap-2">
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full shadow-xs" style={{ backgroundColor: activeTheme.primary }}></span>
                          )}
                          <span className={`text-xs ${isToday ? 'font-black' : 'text-slate-700 font-semibold'}`} style={isToday ? { color: activeTheme.primary } : {}}>
                            {day.name}
                            {isToday && <span className="ml-1.5 text-[9px] uppercase font-black" style={{ color: activeTheme.primary }}>(TODAY)</span>}
                          </span>
                        </div>

                        {/* Timing Columns */}
                        <div className="w-[70%] flex items-center justify-end gap-10 sm:gap-16 pr-2 sm:pr-8">
                          {parsedShift.closed ? (
                            <div className="w-full flex justify-end">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 shadow-xs mr-4">CLOSED {day.name.toUpperCase()}</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-32 text-center flex justify-center">
                                {parsedShift.hasMorning ? (
                                  <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{parsedShift.mStart} <span className="text-slate-300 font-normal mx-0.5">-</span> {parsedShift.mEnd}</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 border border-rose-100 shadow-xs">CLOSED</span>
                                )}
                              </div>
                              <div className="w-32 text-center flex justify-center">
                                {parsedShift.hasEvening ? (
                                  <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{parsedShift.eStart} <span className="text-slate-300 font-normal mx-0.5">-</span> {parsedShift.eEnd}</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 border border-rose-100 shadow-xs">CLOSED</span>
                                )}
                              </div>
                            </>
                          )}
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
      {isAdvancedOrHigher && websiteConfig?.enableMaps ? (
        <section id="contact" className={`py-12 sm:py-16 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
          <div className={`${containerClass} space-y-12`}>
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border"
                style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              >
                Clinic Location & Direct Reach
              </span>
              <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Visit or Connect with Our Clinic
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Walk-in consultations, confirmed digital token appointments, and direct GPS navigation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
              
              {/* Left Column: Contact Channels (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                
                {/* Card 1: Clinic Address & Navigation */}
                <div className={`rounded-3xl border p-8 shadow-lg flex flex-col justify-between h-full relative overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white border-slate-200/60'}`}>
                  {/* Subtle Background Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl -mr-10 -mt-10 pointer-events-none" style={{ backgroundColor: activeTheme.primary }}></div>
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                      <MapPin className="w-7 h-7" />
                    </div>
                    <h3 className={`text-lg font-black mb-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Clinic Physical Address</h3>
                    <p className={`text-base font-black leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{clinicAddress}</p>
                    <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Direct in-person consultations during active OPD shifts.</p>
                  </div>
                  
                  <div className={`pt-5 mt-6 border-t flex items-center justify-between relative z-10 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified Location
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-black flex items-center gap-1 hover:underline transition-all px-4 py-2 rounded-xl"
                      style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}10` }}
                    >
                      <span>Get Directions</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                {/* Card 2 & 3: Reception Helpline & WhatsApp Channel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  
                  {/* Card 2: Reception Telephone */}
                  <div className={`rounded-3xl border p-6 shadow-lg flex flex-col justify-between relative overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white border-slate-200/60'}`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                          <Phone className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reception Line</span>
                      </div>
                      <p className={`text-base font-black truncate mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {clinicPhone}
                      </p>
                    </div>
                    <a 
                      href={`tel:${clinicPhone}`}
                      className="text-xs font-black inline-flex items-center gap-1 hover:underline transition-all mt-1"
                      style={{ color: activeTheme.primary }}
                    >
                      Call Directly →
                    </a>
                  </div>

                  {/* Card 3: WhatsApp Channel */}
                  <div className={`rounded-3xl border p-6 shadow-lg flex flex-col justify-between relative overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-[#25D366]/5 border-[#25D366]/20'}`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.983z"/>
                          </svg>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp OPD</span>
                      </div>
                      <p className={`text-base font-black truncate mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Direct Desk</p>
                    </div>
                    <a 
                      href={`https://wa.me/${clinicPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Dr. ${cleanDocName}, I need OPD directions and appointment assistance.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-[#25D366] hover:text-[#20bd5a] inline-flex items-center gap-1 transition-all mt-1"
                    >
                      Chat Live ↗
                    </a>
                  </div>

                </div>

              </div>

              {/* Right Column: Embedded Interactive Google Map (7 Cols) */}
              <div className={`lg:col-span-7 rounded-3xl border p-4 shadow-sm flex flex-col min-h-[450px] lg:min-h-full ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <div className={`relative w-full h-full min-h-[400px] lg:min-h-full rounded-2xl overflow-hidden border ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <iframe
                    title="Clinic Google Maps Location"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(clinicAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      ) : (
        <section id="contact" className={`py-12 sm:py-16 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
          <div className={`${containerClass} space-y-12`}>
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span 
                style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
              >
                Direct Contact &amp; Location
              </span>
              <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Visit or Contact Our Clinic
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Walk-in consultations, confirmed digital token appointments, and direct assistance.
              </p>
            </div>

            {/* Balanced 2-Column Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: Clinic Location & Directions */}
              <div className={`p-6 rounded-2xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Clinic Address</h3>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {doctor?.address || 'Sultanganj'}, {doctor?.city || 'Patna'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Direct Walk-ins &amp; In-Person OPD Consultation available during shift hours.
                    </p>
                  </div>
                </div>
                {isPremium && doctor?.googleMapsUrl ? (
                  <a
                    href={doctor.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: activeTheme.primary }}
                    className="inline-flex items-center gap-1 text-xs font-bold hover:underline mt-4"
                  >
                    ↗ Open in Google Maps
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 mt-4 block">📍 Verified Physical Clinic Location</span>
                )}
              </div>

              {/* CARD 2: Direct Telephone Helpline */}
              <div className={`p-6 rounded-2xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    >
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Telephone Helpline</h3>
                  </div>
                  <div>
                    <p className={`font-black text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {clinicPhone}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Direct clinic line for instant slot confirmation and general inquiries.
                    </p>
                  </div>
                </div>
                <a
                  href={"tel:" + clinicPhone}
                  style={{ color: activeTheme.primary }}
                  className="inline-flex items-center gap-1 text-xs font-bold hover:underline mt-4"
                >
                  📞 Call Clinic Directly
                </a>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 6. Refined & Balanced Minimal Footer */}
      <PublicFooter
        clinic={clinic}
        doctor={doctor}
        websiteConfig={websiteConfig}
        planId={currentTier}
        specialtyPreset={specialtyPreset}
      />

      {isAdvancedOrHigher && isWhatsappEnabled && clinicPhone && (
        <a
          href={`https://wa.me/${clinicPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Dr. ${cleanDocName}, I want to inquire about clinical consultation.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 group cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.983z"/>
          </svg>
          <span className="text-xs font-bold tracking-wide hidden md:inline-block">Chat on WhatsApp</span>
        </a>
      )}

    </div>
  );
}

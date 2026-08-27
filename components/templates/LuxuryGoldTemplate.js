"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, Phone, Clock, Stethoscope, ArrowRight, CheckCircle2, 
  ShieldCheck, Heart, Sparkles, PhoneCall, User, Mail, Navigation, Calendar,
  Star, FileText, Activity, Award, HelpCircle, Video, Crown, Check, ChevronDown
} from "lucide-react";
import PublicNavbar from "../../frontend/components/clinic/PublicNavbar.js";
import BookingClientWrapper from "../../frontend/components/booking/BookingClient.js";
import { getThemeConfig, getButtonShapeClass } from "../../lib/themeColors.js";
import { getSpecialtyPreset, detectSpecialtyFromText, SPECIALTY_LABELS } from "../../lib/specialtyPresets.js";

export default function LuxuryGoldTemplate({
  clinic = {},
  doctor = {},
  services = [],
  availability = [],
  websiteConfig = {},
  slug = "",
  isAdvanced = true,
  isPremium = true,
  specialtyPreset = null,
  displaySpecialty: customDisplaySpecialty = null
}) {
  const [openFaq, setOpenFaq] = useState(0);

  const activeTheme = getThemeConfig(websiteConfig?.themeColor || websiteConfig?.primaryColor);
  const activeShape = getButtonShapeClass(websiteConfig?.buttonShape || websiteConfig?.buttonStyle);

  const clinicSlug = slug || clinic?.slug || "clinic";
  const cleanDoctorName = `Dr. ${doctor?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  const effectivePhoto = doctor?.profilePhoto || websiteConfig?.doctorPhoto || doctor?.image || doctor?.avatarUrl;
  const rawPhone = clinic?.phone || doctor?.phone || "9523663754";
  const whatsappPhone = rawPhone.replace(/\D/g, "").replace(/^0+/, "");

  const detectedSpecialtyKey = doctor?.specialty || detectSpecialtyFromText(`${doctor?.specialization || ''} ${clinic?.name || ''} ${clinic?.about || ''}`);
  const activePreset = specialtyPreset || getSpecialtyPreset(detectedSpecialtyKey);
  const displaySpecialty = customDisplaySpecialty || SPECIALTY_LABELS[detectedSpecialtyKey] || doctor?.displaySpecialty || doctor?.specialization || activePreset.defaultSpecialization;

  const badgesToDisplay = (activePreset.id === 'dental' || (clinic?.name || '').toLowerCase().includes('dental')) ? [
    '🦷 100% Autoclave Sterilized Operatory',
    '💉 Painless Computerized Anesthesia',
    '📷 Low-Radiation Digital RVG X-Ray',
    '⏱️ Zero Waiting Room Token Appointments'
  ] : activePreset.badges;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const todayAvail = availability.find(a => a.dayOfWeek === currentDayIndex);
  const isOpenToday = todayAvail ? (todayAvail.isOpen !== undefined ? Boolean(todayAvail.isOpen) : !todayAvail.isClosed) : false;

  // Display services based on plan limits (BASIC capped at 5)
  const displayServices = (!isAdvanced && !isPremium) ? services.slice(0, 5) : services;

  const testimonials = [
    {
      name: "Rajesh Sharma",
      treatment: `${activePreset.shortName} Consultation`,
      date: "2 days ago",
      review: `${cleanDoctorName} is exceptionally thorough and compassionate. The online confirmed appointment meant zero waiting time at the clinic reception!`
    },
    {
      name: "Priyanka Sen",
      treatment: `Specialist ${activePreset.shortName} Care`,
      date: "1 week ago",
      review: `Outstanding clinical care at ${clinic.name || "the clinic"}. The diagnosis was explained with clarity, and post-consultation follow-up on WhatsApp was prompt.`
    },
    {
      name: "Amitabh Verma",
      treatment: "Comprehensive Health Protocol",
      date: "2 weeks ago",
      review: "Very professional setup. Confirmed time slots work like a charm and the digital prescription was delivered immediately after the checkup. Highly recommended!"
    }
  ];

  const faqs = [
    {
      q: "How does the online confirmed OPD reservation work?",
      a: `Select your consultation service and preferred time slot. Your personal token is generated instantly and confirmed on ${cleanDoctorName}'s calendar at ${clinic.name || "the clinic"}.`
    },
    {
      q: "Can I reschedule or cancel my consultation in advance?",
      a: "Yes. Contact the clinic helpdesk directly via phone or WhatsApp with your token details to reschedule with zero penalty."
    },
    {
      q: "How will my digital prescription and medical reports be delivered?",
      a: "Immediately following your consultation, a verified digital Rx and payment receipt are dispatched to your WhatsApp and registered phone."
    },
    {
      q: "Is emergency or same-day walk-in consultation supported?",
      a: `While online reservations guarantee zero wait time, urgent walk-ins at ${clinic.address || "the clinic"} are accommodated based on daily clinical capacity.`
    }
  ];

  const metrics = [
    { value: `${doctor?.experienceYrs || 15}+ Yrs`, label: "Clinical Excellence", desc: "Diagnostic mastery & care" },
    { value: "12,000+", label: "Consulted Patients", desc: "Treated with top outcomes" },
    { value: "99.8%", label: "Patient Satisfaction", desc: "Verified 5-star Google reviews" },
    { value: "Direct 1-on-1", label: "Dedicated OPD Slots", desc: "Zero waiting room guarantee" }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 font-sans scroll-smooth">
      
      {/* Full Responsive Navbar with Complete Navigation Links */}
      <PublicNavbar clinic={clinic} doctor={doctor} websiteConfig={websiteConfig} />

      {/* Floating WhatsApp Quick Consult Widget (ADVANCED & PREMIUM Only) */}
      {(isAdvanced || isPremium) && (
        <a 
          href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hi ${cleanDoctorName}, I would like to inquire about an appointment at ${clinic.name || "the clinic"}.`)}`}
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold transition-all hover:scale-105 active:scale-95 border-2 border-white/40 group cursor-pointer"
        >
          <span className="text-xl animate-bounce">💬</span>
          <div className="text-left">
            <span className="text-[10px] block text-emerald-100 uppercase tracking-wider font-bold">Quick Help</span>
            <span className="text-xs sm:text-sm font-black text-white">Instant WhatsApp Chat</span>
          </div>
        </a>
      )}

      {/* Hero Section (#home) with Dynamic Specialty Theme Palette */}
      <section id="home" className="relative overflow-hidden pt-16 pb-24 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-slate-50 via-white to-[#F8FAFC] border-b border-slate-200/80 scroll-mt-20">
        
        <div 
          className="absolute -top-32 right-1/4 w-[600px] h-[450px] rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ backgroundColor: activeTheme.primary }}
        ></div>

        <div className="relative max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Doctor Headline, Badges & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border"
              style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: activeTheme.primary }} />
              <span>{activePreset.name.toUpperCase()} • CONFIRMED APPOINTMENTS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {cleanDoctorName}
            </h1>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span 
                className="px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border"
                style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
              >
                {displaySpecialty}
              </span>
              <span className="bg-white text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                {doctor?.qualification || "MBBS, MD"}
              </span>
              <span className="bg-white text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                {doctor?.experienceYrs || 15}+ Yrs Clinical Practice
              </span>
            </div>

            {/* Specialty-Specific Trust Badges Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {badgesToDisplay.map((badge, bIdx) => (
                <span 
                  key={bIdx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs"
                  style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.primary }} />
                  {badge}
                </span>
              ))}
            </div>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {clinic.about || activePreset.description || `Providing premium healthcare and expert consultations at ${clinic.name || "our clinic"}. Skip the waiting room by booking your confirmed OPD slot online.`}
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start flex-wrap">
              <Link 
                href={`/${clinicSlug}/book`}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white font-black text-base py-3.5 px-8 ${activeShape} shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                style={{ backgroundColor: activeTheme.primary }}
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              {websiteConfig?.videoBioUrl && isPremium ? (
                <a 
                  href={websiteConfig.videoBioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-6 py-3.5 ${activeShape} font-bold text-base transition-all hover:scale-105 shadow-sm cursor-pointer`}
                >
                  <Video className="w-5 h-5" style={{ color: activeTheme.primary }} />
                  <span>Watch Video Bio</span>
                </a>
              ) : (
                <a 
                  href="#services"
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 px-6 ${activeShape} transition-all hover:scale-105 shadow-sm cursor-pointer`}
                >
                  <span>Explore Treatments</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Hero Doctor Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 relative overflow-hidden group">
              
              {/* Doctor Avatar Photo Frame with Dynamic Border */}
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-md mx-auto mb-5 flex items-center justify-center bg-slate-50 relative"
                style={{ borderColor: activeTheme.border }}
              >
                {effectivePhoto ? (
                  <img
                    src={effectivePhoto}
                    alt={cleanDoctorName}
                    className="w-full h-full object-cover object-top rounded-full"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ backgroundColor: activeTheme.light, color: activeTheme.text }}
                  >
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-slate-900">{cleanDoctorName}</h3>
                <p className="text-sm font-semibold" style={{ color: activeTheme.primary }}>{displaySpecialty}</p>
                <p className="text-xs text-slate-500 font-medium">{clinic.name}</p>
              </div>

              {/* Experience & OPD Slots Box */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                  <span className="text-base font-black text-slate-800">{doctor?.experienceYrs || 15} Years</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Today&apos;s OPD</span>
                  <span className={`text-xs font-black block mt-0.5 ${isOpenToday ? "text-emerald-600" : "text-amber-600"}`}>
                    {isOpenToday ? "Slots Open" : "By Prior Slot"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Metric Stat Cards (4-Card Grid below Hero) */}
      <section className="py-10 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200/80">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: activeTheme.primary }}>
                {m.value}
              </div>
              <div className="text-sm font-bold text-slate-800 mb-0.5">{m.label}</div>
              <div className="text-xs text-slate-500">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Doctor Section (#about) */}
      <section id="about" className="py-20 px-6 sm:px-12 lg:px-20 bg-[#F8FAFC] border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div 
              className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full border"
              style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
            >
              <Heart className="w-4 h-4" style={{ color: activeTheme.primary }} />
              <span>About The Doctor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Dedicated to ethical, patient-centric healthcare excellence.
            </h2>
            <div className="space-y-4 text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              <p>
                {cleanDoctorName} is a highly regarded medical practitioner specializing in {displaySpecialty}. 
                With over {doctor?.experienceYrs || 15} years of active clinical practice, they have consulted and managed thousands of patient cases with proven clinical outcomes.
              </p>
              <p>
                Practicing at <strong>{clinic.name}</strong> ({clinic.address}, {clinic.city}), the focus is always on ethical transparency, detailed diagnostic evaluation, and comprehensive digital prescriptions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-4" />
              <h4 className="font-bold text-slate-900 text-lg mb-1">12,000+ Consultations</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Successfully treated and advised patients across the region.</p>
            </div>
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-9 h-9 mb-4" style={{ color: activeTheme.primary }} />
              <h4 className="font-bold text-slate-900 text-lg mb-1">Top Rated Clinic</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Highly recommended by verified patients in {clinic.city || "the city"}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments & Services Section (#services) */}
      <section id="services" className="py-20 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div 
              className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full border"
              style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
            >
              <Stethoscope className="w-4 h-4" style={{ color: activeTheme.primary }} />
              <span>Treatments & Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{activePreset.shortName} Services & Procedures</h2>
            <p className="text-slate-500 text-sm font-medium">
              Transparent, confirmed healthcare offerings with dedicated 1-on-1 doctor consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((srv) => (
              <div 
                key={srv._id?.toString() || srv.name}
                className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-xl flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Specialty-Aware Background Watermark Icon */}
                <div className="absolute top-0 right-0 p-4 pointer-events-none transition-transform group-hover:scale-110 duration-300">
                  {(activePreset.id === 'dental' || (clinic?.name || '').toLowerCase().includes('dental') || (srv.name || '').toLowerCase().includes('dental') || (srv.name || '').toLowerCase().includes('teeth') || (srv.name || '').toLowerCase().includes('tooth') || (srv.name || '').toLowerCase().includes('root canal') || (srv.name || '').toLowerCase().includes('aligner')) ? (
                    <svg className="w-20 h-20 text-blue-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M12 2C8.5 2 6 4.5 6 8c0 4 2 7 3 11 0.5 2 1.5 3 3 3s2.5-1 3-3c1-4 3-7 3-11 0-3.5-2.5-6-6-6z"/>
                    </svg>
                  ) : (
                    <Stethoscope className="w-20 h-20 opacity-5" />
                  )}
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-black text-slate-900 group-hover:opacity-80 transition-opacity">
                      {srv.name}
                    </h3>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold shrink-0 border"
                      style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
                    >
                      {srv.durationMins || 20} Mins
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    {srv.description || "Comprehensive clinical diagnosis, vitals assessment, customized prescription protocol, and instant digital copy."}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Consultation Fee</span>
                    <span className="text-2xl font-black" style={{ color: activeTheme.primary }}>₹{srv.price || 500}</span>
                  </div>

                  <Link 
                    href={`/${clinicSlug}/book?serviceId=${srv._id}`}
                    className={`w-full flex items-center justify-center gap-2 text-white font-bold text-sm py-3 px-6 ${activeShape} shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer hover:opacity-90`}
                    style={{ backgroundColor: activeTheme.primary }}
                  >
                    <span>Select & Book Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* OPD Schedule Section (#schedule) */}
      {(() => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = daysOfWeek[new Date().getDay()];

        const defaultSchedule = [
          { day: 'Sunday', time: doctor?.opdTimings?.sunday || 'CLOSED', isClosed: !doctor?.opdTimings?.sunday || doctor?.opdTimings?.sunday === 'CLOSED' },
          { day: 'Monday', time: doctor?.opdTimings?.monday || '09:00 - 17:00', isClosed: false },
          { day: 'Tuesday', time: doctor?.opdTimings?.tuesday || '09:00 - 17:00', isClosed: false },
          { day: 'Wednesday', time: doctor?.opdTimings?.wednesday || '09:00 - 17:00', isClosed: false },
          { day: 'Thursday', time: doctor?.opdTimings?.thursday || '09:00 - 17:00', isClosed: false },
          { day: 'Friday', time: doctor?.opdTimings?.friday || '09:00 - 17:00', isClosed: false },
          { day: 'Saturday', time: doctor?.opdTimings?.saturday || '09:00 - 17:00', isClosed: false }
        ];

        const activeSchedule = availability && availability.length > 0
          ? daysOfWeek.map((dName, dIdx) => {
              const item = availability.find(a => a.dayOfWeek === dIdx);
              if (item) {
                const isOpen = item.isOpen !== undefined ? Boolean(item.isOpen) : !item.isClosed;
                return {
                  day: dName,
                  time: isOpen ? `${item.startTime || "09:00"} - ${item.endTime || "17:00"}` : 'CLOSED',
                  isClosed: !isOpen
                };
              }
              const def = defaultSchedule.find(s => s.day === dName);
              return def || { day: dName, time: '09:00 - 17:00', isClosed: false };
            })
          : defaultSchedule;

        return (
          <section id="schedule" className="py-20 px-6 sm:px-12 lg:px-20 bg-[#F8FAFC] border-b border-slate-200/80 scroll-mt-20">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Clinic Contact & Schedule CTA Card */}
              <div className="lg:col-span-5 space-y-6">
                <div 
                  className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full border shadow-xs"
                  style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
                >
                  <Clock className="w-4 h-4" style={{ color: activeTheme.primary }} />
                  <span>🕒 OPD SCHEDULE</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Clinical Schedule & Timings
                </h2>
                
                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                  Consultations at <strong>{clinic.name || "our clinic"}</strong> operate strictly on pre-booked confirmed time slots to eliminate waiting room queues.
                </p>

                {/* Clinic Address & Phone Details Box */}
                <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: activeTheme.light, color: activeTheme.primary }}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Clinic Address</span>
                      <span className="text-slate-800 font-bold leading-snug block">{clinic.address ? `${clinic.address}, ${clinic.city}` : "Main Clinic Center, City Medical Zone"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: activeTheme.light, color: activeTheme.primary }}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Helpdesk Phone</span>
                      <a href={`tel:${clinic.phone || doctor.phone || "9523663754"}`} className="text-slate-900 font-bold hover:underline">
                        {clinic.phone || doctor.phone || "+91 9523663754"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={`/${clinicSlug}/book`}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-black text-sm py-4 px-8 ${activeShape} shadow-xl transition-all hover:scale-105 active:scale-95`}
                    style={{ backgroundColor: activeTheme.primary }}
                  >
                    <span>Book Confirmed Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {rawPhone && (
                    <a 
                      href={`tel:${rawPhone}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm py-4 px-6 rounded-2xl shadow-sm transition-all hover:scale-105"
                    >
                      <span>📞 Call Direct</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Day-by-Day OPD Timings Card with Live Day Highlight */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-3">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: activeTheme.light, color: activeTheme.primary }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg border border-slate-200/50"
                    >
                      📅
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">Weekly OPD Schedule</h3>
                      <p className="text-xs text-slate-500 font-medium">Daily confirmed consultation timings</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    isOpenToday ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isOpenToday ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                    {isOpenToday ? "Open Today" : "Prior Slot Only"}
                  </span>
                </div>

                {/* Day-by-Day Schedule List */}
                <div className="space-y-2.5">
                  {activeSchedule.map((item, idx) => {
                    const isToday = item.day.toLowerCase() === currentDayName.toLowerCase();
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3.5 sm:p-4 ${activeShape} border transition-all ${
                          isToday 
                            ? 'shadow-md ring-2' 
                            : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-50'
                        }`}
                        style={isToday ? { 
                          backgroundColor: activeTheme.light, 
                          borderColor: activeTheme.border, 
                          ringColor: activeTheme.border 
                        } : {}}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-sm sm:text-base font-bold ${isToday ? "font-black" : "text-slate-800"}`} style={isToday ? { color: activeTheme.text } : {}}>
                            {item.day}
                          </span>
                          {isToday && (
                            <span 
                              className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white shadow-xs border"
                              style={{ color: activeTheme.primary, borderColor: activeTheme.border }}
                            >
                              (Today)
                            </span>
                          )}
                        </div>

                        <div>
                          {item.isClosed ? (
                            <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                              Closed
                            </span>
                          ) : (
                            <span className="text-xs sm:text-sm font-black text-slate-900">
                              {item.time}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </section>
        );
      })()}

      {/* Patient Reviews Section (#reviews) - ADVANCED & PREMIUM Tiers */}
      {(isAdvanced || isPremium) && (
        <section id="reviews" className="py-20 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200/80 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto space-y-12">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div 
                  className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full border mb-3"
                  style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
                >
                  <Star className="w-4 h-4" style={{ color: activeTheme.primary, fill: activeTheme.primary }} />
                  <span>Patient Experiences</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Verified Patient Reviews</h2>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm">
                <div className="text-2xl font-black text-slate-900">4.9 / 5.0</div>
                <div className="text-[11px] font-bold" style={{ color: activeTheme.primary }}>★★★★★ (350+ Google Reviews)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="p-7 bg-[#F8FAFC] border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black tracking-widest text-base" style={{ color: activeTheme.primary }}>★★★★★</span>
                      <span className="text-slate-400 font-medium">{t.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
                      &ldquo;{t.review}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{t.name}</span>
                      <span className="text-[11px] text-slate-400">{t.treatment}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Inline Confirmed Booking Wizard Section (#book) */}
      <section id="book" className="py-20 px-6 sm:px-12 lg:px-20 bg-[#0c2e3d] text-white border-b border-[#15465c] scroll-mt-20">
        <div className="max-w-[1400px] mx-auto space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Instant Appointment Booking</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Reserve Your Confirmed Slot</h2>
            <p className="text-slate-300 text-sm font-medium">
              Select your consultation service, choose your preferred date, and get instant OPD confirmation.
            </p>
          </div>

          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-4 sm:p-8 overflow-hidden">
            <BookingClientWrapper 
              clinic={clinic} 
              doctor={{ ...doctor, fullName: cleanDoctorName }} 
              services={services} 
              availability={availability}
              websiteConfig={websiteConfig}
              slug={slug} 
              embedded={true}
            />
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions Accordion - ADVANCED & PREMIUM Tiers */}
      {(isAdvanced || isPremium) && (
        <section className="py-20 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <div className="text-center space-y-3">
              <div 
                className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full border"
                style={{ backgroundColor: activeTheme.light, color: activeTheme.text, borderColor: activeTheme.border }}
              >
                <HelpCircle className="w-4 h-4" style={{ color: activeTheme.primary }} />
                <span>Got Questions?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className={`bg-[#F8FAFC] border border-slate-200 ${activeShape} p-5 cursor-pointer transition-all`}
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-sm sm:text-base text-slate-900">{faq.q}</span>
                    <ChevronDown className="w-4 h-4 transition-transform" style={{ color: activeTheme.primary, transform: openFaq === idx ? 'rotate(180deg)' : 'none' }} />
                  </div>
                  {openFaq === idx && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-200/60 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Contact & Location Section (#contact) */}
      <section id="contact" className="py-20 px-6 sm:px-12 lg:px-20 bg-[#F8FAFC] border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Need Help? Get in Touch.</h2>
            <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">
              Our clinical staff is available to assist you with directions, confirmed token updates, or general inquiries.
            </p>

            <div className="space-y-4">
              <a href={`tel:${rawPhone}`} className={`flex items-center gap-5 p-5 bg-white ${activeShape} border border-slate-200 shadow-sm hover:shadow-md transition-shadow`}>
                <div 
                  className={`w-12 h-12 ${activeShape} flex items-center justify-center`}
                  style={{ backgroundColor: activeTheme.light, color: activeTheme.text }}
                >
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Call Direct</span>
                  <span className="text-lg font-black text-slate-900">{rawPhone}</span>
                </div>
              </a>

              <div className={`flex items-center gap-5 p-5 bg-white ${activeShape} border border-slate-200 shadow-sm`}>
                <div 
                  className={`w-12 h-12 ${activeShape} flex items-center justify-center`}
                  style={{ backgroundColor: activeTheme.light, color: activeTheme.text }}
                >
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Clinic Location</span>
                  <span className="text-sm font-bold text-slate-900">{clinic.address}, {clinic.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 min-h-[340px]">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '340px' }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade" 
              src={`https://maps.google.com/maps?q=${encodeURIComponent((clinic.address || '') + ' ' + (clinic.city || ''))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
          </div>
        </div>
      </section>

      {/* Tier-Gated Footer: 100% White-Label on Premium, Powered on Basic/Advanced */}
      <footer className="py-8 px-6 text-center border-t border-slate-200 bg-white text-xs text-slate-500 font-medium">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4" style={{ color: activeTheme.primary }} />
            <span>{clinic.name || "Clinic"}</span>
          </div>
          <p>© {new Date().getFullYear()} {doctor.clinicName || clinic.name || "Clinic"}. All rights reserved.</p>
          
          {/* Platform Branding: Hidden on Premium White-Label */}
          {!(isPremium && websiteConfig?.hideBranding) && (
            <p className="text-[11px] text-slate-400 pt-1">
              Powered by <span className="font-bold text-slate-600">DocPulse Healthcare OS</span>
            </p>
          )}
        </div>
      </footer>

    </div>
  );
}

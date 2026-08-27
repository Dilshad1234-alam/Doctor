"use client";

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Clock, Stethoscope, ArrowRight, CheckCircle2, 
  ShieldCheck, Heart, Sparkles, PhoneCall, Mail, Navigation, Calendar, User
} from 'lucide-react';
import PublicNavbar from '../../frontend/components/clinic/PublicNavbar.js';
import BookingClientWrapper from '../../frontend/components/booking/BookingClient.js';

export default function ModernDoctorTemplate({
  clinic,
  doctor,
  services = [],
  availability = [],
  websiteConfig = {},
  slug = ""
}) {
  const cleanDoctorName = `Dr. ${doctor?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  
  const COLOR_MAP = {
    teal: '#00A1AC',
    blue: '#2563EB',
    emerald: '#059669',
    navy: '#0D3648',
    rose: '#E11D48',
    indigo: '#4F46E5',
    gold: '#D97706'
  };

  const rawColor = websiteConfig?.primaryColor || websiteConfig?.themeColor || clinic?.websiteConfig?.primaryColor || '#00A1AC';
  const primaryColor = COLOR_MAP[rawColor?.toLowerCase()] || rawColor;
  const buttonStyle = websiteConfig?.buttonStyle || clinic?.websiteConfig?.buttonStyle || 'rounded-xl';
  const effectivePhoto = doctor?.profilePhoto || websiteConfig?.doctorPhoto || doctor?.image || doctor?.avatarUrl;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const todayAvail = availability.find(a => a.dayOfWeek === currentDayIndex);
  const isOpenToday = todayAvail ? (todayAvail.isOpen !== undefined ? Boolean(todayAvail.isOpen) : !todayAvail.isClosed) : false;

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans p-0 m-0 selection:bg-teal-200 scroll-smooth" style={{ '--primary-color': primaryColor }}>
      {/* Full-Width Sticky Navbar */}
      <PublicNavbar clinic={clinic} websiteConfig={websiteConfig} />

      {/* Section 1: Hero (#home) */}
      <section id="home" className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white pt-20 pb-28 px-6 sm:px-12 lg:px-20 border-b border-slate-800" style={clinic?.coverImageUrl ? { backgroundImage: `url(${clinic.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        {clinic?.coverImageUrl && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }}></div>
        
        <div className="relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verified Medical Professional
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight">
              {cleanDoctorName}
            </h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: primaryColor }}>{doctor?.specialization || "Specialist"}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctor?.qualification || "MBBS"}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctor?.experienceYrs || 5}+ Yrs Exp</span>
            </div>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
              Providing premium healthcare and expert consultations at <strong>{clinic?.name}</strong>. Book your online appointment to skip the waiting room.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href={`/${slug}/book`} className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-4 ${buttonStyle} font-black text-lg transition-all shadow-xl shadow-black/20 hover:scale-105 active:scale-95`} style={{ backgroundColor: primaryColor }}>
                Book Appointment <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#about" className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 ${buttonStyle} font-bold text-lg transition-all hover:bg-white/20`}>
                Learn More
              </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className="w-full max-w-sm shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-3xl shadow-2xl">
              <div className="bg-slate-900 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 opacity-20" style={{ background: `linear-gradient(to bottom, ${primaryColor}, transparent)` }}></div>
                
                {/* Doctor Photo Frame */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto mb-6 flex items-center justify-center bg-[#0D3648] relative z-10">
                  {effectivePhoto ? (
                    <img 
                      src={effectivePhoto} 
                      alt={doctor?.name || cleanDoctorName} 
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#092734] text-white">
                      {/* Fallback Icon */}
                      <svg className="w-12 h-12 text-teal-400 fill-none stroke-current" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white relative z-10">{cleanDoctorName}</h3>
                <p className="font-medium mt-1 relative z-10" style={{ color: primaryColor }}>{doctor?.specialization || "Specialist"}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 relative z-10">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Experience</p>
                    <p className="text-xl font-black text-white">{doctor?.experienceYrs || 5} Years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Reg. No</p>
                    <p className="text-xl font-black text-white">#Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About Doctor (#about) */}
      <section id="about" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-slate-50 border-b border-slate-200/60 scroll-mt-24">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-4" style={{ color: primaryColor }}>
              <Heart className="w-5 h-5" style={{ fill: `${primaryColor}40` }} /> About The Doctor
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">Dedicated to providing world-class healthcare.</h2>
            <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                {cleanDoctorName} is a highly experienced and dedicated medical professional specializing in {doctor?.specialization || "General Medicine"}. 
                With over {doctor?.experienceYrs || 5} years of clinical practice, they have helped thousands of patients in {clinic?.city || "the city"} lead healthier lives.
              </p>
              <p>
                Holding top qualifications including {doctor?.qualification || "MBBS"}, they are committed to providing ethical, transparent, and compassionate care. 
                At {clinic?.name || "our clinic"}, the focus is always on patient-first treatments and long-term well-being.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
              <h4 className="font-bold text-slate-900 text-xl mb-2">10k+ Patients</h4>
              <p className="text-slate-500 text-sm">Successfully treated and managed over the years.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow">
              <Sparkles className="w-10 h-10 mb-4" style={{ color: primaryColor }} />
              <h4 className="font-bold text-slate-900 text-xl mb-2">Top Rated</h4>
              <p className="text-slate-500 text-sm">Highly recommended by patients in {clinic?.city || "the region"}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Services Offered (#services) */}
      <section id="services" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-4" style={{ color: primaryColor }}>
            <Stethoscope className="w-5 h-5" /> Treatments & Procedures
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Services Offered</h2>
        </div>
        
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service._id?.toString() || service.name} className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Stethoscope className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-slate-900 text-2xl leading-tight pr-4">{service.name}</h4>
                </div>
                <div className="flex gap-2 mb-8">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg">{service.durationMins} Mins</span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>OPD Consultation</span>
                </div>
                <p className="text-4xl font-black mb-8" style={{ color: primaryColor }}>₹{service.price}</p>
              </div>
              <Link href={`/${slug}/book?serviceId=${service._id}`} className={`relative z-10 w-full inline-flex items-center justify-center gap-2 text-center text-white font-bold py-4 ${buttonStyle} transition-all shadow-md hover:shadow-lg opacity-90 hover:opacity-100 active:scale-95`} style={{ backgroundColor: primaryColor }}>
                Select & Book <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Full-Width Footer */}
      <footer className="w-full bg-slate-900 text-white py-12 px-6 sm:px-12 lg:px-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {websiteConfig?.clinicLogo || clinic?.logo ? (
            <img 
              src={websiteConfig?.clinicLogo || clinic?.logo} 
              alt={clinic?.name || "Logo"} 
              className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20" 
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white">
              {clinic?.name?.charAt(0) || "C"}
            </div>
          )}
          <span className="font-bold text-white text-sm">{clinic?.name}</span>
          <span>•</span>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span>Powered by</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> DocPulse
          </span>
        </div>
      </footer>
    </div>
  );
}

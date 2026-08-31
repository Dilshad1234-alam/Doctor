"use client";

import React, { useState } from 'react';
import PublicNavbar from './Navbar';
import Link from 'next/link';
import { 
  Calendar, Phone, CheckCircle2, 
  ArrowRight, Sparkles, Crown, ShieldCheck, Stethoscope
} from 'lucide-react';

export default function AdvancedTopSection({
  clinic,
  doctor,
  websiteConfig,
  currentTier,
  tier,
  slug,
  activeTheme,
  buttonShapeClass,
  isDarkMode,
  containerClass,
  specialtyPreset,
}) {

  // Derive variables just like in page.js
  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.replace(/^Dr\.?\s*/i, '');
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

  return (
    <>
      <PublicNavbar
        clinic={clinic}
        doctor={doctor}
        planId={currentTier}
        navbarType={tier?.navbarType || 'basic'}
        slug={slug}
        activeTheme={activeTheme}
        buttonShapeClass={buttonShapeClass}
      />

      <section id="home" className={`relative overflow-hidden py-16 sm:py-24 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50'}`}>
          <div className={`${containerClass} relative z-10`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Hero Text */}
              <div className="lg:col-span-8 space-y-10">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {displayDegree}
                    </span>
                  )}

                  {displayExperience && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      🩺 {displayExperience}
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {displayHeadline}
                </h1>

                {/* Bio */}
                <p className={`text-sm sm:text-base leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {displayBio}
                </p>

                {/* Trust Badges */}
                {specialtyPreset.badges && (
                  <div className="grid grid-cols-2 gap-3 pt-2 max-w-xl">
                    {specialtyPreset.badges.map((badge, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2 text-xs font-bold p-2.5 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
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
                      className={`px-6 py-4 ${buttonShapeClass} font-bold text-xs transition-all border shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <Phone className="w-4 h-4" style={{ color: activeTheme.primary }} />
                      <span>Call Clinic ({clinicPhone})</span>
                    </a>
                  )}
                </div>

              </div>

              {/* Right Hero Image / Doctor Card */}
              <div className="lg:col-span-4">
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  {/* Doctor Photo or Avatar */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-100 flex items-center justify-center border border-slate-200">
                    {displayDoctorPhoto ? (
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
                    <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {cleanDocName}
                    </h3>
                    <p className="text-xs font-bold" style={{ color: activeTheme.primary }}>
                      {displaySpecialization}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {clinic?.name || 'Alam Dental Clinic'} • {clinicAddress}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      <section id="about" className={`py-12 sm:py-16 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
          <div className={`${containerClass}`}>
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span 
                style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                About The Specialist
              </span>
              <h2 className={`text-3xl sm:text-5xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} leading-tight tracking-tight`}>
                Meet {cleanDocName}
              </h2>
              <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {displayDegree} <span className="mx-2 text-slate-300">•</span> <span style={{ color: activeTheme.primary }}>{displayExperience}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left side: Doctor Bio */}
              <div className="md:col-span-7 space-y-8">
                
                <div className={`text-sm sm:text-base leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner`}>
                  {displayBio}
                </div>

                <div className="pt-2 flex items-center gap-6 sm:gap-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border border-white" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                      <span className="text-xl font-black">{doctor?.experienceYrs || doctor?.yearsOfExperience || '10+'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Years Of</span>
                      <span className={`text-sm font-black`} style={{ color: activeTheme.primary }}>Experience</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border border-white" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Verified</span>
                      <span className={`text-sm font-black`} style={{ color: activeTheme.primary }}>Clinical Expert</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Qualifications / Highlights Card */}
              <div className="md:col-span-5 relative">
                {/* Subtle glowing backdrop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-slate-200/50 dark:to-slate-800/50 blur-3xl transform scale-110 -z-10 rounded-full" style={{ backgroundColor: `${activeTheme.primary}10` }}></div>
                
                <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl backdrop-blur-xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/90 border-slate-200/80'}`}>
                  {/* Decorative Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl -mr-10 -mt-10 pointer-events-none" style={{ backgroundColor: activeTheme.primary }}></div>
                  
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-8 border-b pb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-100'}`}>
                    <Crown className="w-4 h-4" style={{ color: activeTheme.primary }} />
                    Clinical Highlights
                  </h4>
                  
                  <ul className="space-y-5">
                    {(specialtyPreset.badges || ['Advanced Diagnostics', 'Patient-Centric Care', 'Modern Technology']).map((badge, idx) => (
                      <li key={idx} className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-bold tracking-tight transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-black'}`}>{badge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
            </div>
          </div>
        </section>
    </>
  );
}

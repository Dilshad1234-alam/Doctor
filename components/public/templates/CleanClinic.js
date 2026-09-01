"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, Phone, CheckCircle2, 
  ArrowRight, Sparkles, Crown, ShieldCheck, Stethoscope
} from 'lucide-react';
import PublicNavbar from '../Navbar';

export default function CleanClinic({
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
  compact = false,
  isQuotaFull = false
}) {

  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.replace(/^Dr\.?\s*/i, '');
  const displayHeadline = websiteConfig?.headline || doctor?.headline || specialtyPreset?.headline || 'Modern, Painless Clinical Care';
  const displayBio = websiteConfig?.bio || doctor?.bio || specialtyPreset?.description || 'Providing exceptional care and treatments.';
  const displayDegree = doctor?.qualification || doctor?.degree || 'Medical Specialist';
  
  let displayExperience = doctor?.experienceYrs || doctor?.experience || doctor?.yearsOfExperience || '5+ Years Experience';
  if (typeof displayExperience === 'number' || /^\d+$/.test(String(displayExperience).trim())) {
    displayExperience = `${displayExperience}+ Years Experience`;
  }
  
  const displaySpecialization = doctor?.specialization || doctor?.specialty || specialtyPreset?.defaultSpecialization || 'Specialist';
  const displayDoctorPhoto = websiteConfig?.doctorPhoto || doctor?.profilePhoto || doctor?.image || doctor?.avatarUrl || '';
  const clinicPhone = doctor?.phone || clinic?.phone || '1234567898';

  return (
    <>
      {!compact && (
        <PublicNavbar
          clinic={clinic}
          doctor={doctor}
          planId={currentTier}
          navbarType={tier?.navbarType || 'basic'}
          slug={slug}
          activeTheme={activeTheme}
          buttonShapeClass={buttonShapeClass}
        />
      )}

      <section id="home" className={`relative overflow-hidden ${compact ? 'py-8 border-b-2' : 'py-20 sm:py-28 border-b'} ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white'}`}>
          <div className={`${compact ? 'px-6' : containerClass} relative z-10 flex flex-col items-center text-center`}>
            
            {/* Top: Centered doctor avatar & verified clinical badges */}
            <div className={`relative aspect-square ${compact ? 'w-16 h-16 rounded-xl mb-4' : 'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mb-6'} overflow-hidden bg-slate-100 flex items-center justify-center border-4 shadow-lg`} style={{ borderColor: `${activeTheme.primary}20` }}>
              {displayDoctorPhoto ? (
                <img
                  src={displayDoctorPhoto}
                  alt={cleanDocName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, #044E54)` }}
                  className={`w-full h-full flex flex-col items-center justify-center text-white p-2 text-center`}
                >
                  <Stethoscope className={`${compact ? 'w-6 h-6 mb-1' : 'w-12 h-12 mb-2'} opacity-80`} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              <span 
                style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} rounded-full font-black uppercase tracking-wider border`}
              >
                <Sparkles className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
                {specialtyPreset?.name}
              </span>

              {displayDegree && (
                <span className={`${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} rounded-full font-bold border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {displayDegree}
                </span>
              )}

              {displayExperience && (
                <span className={`${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} rounded-full font-bold border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  🩺 {displayExperience}
                </span>
              )}
            </div>

            {/* Center: Centered high-impact headline & subheadline */}
            <h1 className={`${compact ? 'text-lg leading-tight mb-2' : 'text-3xl sm:text-5xl leading-tight mb-4'} font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} max-w-3xl`}>
              {displayHeadline}
            </h1>
            
            <p className={`${compact ? 'text-[10px] mb-5' : 'text-sm sm:text-lg mb-8'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto`}>
              {displayBio}
            </p>

            {/* Action: Centered dual CTAs */}
            <div className={`flex flex-col sm:flex-row items-center justify-center ${compact ? 'gap-2 mb-4' : 'gap-4 mb-8'}`}>
              {compact ? (
                  <button
                  style={{ backgroundColor: isQuotaFull ? '#e11d48' : activeTheme.primary }}
                  className={`px-3.5 py-1.5 ${buttonShapeClass} font-bold text-[10px] shadow-sm flex items-center gap-1 text-white`}
                >
                  {isQuotaFull ? "📅 Full • Book Tomorrow" : "📅 Book Confirmed OPD Slot"}
                </button>
              ) : (
                <Link
                  href={`/${slug}/book`}
                  style={{ backgroundColor: isQuotaFull ? '#e11d48' : activeTheme.primary }}
                  className={`px-8 py-4 ${buttonShapeClass} font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5 text-white w-full sm:w-auto justify-center`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>{isQuotaFull ? "Today Full • Book For Tomorrow" : "Book Confirmed OPD Slot"}</span>
                </Link>
              )}
              
              {clinicPhone && (
                <a
                  href={`tel:${clinicPhone}`}
                  className={`${compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-6 py-4 text-xs'} ${buttonShapeClass} font-bold transition-all border shadow-sm flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'} w-full sm:w-auto`}
                >
                  <Phone className={compact ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: activeTheme.primary }} />
                  <span>Call Clinic</span>
                </a>
              )}
            </div>

            {/* 4 inline clinical badge chips directly underneath in a centered 4-column pill bar */}
            {specialtyPreset?.badges && (
              <div className={`flex items-center justify-center flex-wrap ${compact ? 'gap-1.5' : 'gap-3'} max-w-2xl mx-auto`}>
                {specialtyPreset.badges.slice(0, 4).map((badge, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-1.5 font-bold ${compact ? 'text-[8px] p-1.5 rounded-full' : 'text-xs px-3 py-1.5 rounded-full'} border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    <CheckCircle2 className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} shrink-0`} style={{ color: activeTheme.primary }} />
                    <span className="truncate">{badge}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
      </section>
        
      {/* About Section */}
      <section id="about" className={`${compact ? 'py-6' : 'py-12 sm:py-16'} border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`${compact ? 'px-6' : containerClass}`}>
          <div className={`text-center max-w-3xl mx-auto ${compact ? 'mb-4 space-y-1.5' : 'mb-10 space-y-3'}`}>
            <span 
              style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
              className={`inline-flex items-center justify-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]'} rounded-full font-black uppercase tracking-wider border`}
            >
              <Stethoscope className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
              About The Specialist
            </span>
            <h2 className={`${compact ? 'text-lg' : 'text-3xl sm:text-5xl'} font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} leading-tight tracking-tight`}>
              Meet {cleanDocName}
            </h2>
          </div>
          
          <div className={`max-w-4xl mx-auto text-center ${compact ? 'space-y-4' : 'space-y-8'}`}>
            <div className={`${compact ? 'text-[10px] p-3' : 'text-sm sm:text-base p-6'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {displayBio}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, Phone, CheckCircle2, 
  ArrowRight, Sparkles, Crown, ShieldCheck, Stethoscope
} from 'lucide-react';
import PublicNavbar from '../Navbar';

export default function OceanicPro({
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
  compact = false
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
  const clinicAddress = doctor?.address ? `${doctor.address}, ${doctor?.city || 'Patna'}` : (clinic?.address ? `${clinic.address}, ${clinic?.city || 'Patna'}` : 'Sultanganj, Patna');
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

      {/* Hero Section - Oceanic Pro (Centered, Gradient) */}
      <section id="home" className={`relative overflow-hidden ${compact ? 'py-8 border-b-2' : 'py-20 sm:py-28 border-b'} bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800`}>
          {/* Decorative background blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: activeTheme.primary }}></div>
          
          <div className={`${compact ? 'px-6' : containerClass} relative z-10 flex flex-col items-center text-center`}>
            
            <div className={`flex flex-col items-center w-full ${compact ? 'max-w-lg space-y-4' : 'max-w-3xl space-y-8'}`}>
              {/* Specialty & Degree Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span 
                  style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                  className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-4 py-1.5 text-xs'} rounded-full font-black uppercase tracking-wider border`}
                >
                  <Sparkles className={compact ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
                  {specialtyPreset?.name}
                </span>
                
                {displayExperience && (
                  <span className={`${compact ? 'px-2 py-0.5 text-[9px]' : 'px-4 py-1.5 text-xs'} rounded-full font-bold border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    🩺 {displayExperience}
                  </span>
                )}
              </div>

              {/* Headline */}
              <h1 className={`${compact ? 'text-xl leading-tight' : 'text-4xl sm:text-6xl leading-tight'} font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {displayHeadline}
              </h1>

              {/* Bio */}
              <p className={`${compact ? 'text-[11px]' : 'text-base sm:text-lg'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} max-w-2xl`}>
                {displayBio}
              </p>

              {/* Trust Badges */}
              {specialtyPreset?.badges && (
                <div className={`flex flex-wrap justify-center ${compact ? 'gap-2 pt-2' : 'gap-4 pt-4'}`}>
                  {specialtyPreset.badges.slice(0, 3).map((badge, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-1.5 font-bold ${compact ? 'text-[9px]' : 'text-sm'} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <CheckCircle2 className={`${compact ? 'w-3 h-3' : 'w-5 h-5'} shrink-0`} style={{ color: activeTheme.primary }} />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className={`flex items-center justify-center ${compact ? 'gap-2 pt-2' : 'gap-4 pt-6'} flex-wrap w-full`}>
                {compact ? (
                    <button
                    style={{ backgroundColor: activeTheme.primary }}
                    className={`px-4 py-2 ${buttonShapeClass} font-bold text-[10px] shadow-sm flex items-center gap-1.5 text-white`}
                  >
                    📅 Book Confirmed OPD Slot
                  </button>
                ) : (
                  <Link
                    href={`/${slug}/book`}
                    style={{ backgroundColor: activeTheme.primary }}
                    className={`px-8 py-4 ${buttonShapeClass} font-black text-base transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5 text-white`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Confirmed OPD Slot</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                
                {clinicPhone && (
                  <a
                    href={`tel:${clinicPhone}`}
                    className={`${compact ? 'px-3 py-2 text-[10px]' : 'px-8 py-4 text-base'} ${buttonShapeClass} font-bold transition-all border shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Phone className={compact ? 'w-3 h-3' : 'w-5 h-5'} style={{ color: activeTheme.primary }} />
                    <span>Call Clinic</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section - Oceanic Pro */}
        <section id="about" className={`${compact ? 'py-8' : 'py-16 sm:py-24'} border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className={`${compact ? 'px-6' : containerClass}`}>
            <div className={`grid grid-cols-1 ${compact ? 'grid-cols-12 gap-6' : 'md:grid-cols-12 gap-12'} items-center`}>
              
              {/* Left side: Profile Image */}
              <div className={`${compact ? 'col-span-5' : 'md:col-span-5'}`}>
                <div className={`relative ${compact ? 'rounded-2xl p-2' : 'rounded-3xl p-4'} border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                   {/* Doctor Photo or Avatar */}
                   <div className={`relative aspect-[4/5] ${compact ? 'rounded-xl' : 'rounded-2xl'} overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200`}>
                    {displayDoctorPhoto ? (
                      <img
                        src={displayDoctorPhoto}
                        alt={cleanDocName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, #044E54)` }}
                        className="w-full h-full flex flex-col items-center justify-center text-white text-center"
                      >
                        <Stethoscope className={`${compact ? 'w-10 h-10 mb-2' : 'w-20 h-20 mb-4'} opacity-80`} />
                        <p className={`${compact ? 'font-black text-sm' : 'font-black text-2xl'}`}>{cleanDocName}</p>
                      </div>
                    )}
                  </div>
                  <div className={`absolute ${compact ? '-bottom-4 -right-4 p-3 rounded-xl' : '-bottom-6 -right-6 p-5 rounded-2xl'} shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`${compact ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-xl'} flex items-center justify-center`} style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                        <ShieldCheck className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
                      </div>
                      <div>
                        <p className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold text-slate-500 uppercase`}>Verified</p>
                        <p className={`${compact ? 'text-xs' : 'text-sm'} font-black`} style={{ color: activeTheme.primary }}>Expert</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Doctor Details */}
              <div className={`${compact ? 'col-span-7 space-y-4' : 'md:col-span-7 space-y-6'}`}>
                <div>
                  <span 
                    style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                    className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]'} rounded-full font-black uppercase tracking-wider border mb-2`}
                  >
                    <Crown className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
                    About The Specialist
                  </span>
                  <h2 className={`${compact ? 'text-xl' : 'text-4xl sm:text-5xl'} font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} leading-tight tracking-tight`}>
                    Meet {cleanDocName}
                  </h2>
                  <h3 className={`${compact ? 'text-[11px] mt-1' : 'text-lg mt-2'} font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {displayDegree}
                  </h3>
                </div>

                <div className={`${compact ? 'text-[10px]' : 'text-base'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {displayBio}
                </div>

                <div className={`grid grid-cols-2 ${compact ? 'gap-3 pt-2' : 'gap-6 pt-4'}`}>
                   <div className={`border rounded-xl ${compact ? 'p-3' : 'p-4'} ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold text-slate-500 uppercase mb-1`}>Specialization</p>
                      <p className={`${compact ? 'text-xs' : 'text-sm'} font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{displaySpecialization}</p>
                   </div>
                   <div className={`border rounded-xl ${compact ? 'p-3' : 'p-4'} ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold text-slate-500 uppercase mb-1`}>Clinic Location</p>
                      <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{clinicAddress}</p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>
    </>
  );
}

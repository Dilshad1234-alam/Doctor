"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, Phone, CheckCircle2, 
  ArrowRight, Sparkles, Crown, ShieldCheck, Stethoscope
} from 'lucide-react';
import PublicNavbar from '../Navbar';

export default function MinimalSolo({
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

      <section id="home" className={`relative overflow-hidden ${compact ? 'py-6 border-b-2' : 'py-16 sm:py-24 border-b'} ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50'}`}>
          <div className={`${compact ? 'px-6' : containerClass} relative z-10`}>
            <div className={`grid grid-cols-1 ${compact ? 'grid-cols-12 gap-5' : 'lg:grid-cols-12 gap-12'} items-center`}>
              
              {/* Left Hero Text */}
              <div className={`${compact ? 'col-span-7 space-y-3' : 'lg:col-span-8 space-y-10'}`}>
                {/* Emergency Closed Banner */}
                {clinic?.emergencyClosed && (
                  <div className={`mb-4 inline-flex items-center gap-2 ${compact ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-xs'} rounded-xl bg-red-100 text-red-700 border border-red-200 font-bold animate-pulse`}>
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    🚨 Clinic Closed Today for Emergency Duty
                  </div>
                )}

                {/* Specialty & Degree Badges */}
                <div className="flex items-center gap-2 flex-wrap">
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

                {/* Headline */}
                <h1 className={`${compact ? 'text-base leading-tight' : 'text-3xl sm:text-5xl leading-tight'} font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {displayHeadline}
                </h1>

                {/* Bio */}
                <p className={`${compact ? 'text-[10px]' : 'text-sm sm:text-base'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {displayBio}
                </p>

                {/* Trust Badges */}
                {specialtyPreset?.badges && (
                  <div className={`grid grid-cols-2 ${compact ? 'gap-1.5 pt-1 max-w-sm' : 'gap-3 pt-2 max-w-xl'}`}>
                    {specialtyPreset.badges.map((badge, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2 font-bold ${compact ? 'text-[9px] p-1.5 rounded-lg' : 'text-xs p-2.5 rounded-2xl'} border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                      >
                        <CheckCircle2 className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} shrink-0`} style={{ color: activeTheme.primary }} />
                        <span className="truncate">{badge}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className={`flex items-center ${compact ? 'gap-2 pt-1' : 'gap-4 pt-4'} flex-wrap`}>
                  {compact ? (
                     <button
                     style={{ backgroundColor: clinic?.emergencyClosed ? '#ef4444' : (isQuotaFull ? '#e11d48' : activeTheme.primary) }}
                     className={`px-3.5 py-1.5 ${buttonShapeClass} font-bold text-[10px] shadow-sm flex items-center gap-1 text-white ${clinic?.emergencyClosed ? 'opacity-80 cursor-not-allowed' : ''}`}
                   >
                     {clinic?.emergencyClosed ? "🚨 Emergency Closed" : (isQuotaFull ? "📅 Today Full • Book Tomorrow" : "📅 Book Confirmed OPD Slot")}
                   </button>
                  ) : (
                    <Link
                      href={clinic?.emergencyClosed ? '#' : `/${slug}/book`}
                      style={{ backgroundColor: clinic?.emergencyClosed ? '#ef4444' : (isQuotaFull ? '#e11d48' : activeTheme.primary) }}
                      className={`px-8 py-4 ${buttonShapeClass} font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5 text-white ${clinic?.emergencyClosed ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>{clinic?.emergencyClosed ? "🚨 Emergency Closed" : (isQuotaFull ? "Today Full • Book For Tomorrow" : "Book Confirmed OPD Slot")}</span>
                      {!clinic?.emergencyClosed && <ArrowRight className="w-4 h-4" />}
                    </Link>
                  )}
                  
                  {clinicPhone && (
                    <a
                      href={`tel:${clinicPhone}`}
                      className={`${compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-6 py-4 text-xs'} ${buttonShapeClass} font-bold transition-all border shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      <Phone className={compact ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: activeTheme.primary }} />
                      <span>Call Clinic</span>
                    </a>
                  )}
                </div>

              </div>

              {/* Right Hero Image / Doctor Card */}
              <div className={compact ? 'col-span-5' : 'lg:col-span-4'}>
                <div className={`${compact ? 'p-3 rounded-2xl' : 'p-6 sm:p-8 rounded-3xl'} border shadow-xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  {/* Doctor Photo or Avatar */}
                  <div className={`relative aspect-square ${compact ? 'rounded-xl mb-3' : 'rounded-2xl mb-6'} overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200`}>
                    {displayDoctorPhoto ? (
                      <img
                        src={displayDoctorPhoto}
                        alt={cleanDocName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, #044E54)` }}
                        className={`w-full h-full flex flex-col items-center justify-center text-white ${compact ? 'p-2' : 'p-6'} text-center`}
                      >
                        <Stethoscope className={`${compact ? 'w-8 h-8 mb-1' : 'w-16 h-16 mb-2'} opacity-80`} />
                        <p className={`${compact ? 'font-black text-xs' : 'font-black text-xl'}`}>{cleanDocName}</p>
                        <p className={`${compact ? 'text-[9px]' : 'text-xs'} text-teal-100 mt-1`}>{displaySpecialization}</p>
                      </div>
                    )}
                  </div>

                  {/* Doctor Details */}
                  <div className={`space-y-1 ${compact ? 'text-center' : 'text-center sm:text-left'}`}>
                    <h3 className={`${compact ? 'text-xs font-bold' : 'text-xl font-black'} ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {cleanDocName}
                    </h3>
                    <p className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold`} style={{ color: activeTheme.primary }}>
                      {displaySpecialization}
                    </p>
                    <p className={`${compact ? 'text-[8px]' : 'text-xs'} text-slate-500 font-medium truncate max-w-[170px] mx-auto`}>
                      {clinic?.name || 'Alam Dental Clinic'} • {clinicAddress}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
        
        {/* About Section minimalized */}
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
            
            <div className={`grid grid-cols-1 ${compact ? 'grid-cols-12 gap-5' : 'md:grid-cols-12 gap-8 lg:gap-12'} items-center`}>
              {/* Left side: Doctor Bio */}
              <div className={`${compact ? 'col-span-7 space-y-3' : 'md:col-span-7 space-y-8'}`}>
                <div className={`${compact ? 'text-[10px] p-3 rounded-xl' : 'text-sm sm:text-base p-6 rounded-2xl'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-300 bg-slate-800/50 border-slate-700/50' : 'text-slate-600 bg-white/50 border-slate-200/50'} border shadow-inner`}>
                  {displayBio}
                </div>
              </div>

              {/* Right side: Qualifications */}
              <div className={`${compact ? 'col-span-5' : 'md:col-span-5 relative'}`}>
                <div className={`${compact ? 'p-3 rounded-2xl' : 'p-8 sm:p-10 rounded-3xl'} border shadow-xl backdrop-blur-xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/90 border-slate-200/80'}`}>
                  <h4 className={`${compact ? 'text-[9px] mb-3 pb-2' : 'text-xs mb-8 pb-4'} font-black uppercase tracking-widest border-b flex items-center gap-2 ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-100'}`}>
                    <Crown className={compact ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: activeTheme.primary }} />
                    Highlights
                  </h4>
                  <ul className={`${compact ? 'space-y-2' : 'space-y-5'}`}>
                    {(specialtyPreset?.badges || ['Advanced Diagnostics', 'Patient-Centric']).map((badge, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className={`${compact ? 'w-5 h-5 rounded-md' : 'w-8 h-8 rounded-xl'} flex items-center justify-center shrink-0 shadow-sm`} style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                          <CheckCircle2 className={compact ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
                        </div>
                        <span className={`${compact ? 'text-[9px]' : 'text-sm'} font-bold tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{badge}</span>
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

"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, Phone, CheckCircle2, 
  ArrowRight, Sparkles, Crown, ShieldCheck, Stethoscope
} from 'lucide-react';
import PublicNavbar from '../Navbar';

export default function CareGrid({
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

      {/* Hero Section - Care Grid (Boxed Layout) */}
      <section id="home" className={`relative ${compact ? 'py-6 border-b-2' : 'py-16 sm:py-20 border-b'} ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'}`}>
          <div className={`${compact ? 'px-6' : containerClass} relative z-10`}>
            
            <div className={`border shadow-sm overflow-hidden ${compact ? 'rounded-2xl flex flex-col' : 'rounded-[2rem] flex flex-col lg:flex-row'} ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              
              {/* Left Content Box */}
              <div className={`${compact ? 'p-5 flex flex-col gap-3 border-b' : 'p-10 lg:p-16 lg:w-[60%] flex flex-col justify-center gap-8 border-b lg:border-b-0 lg:border-r'} ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                
                {/* Specialty & Degree Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                    className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} rounded font-black uppercase tracking-wider border`}
                  >
                    <Sparkles className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
                    {specialtyPreset?.name}
                  </span>
                  {displayExperience && (
                    <span className={`${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} rounded font-bold border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      🩺 {displayExperience}
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h1 className={`${compact ? 'text-lg leading-snug' : 'text-3xl sm:text-5xl leading-tight'} font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {displayHeadline}
                </h1>

                {/* Bio */}
                <p className={`${compact ? 'text-[10px]' : 'text-sm sm:text-lg'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {displayBio}
                </p>

                {/* CTA Buttons */}
                <div className={`flex items-center ${compact ? 'gap-2 pt-1' : 'gap-4 pt-4'} flex-wrap`}>
                  {compact ? (
                     <button
                     style={{ backgroundColor: activeTheme.primary }}
                     className={`px-3 py-1.5 ${buttonShapeClass} font-bold text-[10px] shadow-sm flex items-center gap-1 text-white`}
                   >
                     📅 Book Slot
                   </button>
                  ) : (
                    <Link
                      href={`/${slug}/book`}
                      style={{ backgroundColor: activeTheme.primary }}
                      className={`px-8 py-4 ${buttonShapeClass} font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5 text-white`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Book Confirmed Slot</span>
                    </Link>
                  )}
                  
                  {clinicPhone && (
                    <a
                      href={`tel:${clinicPhone}`}
                      className={`${compact ? 'px-2 py-1.5 text-[10px]' : 'px-6 py-4 text-xs'} ${buttonShapeClass} font-bold transition-all border shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <Phone className={compact ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: activeTheme.primary }} />
                      <span>{compact ? 'Call' : `Call ${clinicPhone}`}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Hero Image Box */}
              <div className={`${compact ? 'p-4 flex justify-center' : 'lg:w-[40%] flex justify-center bg-slate-50/50 dark:bg-slate-800/20 p-8 lg:p-12'}`}>
                <div className="w-full h-full flex flex-col justify-center items-center relative">
                   <div className={`w-full aspect-square ${compact ? 'max-w-[120px] rounded-xl' : 'max-w-md rounded-[2rem]'} overflow-hidden bg-slate-100 flex items-center justify-center border shadow-inner ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
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
                        <p className={`${compact ? 'font-black text-xs' : 'font-black text-2xl'}`}>{cleanDocName}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Floating Badge */}
                  <div className={`absolute ${compact ? 'bottom-2 -left-2 px-2 py-1' : 'bottom-6 -left-6 px-4 py-3'} rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className={compact ? 'w-3 h-3' : 'w-5 h-5'} style={{ color: activeTheme.primary }} />
                       <div>
                         <p className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-bold text-slate-500 uppercase leading-none`}>Verified</p>
                         <p className={`${compact ? 'text-[9px]' : 'text-xs'} font-black mt-0.5 leading-none`} style={{ color: activeTheme.primary }}>Professional</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
        
        {/* About Section - Care Grid */}
        <section id="about" className={`${compact ? 'py-6' : 'py-16 sm:py-20'} border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className={`${compact ? 'px-6' : containerClass}`}>
            
            <div className={`grid grid-cols-1 ${compact ? 'grid-cols-12 gap-4' : 'md:grid-cols-12 gap-8'}`}>
               
               {/* Left Header Box */}
               <div className={`${compact ? 'col-span-12' : 'md:col-span-5 flex flex-col justify-center'}`}>
                  <span 
                    style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary, borderColor: `${activeTheme.primary}30` }}
                    className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1.5 text-[10px]'} rounded-full font-black uppercase tracking-wider border w-fit mb-3`}
                  >
                    <Crown className={compact ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
                    About The Specialist
                  </span>
                  <h2 className={`${compact ? 'text-lg mb-1' : 'text-4xl sm:text-5xl mb-3'} font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} leading-tight tracking-tight`}>
                    Meet {cleanDocName}
                  </h2>
                  <h3 className={`${compact ? 'text-[10px]' : 'text-lg'} font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {displayDegree}
                  </h3>
               </div>

               {/* Right Details Grid */}
               <div className={`${compact ? 'col-span-12' : 'md:col-span-7'}`}>
                  <div className={`border ${compact ? 'rounded-xl p-4 space-y-4' : 'rounded-[2rem] p-8 space-y-8'} shadow-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`${compact ? 'text-[10px]' : 'text-base'} leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {displayBio}
                    </div>

                    <div className={`grid grid-cols-2 ${compact ? 'gap-3' : 'gap-6'} border-t pt-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                       <div>
                          <p className={`${compact ? 'text-[8px]' : 'text-xs'} font-bold text-slate-500 uppercase mb-1`}>Specialization</p>
                          <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{displaySpecialization}</p>
                       </div>
                       <div>
                          <p className={`${compact ? 'text-[8px]' : 'text-xs'} font-bold text-slate-500 uppercase mb-1`}>Clinic Location</p>
                          <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{clinicAddress}</p>
                       </div>
                    </div>
                  </div>
               </div>

            </div>
          </div>
        </section>
    </>
  );
}

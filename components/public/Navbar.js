"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  HeartPulse, Calendar, ShieldCheck, Menu, X, Crown, Stethoscope
} from "lucide-react";
import { getThemeConfig, getButtonShapeClass } from "../../lib/themeColors";

export default function PublicNavbar({
  clinic,
  doctor,
  planId = "BASIC",
  navbarType = "basic",
  themeColor = "teal",
  activeTheme,
  buttonShapeClass,
  slug = "",
  activeTopTab,
  setActiveTopTab,
  isCompact = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("home");

  // On mount or scroll, we could track activeHash, but for now we'll update it on click.

  const theme = activeTheme || getThemeConfig(themeColor);
  const shape = buttonShapeClass || getButtonShapeClass(doctor?.buttonShape || "rounded-2xl");

  const rawDocName = doctor?.fullName || doctor?.name || "Alam";
  const cleanDocName = rawDocName.replace(/^Dr\.?\s*/i, "");
  const clinicTitle = doctor?.clinicName || clinic?.name || "Alam Dental Clinic";
  const specialization = doctor?.specialization || doctor?.specialty || "Dentist & Oral Surgeon";

  const isPremium = planId === "PREMIUM" || planId === "ENTERPRISE" || navbarType === "premium";
  const isAdvanced = planId === "ADVANCED" || planId === "PRO" || navbarType === "advanced" || isPremium;

  // Center Navigation Links
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "OPD Timings", href: "#schedule" },
    { name: "Contact", href: "#contact" }
  ];

  const handleScroll = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      setActiveHash(targetId);
      
      const elem = document.getElementById(targetId);
      if (elem) {
        const offset = 80; // height of the sticky navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = elem.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs w-full ${isCompact ? 'px-3' : 'px-4 sm:px-8 lg:px-12'}`}>
      <div className={`w-full flex items-center justify-between ${isCompact ? 'h-14 gap-2' : 'h-20 gap-4'}`}>
        
        {/* 1. Left Side: Logo & Clinic Info (Far Left) */}
        <div className={`flex items-center justify-start ${isCompact ? '' : 'flex-1'} min-w-0`}>
          <Link href={`/${slug}`} className="flex items-center gap-3 group min-w-0">
            {clinic?.logo ? (
              <img 
                src={clinic.logo} 
                alt={clinicTitle} 
                className={`${isCompact ? 'h-8 w-8 rounded-xl' : 'h-11 w-11 rounded-2xl'} shrink-0 object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform`} 
              />
            ) : (
              <div 
                style={{ backgroundColor: theme.primary }}
                className={`${isCompact ? 'h-8 w-8 rounded-xl' : 'h-11 w-11 rounded-2xl'} shrink-0 flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform text-white`}
              >
                <Stethoscope className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'}`} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-black ${isCompact ? 'text-xs' : 'text-base sm:text-lg'} tracking-tight text-slate-900 truncate`}>
                  {clinicTitle}
                </span>
                {isPremium ? (
                  <span className={`${isCompact ? 'text-[8px] px-1.5' : 'text-[10px] px-2'} font-black uppercase py-0.5 rounded-full bg-amber-400/20 text-amber-700 border border-amber-400/40 flex items-center gap-1 shrink-0`}>
                    <Crown className={`${isCompact ? 'w-2 h-2' : 'w-3 h-3'} text-amber-600`} /> VIP Clinic
                  </span>
                ) : isAdvanced ? (
                  <span 
                    style={{ backgroundColor: `${theme.primary}15`, color: theme.primary, borderColor: `${theme.primary}30` }}
                    className={`${isCompact ? 'text-[8px] px-1.5' : 'text-[10px] px-2'} font-black uppercase py-0.5 rounded-full border flex items-center gap-1 shrink-0`}
                  >
                    <ShieldCheck className={`${isCompact ? 'w-2 h-2' : 'w-3 h-3'}`} /> Verified
                  </span>
                ) : null}
              </div>
              <p className={`${isCompact ? 'text-[9px]' : 'text-xs'} font-semibold text-slate-500 truncate`}>
                Dr. {cleanDocName} • {specialization}
              </p>
            </div>
          </Link>
        </div>

        {/* 2. Center: Navigation Links (Exact Center) */}
        <nav className={`hidden md:flex items-center justify-center ${isCompact ? 'gap-3 text-[9px]' : 'gap-8 text-xs'} font-bold text-slate-600 flex-1 whitespace-nowrap`}>
          {navLinks.map(link => {
            const targetId = link.href.replace("#", "");
            const isActive = activeHash === targetId;
            
            return (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleScroll(e, link.href)}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${isActive ? 'text-slate-900 border-b-2 font-black pb-1' : ''}`}
                style={isActive ? { borderColor: theme.primary, color: theme.primary } : {}}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* 3. Right Side: Book Appointment CTA (Far Right) */}
        <div className={`hidden md:flex items-center justify-end ${isCompact ? '' : 'flex-1'} shrink-0`}>
          <Link
            href={clinic?.emergencyClosed ? '#' : `/${slug}/book`}
            style={{ backgroundColor: clinic?.emergencyClosed ? '#ef4444' : theme.primary }}
            className={`${isCompact ? 'px-3 py-1.5 text-[9px]' : 'px-6 py-2.5 text-xs'} ${shape} font-black transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 text-white shadow-sm whitespace-nowrap ${clinic?.emergencyClosed ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <Calendar className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>{clinic?.emergencyClosed ? "Emergency Closed" : `Book ${isCompact ? 'Slot' : 'Appointment'}`}</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href={clinic?.emergencyClosed ? '#' : `/${slug}/book`}
            style={{ backgroundColor: clinic?.emergencyClosed ? '#ef4444' : theme.primary }}
            className={`px-3.5 py-2 text-white ${shape} font-bold text-xs shadow-md ${clinic?.emergencyClosed ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''}`}
          >
            {clinic?.emergencyClosed ? "Closed" : "Book Slot"}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-6 py-5 space-y-4 bg-white text-slate-900 animate-in slide-in-from-top-3">
          <div className="flex flex-col gap-3 text-xs font-bold">
            {navLinks.map(link => {
              const targetId = link.href.replace("#", "");
              const isActive = activeHash === targetId;
              
              return (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleScroll(e, link.href);
                  }}
                  className={`py-2 border-b hover:text-slate-900 ${isActive ? 'border-slate-800 text-slate-900 font-black' : 'border-slate-100 text-slate-600'}`}
                  style={isActive ? { color: theme.primary, borderColor: theme.primary } : {}}
                >
                  {link.name}
                </a>
              );
            })}
            <Link 
              href={clinic?.emergencyClosed ? '#' : `/${slug}/book`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ backgroundColor: clinic?.emergencyClosed ? '#ef4444' : theme.primary }}
              className={`w-full text-center text-white text-xs font-black py-2.5 ${shape} shadow-md mt-2 flex items-center justify-center gap-1.5 ${clinic?.emergencyClosed ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              <span>{clinic?.emergencyClosed ? "Emergency Closed" : "Book Appointment"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

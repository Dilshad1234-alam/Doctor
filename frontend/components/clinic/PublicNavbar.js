"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, HeartPulse, ArrowRight, Calendar } from 'lucide-react';
import { getThemeConfig, getButtonShapeClass } from '../../../lib/themeColors.js';

export default function PublicNavbar({ clinic = {}, doctor = {}, websiteConfig = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = getThemeConfig(websiteConfig?.themeColor || websiteConfig?.primaryColor);
  const activeShape = getButtonShapeClass(websiteConfig?.buttonShape || websiteConfig?.buttonStyle || 'curved');

  const slug = clinic?.slug || '';
  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.replace(/^Dr\.?\s*/i, '');
  const clinicTitle = doctor?.clinicName || clinic?.name || 'Alam Dental Clinic';
  const specialization = doctor?.specialization || doctor?.specialty || 'Dentist & Oral Surgeon';

  const bookUrl = slug ? `/${slug}/book` : "#book";

  // Center Navigation Links
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Services & Fees", href: "#services" },
    { name: "OPD Timings", href: "#schedule" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 lg:px-12 py-3.5 shadow-xs text-slate-900 w-full">
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* 1. Left: Logo & Clinic Info (Far Left) */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <Link href={`/${slug}`} className="flex items-center gap-3 shrink-0">
            {clinic?.logo || websiteConfig?.clinicLogo ? (
              <img 
                src={clinic?.logo || websiteConfig?.clinicLogo} 
                alt={clinicTitle} 
                className="w-10 h-10 rounded-xl object-contain border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#00A1AC] text-white font-black flex items-center justify-center text-sm shadow-xs">
                <HeartPulse className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-base leading-tight block truncate">{clinicTitle}</span>
              <span className="text-xs text-slate-500 font-semibold truncate block">
                Dr. {cleanDocName} • {specialization}
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Center: Navigation Links (Exact Center) */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-xs font-bold text-slate-600 flex-1 whitespace-nowrap">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} className="hover:text-[#00A1AC] transition-colors">
              {link.name}
            </a>
          ))}
        </nav>

        {/* 3. Right: Book Appointment CTA (Far Right) */}
        <div className="hidden md:flex items-center justify-end flex-1 shrink-0">
          <Link
            href={bookUrl}
            style={{ backgroundColor: activeTheme.primary }}
            className={`text-white text-xs font-bold px-6 py-2.5 ${activeShape} shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 px-6 py-5 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-700 hover:text-[#00A1AC] py-1.5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link 
              href={bookUrl}
              onClick={() => setIsOpen(false)}
              className={`w-full text-center text-white text-xs font-black py-2.5 ${activeShape} shadow-md flex items-center justify-center gap-1.5`}
              style={{ backgroundColor: activeTheme.primary }}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, HeartPulse, Stethoscope, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { getThemeConfig, getButtonShapeClass } from '../../../lib/themeColors.js';

export default function PublicNavbar({ clinic = {}, doctor = {}, websiteConfig = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Determine Active Plan Tier & Styling Tokens
  const rawPlan = doctor?.planId || doctor?.subscription?.tier || doctor?.subscription?.planId || clinic?.subscription?.planId || clinic?.planId || 'BASIC';
  const planUpper = String(rawPlan).toUpperCase();
  const currentPlan = (planUpper === 'PREMIUM' || planUpper === 'ENTERPRISE') 
    ? 'PREMIUM' 
    : (planUpper === 'ADVANCED' || planUpper === 'PRO' || planUpper === 'PROFESSIONAL') 
      ? 'ADVANCED' 
      : 'BASIC';

  const activeTheme = getThemeConfig(websiteConfig?.themeColor || websiteConfig?.primaryColor);
  const activeShape = getButtonShapeClass(websiteConfig?.buttonShape || websiteConfig?.buttonStyle || 'curved');

  const slug = clinic?.slug || '';
  const clinicName = clinic?.name || doctor?.clinicName || 'Clinic Portal';
  const rawPhone = clinic?.phone || doctor?.phone || "9523663754";
  const displayPhone = rawPhone.startsWith("+91") ? rawPhone : (rawPhone.length === 10 ? `+91 ${rawPhone}` : rawPhone);

  const bookUrl = slug ? `/${slug}/book` : "#book";

  // BASIC Navigation Links
  const basicNavLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Timings", href: "#schedule" }
  ];

  // ADVANCED Navigation Links
  const advancedNavLinks = [
    { name: "Home", href: "#home" },
    { name: "About Doctor", href: "#about" },
    { name: "Treatments & Services", href: "#services" },
    { name: "OPD Schedule", href: "#schedule" },
    { name: "Patient Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" }
  ];

  // PREMIUM Navigation Links
  const premiumNavLinks = [
    { name: "Home", href: "#home" },
    { name: "Clinical Bio", href: "#about" },
    { name: "Treatments", href: "#services" },
    { name: "OPD Hours", href: "#schedule" },
    { name: "Testimonials", href: "#reviews" },
    { name: "Directions", href: "#contact" }
  ];

  return (
    <>
      {/* 2. BASIC Plan Navbar Layout */}
      {currentPlan === 'BASIC' && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-xs">
          <Link href={`/${slug}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-black flex items-center justify-center text-sm border border-slate-200 shadow-xs">
              {clinicName.charAt(0) || 'C'}
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">{clinicName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {basicNavLinks.map(link => (
              <a key={link.name} href={link.href} className="hover:text-slate-900 transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={bookUrl}
              style={{ backgroundColor: activeTheme.primary }}
              className={`text-white text-xs font-bold px-4 py-2 ${activeShape} shadow-sm transition-all hover:opacity-90 active:scale-95`}
            >
              Book Slot
            </Link>

            <button 
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* 3. ADVANCED Plan Navbar Layout */}
      {currentPlan === 'ADVANCED' && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 sm:px-10 py-4 flex items-center justify-between shadow-sm">
          <Link href={`/${slug}`} className="flex items-center gap-3">
            <div
              style={{ backgroundColor: activeTheme.primary }}
              className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shadow-sm text-lg"
            >
              {clinicName.charAt(0) || 'D'}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-tight block">{clinicName}</span>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Verified Clinic
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {advancedNavLinks.map(link => (
              <a key={link.name} href={link.href} className="hover:text-slate-900 transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {rawPhone && (
              <a href={`tel:${rawPhone}`} className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-full transition-colors">
                <span>📞</span> {displayPhone}
              </a>
            )}
            <Link
              href={bookUrl}
              style={{ backgroundColor: activeTheme.primary }}
              className={`text-white text-xs font-bold px-5 py-2.5 ${activeShape} shadow-md shadow-blue-500/15 hover:opacity-95 transition-all flex items-center gap-1.5 active:scale-95`}
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button 
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* 4. PREMIUM Plan Navbar Layout */}
      {currentPlan === 'PREMIUM' && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100/80 px-6 sm:px-12 py-4 flex items-center justify-between shadow-md">
          <Link href={`/${slug}`} className="flex items-center gap-3.5 group">
            {websiteConfig?.clinicLogo || clinic?.logo ? (
              <img 
                src={websiteConfig?.clinicLogo || clinic?.logo} 
                alt={clinicName} 
                className="h-10 w-auto max-w-[150px] object-contain rounded-xl" 
              />
            ) : (
              <div
                style={{ backgroundColor: activeTheme.primary }}
                className="w-10 h-10 rounded-2xl text-white font-black flex items-center justify-center shadow-lg text-lg group-hover:scale-105 transition-transform"
              >
                {clinicName.charAt(0) || 'P'}
              </div>
            )}
            <div>
              <span className="font-extrabold text-slate-950 text-base tracking-tight block">{clinicName}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1">
                ★ Executive Medical Practice
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            {premiumNavLinks.map(link => (
              <a key={link.name} href={link.href} className="hover:text-slate-950 transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {rawPhone && (
              <a href={`tel:${rawPhone}`} className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-50/80 border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all hover:bg-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{displayPhone}</span>
              </a>
            )}
            <Link
              href={bookUrl}
              style={{ backgroundColor: activeTheme.primary }}
              className={`text-white text-xs font-extrabold tracking-wide uppercase px-6 py-2.5 ${activeShape} shadow-lg transition-transform hover:scale-[1.03] active:scale-95 flex items-center gap-1.5`}
            >
              <span>Reserve Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button 
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* Responsive Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {(currentPlan === 'PREMIUM' ? premiumNavLinks : currentPlan === 'ADVANCED' ? advancedNavLinks : basicNavLinks).map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold text-slate-700 hover:text-[#00A1AC] py-1 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            {rawPhone && (
              <a 
                href={`tel:${rawPhone}`}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 py-1"
              >
                <Phone className="w-4 h-4 text-[#00A1AC]" />
                <span>Call Clinic: {displayPhone}</span>
              </a>
            )}
            <Link 
              href={bookUrl}
              onClick={() => setIsOpen(false)}
              className={`w-full text-center text-white text-xs font-black py-3 ${activeShape} shadow-md`}
              style={{ backgroundColor: activeTheme.primary }}
            >
              Book Confirmed Slot
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

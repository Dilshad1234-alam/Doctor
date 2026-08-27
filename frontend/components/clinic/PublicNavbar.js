"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';
import { getThemeConfig, getButtonShapeClass } from '../../../lib/themeColors.js';

export default function PublicNavbar({ clinic = {}, doctor = {}, websiteConfig = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = getThemeConfig(websiteConfig?.themeColor || websiteConfig?.primaryColor);
  const activeShape = getButtonShapeClass(websiteConfig?.buttonShape || websiteConfig?.buttonStyle);

  const slug = clinic?.slug || '';
  const rawPhone = clinic?.phone || doctor?.phone || "9523663754";
  const displayPhone = rawPhone.startsWith("+91") ? rawPhone : (rawPhone.length === 10 ? `+91 ${rawPhone}` : rawPhone);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Doctor", href: "#about" },
    { name: "Treatments & Services", href: "#services" },
    { name: "OPD Schedule", href: "#schedule" },
    { name: "Patient Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-3.5 flex items-center justify-between">
        
        {/* Left: Clinic Brand & Logo */}
        <Link href={`/${slug}`} className="flex items-center gap-3 group">
          {websiteConfig?.clinicLogo || clinic?.logo ? (
            <img 
              src={websiteConfig?.clinicLogo || clinic?.logo} 
              alt={clinic?.name || "Clinic Logo"} 
              className={`w-10 h-10 ${activeShape} object-contain p-1 border border-slate-200 bg-white shadow-sm group-hover:scale-105 transition-transform`} 
            />
          ) : (
            <div 
              className={`w-10 h-10 ${activeShape} flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform`}
              style={{ backgroundColor: activeTheme.primary }}
            >
              {clinic?.name?.charAt(0) || "D"}
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:opacity-80 transition-opacity">
              {clinic?.name || "Dilshad Clinic"}
            </h1>
            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Medical Clinic
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-7">
          {navLinks.map(link => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Clinic Phone & Primary CTA */}
        <div className="hidden sm:flex items-center gap-5">
          <a 
            href={`tel:${rawPhone}`} 
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: activeTheme.light, color: activeTheme.text }}
            >
              <Phone className="w-4 h-4" />
            </div>
            <span>{displayPhone}</span>
          </a>

          <Link 
            href={`/${slug}/book`} 
            className={`text-white text-xs sm:text-sm font-black px-5 sm:px-6 py-2.5 ${activeShape} shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-90`}
            style={{ backgroundColor: activeTheme.primary }}
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 shadow-xl py-4 px-6 flex flex-col gap-3 animate-in slide-in-from-top-2">
          {navLinks.map(link => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)} 
              className="text-sm font-bold text-slate-700 py-2 px-3 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
            <a 
              href={`tel:${rawPhone}`} 
              className="text-sm font-bold text-slate-700 flex items-center gap-2 px-3"
            >
              <Phone className="w-4 h-4" style={{ color: activeTheme.primary }} />
              <span>{displayPhone}</span>
            </a>
            <Link 
              href={`/${slug}/book`} 
              onClick={() => setIsOpen(false)} 
              className={`text-center text-white font-black py-3 ${activeShape} shadow-md block active:scale-95 text-sm`}
              style={{ backgroundColor: activeTheme.primary }}
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

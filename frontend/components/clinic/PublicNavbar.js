"use client";
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function PublicNavbar({ clinic, websiteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const primaryColor = websiteConfig?.primaryColor || clinic?.websiteConfig?.primaryColor || '#0f766e';
  const buttonStyle = websiteConfig?.buttonStyle || clinic?.websiteConfig?.buttonStyle || 'rounded-xl';
  
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Doctor", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Clinic Info", href: "#clinic-info" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${buttonStyle} flex items-center justify-center text-white font-bold text-xl shadow-inner`} style={{ backgroundColor: primaryColor }}>
            {clinic.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">{clinic.name}</h1>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} className="text-sm font-bold text-slate-600 hover:opacity-80 transition-colors" style={{ '--tw-text-opacity': 1 }}>
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a href="#book" className={`text-white px-6 py-2.5 ${buttonStyle} font-bold text-sm transition-all shadow-md hover:shadow-lg hover:opacity-95`} style={{ backgroundColor: primaryColor }}>
            Book Appointment
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-800 p-2 hover:bg-slate-50 rounded-lg">
              {link.name}
            </a>
          ))}
          <a href="#book" onClick={() => setIsOpen(false)} className={`text-center text-white p-3 ${buttonStyle} font-bold shadow-sm mt-2`} style={{ backgroundColor: primaryColor }}>
            Book Appointment
          </a>
        </div>
      )}
    </nav>
  );
}

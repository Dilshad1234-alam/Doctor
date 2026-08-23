"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function PublicNavbar({ clinic, websiteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const primaryColor = websiteConfig?.primaryColor || clinic?.websiteConfig?.primaryColor || '#059669';
  const buttonStyle = websiteConfig?.buttonStyle || clinic?.websiteConfig?.buttonStyle || 'rounded-xl';
  const slug = clinic?.slug || '';
  
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Doctor", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Clinic Info", href: "#clinic-info" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 lg:px-20 py-3.5 flex items-center justify-between shadow-sm transition-all">
      <Link href={`/${slug}`} className="flex items-center gap-3">
        <div className={`w-10 h-10 ${buttonStyle} flex items-center justify-center text-white font-bold text-xl shadow-inner`} style={{ backgroundColor: primaryColor }}>
          {clinic.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">{clinic.name}</h1>
        </div>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map(link => (
          <a key={link.name} href={link.href} className="text-sm font-bold text-slate-600 hover:opacity-80 transition-colors">
            {link.name}
          </a>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <Link 
          href={`/${slug}/book`} 
          className={`text-white font-bold py-2.5 px-6 ${buttonStyle} hover:opacity-90 transition-all shadow-md hover:shadow-lg inline-block active:scale-95 text-sm`} 
          style={{ backgroundColor: primaryColor }}
        >
          Book Appointment
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-800 p-2 hover:bg-slate-50 rounded-lg">
              {link.name}
            </a>
          ))}
          <Link 
            href={`/${slug}/book`} 
            onClick={() => setIsOpen(false)} 
            className={`text-center text-white p-3 ${buttonStyle} font-bold shadow-sm mt-2 block active:scale-95`} 
            style={{ backgroundColor: primaryColor }}
          >
            Book Appointment
          </Link>
        </div>
      )}
    </nav>
  );
}

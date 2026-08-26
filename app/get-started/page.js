"use client";
import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Building2,
  Hotel,
  Check,
  HeartPulse,
} from "lucide-react";

export default function GetStartedPage() {
  const providerOptions = [
    {
      id: "individual_doctor",
      type: "individual_doctor",
      title: "Individual Doctor",
      badge: "Solo Practice",
      icon: Stethoscope,
      tagline: "Designed for private physicians, solo specialists, and independent consultants.",
      inclusions: [
        "Personal branded website & direct booking",
        "1 Doctor OPD slot & token management",
        "Prescription slips & digital consultation",
        "Verified doctor badge",
      ],
      buttonText: "Continue as Individual Doctor →",
      targetUrl: "/register?type=individual_doctor",
      featured: false,
    },
    {
      id: "clinic",
      type: "clinic",
      title: "Multi-Doctor Clinic",
      badge: "Clinic Roster",
      icon: Building2,
      tagline: "For polyclinics, diagnostic centers, and group practices with multiple doctors.",
      inclusions: [
        "Single clinic website with multiple doctors",
        "Speciality-wise & doctor-wise booking filters",
        "Doctor specific fees & schedule management",
        "Receptionist / Doctor sub-accounts",
      ],
      buttonText: "Continue as Multi-Doctor Clinic →",
      targetUrl: "/register?type=clinic",
      featured: true,
    },
    {
      id: "hospital",
      type: "hospital",
      title: "Hospital",
      badge: "Enterprise Healthcare",
      icon: Hotel,
      tagline: "Comprehensive infrastructure for multi-department hospitals and medical centers.",
      inclusions: [
        "Department hierarchies (Cardiology, Ortho, etc.)",
        "Doctor-to-department roster mapping",
        "24/7 Emergency helpline & facility directory",
        "Multi-speciality OPD & bed capacity queues",
      ],
      buttonText: "Continue as Hospital →",
      targetUrl: "/register?type=hospital",
      featured: false,
    },
  ];

  return (
    <div className="bg-[#0D3648] min-h-screen text-slate-900 relative flex flex-col justify-between font-sans antialiased selection:bg-[#0D3648] selection:text-white">
      {/* Full-Width Top Navbar: Extreme Left & Right Corners */}
      <header className="w-full flex items-center justify-between px-6 sm:px-12 lg:px-16 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
            <HeartPulse className="w-5 h-5 font-black text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            DocPulse <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">CRM</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-white/80 hidden sm:inline-block font-medium">Already a partner?</span>
          <Link
            href="/login"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm backdrop-blur-md"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 my-auto py-10 sm:py-16 flex flex-col items-center justify-center flex-1">
        {/* Main Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight text-center leading-tight">
            Choose Your Healthcare Practice Type
          </h1>

          <p className="text-sm sm:text-base text-white/80 text-center font-medium mt-3">
            Select the category that best matches your clinical operations
          </p>
        </div>

        {/* 3 Modern White Practice Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full max-w-6xl mx-auto">
          {providerOptions.map((provider) => {
            const Icon = provider.icon;
            return (
              <div
                key={provider.id}
                className={`bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between hover:shadow-black/20 hover:scale-[1.01] transition-all duration-200 relative ${
                  provider.featured
                    ? "border-2 border-[#0D3648] shadow-2xl scale-[1.02] z-10"
                    : "border border-white/60 shadow-xl"
                }`}
              >
                {/* Most Popular Pinned Top Badge */}
                {provider.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider font-bold bg-[#0D3648] text-white border border-white/20 block">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div>
                  {/* Top Row: Navy Icon Badge + Pill Badge */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="bg-[#0D3648]/10 text-[#0D3648] p-3 rounded-2xl w-12 h-12 flex items-center justify-center border border-[#0D3648]/15 shadow-sm">
                      <Icon className="w-6 h-6 text-[#0D3648]" />
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200/80">
                      {provider.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-xl sm:text-2xl font-black text-[#0D3648] mt-4 tracking-tight">
                    {provider.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 mb-4">
                    {provider.tagline}
                  </p>

                  {/* Inclusion List */}
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2.5">
                      DETAILS & INCLUSIONS
                    </h3>
                    <ul className="space-y-2.5">
                      {provider.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                          <div className="w-4 h-4 rounded-full bg-[#0D3648]/10 text-[#0D3648] flex items-center justify-center shrink-0 mt-0.5 border border-[#0D3648]/20">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="pt-4">
                  <Link
                    href={provider.targetUrl}
                    className="bg-[#0D3648] hover:bg-[#12455c] active:bg-[#08232f] text-white font-black py-3.5 px-4 rounded-2xl w-full text-xs sm:text-sm shadow-xl shadow-[#0D3648]/30 mt-6 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{provider.buttonText}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

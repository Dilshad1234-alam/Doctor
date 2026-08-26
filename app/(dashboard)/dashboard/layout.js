"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Stethoscope, Clock, Globe, 
  CreditCard, Settings, LogOut, Sparkles, HeartPulse,
  ArrowLeft, ExternalLink, Menu, X, ShieldCheck, User
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userState, setUserState] = useState({
    name: "Doctor",
    email: "",
    clinicSlug: "",
    isOnboardingCompleted: pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding") ? false : null,
  });
  const doctorInfo = userState;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          const isDone = Boolean(json.user.isOnboardingCompleted || json.user.hasCompletedOnboarding);
          setUserState({
            name: json.user.name ? `Dr. ${json.user.name.replace(/^Dr\.?\s*/i, "")}` : "Doctor",
            email: json.user.email || "",
            clinicSlug: json.user.slug || "",
            isOnboardingCompleted: isDone,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [pathname]);

  // Seamless Layout Guard: Do not mount dashboard sidebar/topbar during onboarding
  if (
    pathname === "/dashboard/onboarding" ||
    pathname.startsWith("/dashboard/onboarding") ||
    userState.isOnboardingCompleted === false
  ) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  const navItems = [
    { name: "Platform Overview", href: "/dashboard", icon: LayoutDashboard, badge: "Live" },
    { name: "Appointments Queue", href: "/dashboard/appointments", icon: Calendar, badge: null },
    { name: "Clinic Services", href: "/dashboard/services", icon: Stethoscope, badge: null },
    { name: "OPD Availability", href: "/dashboard/availability", icon: Clock, badge: null },
    { name: "Website Builder", href: "/dashboard/website", icon: Globe, badge: "Web" },
    { name: "Subscription & Plan", href: "/dashboard/billing", icon: CreditCard, badge: "SaaS" },
    { name: "Clinic Settings", href: "/dashboard/settings", icon: Settings, badge: null },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const initials = doctorInfo.name.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase() || "DR";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#0f172a] selection:bg-[#00A1AC] selection:text-white flex">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#0c2e3d]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Component (Medical Navy #0c2e3d Background & Teal #00A1AC Active Pill) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0c2e3d] text-white border-r border-[#15465c] flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & Doctor Mode */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#00A1AC] border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-white tracking-tight">DocPulse</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#00A1AC]/30 text-teal-200 border border-[#00A1AC]/40">
                    Doctor
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Doctor Suite</p>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Doctor Suite Status Pill */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-[#15465c] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A1AC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A1AC]"></span>
              </div>
              <span className="text-xs font-bold text-slate-200">Doctor Suite Mode</span>
            </div>
            <span className="text-[10px] font-black text-white bg-[#00A1AC] px-2 py-0.5 rounded-full">v2.4</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-1 overflow-y-auto max-h-[calc(100vh-380px)] hide-scrollbar">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-1">
              Management
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs transition-all duration-200 group ${
                    active
                      ? "bg-[#00A1AC] text-white font-bold shadow-md shadow-[#00A1AC]/30"
                      : "text-slate-300 hover:text-white hover:bg-[#134255]/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? "text-white" : "text-slate-400 group-hover:text-[#00A1AC]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-[#00A1AC]/20 text-[#00A1AC] border border-[#00A1AC]/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="pt-4 space-y-2.5 border-t border-[#15465c]">
          {doctorInfo.clinicSlug && (
            <Link
              href={`/${doctorInfo.clinicSlug}`}
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:border-[#00A1AC] bg-white/5 hover:bg-[#134255]/70 border border-[#15465c] transition-all"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5 text-[#00A1AC]" />
                <span>View Live Clinic Site</span>
              </div>
              <ExternalLink className="w-3 h-3 text-[#00A1AC]" />
            </Link>
          )}

          {/* Doctor User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-[#15465c] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0 border border-white/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{doctorInfo.name}</p>
                <p className="text-[11px] text-slate-300 truncate">{doctorInfo.email}</p>
                <span className="inline-block text-[9px] font-black text-[#00A1AC] uppercase mt-0.5">Verified Doctor</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Clean White Header + Slate-50 Background) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <HeartPulse className="w-5 h-5 text-[#00A1AC]" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Doctor Suite Portal
              </h2>
              <span className="hidden sm:inline-block text-[11px] font-bold text-[#00A1AC] bg-[#00A1AC]/10 px-2.5 py-0.5 rounded-full border border-[#00A1AC]/20">
                Doctor: {doctorInfo.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#00A1AC] animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>

            {doctorInfo.clinicSlug && (
              <Link
                href={`/${doctorInfo.clinicSlug}`}
                target="_blank"
                className="bg-[#00A1AC] hover:bg-[#008790] text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-md shadow-[#00A1AC]/25 flex items-center gap-1.5"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </header>

        {/* Page Children with slate-50 background */}
        <main className="flex-1 bg-slate-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

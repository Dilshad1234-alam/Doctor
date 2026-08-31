"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Stethoscope, 
  Clock, 
  Globe, 
  CreditCard, 
  Settings, 
  LogOut, 
  HeartPulse, 
  ArrowLeft, 
  ExternalLink, 
  X,
  BarChart3,
  Crown,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export const NAV_ITEMS = [
  { name: "Platform Overview", href: "/dashboard", icon: LayoutDashboard, badge: "Live" },
  { name: "Appointments Queue", href: "/dashboard/appointments", icon: Calendar, badge: null },
  { name: "Patients Directory", href: "/dashboard/patients", icon: Users, badge: "Records" },
  { name: "Clinic Services", href: "/dashboard/services", icon: Stethoscope, badge: null },
  { name: "OPD Availability", href: "/dashboard/opd-availability", icon: Clock, badge: null },
  { name: "Telemetry & Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: null },
  { name: "Website Builder", href: "/dashboard/website", icon: Globe, badge: "Web" },
  { name: "Subscription & Plan", href: "/dashboard/billing", icon: CreditCard, badge: "SaaS" },
  { name: "Clinic Settings", href: "/dashboard/clinic-settings", icon: Settings, badge: null },
];

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  doctorInfo = { name: "Doctor", email: "", clinicSlug: "" },
  isPremium = false,
  isAdvanced = false,
  planId = "BASIC",
  onLogout
}) {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    if (path === "/dashboard/opd-availability" && pathname === "/dashboard/availability") return true;
    if (path === "/dashboard/clinic-settings" && pathname === "/dashboard/settings") return true;
    if (path === "/dashboard/website" && pathname === "/dashboard/website-builder") return true;
    return pathname.startsWith(path);
  };

  const initials = doctorInfo.name ? doctorInfo.name.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase() : "DR";
  const currentTier = (planId || "BASIC").toUpperCase();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#0c2e3d]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0c2e3d] text-white border-r border-[#15465c] flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & Navigation */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#00A1AC] border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-white tracking-tight">DocPulse</span>
                  {currentTier === 'PREMIUM' || currentTier === 'ENTERPRISE' ? (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">PREMIUM VIP</span>
                  ) : currentTier === 'ADVANCED' || currentTier === 'PRO' ? (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">ADVANCED</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-slate-700/60 text-slate-300 border border-slate-600">BASIC TIER</span>
                  )}
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
          <div className="p-3 rounded-2xl bg-white/5 border border-[#15465c] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A1AC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A1AC]"></span>
              </div>
              <span className="text-xs font-bold text-slate-200">Doctor Suite Mode</span>
            </div>
            <span className="text-[10px] font-black text-white bg-[#00A1AC] px-2 py-0.5 rounded-full">v2.5</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1 overflow-y-auto max-h-[calc(100vh-370px)] hide-scrollbar">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-1">
              Clinic Management
            </div>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 group ${
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
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.badge === "VIP"
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                          : active
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
        <div className="pt-3 space-y-2 border-t border-[#15465c]">
          {doctorInfo.clinicSlug && (
            <Link
              href={`/${doctorInfo.clinicSlug}`}
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:border-[#00A1AC] bg-white/5 hover:bg-[#134255]/70 border border-[#15465c] transition-all"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5 text-[#00A1AC]" />
                <span>Live Clinic Site</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#00A1AC]" />
            </Link>
          )}

          {/* Doctor User Profile Card */}
          <div className="p-3 rounded-2xl bg-white/5 border border-[#15465c] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black text-xs shadow-md shrink-0 border border-white/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{doctorInfo.name}</p>
                <p className="text-[10px] text-slate-300 truncate">{doctorInfo.email}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-[#00A1AC] uppercase mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentTier === 'PREMIUM' || currentTier === 'ENTERPRISE' ? 'bg-purple-500' : currentTier === 'ADVANCED' || currentTier === 'PRO' ? 'bg-teal-500' : 'bg-slate-500'}`}></span>
                  {currentTier} DOCTOR
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

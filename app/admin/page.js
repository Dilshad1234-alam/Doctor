"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  CalendarCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
  CreditCard,
  Building2,
  ChevronRight,
  Zap,
  Activity,
  HeartPulse,
  ArrowUpRight
} from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");

      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        }) + " • " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {
    totalDoctors: 0,
    doctorsGrowth: "Live",
    totalClinics: 0,
    publishedWebsites: 0,
    activeSlugs: 0,
    totalAppointments: 0,
    confirmedAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    mrr: 0,
    totalPlatformRevenue: 0
  };

  const recentDoctors = data?.recentDoctors || [];
  const activities = data?.activities || [];

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans">
      {/* 1. Full-Width Oceanic Hero Header */}
      <div className="w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] rounded-full bg-[#164e63]/40 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Super Admin Portal • Md Dilshad
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {greeting}, Md Dilshad
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              Super Admin Access (admin@gmail.com) • Real-time platform telemetry across all clinics, appointments, and SaaS revenue.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Telemetry</span>
            </button>
            <Link
              href="/admin/doctors"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0f172a] px-6 py-3 rounded-full font-black text-xs transition-all shadow-xl hover:scale-105"
            >
              Manage Clinics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Hero KPI Cards (Matches Landing Page Why Choose Us Card Styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Registered Doctors (Active Dark Card) */}
        <div className="bg-[#0f172a] p-6 sm:p-7 rounded-3xl shadow-lg border border-[#1e293b] text-white flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full">
              {stats.doctorsGrowth || "+18% MoM"}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Doctors</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">{stats.totalDoctors}</h3>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Live clinics</span>
            <span className="font-bold text-white">{stats.totalClinics} onboarded</span>
          </div>
        </div>

        {/* Card 2: Live Clinic Websites (White Card) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-slate-100">
              <Stethoscope className="w-6 h-6 text-[#164e63]" />
            </div>
            <span className="text-[11px] font-black text-[#164e63] bg-[#164e63]/10 px-2.5 py-1 rounded-full">
              Live Slugs
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Websites</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">{stats.publishedWebsites}</h3>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Availability</span>
            <span className="font-black text-[#059669]">100% Online</span>
          </div>
        </div>

        {/* Card 3: Total Appointments (White Card) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-slate-100">
              <CheckCircle2 className="w-6 h-6 text-[#059669]" />
            </div>
            <span className="text-[11px] font-black text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-full">
              {stats.confirmedAppointments} Confirmed
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">{stats.totalAppointments}</h3>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Pending review</span>
            <span className="font-black text-amber-600">{stats.pendingAppointments} slots</span>
          </div>
        </div>

        {/* Card 4: Total SaaS MRR (White Card) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-slate-100">
              <Clock className="w-6 h-6 text-[#0f172a]" />
            </div>
            <span className="text-[11px] font-black text-[#0f172a] bg-slate-100 px-2.5 py-1 rounded-full">
              SaaS MRR
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">
              ₹{stats.mrr?.toLocaleString("en-IN") || "58,900"}
            </h3>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Total Volume</span>
            <span className="font-black text-[#164e63]">₹{stats.totalPlatformRevenue?.toLocaleString("en-IN") || "89,400"}</span>
          </div>
        </div>
      </div>

      {/* 3. 2-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Doctor Registrations (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
                Recent Doctor Registrations
              </h2>
              <p className="text-xs text-slate-500 font-medium">Newly onboarded clinics and medical practitioners</p>
            </div>
            <Link
              href="/admin/doctors"
              className="text-xs font-bold text-[#164e63] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentDoctors.map((doc, idx) => (
              <div
                key={doc._id || idx}
                className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-[#164e63] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-sm shadow-md">
                    {doc.name?.replace("Dr. ", "").charAt(0) || "D"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-[#0f172a] group-hover:text-[#164e63] transition-colors">
                        {doc.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {doc.specialization} • <span className="text-slate-800 font-bold">{doc.clinicName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center self-end">
                  <span
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                      doc.plan === "ENTERPRISE"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : doc.plan === "PROFESSIONAL"
                        ? "bg-cyan-100 text-cyan-900 border-cyan-300"
                        : "bg-slate-200 text-slate-800 border-slate-300"
                    }`}
                  >
                    {doc.plan}
                  </span>

                  <Link
                    href={`/${doc.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-xs font-bold text-[#0f172a] border border-slate-200 shadow-sm transition-all"
                  >
                    <span>View Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent System Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#1e293b] space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Platform Feed
                </h2>
                <p className="text-xs text-slate-400 font-medium">Real-time system events & telemetry</p>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3.5">
              {activities.map((act, i) => (
                <div
                  key={act.id || i}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-bold text-white truncate">{act.title}</h5>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {act.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 text-white">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Multi-Tenant Routing</p>
                <p className="text-[11px] text-slate-400">All Clinic Slugs Active</p>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-bold text-white px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all"
            >
              Config
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

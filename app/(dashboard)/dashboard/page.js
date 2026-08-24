"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, CheckCircle2, CreditCard, RefreshCw, 
  ExternalLink, Copy, Check, Clock3, PlusCircle, 
  Settings, Loader2, Lock, MessageCircle, Link as LinkIcon, Users, Sparkles, Camera, Image as ImageIcon,
  ArrowRight, HeartPulse, Stethoscope, Activity, ArrowUpRight, ShieldCheck, Globe
} from "lucide-react";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [greeting, setGreeting] = useState("Good afternoon");
  const [currentTime, setCurrentTime] = useState("");
  
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [mediaSaving, setMediaSaving] = useState(false);

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

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.hasCompletedOnboarding === false) {
          router.push("/dashboard/onboarding");
          return;
        }
      } else {
        if (json.requiresSubscription) {
          router.push("/pricing?onboarding=true");
          return;
        }
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/clinic/media");
      const json = await res.json();
      if (json.success) {
        setAvatarUrl(json.avatarUrl || "");
        setCoverImageUrl(json.coverImageUrl || "");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (data?.clinic) {
      fetchMedia();
    }
  }, [data?.clinic, fetchMedia]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyClinicLink = () => {
    if (!data?.clinic?.slug) return;
    const url = `${window.location.origin}/${data.clinic.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        setMediaSaving(true);
        try {
          const payload = type === 'avatar' ? { avatarUrl: base64 } : { coverImageUrl: base64 };
          const res = await fetch('/api/clinic/media', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.success) {
             if (type === 'avatar') setAvatarUrl(json.avatarUrl);
             else setCoverImageUrl(json.coverImageUrl);
          }
        } catch(err) {
          console.error(err);
        } finally {
          setMediaSaving(false);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#0a2635]" />
      </div>
    );
  }

  const { stats, clinic, doctor, recentAppointments, subscription } = data || {
    stats: { todayAppointmentsCount: 0, pendingCount: 0, completedCount: 0, totalRevenue: 0 },
    clinic: { name: "My Clinic", slug: "" },
    doctor: { name: "Doctor" },
    recentAppointments: [],
    subscription: { planId: "STARTER" }
  };

  const planId = subscription.planId;
  const isStarter = planId === "STARTER";
  const isEnterprise = planId === "ENTERPRISE";

  const rawName = doctor?.name || "Doctor";
  const cleanDoctorName = `Dr. ${rawName.replace(/^Dr\.?\s*/i, "").trim()}`;

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans bg-slate-50 text-[#0f172a]">
      
      {/* 1. Full-Width Oceanic Hero Header (Exact Admin Header Match) */}
      <div className="w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] rounded-full bg-[#164e63]/40 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Doctor Suite • {cleanDoctorName}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {greeting}, {cleanDoctorName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              Clinic Portal ({clinic.name}{doctor?.email ? ` • ${doctor.email}` : ""}) • Real-time patient booking telemetry, OPD availability, and clinic revenue.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Telemetry</span>
            </button>
            <button
              onClick={copyClinicLink}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <Link
              href={`/${clinic.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0f172a] px-6 py-3 rounded-full font-black text-xs transition-all shadow-xl hover:scale-105"
            >
              View Live Clinic <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Hero KPI Cards (Matches Exact Admin Style: 1 Dark + 3 White) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Active Bookings (Active Dark Card) */}
        <div className="bg-[#0f172a] p-6 sm:p-7 rounded-3xl shadow-lg border border-[#1e293b] text-white flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full">
              Live
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Active Bookings</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">{stats.todayAppointmentsCount}</h3>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Scheduled Today</span>
            <span className="font-bold text-white">{stats.todayAppointmentsCount} slots</span>
          </div>
        </div>

        {/* Card 2: Pending Approval (White Card) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-slate-100">
              <Clock className="w-6 h-6 text-[#164e63]" />
            </div>
            <span className="text-[11px] font-black text-[#164e63] bg-[#164e63]/10 px-2.5 py-1 rounded-full">
              {stats.pendingCount} Pending
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approval</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">{stats.pendingCount}</h3>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Awaiting Review</span>
            <span className="font-bold text-emerald-600">Online</span>
          </div>
        </div>

        {/* Card 3: Total Consulted (White Card) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-slate-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {stats.completedCount} Done
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consulted Today</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">{stats.completedCount}</h3>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Consultation status</span>
            <span className="font-bold text-slate-900">Completed</span>
          </div>
        </div>

        {/* Card 4: Estimated Revenue (White Card) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-slate-100">
              <CreditCard className="w-6 h-6 text-[#0f172a]" />
            </div>
            <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              SaaS MRR
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Revenue</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">₹{stats.totalRevenue}</h3>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Today&apos;s Volume</span>
            <span className="font-bold text-slate-900">₹{stats.totalRevenue}</span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Grid: Recent Appointments (White Card) + Quick Shortcuts (Active Dark Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Appointments Table (White Card) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0f172a]">Recent Appointments</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Live appointments booked via your public clinic page</p>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-bold text-[#164e63] hover:text-[#0f172a] flex items-center gap-1 bg-slate-100 px-3.5 py-1.5 rounded-full transition-colors"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3 font-black">Patient Info</th>
                  <th className="pb-3 font-black">Service</th>
                  <th className="pb-3 font-black">Time Slot</th>
                  <th className="pb-3 font-black">Status</th>
                  <th className="pb-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No appointments booked yet today.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] font-black flex items-center justify-center text-xs shrink-0">
                            {item.patientName?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-bold text-[#0f172a] text-sm group-hover:text-[#164e63] transition-colors">{item.patientName}</p>
                            <p className="text-xs text-slate-400 font-mono">{item.patientPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-600">{item.serviceName}</td>
                      <td className="py-4 text-xs font-bold text-[#164e63]">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                          {item.timeSlot}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {item.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {item.status === "COMPLETED" ? (
                          <span className="text-xs text-emerald-600 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(item._id, "COMPLETED")}
                            className="rounded-full bg-[#0f172a] hover:bg-[#1e293b] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions & Live Clinic Shortcuts (Active Dark Card) */}
        <div className="bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-lg border border-[#1e293b] text-white space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white">Clinic Feed</h2>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs text-slate-400 font-medium -mt-3">Real-time clinic shortcuts & actions</p>

          <div className="space-y-3">
            <Link
              href="/dashboard/availability"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">OPD Timings</p>
                  <p className="text-[11px] text-slate-400">Manage daily doctor hours</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full group-hover:bg-white group-hover:text-[#0f172a] transition-colors">
                Config
              </span>
            </Link>

            <Link
              href="/dashboard/services"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Clinic Services</p>
                  <p className="text-[11px] text-slate-400">Configure fees & duration</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full group-hover:bg-white group-hover:text-[#0f172a] transition-colors">
                Config
              </span>
            </Link>

            <Link
              href="/dashboard/website"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Website Builder</p>
                  <p className="text-[11px] text-slate-400">Customize clinic theme</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full group-hover:bg-white group-hover:text-[#0f172a] transition-colors">
                Theme
              </span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Clinic Settings</p>
                  <p className="text-[11px] text-slate-400">Phone, address, & credentials</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full group-hover:bg-white group-hover:text-[#0f172a] transition-colors">
                Edit
              </span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

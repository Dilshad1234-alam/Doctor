"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, CheckCircle2, CreditCard, RefreshCw, 
  ExternalLink, Copy, Check, Clock3, PlusCircle, 
  Settings, Loader2, Lock, MessageCircle, Link as LinkIcon, Users, Sparkles, Camera, Image as ImageIcon,
  ArrowUpRight, Activity, ShieldCheck, HeartPulse
} from "lucide-react";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [mediaSaving, setMediaSaving] = useState(false);

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
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (data?.clinic) {
      fetchMedia();
    }
  }, [data?.clinic, fetchMedia]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await fetch("/api/dashboard/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
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
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">{cleanDoctorName}</span>
            </h1>
            <Link 
              href="/dashboard/billing" 
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300 border border-teal-400/30 hover:bg-teal-500/30 transition-all shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" /> {planId} PLAN
            </Link>
          </div>
          <p className="mt-1 text-sm text-slate-300 font-medium">{clinic.name} • Operational Overview</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/15 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="h-4 w-4 text-teal-300" /> Refresh
          </button>
          <button
            onClick={copyClinicLink}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/15 active:scale-[0.98] transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-teal-300" /> : <Copy className="h-4 w-4 text-teal-300" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <Link
            href={`/${clinic.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 px-5 py-2.5 text-sm font-bold text-[#081e2b] shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
          >
            <ExternalLink className="h-4 w-4" /> View Live Site
          </Link>
        </div>
      </div>

      {/* Media Banner Card */}
      <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/30 relative">
        <div 
          className="h-44 md:h-52 w-full relative bg-gradient-to-r from-[#0a2635] via-[#0d3b4d] to-[#124e5e] flex items-center justify-center border-b border-white/10" 
          style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {/* Subtle medical pattern overlay */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
          {coverImageUrl && <div className="absolute inset-0 bg-[#081e2b]/60 backdrop-blur-[1px]"></div>}
          
          {mediaSaving && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-teal-300 animate-spin" />
            </div>
          )}
          
          <button 
            onClick={() => handleUpload('cover')} 
            disabled={mediaSaving} 
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/20 shadow-md z-10"
          >
            <Camera className="w-4 h-4 text-teal-300" /> Change Cover
          </button>
        </div>

        <div className="px-6 md:px-10 pb-6 bg-[#081e2b]/80 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-end -mt-14 sm:-mt-16 mb-2 relative z-20">
            <div className="relative inline-block group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[#0d3b4d] shadow-2xl bg-slate-800 overflow-hidden relative border-2 border-teal-400/40">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900 to-slate-900 text-teal-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleUpload('avatar')} 
                disabled={mediaSaving} 
                className="absolute bottom-1 right-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-[#081e2b] p-2.5 rounded-full shadow-xl border-2 border-[#081e2b] hover:scale-110 active:scale-95 transition-all z-20"
                title="Update Profile Photo"
              >
                <Camera className="w-4 h-4 font-bold" />
              </button>
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{cleanDoctorName}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/20 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-sm font-semibold text-teal-200">Doctor Profile</span>
                <span className="text-white/30">•</span>
                <span className="text-sm font-semibold text-slate-300">{clinic.name}</span>
                <span className="text-white/30">•</span>
                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">/{clinic.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Stat 1 */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-xl shadow-black/20 hover:border-teal-400/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300">Today&apos;s Active</span>
            <div className="rounded-xl bg-teal-500/20 p-2.5 text-teal-300 border border-teal-400/30 shadow-inner">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{stats.todayAppointmentsCount}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Appointments scheduled today</p>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-xl shadow-black/20 hover:border-amber-400/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300">Pending</span>
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-300 border border-amber-400/30 shadow-inner">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{stats.pendingCount}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Patients waiting in queue</p>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-xl shadow-black/20 hover:border-emerald-400/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300">Completed</span>
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-300 border border-emerald-400/30 shadow-inner">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{stats.completedCount}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Consulted successfully today</p>
        </div>

        {/* Stat 4 */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-xl shadow-black/20 relative overflow-hidden hover:border-cyan-400/40 hover:-translate-y-0.5 transition-all">
          {isStarter && (
            <div className="absolute inset-0 bg-[#081e2b]/80 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 text-center">
              <Lock className="h-5 w-5 text-teal-300 mb-1.5" />
              <span className="text-xs font-bold text-white bg-white/10 border border-white/20 px-3 py-1 rounded-full shadow-sm">Pro Feature</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300">Today&apos;s Revenue</span>
            <div className="rounded-xl bg-cyan-500/20 p-2.5 text-cyan-300 border border-cyan-400/30 shadow-inner">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">₹{stats.totalRevenue}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Estimated earnings today</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Table Card */}
        <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/30 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">Recent Appointments</h2>
              <p className="text-xs text-slate-300 mt-0.5">Live appointments booked via your portal</p>
            </div>
            <Link 
              href="/dashboard/appointments" 
              className="text-xs font-bold text-teal-300 hover:text-teal-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase text-teal-300/90 font-bold tracking-wider">
                  <th className="pb-3 font-bold">Patient Info</th>
                  <th className="pb-3 font-bold">Service</th>
                  <th className="pb-3 font-bold">Time Slot</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/10">
                        <Calendar className="w-6 h-6 text-slate-400" />
                      </div>
                      No appointments booked yet today.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((item) => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4">
                        <p className="font-bold text-white group-hover:text-teal-200 transition-colors">{item.patientName}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{item.patientPhone}</p>
                      </td>
                      <td className="py-4 text-slate-300 font-medium">{item.serviceName}</td>
                      <td className="py-4 font-bold text-teal-300">
                        <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-xs">
                          {item.timeSlot}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : item.status === "CANCELLED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-teal-500/20 text-teal-300 border border-teal-400/30"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {item.status === "COMPLETED" ? (
                          <span className="text-xs text-emerald-400 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(item._id, "COMPLETED")}
                            className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 px-3 py-1.5 text-xs font-bold text-[#081e2b] shadow-md shadow-teal-500/20 active:scale-95 transition-all"
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

        {/* Quick Actions & Shortcuts */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-black text-white mb-4">Quick Shortcuts</h2>
            <div className="space-y-3">
              <Link 
                href="/dashboard/availability" 
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-200 hover:bg-teal-500/20 hover:border-teal-400/30 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  Manage OPD Hours
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-300" />
              </Link>
              
              <Link 
                href="/dashboard/services" 
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-200 hover:bg-teal-500/20 hover:border-teal-400/30 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  Manage Services
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-300" />
              </Link>

              <Link 
                href="/dashboard/settings" 
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-200 hover:bg-teal-500/20 hover:border-teal-400/30 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                    <Settings className="h-4 w-4" />
                  </div>
                  Clinic Settings
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-300" />
              </Link>

              {/* Gated Features */}
              {!isStarter ? (
                <>
                  <div className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-emerald-400" /> WhatsApp Alerts
                    </div>
                    <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                  </div>
                  <div className="flex w-full items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm font-bold text-cyan-300">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-cyan-400" /> Custom Domain
                    </div>
                    <span className="text-[10px] uppercase font-extrabold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">Active</span>
                  </div>
                </>
              ) : (
                <Link href="/dashboard/billing" className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4 text-sm font-bold text-slate-400 hover:bg-black/30 hover:text-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Alerts
                  </div>
                  <Lock className="h-4 w-4 text-slate-400" />
                </Link>
              )}
              
              {isEnterprise ? (
                <div className="flex w-full items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm font-bold text-indigo-300">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-indigo-400" /> Team & Multi-Doctor
                  </div>
                </div>
              ) : (
                <Link href="/dashboard/billing" className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4 text-sm font-bold text-slate-400 hover:bg-black/30 hover:text-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4" /> Team & Multi-Doctor
                  </div>
                  <Lock className="h-4 w-4 text-slate-400" />
                </Link>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#081e2b] to-[#0a2f42] border border-teal-500/30 p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-teal-400/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-5 h-5 text-teal-300" />
              <h3 className="font-extrabold text-base text-white">Need Setup Help?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our clinical solutions team is available 24/7 to help you configure domains, schedule slots, and customize your site.
            </p>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Hi DocPulse Support, I need assistance with my clinic dashboard.`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98]"
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

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
      <div className="flex min-h-screen items-center justify-center bg-[#071720]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2dd4bf]" />
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
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto font-sans bg-[#071720] text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-[#2dd4bf]">{cleanDoctorName}</span>
            </h1>
            <span className="bg-[#3d3215] text-[#facc15] text-[10px] font-bold px-2.5 py-1 rounded border border-[#6b581e] uppercase tracking-wider">
              {planId} PLAN
            </span>
          </div>
          <p className="mt-1 text-sm text-[#62879a] font-medium">{clinic.name} • Executive Command Overview</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 bg-[#0d2a38] hover:bg-[#12394c] text-white border border-[#1c485d] font-semibold rounded-xl px-4 py-2 text-xs cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#2dd4bf]" /> Refresh
          </button>
          <button
            onClick={copyClinicLink}
            className="inline-flex items-center gap-2 bg-[#0d2a38] hover:bg-[#12394c] text-white border border-[#1c485d] font-semibold rounded-xl px-4 py-2 text-xs cursor-pointer transition-all active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#2dd4bf]" /> : <Copy className="h-3.5 w-3.5 text-[#2dd4bf]" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <Link
            href={`/${clinic.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-[#00c9a7] hover:bg-[#00b596] text-[#051a24] font-black rounded-xl px-5 py-2 text-xs shadow-lg shadow-[#00c9a7]/20 cursor-pointer transition-all active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Live Site
          </Link>
        </div>
      </div>

      {/* Media Banner Card */}
      <div className="rounded-3xl border border-[#133748] bg-[#0a202c] overflow-hidden shadow-xl relative">
        <div 
          className="h-44 md:h-52 w-full relative bg-[#071d28] flex items-center justify-center border-b border-[#133748]" 
          style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {coverImageUrl && <div className="absolute inset-0 bg-[#071720]/60 backdrop-blur-[1px]"></div>}
          
          {mediaSaving && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-[#2dd4bf] animate-spin" />
            </div>
          )}
          
          <button 
            onClick={() => handleUpload('cover')} 
            disabled={mediaSaving} 
            className="absolute top-4 right-4 bg-[#051118]/80 hover:bg-[#051118] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-[#163c4e] shadow-md z-10 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#2dd4bf]" /> Change Cover
          </button>
        </div>

        <div className="px-6 md:px-10 pb-6 bg-[#0a202c]">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-end -mt-14 sm:-mt-16 mb-2 relative z-20">
            <div className="relative inline-block group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[#0a202c] shadow-2xl bg-[#06151f] overflow-hidden relative border-2 border-[#164e63]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#071d28] text-[#2dd4bf]">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleUpload('avatar')} 
                disabled={mediaSaving} 
                className="absolute bottom-1 right-1 bg-[#00c9a7] text-[#051a24] p-2.5 rounded-full shadow-xl border-2 border-[#0a202c] hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
                title="Update Profile Photo"
              >
                <Camera className="w-4 h-4 font-bold" />
              </button>
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{cleanDoctorName}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0d3443] px-2.5 py-0.5 text-xs font-bold text-[#2dd4bf] border border-[#164e63]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-sm font-semibold text-[#2dd4bf]">Doctor Profile</span>
                <span className="text-[#3b6072]">•</span>
                <span className="text-sm font-semibold text-slate-300">{clinic.name}</span>
                <span className="text-[#3b6072]">•</span>
                <span className="text-xs font-mono text-[#62879a] bg-[#06151f] px-2 py-0.5 rounded-md border border-[#163c4e]">/{clinic.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Stat 1 */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-2xl p-5 shadow-xl hover:border-[#2dd4bf]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62879a] uppercase tracking-wider">Today&apos;s Active</span>
            <div className="rounded-xl bg-[#0b3342] p-2 text-[#2dd4bf] border border-[#164e63]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white">{stats.todayAppointmentsCount}</p>
          <span className="inline-block mt-2 bg-[#0d3443] text-[#2dd4bf] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Scheduled Today
          </span>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-2xl p-5 shadow-xl hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62879a] uppercase tracking-wider">Pending</span>
            <div className="rounded-xl bg-[#3d3215] p-2 text-[#facc15] border border-[#6b581e]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white">{stats.pendingCount}</p>
          <span className="inline-block mt-2 bg-[#3d3215] text-[#facc15] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Awaiting Approval
          </span>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-2xl p-5 shadow-xl hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62879a] uppercase tracking-wider">Completed</span>
            <div className="rounded-xl bg-[#063b36] p-2 text-[#2dd4bf] border border-[#0d5952]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white">{stats.completedCount}</p>
          <span className="inline-block mt-2 bg-[#063b36] text-[#2dd4bf] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Consulted Today
          </span>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-2xl p-5 shadow-xl relative overflow-hidden hover:border-[#facc15]/40 transition-all">
          {isStarter && (
            <div className="absolute inset-0 bg-[#071720]/80 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 text-center">
              <Lock className="h-4 w-4 text-[#2dd4bf] mb-1" />
              <span className="text-[10px] font-bold text-[#facc15] bg-[#3d3215] border border-[#6b581e] px-2.5 py-0.5 rounded-full">Pro Feature</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62879a] uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="rounded-xl bg-[#3d3215] p-2 text-[#facc15] border border-[#6b581e]">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#facc15]">₹{stats.totalRevenue}</p>
          <span className="inline-block mt-2 bg-[#0d3443] text-[#2dd4bf] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Estimated Earnings
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Table Card */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 sm:p-8 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Recent Appointments</h2>
              <p className="text-xs text-[#62879a] mt-0.5">Live appointments booked via your public clinic page</p>
            </div>
            <Link 
              href="/dashboard/appointments" 
              className="text-xs font-bold text-[#2dd4bf] hover:text-[#2dd4bf]/80 bg-[#0d2a38] hover:bg-[#12394c] px-3.5 py-1.5 rounded-xl border border-[#1c485d] transition-colors flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#133748] text-[11px] uppercase text-[#62879a] font-bold tracking-wider">
                  <th className="pb-3 font-bold">Patient Info</th>
                  <th className="pb-3 font-bold">Service</th>
                  <th className="pb-3 font-bold">Time Slot</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#133748]/60">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#62879a]">
                      <div className="w-12 h-12 rounded-full bg-[#06151f] flex items-center justify-center mx-auto mb-3 border border-[#163c4e]">
                        <Calendar className="w-6 h-6 text-[#62879a]" />
                      </div>
                      No appointments booked yet today.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((item) => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4">
                        <p className="font-bold text-white group-hover:text-[#2dd4bf] transition-colors">{item.patientName}</p>
                        <p className="text-xs text-[#62879a] font-mono mt-0.5">{item.patientPhone}</p>
                      </td>
                      <td className="py-4 text-slate-300 font-medium">{item.serviceName}</td>
                      <td className="py-4 font-bold text-[#2dd4bf]">
                        <span className="bg-[#06151f] px-2.5 py-1 rounded-lg border border-[#163c4e] text-xs">
                          {item.timeSlot}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                          item.status === "COMPLETED"
                            ? "bg-[#063b36] text-[#2dd4bf] border-[#0d5952]"
                            : item.status === "CANCELLED"
                            ? "bg-[#3b1219] text-[#f43f5e] border-[#591b26]"
                            : "bg-[#3d3215] text-[#facc15] border-[#6b581e]"
                        }`}>
                          {item.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {item.status === "COMPLETED" ? (
                          <span className="text-xs text-[#2dd4bf] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(item._id, "COMPLETED")}
                            className="rounded-xl bg-[#00c9a7] hover:bg-[#00b596] px-3 py-1.5 text-xs font-bold text-[#051a24] shadow-md shadow-[#00c9a7]/20 active:scale-95 transition-all cursor-pointer"
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
          <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-extrabold text-white mb-4 tracking-tight">Quick Shortcuts</h2>
            <div className="space-y-3">
              <Link 
                href="/dashboard/availability" 
                className="flex w-full items-center justify-between rounded-2xl border border-[#163c4e] bg-[#06151f] p-4 text-sm font-bold text-slate-200 hover:bg-[#0b3342] hover:border-[#164e63] hover:text-[#2dd4bf] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0b3342] flex items-center justify-center text-[#2dd4bf] group-hover:scale-110 transition-transform">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  Manage OPD Hours
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#62879a] group-hover:text-[#2dd4bf]" />
              </Link>
              
              <Link 
                href="/dashboard/services" 
                className="flex w-full items-center justify-between rounded-2xl border border-[#163c4e] bg-[#06151f] p-4 text-sm font-bold text-slate-200 hover:bg-[#0b3342] hover:border-[#164e63] hover:text-[#2dd4bf] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0b3342] flex items-center justify-center text-[#2dd4bf] group-hover:scale-110 transition-transform">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  Manage Services
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#62879a] group-hover:text-[#2dd4bf]" />
              </Link>

              <Link 
                href="/dashboard/settings" 
                className="flex w-full items-center justify-between rounded-2xl border border-[#163c4e] bg-[#06151f] p-4 text-sm font-bold text-slate-200 hover:bg-[#0b3342] hover:border-[#164e63] hover:text-[#2dd4bf] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0b3342] flex items-center justify-center text-[#2dd4bf] group-hover:scale-110 transition-transform">
                    <Settings className="h-4 w-4" />
                  </div>
                  Clinic Settings
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#62879a] group-hover:text-[#2dd4bf]" />
              </Link>

              {/* Gated Features */}
              {!isStarter ? (
                <>
                  <div className="flex w-full items-center justify-between rounded-2xl border border-[#0d5952] bg-[#063b36]/30 p-4 text-sm font-bold text-[#2dd4bf]">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-[#2dd4bf]" /> WhatsApp Alerts
                    </div>
                    <span className="text-[10px] uppercase font-extrabold bg-[#063b36] text-[#2dd4bf] px-2 py-0.5 rounded-full border border-[#0d5952]">Active</span>
                  </div>
                  <div className="flex w-full items-center justify-between rounded-2xl border border-[#164e63] bg-[#0b3342]/30 p-4 text-sm font-bold text-[#2dd4bf]">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-[#2dd4bf]" /> Custom Domain
                    </div>
                    <span className="text-[10px] uppercase font-extrabold bg-[#0b3342] text-[#2dd4bf] px-2 py-0.5 rounded-full border border-[#164e63]">Active</span>
                  </div>
                </>
              ) : (
                <Link href="/dashboard/billing" className="flex w-full items-center justify-between rounded-2xl border border-[#163c4e] bg-[#06151f] p-4 text-sm font-bold text-[#62879a] hover:bg-[#081e2b] hover:text-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Alerts
                  </div>
                  <Lock className="h-4 w-4 text-[#62879a]" />
                </Link>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="rounded-3xl bg-[#0a202c] border border-[#133748] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-5 h-5 text-[#2dd4bf]" />
              <h3 className="font-extrabold text-base text-white">Need Setup Help?</h3>
            </div>
            <p className="text-xs text-[#62879a] leading-relaxed">
              Our clinical solutions team is available 24/7 to help you configure domains, schedule slots, and customize your site.
            </p>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Hi DocPulse Support, I need assistance with my clinic dashboard.`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-[#0d2a38] hover:bg-[#12394c] border border-[#1c485d] py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98]"
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

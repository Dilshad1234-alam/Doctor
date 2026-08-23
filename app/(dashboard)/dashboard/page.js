"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, CheckCircle2, CreditCard, RefreshCw, 
  ExternalLink, Copy, Check, Clock3, PlusCircle, 
  Settings, Loader2, Lock, MessageCircle, Link as LinkIcon, Users, Sparkles, Camera, Image as ImageIcon
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

  return (
    <div className="p-6 md:p-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {doctor.name}</h1>
            <Link href="/dashboard/billing" className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
              <Sparkles className="w-3 h-3" /> {planId} PLAN
            </Link>
          </div>
          <p className="mt-1 text-sm text-slate-500">{clinic.name} Dashboard Overview</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={copyClinicLink}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <Link
            href={`/${clinic.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> View Live Website
          </Link>
        </div>
      </div>

      {/* Media Banner Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm relative">
        <div className="h-40 md:h-48 w-full relative bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center" style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {mediaSaving && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
          <button onClick={() => handleUpload('cover')} disabled={mediaSaving} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-white/30 shadow-sm z-10">
            <Camera className="w-4 h-4" /> Change Cover
          </button>
        </div>
        <div className="px-6 md:px-10 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-12 sm:-mt-16 mb-4 relative z-20">
            <div className="relative inline-block group shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden relative">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
              </div>
              <button onClick={() => handleUpload('avatar')} disabled={mediaSaving} className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-700 transition-colors z-20">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Dr. {doctor.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm font-bold text-slate-500">{"General Physician"}</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm font-bold text-blue-600">{clinic.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Today&apos;s Active</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900">{stats.todayAppointmentsCount}</p>
          <p className="mt-1 text-xs text-slate-500">Appointments scheduled today</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900">{stats.pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500">Patients waiting to be seen</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Completed</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900">{stats.completedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Successfully consulted today</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          {isStarter && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
              <Lock className="h-5 w-5 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md shadow-sm">Pro Feature</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Today&apos;s Revenue</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900">₹{stats.totalRevenue}</p>
          <p className="mt-1 text-xs text-slate-500">Total earnings today</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="pb-3 font-semibold">Patient Info</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Time Slot</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No appointments booked yet.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-900">{item.patientName}</p>
                        <p className="text-xs text-slate-500">{item.patientPhone}</p>
                      </td>
                      <td className="py-3.5 text-slate-600">{item.serviceName}</td>
                      <td className="py-3.5 font-medium text-slate-900">{item.timeSlot}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "CANCELLED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {item.status === "COMPLETED" ? (
                          <span className="text-xs text-slate-400 italic">Done</span>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(item._id, "COMPLETED")}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
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

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Shortcuts</h2>
            <div className="space-y-3">
              <Link href="/dashboard/availability" className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-blue-600" /> Manage OPD Hours
                </div>
              </Link>
              <Link href="/dashboard/services" className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-5 w-5 text-blue-600" /> Manage Services
                </div>
              </Link>
              <Link href="/dashboard/settings" className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-slate-500" /> Clinic Settings
                </div>
              </Link>

              {/* Gated Features */}
              {!isStarter ? (
                <>
                  <div className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-800">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-emerald-600" /> WhatsApp Reminders
                    </div>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                  </div>
                  <div className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-sm font-semibold text-indigo-800">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-indigo-600" /> Custom Domain
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/dashboard/billing" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-semibold text-slate-400 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" /> WhatsApp Reminders
                  </div>
                  <Lock className="h-4 w-4" />
                </Link>
              )}
              
              {isEnterprise ? (
                <div className="flex w-full items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-3.5 text-sm font-semibold text-purple-800">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" /> Team & Multi-Doctor
                  </div>
                </div>
              ) : (
                <Link href="/dashboard/billing" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-semibold text-slate-400 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" /> Team & Multi-Doctor
                  </div>
                  <Lock className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-base">Need Help?</h3>
            <p className="mt-1 text-xs text-slate-300">
              Our support team is available 24/7 to assist you with any setup or operational queries.
            </p>
            <button className="mt-4 w-full rounded-xl bg-white py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors">
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

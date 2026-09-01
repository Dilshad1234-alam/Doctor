"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, CheckCircle2, CreditCard, RefreshCw, 
  ExternalLink, Copy, Check, PlusCircle, 
  Settings, Loader2, Sparkles, Users,
  ArrowRight, HeartPulse, Stethoscope, Activity, ArrowUpRight,
  ShieldCheck, MessageSquare, AlertCircle
} from "lucide-react";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [session, setSession] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentPlan, setCurrentPlan] = useState("BASIC");
  const [isShifting, setIsShifting] = useState(false);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  useEffect(() => {
    const fetchAuthAndProfile = async () => {
      try {
        const [meRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/clinic/settings")
        ]);
        const [meData, settingsData] = await Promise.all([
          meRes.json(),
          settingsRes.json()
        ]);
        if (meData?.success && meData?.user) {
          setSession({ user: meData.user });
        }
        if (settingsData?.success && settingsData?.doctorProfile) {
          setDoctorProfile(settingsData.doctorProfile);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAuthAndProfile();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        }) + " • " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    
    if (typeof window !== "undefined") {
      const localPlan = localStorage.getItem("user_plan");
      if (localPlan) setCurrentPlan(localPlan.toUpperCase());
    }
    
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
        if (json.subscription?.planId) {
          const plan = json.subscription.planId.toUpperCase();
          setCurrentPlan(plan);
          if (typeof window !== "undefined") {
            localStorage.setItem("user_plan", plan);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "PATCH",
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

  if (loading && !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A1AC]" />
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

  const doctorName = session?.user?.name || doctorProfile?.fullName || (doctor?.name && doctor?.name !== "Doctor" ? doctor.name : null) || 'Alam';
  const displayGreeting = doctorName.toLowerCase().startsWith('dr.') ? doctorName : `Dr. ${doctorName}`;
  const greetingTime = getTimeGreeting();

  // Extract today's appointments
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayList = (recentAppointments || []).filter(a => {
    const d = a.date ? new Date(a.date).toISOString().split('T')[0] : todayDateStr;
    return d === todayDateStr;
  });

  // Compute non-overlapping counts
  const totalBookedToday = todayList.length;
  const consultedToday = todayList.filter(a => a.status === 'COMPLETED' || a.queueStatus === 'COMPLETED').length;
  const waitingInClinic = todayList.filter(a => a.status === 'IN_CONSULTATION' || a.queueStatus === 'WAITING' || a.status === 'CONFIRMED').length;
  const unattendedPatients = todayList.filter(a => a.status !== 'COMPLETED' && a.queueStatus !== 'COMPLETED' && a.status !== 'CANCELLED');
  const unattendedCount = unattendedPatients.length;

  const themeHex = doctor?.websiteConfig?.themeColor || '#0A8692';
  const activeTemplate = doctor?.websiteConfig?.templateId || 'minimal-solo';
  const activeServicesCount = (doctor?.services || []).filter(s => s.isActive !== false).length;
  const isOpdOpen = doctor?.opdConfig?.isOpen !== false;
  const totalRevenueToday = (todayList || [])
    .filter(a => (a.status === 'COMPLETED' || a.queueStatus === 'COMPLETED') && a.paymentStatus === 'PAID')
    .reduce((sum, a) => sum + (Number(a.fee || a.price || 0)), 0);

  const handleShiftRemainingToTomorrow = async () => {
    if (unattendedCount === 0) return;
    if (!confirm(`Bache huye ${unattendedCount} patients ko kal ke liye shift karke WhatsApp message bhej dein?`)) return;

    setIsShifting(true);
    try {
      const patientIds = unattendedPatients.map(p => p._id);
      const res = await fetch("/api/dashboard/appointments/shift-tomorrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientIds }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`Successfully shifted ${result.count} patients to ${result.shiftedTo} and sent WhatsApp notifications!`);
        fetchDashboardData();
      } else {
        alert("Failed to shift patients.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    } finally {
      setIsShifting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans bg-slate-50 text-[#0f172a]">
      
      {/* 1. Full-Width Medical Hero Header with Dynamic Doctor Greeting */}
      <div className="w-full bg-gradient-to-r from-[#00A1AC] via-[#008f99] to-[#0c2e3d] text-white rounded-3xl p-7 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] rounded-full bg-white/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/30 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Doctor Suite • {currentTime} • {currentPlan === 'PREMIUM' || currentPlan === 'ENTERPRISE' ? 'VIP' : currentPlan}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Good {greetingTime}, {displayGreeting}
            </h1>
            <p className="text-sm sm:text-base text-slate-100 font-medium max-w-2xl leading-relaxed">
              {clinic.name} Command Center • Real-time patient queue, OPD split-shift controls, rates catalog, and WhatsApp telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Telemetry</span>
            </button>
            <button
              onClick={copyClinicLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Link!" : "Share Link"}</span>
            </button>
            <Link
              href={`/${clinic.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#00A1AC] px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-xl hover:scale-105"
            >
              View Live Clinic <ArrowRight className="w-4 h-4 text-[#00A1AC]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Clinic Command & Customizer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">

        {/* Card 1: Live Website & Studio Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: themeHex }}>
              🎨
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live & Synced
            </span>
          </div>
          <div className="my-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Website Studio</span>
            <h4 className="text-lg font-black text-slate-800 capitalize mt-0.5 truncate">{activeTemplate.replace('-', ' ')} Template</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: themeHex }}></span>
              <span className="text-xs font-semibold text-slate-500">Theme Active</span>
            </div>
          </div>
          <Link className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold text-center border border-slate-200 transition-colors flex items-center justify-center gap-1.5" href="/dashboard/website-builder">
            <span>Customize Design</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 2: OPD Availability & Shift Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">⏰</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${isOpdOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {isOpdOpen ? 'OPD Open' : 'Emergency Off'}
            </span>
          </div>
          <div className="my-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">OPD Schedule</span>
            <h4 className="text-lg font-black text-slate-800 mt-0.5">Morning & Evening</h4>
            <p className="text-xs text-slate-500 mt-0.5">Split shift timings active</p>
          </div>
          <Link className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold text-center border border-slate-200 transition-colors flex items-center justify-center gap-1.5" href="/dashboard/opd-availability">
            <span>Configure Shifts</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 3: Clinical Services & Rates */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">🩺</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {activeServicesCount} Active
            </span>
          </div>
          <div className="my-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rate Catalog</span>
            <h4 className="text-lg font-black text-slate-800 mt-0.5">{activeServicesCount} Treatments</h4>
            <p className="text-xs text-slate-500 mt-0.5">Instant booking prices live</p>
          </div>
          <Link className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold text-center border border-slate-200 transition-colors flex items-center justify-center gap-1.5" href="/dashboard/services">
            <span>Manage Rates</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 4: Daily Settled Collection & Live Queue Shortcut */}
        <div className="bg-[#0A8692] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-xs">💳</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white">
              Direct Settled
            </span>
          </div>
          <div className="my-3">
            <span className="text-[11px] font-bold text-teal-100 uppercase tracking-wider block">Today Collection</span>
            <h4 className="text-2xl font-black text-white mt-0.5">₹{totalRevenueToday}</h4>
            <p className="text-[11px] text-teal-100/90 mt-0.5">Cash + UPI settlements</p>
          </div>
          <Link className="w-full py-2 px-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-black text-center shadow-xs transition-colors flex items-center justify-center gap-1.5" href="/dashboard/appointments">
            <span>Open Live Queue Manager</span>
            <span>→</span>
          </Link>
        </div>

      </div>

      {/* 3. 6 Core Essential Clinic Modules Quick Links Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#00A1AC]" />
              6 Core Essential Clinic Modules
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Quick access to all essential doctor workflow modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Appointments Queue & Token Manager */}
          <Link
            href="/dashboard/appointments"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#00A1AC] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center font-black group-hover:bg-[#00A1AC] group-hover:text-white transition-all">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2.5 py-1 rounded-full border border-teal-200">
                Module 1 & 5
              </span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-[#00A1AC] transition-colors">
                Appointments & Walk-in Tokens
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Live queue manager, 1-click consultation transitions, walk-in token generation, and payment status tracking.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00A1AC] pt-2 border-t border-slate-100">
              <span>Open Queue Manager</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: OPD Availability & Day-OFF */}
          <Link
            href="/dashboard/opd-availability"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#00A1AC] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center font-black group-hover:bg-[#00A1AC] group-hover:text-white transition-all">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2.5 py-1 rounded-full border border-teal-200">
                Module 2
              </span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-[#00A1AC] transition-colors">
                OPD Availability & Shifts
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Morning & Evening split shifts, slot duration interval settings (15/20/30m), and emergency Day-OFF master switch.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00A1AC] pt-2 border-t border-slate-100">
              <span>Configure Shifts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Services & Rate Catalog */}
          <Link
            href="/dashboard/services"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#00A1AC] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center font-black group-hover:bg-[#00A1AC] group-hover:text-white transition-all">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2.5 py-1 rounded-full border border-teal-200">
                Module 3
              </span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-[#00A1AC] transition-colors">
                Services & Rate Catalog
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Consultation charges, treatment duration, and instant 1-click active/inactive visibility toggle for public site.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00A1AC] pt-2 border-t border-slate-100">
              <span>Manage Services</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4: Patient History & Clinical Records */}
          <Link
            href="/dashboard/patients"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#00A1AC] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center font-black group-hover:bg-[#00A1AC] group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2.5 py-1 rounded-full border border-teal-200">
                Module 4
              </span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-[#00A1AC] transition-colors">
                Patient History & Records
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Aggregated patient directory, visit timeline history, real-time search, and 1-line quick clinical prescription notes.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00A1AC] pt-2 border-t border-slate-100">
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 5: Clinic Profile & WhatsApp Alerts */}
          <Link
            href="/dashboard/clinic-settings"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#00A1AC] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center font-black group-hover:bg-[#00A1AC] group-hover:text-white transition-all">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2.5 py-1 rounded-full border border-teal-200">
                Module 6
              </span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-[#00A1AC] transition-colors">
                Clinic Profile & WhatsApp Alerts
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Clinic metadata, Google Maps location embed, and automated WhatsApp token confirmation webhook alerts.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00A1AC] pt-2 border-t border-slate-100">
              <span>Open Settings</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* SaaS Telemetry & Subscription */}
          <Link
            href="/dashboard/billing"
            className="p-6 rounded-3xl bg-[#0c2e3d] border border-[#15465c] text-white hover:border-[#00A1AC] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A1AC]/30 text-teal-200 px-2.5 py-1 rounded-full border border-[#00A1AC]/40">
                SaaS Subscription
              </span>
            </div>
            <div>
              <h3 className="font-black text-white text-base group-hover:text-teal-200 transition-colors">
                {currentPlan === 'PREMIUM' || currentPlan === 'ENTERPRISE' ? 'Premium VIP (₹1,499)' : currentPlan === 'ADVANCED' || currentPlan === 'PRO' ? 'Advanced Clinic (₹999)' : 'Basic OPD (₹499)'}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                Active plan status, quota limits, invoice history, and VIP support desk priority upgrades.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00A1AC] pt-2 border-t border-[#15465c]">
              <span>Manage Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-white" />
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}

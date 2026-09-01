"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HeartPulse, ExternalLink, Menu, Crown, X, MessageSquare, Headphones
} from "lucide-react";
import Sidebar from "../../../components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [planId, setPlanId] = useState("BASIC");
  const [planName, setPlanName] = useState("Basic Tier");
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [showVipModal, setShowVipModal] = useState(false);
  const [userState, setUserState] = useState({
    name: "Doctor",
    email: "",
    clinicSlug: "",
    isOnboardingCompleted: pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding") ? false : null,
  });

  useEffect(() => {
    // Instant sync from localStorage for zero-latency updates
    if (typeof window !== "undefined") {
      const localPlan = localStorage.getItem("user_plan");
      if (localPlan) {
        setPlanId(localPlan);
        setIsPremium(localPlan === "PREMIUM" || localPlan === "ENTERPRISE");
        setIsAdvanced(localPlan === "ADVANCED" || localPlan === "PRO" || localPlan === "PREMIUM" || localPlan === "ENTERPRISE");
      }
    }

    const fetchUserAndSub = async () => {
      try {
        const [meRes, subRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/subscription/upgrade", { cache: "no-store" })
        ]);
        const [meJson, subJson] = await Promise.all([
          meRes.json(),
          subRes.json()
        ]);
        
        if (meJson.success && meJson.user) {
          const isDone = Boolean(meJson.user.isOnboardingCompleted || meJson.user.hasCompletedOnboarding);
          setUserState({
            name: meJson.user.name ? `Dr. ${meJson.user.name.replace(/^Dr\.?\s*/i, "")}` : "Doctor",
            email: meJson.user.email || "",
            clinicSlug: meJson.user.slug || "",
            isOnboardingCompleted: isDone,
          });
        }

        if (subJson.success) {
          if (subJson.isPremium) setIsPremium(true);
          if (subJson.isAdvanced) setIsAdvanced(true);
          if (subJson.planId || subJson.subscription?.planId) {
            const currentPlan = subJson.planId || subJson.subscription?.planId || "BASIC";
            setPlanId(currentPlan);
            setPlanName(subJson.subscription?.planName || currentPlan + " Tier");
            
            // Calculate 14-day trial for Basic/Starter plans
            if (currentPlan === "BASIC" || currentPlan === "STARTER") {
              const startDate = subJson.subscription?.startDate || subJson.subscription?.createdAt || new Date();
              const trialEnd = new Date(startDate);
              trialEnd.setDate(trialEnd.getDate() + 14);
              const daysLeft = Math.max(0, Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24)));
              setTrialDaysLeft(daysLeft);
            } else {
              setTrialDaysLeft(null);
            }

            if (typeof window !== "undefined") {
              localStorage.setItem("user_plan", currentPlan);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserAndSub();
  }, [pathname]);

  // Seamless Layout Guard: Do not mount dashboard sidebar/topbar during onboarding
  if (
    pathname === "/dashboard/onboarding" ||
    pathname.startsWith("/dashboard/onboarding") ||
    userState.isOnboardingCompleted === false
  ) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#0f172a] selection:bg-[#00A1AC] selection:text-white flex">
      {/* Sidebar Component */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        doctorInfo={userState}
        isPremium={isPremium}
        isAdvanced={isAdvanced}
        planId={planId}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <HeartPulse className="w-5 h-5 text-[#00A1AC]" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Doctor Suite Portal
              </h2>
              <span className="hidden sm:inline-block text-[11px] font-bold text-[#00A1AC] bg-[#00A1AC]/10 px-2.5 py-0.5 rounded-full border border-[#00A1AC]/20">
                Doctor: {userState.name}
              </span>
              
              {/* Active Plan Indicator */}
              <span className={`hidden sm:inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isPremium 
                  ? "bg-amber-100 text-amber-800 border-amber-300" 
                  : isAdvanced 
                    ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
              }`}>
                {planName}
              </span>

              {/* Free Trial Countdown Indicator */}
              {trialDaysLeft !== null && (
                <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  trialDaysLeft <= 3 
                    ? "bg-rose-100 text-rose-700 border-rose-300 animate-pulse" 
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}>
                  <span>⏳</span>
                  {trialDaysLeft > 0 ? `${trialDaysLeft} Days Free Trial Left` : "Trial Expired"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* VIP Priority Support Badge (Premium Doctors) */}
            {isPremium ? (
              <button
                onClick={() => setShowVipModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-teal-50 border border-amber-400 text-xs font-black text-amber-900 hover:shadow-md transition-all cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>VIP Priority Support</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-[#00A1AC] animate-pulse"></span>
                <span>All Systems Operational</span>
              </div>
            )}

            {userState.clinicSlug && (
              <Link
                href={`/${userState.clinicSlug}`}
                target="_blank"
                className="bg-[#00A1AC] hover:bg-[#008790] text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-md shadow-[#00A1AC]/25 flex items-center gap-1.5"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </header>

        {/* VIP Support Modal */}
        {showVipModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 font-black text-base">
                  <Crown className="w-5 h-5" /> VIP Priority Support Desk
                </div>
                <button 
                  onClick={() => setShowVipModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <p className="text-xs font-bold text-amber-900">
                  Direct Line for Premium Doctors
                </p>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  As an upgraded subscriber, your technical queries bypass regular queues and route directly to our senior engineering team with &lt;15 minute SLA.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://wa.me/919999999999?text=Hi%20DocPulse%20Team%2C%20I%20am%20a%20VIP%20Doctor%20and%20need%20priority%20assistance."
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant WhatsApp VIP Desk</span>
                </a>
                <a
                  href="mailto:priority-doctor@docpulse.in?subject=VIP%20Doctor%20Priority%20Support"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Priority Email Ticket</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}

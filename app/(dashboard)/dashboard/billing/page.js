"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (json.success && json.subscription) {
          setSub(json.subscription);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-teal-300">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No active subscription found.</h2>
        <p className="text-sm text-slate-400 max-w-sm">Choose a plan tier to unlock appointments, custom themes, and WhatsApp alerts.</p>
        <Link 
          href="/pricing" 
          className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-[#081e2b] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          Choose a Plan
        </Link>
      </div>
    );
  }

  const isStarter = sub.planId === "STARTER";
  const isPro = sub.planId === "PRO" || sub.planId === "PROFESSIONAL";
  const isEnterprise = sub.planId === "ENTERPRISE";

  const getFeatures = () => {
    if (isStarter) return ["Basic Clinic Profile", "Online Appointment Booking", "Up to 50 Appointments/mo", "Standard Support"];
    if (isPro) return ["Advanced Clinic Profile", "Unlimited Appointments", "WhatsApp Reminders", "Custom Domain Support", "Priority Support"];
    if (isEnterprise) return ["Everything in Pro", "Multi-Doctor Support", "Advanced Analytics", "Dedicated Account Manager"];
    return ["Online Appointment Booking", "Clinic Web Profile", "Real-Time Slot Engine"];
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
          <CreditCard className="w-8 h-8 text-teal-300" />
          Billing & Subscription Plan
        </h1>
        <p className="mt-1 text-sm text-slate-300 font-medium">Review your current subscription tier, renew cycles, and feature allowances.</p>
      </div>

      {/* Active Subscription Luxury Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Plan
              </span>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {sub.billingCycle} Billing
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {sub.planId} <span className="text-2xl text-teal-300 font-medium">Edition</span>
            </h2>
            <p className="text-slate-300 mt-2 text-sm font-medium">
              Next billing date: <span className="text-white font-bold">{new Date(sub.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </p>
          </div>
          
          <div className="text-left md:text-right bg-white/5 border border-white/10 p-5 rounded-2xl">
            <div className="text-4xl font-black text-white mb-1">₹{sub.price}</div>
            <div className="text-xs text-slate-300 font-medium">billed every {sub.billingCycle === 'YEARLY' ? 'year' : 'month'}</div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-base font-bold text-teal-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-300" /> Features Included in Your Tier:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getFeatures().map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 p-3.5 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span className="text-slate-200 text-sm font-semibold">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/pricing" 
            className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-[#081e2b] font-bold px-8 py-3.5 rounded-xl text-center shadow-lg shadow-teal-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Upgrade / Change Plan <ArrowUpRight className="w-4 h-4" />
          </Link>
          <a 
            href="mailto:support@docpulse.com?subject=Billing%20Inquiry" 
            className="bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold px-8 py-3.5 rounded-xl text-center transition-all text-sm"
          >
            Contact Billing Support
          </a>
        </div>
      </div>
    </div>
  );
}

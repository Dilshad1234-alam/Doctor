"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-700">No active subscription found.</h2>
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">
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
    return [];
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-600" />
          Billing & Plan
        </h1>
        <p className="mt-2 text-slate-500">Manage your subscription plan, billing cycle, and payment methods.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">Active</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{sub.billingCycle} Billing</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900">{sub.planId} <span className="text-xl text-slate-500 font-medium tracking-tight">Plan</span></h2>
            <p className="text-slate-500 mt-2 font-medium">Renews on {new Date(sub.endDate).toLocaleDateString()}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-black text-slate-900 mb-1">₹{sub.price}</div>
            <div className="text-sm text-slate-500 font-medium">per {sub.billingCycle === 'YEARLY' ? 'year' : 'month'}</div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Features included in your plan:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getFeatures().map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-slate-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/pricing" className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl text-center hover:bg-blue-700 transition-colors shadow-md">
            Upgrade Plan
          </Link>
          <button className="bg-white text-slate-700 border-2 border-slate-200 font-bold px-8 py-3.5 rounded-xl text-center hover:bg-slate-50 transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

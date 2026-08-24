"use client";
import React, { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Shield,
  X,
  Building2,
  UserCheck,
  Check,
  Edit3,
  Save,
  Tag,
  Users
} from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ priceMonthly: 499, priceYearly: 399, description: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [extendDays, setExtendDays] = useState(30);

  const fetchSubscriptionsAndPlans = async () => {
    try {
      setLoading(true);
      const [subRes, planRes] = await Promise.all([
        fetch("/api/admin/subscriptions"),
        fetch("/api/plans")
      ]);
      const [subJson, planJson] = await Promise.all([subRes.json(), planRes.json()]);

      if (subJson.success) setData(subJson);
      if (planJson.success && planJson.plans) setPlans(planJson.plans);
    } catch (err) {
      console.error("Failed to load subscriptions/plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsAndPlans();
  }, []);

  const handleUpdateSubscription = async (subscriptionId, newPlan, newStatus, daysToAdd) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          planId: newPlan,
          status: newStatus,
          extendDays: daysToAdd ? Number(daysToAdd) : undefined
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Subscription successfully updated!" });
        setSelectedSub(null);
        fetchSubscriptionsAndPlans();
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly || Math.round(plan.priceMonthly * 0.8),
      description: plan.description || ""
    });
  };

  const handleSavePlanPricing = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: editingPlan.planId,
          priceMonthly: Number(planForm.priceMonthly),
          priceYearly: Number(planForm.priceYearly),
          description: planForm.description
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: `${editingPlan.name} plan pricing updated successfully!` });
        setEditingPlan(null);
        fetchSubscriptionsAndPlans();
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update pricing" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update plan pricing" });
    } finally {
      setActionLoading(false);
    }
  };

  // Real data metrics without hardcoded mock fallbacks
  const metrics = data?.metrics || {
    mrr: 0,
    arr: 0,
    totalSubscriptions: 0,
    activeCount: 0,
    trialCount: 0,
    expiredCount: 0,
    planStats: { starter: 0, pro: 0, premium: 0, enterprise: 0 }
  };

  const subscriptions = data?.subscriptions || [];

  const starterPlan = plans.find((p) => p.planId === "starter") || {
    planId: "starter",
    name: "Starter",
    priceMonthly: 499,
    priceYearly: 399,
    description: "For solo doctors establishing their initial digital presence.",
    features: ["Doctor Website", "Online Booking", "Basic Templates", "5 Services", "Community Support"]
  };

  const proPlan = plans.find((p) => p.planId === "pro") || {
    planId: "pro",
    name: "Pro",
    priceMonthly: 1299,
    priceYearly: 999,
    description: "Complete practice automation for busy medical clinics.",
    features: ["Everything in Starter", "Unlimited Services", "Custom Availability", "Premium Templates", "Priority Support", "Analytics Dashboard"]
  };

  const premiumPlan = plans.find((p) => p.planId === "premium") || {
    planId: "premium",
    name: "Premium",
    priceMonthly: 2999,
    priceYearly: 2499,
    description: "White-label solution with custom domains and multi-doctor rosters.",
    features: ["Everything in Pro", "Custom Domain", "White-label Solution", "Dedicated Account Manager", "Advanced CRM", "Multi-Doctor Support"]
  };

  const starterCount = metrics.planStats?.starter ?? 0;
  const proCount = metrics.planStats?.pro ?? 0;
  const premiumCount = metrics.planStats?.premium ?? (metrics.planStats?.enterprise ?? 0);

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans text-[#0f172a]">
      {/* 1. Hero Header Banner */}
      <div className="w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
            SaaS Monetization & Live Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Subscriptions & Platform Revenue
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl">
            Live database records of registered doctors, actual plan distribution, and monthly recurring revenue.
          </p>
        </div>

        <button
          onClick={fetchSubscriptionsAndPlans}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm self-start md:self-auto relative z-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Financials</span>
        </button>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs"
              : "bg-rose-50 text-rose-800 border-rose-200 font-bold text-xs"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Financial KPI Metric Cards (100% Real Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0f172a] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-[#1e293b] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full">
              Real MRR
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              ₹{metrics.mrr.toLocaleString("en-IN")}
            </h3>
          </div>
          <p className="text-xs text-slate-400 pt-3 border-t border-white/10">Active registered clinic recurring billing</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#164e63]" />
            </div>
            <span className="text-[11px] font-black text-[#164e63] bg-[#164e63]/10 px-2.5 py-1 rounded-full">
              Projected ARR
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annualized Run Rate</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">
              ₹{metrics.arr.toLocaleString("en-IN")}
            </h3>
          </div>
          <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">Annualized subscription forecast</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#059669]" />
            </div>
            <span className="text-[11px] font-black text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-full">
              Active Subs
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Paid Clinics</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">
              {metrics.activeCount} <span className="text-sm font-bold text-slate-400">/ {metrics.totalSubscriptions}</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">{metrics.trialCount} clinics on free trial</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-[#0f172a]" />
            </div>
            <span className="text-[11px] font-black text-[#0f172a] bg-slate-100 px-2.5 py-1 rounded-full">
              ARPU
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Revenue Per Clinic</p>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight mt-1">
              ₹{metrics.activeCount > 0 ? Math.round(metrics.mrr / metrics.activeCount).toLocaleString("en-IN") : "0"}
            </h3>
          </div>
          <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">Monthly average per clinic</p>
        </div>
      </div>

      {/* 3. 3 Dynamic Plan Cards with Real Database Subscriber Counts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">SaaS Plan Pricing & Real Subscriptions</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time counts of doctors who have subscribed to each price tier.</p>
          </div>
          <span className="text-xs font-black text-[#059669] bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
            Real-time DB Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan Card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#0f172a]">{starterPlan.name}</h3>
                <button
                  onClick={() => handleOpenEditPlan(starterPlan)}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Pricing
                </button>
              </div>

              <div>
                <span className="text-5xl font-black text-[#0f172a]">₹{starterPlan.priceMonthly}</span>
                <span className="text-slate-500 font-bold">/mo</span>
                <span className="block text-xs font-bold text-[#059669] mt-1">₹{starterPlan.priceYearly}/mo on yearly</span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {starterPlan.description}
              </p>

              <ul className="space-y-4 pt-4 border-t border-slate-100">
                {starterPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Real Subscribers</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                starterCount > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}>
                {starterCount} {starterCount === 1 ? "Clinic" : "Clinics"}
              </span>
            </div>
          </div>

          {/* Pro Plan Card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border-[4px] border-[#0f172a] shadow-2xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white font-bold px-6 py-1.5 rounded-full text-xs shadow-lg">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#0f172a]">{proPlan.name}</h3>
                <button
                  onClick={() => handleOpenEditPlan(proPlan)}
                  className="inline-flex items-center gap-1 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Pricing
                </button>
              </div>

              <div>
                <span className="text-5xl font-black text-[#0f172a]">₹{proPlan.priceMonthly}</span>
                <span className="text-slate-500 font-bold">/mo</span>
                <span className="block text-xs font-bold text-[#059669] mt-1">₹{proPlan.priceYearly}/mo on yearly</span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {proPlan.description}
              </p>

              <ul className="space-y-4 pt-4 border-t border-slate-100">
                {proPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Real Subscribers</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                proCount > 0 ? "bg-cyan-100 text-cyan-900" : "bg-slate-100 text-slate-600"
              }`}>
                {proCount} {proCount === 1 ? "Clinic" : "Clinics"}
              </span>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 relative group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#0f172a]">{premiumPlan.name}</h3>
                <button
                  onClick={() => handleOpenEditPlan(premiumPlan)}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Pricing
                </button>
              </div>

              <div>
                <span className="text-5xl font-black text-[#0f172a]">₹{premiumPlan.priceMonthly}</span>
                <span className="text-slate-500 font-bold">/mo</span>
                <span className="block text-xs font-bold text-[#059669] mt-1">₹{premiumPlan.priceYearly}/mo on yearly</span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {premiumPlan.description}
              </p>

              <ul className="space-y-4 pt-4 border-t border-slate-100">
                {premiumPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Real Subscribers</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                premiumCount > 0 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"
              }`}>
                {premiumCount} {premiumCount === 1 ? "Clinic" : "Clinics"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Subscriptions Directory Table with Doctor Details */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-[#0f172a]">Active Clinic Subscriptions Directory</h3>
            <p className="text-xs text-slate-500 font-medium">Exact database breakdown of which doctor has enrolled in which plan.</p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto">
            Total Records: {subscriptions.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8fafc] text-slate-600 font-black uppercase tracking-wider text-[11px]">
                <th className="py-5 px-6">Doctor & Clinic</th>
                <th className="py-5 px-6">Subscribed Plan</th>
                <th className="py-5 px-6">Billing Cycle</th>
                <th className="py-5 px-6">Enrolled Price</th>
                <th className="py-5 px-6">Validity Period</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#164e63] mb-2" />
                    <span className="font-bold text-slate-700">Loading subscriptions from database...</span>
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="font-black text-[#0f172a] text-sm">No doctors have subscribed yet</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Doctor & Clinic */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-black text-sm text-[#0f172a] group-hover:text-[#164e63] transition-colors">
                          {sub.doctorName}
                        </span>
                        <p className="text-xs text-slate-500 font-medium">{sub.clinicName}</p>
                        <p className="text-[11px] text-slate-400">{sub.doctorEmail}</p>
                      </div>
                    </td>

                    {/* Plan Tier */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                          sub.planId === "ENTERPRISE" || sub.planId === "PREMIUM"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : sub.planId === "PROFESSIONAL" || sub.planId === "PRO"
                            ? "bg-cyan-100 text-cyan-900 border-cyan-300"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {sub.planId}
                      </span>
                    </td>

                    {/* Cycle */}
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {sub.billingCycle}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-black text-[#0f172a] text-sm">
                      ₹{sub.price}
                    </td>

                    {/* Validity */}
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      <div className="space-y-0.5 text-[11px]">
                        <span>Expires: {new Date(sub.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          sub.status === "ACTIVE"
                            ? "bg-emerald-50 text-[#059669] border-emerald-200"
                            : sub.status === "TRIAL"
                            ? "bg-cyan-50 text-[#164e63] border-cyan-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="rounded-full px-4 py-1.5 bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 font-bold transition-all text-xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Plan Pricing */}
      {editingPlan && (
        <div className="fixed inset-0 bg-[#0a2635]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#0f172a]">Edit {editingPlan.name} Pricing</h3>
                  <p className="text-xs text-slate-500 font-medium">Updates live pricing on Landing Page & Doctor Billing</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanPricing} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">Monthly Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={planForm.priceMonthly}
                    onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-black text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">Yearly Effective Monthly Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={planForm.priceYearly}
                    onChange={(e) => setPlanForm({ ...planForm, priceYearly: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-black text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">Plan Description</label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-medium focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Pricing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Subscription Management */}
      {selectedSub && (
        <div className="fixed inset-0 bg-[#0a2635]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-[#0f172a]">Manage Plan: {selectedSub.clinicName}</h3>
                <p className="text-xs text-slate-500 font-bold">{selectedSub.doctorName} • Current: {selectedSub.planId}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-2">Change Plan Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((p) => (
                    <button
                      key={p}
                      onClick={() => handleUpdateSubscription(selectedSub._id, p, selectedSub.status, 0)}
                      disabled={actionLoading}
                      className={`p-3 rounded-2xl border font-black transition-all ${
                        selectedSub.planId === p
                          ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-2">Extend Validity Days</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={extendDays}
                    onChange={(e) => setExtendDays(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  />
                  <button
                    onClick={() => handleUpdateSubscription(selectedSub._id, selectedSub.planId, "ACTIVE", extendDays)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold transition-all shadow-md"
                  >
                    + Add Days
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleUpdateSubscription(selectedSub._id, selectedSub.planId, "EXPIRED", 0)}
                  disabled={actionLoading}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Mark as Expired
                </button>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

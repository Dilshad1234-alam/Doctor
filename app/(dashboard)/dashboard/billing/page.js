"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, Zap, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState("MONTHLY");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, plansRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/plans")
        ]);
        const [statsJson, plansJson] = await Promise.all([
          statsRes.json(),
          plansRes.json()
        ]);

        if (statsJson.success && statsJson.subscription) {
          setSub(statsJson.subscription);
        }
        if (plansJson.success && plansJson.plans) {
          const uniqueMap = new Map();
          plansJson.plans.forEach((p) => {
            const key = (p.planId || p.name || "").toLowerCase();
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, p);
            }
          });
          setPlans(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.error("Billing Page Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#0a2635]" />
      </div>
    );
  }

  const currentPlanId = sub?.planId?.toUpperCase() || "STARTER";

  const defaultFeatures = {
    starter: ["Doctor Clinic Website", "Online Appointment Booking", "Basic Templates", "5 Medical Services", "Standard Support"],
    pro: ["Everything in Starter", "Unlimited Services", "Custom Availability", "Premium Templates", "Priority Support", "Analytics Dashboard"],
    premium: ["Everything in Pro", "Custom Domain", "White-label Solution", "Dedicated Account Manager", "Advanced CRM", "Multi-Doctor Support"]
  };

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-6xl mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
          <CreditCard className="w-7 h-7 text-[#00A1AC]" />
          Subscription & Billing Plan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Review your active clinic plan, view real-time SaaS rates, or upgrade your practice features.
        </p>
      </div>

      {/* Active Subscription Luxury Card (Medical Teal Banner) */}
      {sub ? (
        <div className="bg-gradient-to-r from-[#0c2e3d] via-[#103e52] to-[#00A1AC] text-white rounded-3xl p-7 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-white/20 text-teal-100 border border-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-200" /> Active Plan
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                  {sub.billingCycle || "MONTHLY"} Billing
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {sub.planId} <span className="text-2xl text-teal-100 font-medium">Edition</span>
              </h2>
              {sub.endDate && (
                <p className="text-slate-200 mt-2 text-xs sm:text-sm font-medium">
                  Next renewal: <span className="text-white font-bold">{new Date(sub.endDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                </p>
              )}
            </div>

            <div className="text-left md:text-right bg-white/15 border border-white/20 p-5 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">₹{sub.price}</div>
              <div className="text-xs text-teal-100 font-medium">
                billed every {sub.billingCycle === "YEARLY" ? "year" : "month"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-[#0f172a]">No active subscription found</h3>
          <p className="text-xs text-slate-500">Select an edition below to activate your clinic website and online booking slots.</p>
        </div>
      )}

      {/* Dynamic Plan Upgrade Options */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00A1AC]" />
              Available Plan Tiers
            </h2>
            <p className="text-xs text-slate-500 font-medium">Synchronized in real-time with platform rates</p>
          </div>

          {/* Monthly / Yearly cycle toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setSelectedCycle("MONTHLY")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCycle === "MONTHLY" ? "bg-[#00A1AC] text-white shadow-md shadow-[#00A1AC]/25" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedCycle("YEARLY")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCycle === "YEARLY" ? "bg-[#00A1AC] text-white shadow-md shadow-[#00A1AC]/25" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yearly <span className="text-[10px] text-teal-200 font-black ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(plans.length > 0
            ? plans
            : [
                { planId: "starter", name: "Starter", priceMonthly: 499, priceYearly: 399, isPopular: false },
                { planId: "pro", name: "Pro", priceMonthly: 1299, priceYearly: 999, isPopular: true },
                { planId: "premium", name: "Premium", priceMonthly: 2999, priceYearly: 2499, isPopular: false }
              ]
          ).map((plan) => {
            const isCurrent =
              currentPlanId === plan.planId.toUpperCase() ||
              (currentPlanId === "PROFESSIONAL" && plan.planId === "pro");
            const price = selectedCycle === "YEARLY" ? plan.priceYearly || Math.round(plan.priceMonthly * 0.8) : plan.priceMonthly;
            const features = plan.features?.length > 0 ? plan.features : defaultFeatures[plan.planId] || [];

            return (
              <div
                key={plan.planId}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all relative ${
                  plan.isPopular
                    ? "bg-white border-2 border-[#00A1AC] shadow-xl"
                    : "bg-white border border-slate-200 shadow-sm"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00A1AC] text-white font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-md">
                    Recommended
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-[#0f172a]">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase text-[#00A1AC] bg-teal-50 border border-[#00A1AC]/30 px-2.5 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-[#0f172a]">₹{price}</span>
                    <span className="text-slate-400 text-xs font-bold"> / month</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {plan.description || (plan.planId === "starter" ? "For solo practitioners" : plan.planId === "pro" ? "For established growing clinics" : "For multi-doctor centers")}
                  </p>

                  <ul className="space-y-3 pt-3 border-t border-slate-100">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#00A1AC] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs cursor-default"
                    >
                      Active Tier
                    </button>
                  ) : (
                    <a
                      href={`mailto:support@docpulse.internal?subject=Upgrade%20to%20${plan.name}%20Plan`}
                      className={`block w-full py-2.5 text-center rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                        plan.isPopular
                          ? "bg-[#00A1AC] hover:bg-[#008790] text-white shadow-lg shadow-[#00A1AC]/25 font-black"
                          : "bg-slate-100 hover:bg-slate-200 text-[#0f172a]"
                      }`}
                    >
                      Switch to {plan.name}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

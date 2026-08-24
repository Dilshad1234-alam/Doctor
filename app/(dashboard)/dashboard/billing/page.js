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
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
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
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
          <CreditCard className="w-8 h-8 text-teal-300" />
          Billing & Subscription Plan
        </h1>
        <p className="mt-1 text-sm text-slate-300 font-medium">
          Review your active clinic plan, view real-time SaaS rates, or upgrade your practice features.
        </p>
      </div>

      {/* Active Subscription Luxury Card */}
      {sub ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Plan
                </span>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {sub.billingCycle || "MONTHLY"} Billing
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {sub.planId} <span className="text-2xl text-teal-300 font-medium">Edition</span>
              </h2>
              {sub.endDate && (
                <p className="text-slate-300 mt-2 text-sm font-medium">
                  Next renewal: <span className="text-white font-bold">{new Date(sub.endDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                </p>
              )}
            </div>

            <div className="text-left md:text-right bg-white/5 border border-white/10 p-5 rounded-2xl">
              <div className="text-4xl font-black text-white mb-1">₹{sub.price}</div>
              <div className="text-xs text-slate-300 font-medium">
                billed every {sub.billingCycle === "YEARLY" ? "year" : "month"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">No active subscription found</h3>
          <p className="text-xs text-slate-400">Select an edition below to activate your clinic website and online booking slots.</p>
        </div>
      )}

      {/* Dynamic Plan Upgrade Options */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-300" />
              Available Plan Tiers
            </h2>
            <p className="text-xs text-slate-400 font-medium">Synchronized in real-time with platform rates</p>
          </div>

          {/* Monthly / Yearly cycle toggle */}
          <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setSelectedCycle("MONTHLY")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCycle === "MONTHLY" ? "bg-teal-400 text-[#081e2b]" : "text-slate-300 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedCycle("YEARLY")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCycle === "YEARLY" ? "bg-teal-400 text-[#081e2b]" : "text-slate-300 hover:text-white"
              }`}
            >
              Yearly <span className="text-[10px] text-emerald-300 ml-1">Save 20%</span>
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
                    ? "bg-gradient-to-b from-white/15 to-white/5 border-2 border-teal-400 shadow-2xl"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-400 text-[#081e2b] font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-lg">
                    Recommended
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-4xl font-black text-white">₹{price}</span>
                    <span className="text-slate-400 text-xs font-bold"> / month</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {plan.description || (plan.planId === "starter" ? "For solo practitioners" : plan.planId === "pro" ? "For established growing clinics" : "For multi-doctor centers")}
                  </p>

                  <ul className="space-y-3 pt-3 border-t border-white/10">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-full bg-white/10 text-slate-400 font-bold text-xs cursor-default"
                    >
                      Active Tier
                    </button>
                  ) : (
                    <a
                      href={`mailto:support@docpulse.internal?subject=Upgrade%20to%20${plan.name}%20Plan`}
                      className={`block w-full py-3 text-center rounded-full font-black text-xs transition-all ${
                        plan.isPopular
                          ? "bg-teal-400 hover:bg-teal-300 text-[#081e2b] shadow-lg shadow-teal-500/20"
                          : "bg-white/10 hover:bg-white/20 text-white"
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

"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, CheckCircle2, AlertCircle, Loader2, Sparkles, 
  ShieldCheck, Zap, ArrowUpRight, Check, Lock, ChevronRight, X,
  Crown, Video, BarChart3, Download, Shield
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLAN_CONFIG } from "../../../../lib/planLimits.js";

export default function BillingPage() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState("MONTHLY");
  const [checkoutModal, setCheckoutModal] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/upgrade", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.subscription) {
        setSub(json.subscription);
      }
    } catch (err) {
      console.error("Billing Page Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const router = useRouter();

  const handleUpgrade = async (planKey) => {
    setProcessingPayment(true);
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planKey,
          newPlan: planKey,
          billingCycle: selectedCycle
        })
      });
      const json = await res.json();
      if (json.success) {
        setSub(json.subscription);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_plan", planKey.toUpperCase());
        }
        setPaymentSuccess(true);
        setCheckoutModal(null);
        setPaymentSuccess(false);
        router.refresh();
        router.push("/dashboard");
      } else {
        alert("Failed to upgrade: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error upgrading subscription.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  const currentPlanId = (sub?.planId || "BASIC").toUpperCase();
  const isPremium = currentPlanId === "PREMIUM" || currentPlanId === "ENTERPRISE";
  const isAdvancedOrHigher = currentPlanId === "ADVANCED" || currentPlanId === "PRO" || isPremium;

  const plans = [
    {
      id: "BASIC",
      name: "Basic Plan",
      priceMonthly: 499,
      priceYearly: 399,
      badge: "Starter",
      description: "Essential tools for solo practitioners & independent clinics.",
      features: [
        "1 Doctor Profile Seat",
        "Up to 5 Consultation Services",
        "Online OPD Appointment Booking",
        "Public Clinic Website (Subdomain)",
        "Patient Queue & Basic Records",
        "DocPulse Platform Footer Branding",
        "Standard Email Support"
      ]
    },
    {
      id: "ADVANCED",
      name: "Advanced Plan",
      priceMonthly: 999,
      priceYearly: 799,
      badge: "Most Popular",
      isPopular: true,
      description: "Complete growth suite with unlimited services & custom domain.",
      features: [
        "Everything in Basic Plan",
        "Unlimited Consultation Services (∞)",
        "All 3 Premium Website Templates",
        "Custom Domain Linking (e.g. drdilshad.com)",
        "CSV & Excel Patient Data Export",
        "Advanced Multi-Month Date Filters",
        "Reduced Subtle Branding Footer",
        "Priority 24/7 Support"
      ]
    },
    {
      id: "PREMIUM",
      name: "Premium Tier",
      priceMonthly: 1499,
      priceYearly: 1199,
      badge: "VIP Exclusive",
      isVIP: true,
      description: "100% White-Label, Luxury Executive Templates, Video Bio & Advanced Telemetry.",
      features: [
        "Everything in Advanced Plan",
        "100% White-Label (Remove DocPulse Branding)",
        "All Luxury & Executive Clinic Templates",
        "Interactive Analytics & Telemetry Graphs",
        "Financial & Revenue PDF / CSV Export",
        "Video Bio & Intro Hero Embed Support",
        "Direct CNAME DNS Verification Indicator",
        "VIP Priority Support + Onboarding Assist"
      ]
    }
  ];

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-6xl mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
          <CreditCard className="w-7 h-7 text-[#00A1AC]" />
          Subscription & Billing Plan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Review your active clinic plan, view real-time SaaS rates, or upgrade to unlock advanced features.
        </p>
      </div>

      {/* Active Subscription Luxury Card */}
      <div className={`text-white rounded-3xl p-7 sm:p-10 shadow-xl relative overflow-hidden ${
        isPremium 
          ? "bg-gradient-to-r from-[#071d28] via-[#0b3345] to-[#f59e0b]" 
          : "bg-gradient-to-r from-[#0c2e3d] via-[#103e52] to-[#00A1AC]"
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="bg-white/20 text-teal-100 border border-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-200" /> Active Plan
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                {sub?.billingCycle || "MONTHLY"} Billing
              </span>
              {isPremium ? (
                <span className="text-xs font-black text-amber-200 bg-amber-500/30 border border-amber-300/40 px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-300" /> VIP Premium Tier Unlocked
                </span>
              ) : isAdvancedOrHigher ? (
                <span className="text-xs font-black text-amber-300 bg-amber-400/20 border border-amber-300/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> All Pro Features Unlocked
                </span>
              ) : null}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {isPremium ? "Premium Tier" : (currentPlanId === "ADVANCED" || currentPlanId === "PRO") ? "Advanced Plan" : "Basic Plan"} <span className="text-2xl text-teal-100 font-medium">Edition</span>
            </h2>
            {sub?.endDate && (
              <p className="text-slate-200 mt-2 text-xs sm:text-sm font-medium">
                Active through: <span className="text-white font-bold">{new Date(sub.endDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
              </p>
            )}
          </div>

          <div className="text-left md:text-right bg-white/15 border border-white/20 p-5 rounded-2xl">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">₹{sub?.price || (isPremium ? 1499 : isAdvancedOrHigher ? 999 : 499)}</div>
            <div className="text-xs text-teal-100 font-medium">
              billed every {sub?.billingCycle === "YEARLY" ? "year" : "month"}
            </div>
          </div>
        </div>
      </div>

      {/* Available Plan Tiers */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00A1AC]" />
              Choose Your Practice Tier
            </h2>
            <p className="text-xs text-slate-500 font-medium">Instant feature activation with no waiting period</p>
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
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id || 
              (currentPlanId === "PRO" && plan.id === "ADVANCED") || 
              (currentPlanId === "STARTER" && plan.id === "BASIC") ||
              (currentPlanId === "ENTERPRISE" && plan.id === "PREMIUM");
            const price = selectedCycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all relative ${
                  plan.isVIP
                    ? "bg-white border-2 border-amber-400 shadow-xl ring-2 ring-amber-400/20"
                    : plan.isPopular
                      ? "bg-white border-2 border-[#00A1AC] shadow-xl ring-2 ring-[#00A1AC]/20"
                      : "bg-white border border-slate-200 shadow-sm"
                }`}
              >
                {plan.isVIP ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Crown className="w-3 h-3" /> VIP Exclusive
                  </div>
                ) : plan.isPopular ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00A1AC] text-white font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-[#0f172a]">{plan.name}</h3>
                    {isCurrent ? (
                      <span className="text-[10px] font-black uppercase text-[#00A1AC] bg-teal-50 border border-[#00A1AC]/30 px-2.5 py-1 rounded-full">
                        Current
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        plan.isVIP ? "text-amber-700 bg-amber-50 border border-amber-200" : "text-slate-400 bg-slate-100"
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-[#0f172a]">₹{price}</span>
                    <span className="text-slate-400 text-xs font-bold"> / month</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 pt-3 border-t border-slate-100">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.isVIP ? "text-amber-500" : "text-[#00A1AC]"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Active Current Tier
                    </button>
                  ) : (
                    <button
                      onClick={() => setCheckoutModal(plan)}
                      className={`w-full py-3 text-center rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                        plan.isVIP
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25"
                          : plan.isPopular
                            ? "bg-[#00A1AC] hover:bg-[#008790] text-white shadow-[#00A1AC]/25"
                            : "bg-[#0c2e3d] hover:bg-[#103e52] text-white shadow-slate-900/10"
                      }`}
                    >
                      <span>Upgrade to {plan.name}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout & Payment Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
            <button 
              onClick={() => setCheckoutModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Upgrade Successful!</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Your account has been upgraded to <strong>{checkoutModal.name}</strong>. All premium features are now unlocked live across your dashboard!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A1AC]/10 text-[#00A1AC] text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Instant Tier Upgrade
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{checkoutModal.name} Checkout</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Upgrade your clinic plan to unlock 100% white-labeling, executive templates, video bios, and advanced telemetry analytics.
                  </p>
                </div>

                {/* Order Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{checkoutModal.name} ({selectedCycle})</span>
                    <span className="font-black text-slate-900">₹{selectedCycle === "YEARLY" ? checkoutModal.priceYearly : checkoutModal.priceMonthly}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>GST (18%)</span>
                    <span>Included</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-black text-sm">
                    <span className="text-slate-900">Total Payable:</span>
                    <span className="text-[#00A1AC] text-base">₹{selectedCycle === "YEARLY" ? checkoutModal.priceYearly : checkoutModal.priceMonthly}</span>
                  </div>
                </div>

                {/* Payment Methods Simulation */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 border-2 border-[#00A1AC] bg-[#00A1AC]/5 rounded-xl text-center cursor-pointer">
                      <div className="font-black text-xs text-slate-900">UPI / QR</div>
                      <div className="text-[10px] text-[#00A1AC] font-bold">Instant</div>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl text-center cursor-pointer hover:border-slate-300">
                      <div className="font-bold text-xs text-slate-700">Cards</div>
                      <div className="text-[10px] text-slate-400">Debit / Credit</div>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl text-center cursor-pointer hover:border-slate-300">
                      <div className="font-bold text-xs text-slate-700">NetBanking</div>
                      <div className="text-[10px] text-slate-400">All Banks</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => setCheckoutModal(null)}
                    disabled={processingPayment}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleUpgrade(checkoutModal.id)}
                    disabled={processingPayment}
                    className={`flex-2 py-3 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer ${
                      checkoutModal.isVIP
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/30"
                        : "bg-[#00A1AC] hover:bg-[#008790] shadow-[#00A1AC]/30"
                    }`}
                  >
                    {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>{processingPayment ? "Processing Upgrade..." : `Pay ₹${selectedCycle === "YEARLY" ? checkoutModal.priceYearly : checkoutModal.priceMonthly} & Unlock Instantly`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

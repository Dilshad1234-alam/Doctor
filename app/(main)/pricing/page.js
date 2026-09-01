"use client";

import { useEffect, useState, Suspense } from "react";
import { Check, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { PRICING_PLANS } from "../../../lib/plans.js";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuthAndSub() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          setIsLoggedIn(true);
          const subRes = await fetch("/api/clinic/subscription");
          const subData = await subRes.json();
          if (subData.success) {
            setSubscription(subData.subscription);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndSub();
  }, []);

  const handleUpgrade = async (planId) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!subscription && isLoggedIn && !isOnboarding) {
      alert("Please complete your clinic setup first.");
      router.push("/dashboard/onboarding");
      return;
    }

    setUpgradeLoading(planId);
    try {
      const res = await fetch("/api/clinic/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle })
      });
      const data = await res.json();
      if (data.success) {
        alert("Subscription activated successfully!");
        setSubscription(data.subscription);
        if (isOnboarding) {
          router.push("/dashboard");
        }
      } else {
        alert(data.error || "Upgrade failed.");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {isOnboarding && (
            <div className="mb-8 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-800 animate-in fade-in slide-in-from-top-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold text-sm">Almost Done! Select a Plan to Activate Your Clinic</span>
            </div>
          )}

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Choose the perfect plan for your practice. Upgrade anytime as your clinic grows.
          </p>

          {/* Trial / Active Alert */}
          {subscription && !isOnboarding && (
            <div className={`mt-8 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              subscription.status === 'TRIAL' ? 'bg-amber-100 text-amber-800' : 
              subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {subscription.status === 'TRIAL' && <AlertCircle className="w-5 h-5" />}
              {subscription.status === 'ACTIVE' && <CheckCircle2 className="w-5 h-5" />}
              {subscription.status === 'EXPIRED' && <AlertCircle className="w-5 h-5" />}
              
              <span>
                {subscription.status === 'TRIAL' && `You are currently on a 14-day free trial. Ends on ${new Date(subscription.endDate).toLocaleDateString()}`}
                {subscription.status === 'ACTIVE' && `You are currently on the ${subscription.planId} plan (${subscription.billingCycle}).`}
                {subscription.status === 'EXPIRED' && `Your subscription expired on ${new Date(subscription.endDate).toLocaleDateString()}. Please upgrade.`}
              </span>
            </div>
          )}

          {/* Nav links */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {isLoggedIn && !isOnboarding ? (
              <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">
                Go to Dashboard &rarr;
              </Link>
            ) : null}
          </div>

          {/* Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold ${billingCycle === 'MONTHLY' ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${billingCycle === 'YEARLY' ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${billingCycle === 'YEARLY' ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${billingCycle === 'YEARLY' ? 'text-slate-900' : 'text-slate-500'}`}>Yearly</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Save 20%</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg ${plan.recommended ? 'ring-2 ring-blue-600 shadow-md' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-bold uppercase text-white shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {plan.badge}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{plan.badge}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₹{billingCycle === 'YEARLY' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="text-sm font-medium text-slate-500">/mo</span>
              </div>
              
              {billingCycle === 'YEARLY' && (
                <p className="mb-6 text-sm font-semibold text-emerald-600">
                  Billed ₹{plan.yearlyPrice} yearly
                </p>
              )}

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                    <Check className="h-5 w-5 shrink-0 text-blue-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={upgradeLoading === plan.id || (subscription?.planId === plan.id && subscription?.status === 'ACTIVE' && subscription?.billingCycle === billingCycle && !isOnboarding)}
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all ${
                  subscription?.planId === plan.id && subscription?.status === 'ACTIVE' && subscription?.billingCycle === billingCycle && !isOnboarding
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : plan.recommended
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {upgradeLoading === plan.id ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : subscription?.planId === plan.id && subscription?.status === 'ACTIVE' && subscription?.billingCycle === billingCycle && !isOnboarding ? (
                  'Current Plan'
                ) : (
                  isOnboarding ? `Start with ${plan.name}` : `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PricingContent />
    </Suspense>
  );
}

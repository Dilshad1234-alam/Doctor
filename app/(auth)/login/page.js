"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartPulse,
  CheckCircle2,
  Star,
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const emailParam = searchParams.get("email") || "";
  const errorParam = searchParams.get("error");

  const [formData, setFormData] = useState({
    email: emailParam,
    password: "",
  });
  const [error, setError] = useState(
    errorParam === "unauthorized"
      ? "Access denied. Please sign in with an authorized account."
      : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const { user } = data;
        if (
          user?.role === "ADMIN" ||
          user?.role === "SUPER_ADMIN" ||
          data.redirectUrl === "/admin"
        ) {
          window.location.href = "/admin";
        } else if (!user?.isOnboardingCompleted && !user?.hasCompletedOnboarding) {
          // Force smooth direct transition to onboarding wizard
          window.location.href = "/dashboard/onboarding";
        } else {
          window.location.href = data.redirectUrl || "/dashboard";
        }
      } else {
        setError(data.message || data.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] text-[#0f172a] selection:bg-[#164e63] selection:text-white font-sans antialiased">
      {/* Left Column: Brand Showcase (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] p-12 flex-col justify-between fixed left-0 top-0 bottom-0 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-[#164e63]/40 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-2 text-white">
          <HeartPulse className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-extrabold tracking-tight">DocPulse</h1>
        </div>

        <div className="relative z-10 max-w-lg mt-12">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-8">
            Empowering Doctors to Build Their Digital Clinic in Minutes.
          </h2>

          <ul className="space-y-5 mb-12">
            {[
              "Zero-code website setup",
              "24/7 automated OPD slots",
              "Direct patient queue management",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-slate-200 font-medium">
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl max-w-lg">
          <div className="flex gap-1 mb-4">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-white text-lg font-medium leading-relaxed mb-6">
            "Since joining DocPulse, my clinic's operational efficiency has doubled. Patients love booking online, and I don't need a receptionist to manage my schedule."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600">
              <User className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-white font-bold">Dr. Rajesh Kumar</p>
              <p className="text-slate-300 text-sm">Senior Neurologist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-6 sm:p-12 min-h-screen py-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative my-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 hover:text-[#164e63] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to main site
          </Link>

          <div className="w-16 h-16 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-100">
            <HeartPulse className="w-8 h-8 text-[#164e63]" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-[#0f172a] mb-2">
            Welcome Back, Doctor
          </h2>
          <p className="text-xs font-semibold text-slate-600 mb-6">
            Access your clinic dashboard and manage patient OPD bookings.
          </p>

          {/* Success Banner when redirected from Registration */}
          {isRegistered && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-2xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account successfully created! Please enter your password to log in.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="doctor@clinic.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#164e63] focus:ring-[#164e63]"
                />
                <span className="text-xs font-bold tracking-wide text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-xs font-bold tracking-wide text-[#164e63] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#0f172a] hover:bg-[#1e293b] disabled:bg-slate-800 text-white font-bold tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In to Clinic Dashboard <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-bold tracking-wide text-slate-500">
            Don't have an account?{" "}
            <Link href="/get-started" className="text-[#164e63] hover:underline">
              Start Free Trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 text-[#164e63] animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

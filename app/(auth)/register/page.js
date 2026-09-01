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
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Stethoscope,
  Hotel,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

const providerMetadata = {
  individual_doctor: {
    badgeText: "Registration for Individual Doctor Practice",
    title: "Individual Doctor Practice",
    nameLabel: "Doctor Full Name",
    namePlaceholder: "Dr. Rajesh Sharma",
    entityLabel: "Practice / Clinic Name",
    entityPlaceholder: "Sharma Health & Neuro Clinic",
    icon: Stethoscope,
    themeColor: "teal",
    description: "Launch your independent digital OPD with direct appointment bookings and prescription slips.",
  },
  clinic: {
    badgeText: "Registration for Multi-Doctor Clinic",
    title: "Multi-Doctor Clinic",
    nameLabel: "Clinic Administrator / Director Name",
    namePlaceholder: "Dr. Vikram Patel",
    entityLabel: "Clinic / Polyclinic Name",
    entityPlaceholder: "Apex Multi-Specialty Healthcare",
    icon: Building2,
    themeColor: "cyan",
    description: "Manage unlimited visiting doctors, department queues, split fees, and shared reception.",
  },
  hospital: {
    badgeText: "Registration for Hospital",
    title: "Hospital & Medical Center",
    nameLabel: "Medical Superintendent / Admin Name",
    namePlaceholder: "Dr. Arvind Menon",
    entityLabel: "Hospital / Healthcare Center Name",
    entityPlaceholder: "City Care Super-Specialty Hospital",
    icon: Hotel,
    themeColor: "emerald",
    description: "Enterprise tier with department hierarchies, 24/7 ER emergency hotlines, and bed queues.",
  },
};

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");

  const validTypes = ["individual_doctor", "clinic", "hospital"];
  const provider_type = validTypes.includes(rawType) ? rawType : "individual_doctor";

  const [formData, setFormData] = useState({
    name: "",
    entityName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const activeProvider = providerMetadata[provider_type] || providerMetadata.individual_doctor;
  const ActiveIcon = activeProvider.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const mappedRole =
      provider_type === "clinic"
        ? "MULTI_DOCTOR_CLINIC"
        : provider_type === "hospital"
        ? "HOSPITAL"
        : "INDIVIDUAL_DOCTOR";

    const mappedCategory =
      provider_type === "clinic"
        ? "Multi-Doctor Clinic"
        : provider_type === "hospital"
        ? "Hospital"
        : "Solo Practitioner";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          entityName: formData.entityName || (provider_type === "individual_doctor" ? `${formData.name}'s Practice` : formData.name),
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          provider_type,
          role: mappedRole,
          accountType: mappedRole,
          entityType: mappedRole,
          category: mappedCategory,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to login page with success flag and email pre-filled
        window.location.href = `/login?registered=true&email=${encodeURIComponent(formData.email)}`;
      } else {
        setError(data.error || data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      {/* Left Column: Dark Oceanic Brand Showcase (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-[#06141d] via-[#0a202c] to-[#0c2a3b] p-12 flex-col justify-between fixed left-0 top-0 bottom-0 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-[#00c9a7]/20 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between text-white">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-[#00c9a7] flex items-center justify-center text-[#06141d]">
              <HeartPulse className="w-5 h-5 font-black" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">DocPulse</h1>
          </Link>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00c9a7]/15 text-[#00c9a7] border border-[#00c9a7]/30">
            {activeProvider.title}
          </span>
        </div>

        <div className="relative z-10 max-w-lg mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#00c9a7] border border-white/10 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Isolated Database Storage
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Strict Multi-Tenant Isolation For Your Healthcare Practice.
          </h2>

          <ul className="space-y-4 mb-8">
            {[
              "Dedicated MongoDB collection for your provider category",
              "Personalized booking engine & verified badge",
              "Instant appointment slots with zero-code setup",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-base text-slate-200 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#00c9a7] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl max-w-lg">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, idx) => (
              <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-white text-sm font-medium leading-relaxed mb-4">
            "Setting up our clinical operations on DocPulse was effortless. The data separation and instant OPD token management have saved our team hours every day."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00c9a7]/20 rounded-full flex items-center justify-center border border-[#00c9a7]/40 text-[#00c9a7] font-bold text-sm">
              DR
            </div>
            <div>
              <p className="text-white font-bold text-sm">Dr. Rajesh Kumar</p>
              <p className="text-slate-300 text-xs">Chief of Medicine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-6 sm:p-12 min-h-screen py-10">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative my-auto">
          {/* Header Link */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Change Practice Type
            </Link>
          </div>

          {/* Active Provider Header Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold mb-4">
            <ActiveIcon className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{activeProvider.badgeText}</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 font-medium mb-5">
            {activeProvider.description}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name / Admin Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeProvider.nameLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={activeProvider.namePlaceholder}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Entity / Clinic / Hospital Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeProvider.entityLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={activeProvider.entityPlaceholder}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@practice.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#06141d] hover:bg-[#0a202c] disabled:bg-slate-700 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#00c9a7]" /> Provisioning Workspace...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#00c9a7]" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Login Link */}
          <p className="mt-6 text-center text-xs font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-700 font-bold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-[#00c9a7] animate-spin" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}

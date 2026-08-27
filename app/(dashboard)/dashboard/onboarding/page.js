"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, Sparkles, Building, UserCircle, 
  Stethoscope, Clock, Clock3, LayoutTemplate, Palette, Globe, Play, ArrowRight, ShieldCheck,
  Zap, Check, ExternalLink, Sliders, MapPin, Phone, Mail, Award, Plus, Trash2, HelpCircle
} from "lucide-react";

const getDisplayDoctorName = (name) => {
  if (!name) return "Dr. Doctor";
  const stripped = name.replace(/^Dr\.?\s*/i, "").trim();
  return `Dr. ${stripped}`;
};

const modernWhitePlans = [
  {
    planId: "BASIC",
    code: "BASIC",
    name: "Basic / Starter",
    priceMonthly: 499,
    priceYearly: 399,
    badge: "14-DAY FREE TRIAL",
    badgeClass: "bg-emerald-600 text-white border border-white/30 font-black shadow-md",
    subtitle: "For new / solo doctors establishing their initial digital presence.",
    features: [
      "1 Doctor Practice (Solo Doctor)",
      "Basic Website Templates",
      "Public Website & Appointment Booking",
      "Up to 5 Clinical Services",
      "Weekly Availability & Slot Engine",
      "Basic Contact & Booking History",
      "Platform Subdomain URL",
      "Standard Support"
    ]
  },
  {
    planId: "PRO",
    code: "PRO",
    name: "Advanced / Pro",
    priceMonthly: 999,
    priceYearly: 799,
    badge: "MOST POPULAR",
    badgeClass: "bg-[#00A1AC] text-white border border-white/30 font-black shadow-md",
    isPopular: true,
    subtitle: "For active private practices wanting full automation.",
    features: [
      "1 Doctor Practice",
      "Basic + Advanced Website Templates",
      "Unlimited Services",
      "Full Booking History + Search & Filters",
      "Custom Domain + Subdomain Included",
      "Advanced Sections & Branding Customization",
      "Website + Booking Analytics",
      "Priority Support"
    ]
  },
  {
    planId: "PREMIUM",
    code: "PREMIUM",
    name: "Premium",
    priceMonthly: 1499,
    priceYearly: 1199,
    badge: "ENTERPRISE GRADE",
    badgeClass: "bg-slate-800 text-white border border-slate-600 font-black shadow-md",
    subtitle: "Maximum control, white-label branding & top-tier templates.",
    features: [
      "1 Doctor Practice",
      "All + Premium Website Templates",
      "Unlimited Services",
      "Advanced Patient Management View",
      "Custom Domain & Subdomain",
      "Maximum Template Controls",
      "Advanced Analytics & Export Reports",
      "Zero Platform Branding (100% White-label)",
      "Priority Support + Onboarding Assistance"
    ]
  }
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successSlug, setSuccessSlug] = useState("");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");

  const [formData, setFormData] = useState({
    plan: { planId: "BASIC", billingCycle: "MONTHLY", price: 499, isTrial: true },
    doctorProfile: { fullName: "", qualification: "", specialization: "", experienceYrs: "", regNumber: "", bio: "", profilePhoto: "" },
    clinicDetails: { name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", slug: "" },
    services: [
      { name: "General Consultation", description: "Standard clinical examination and prescription", price: "500", durationMins: "15" },
      { name: "Follow-up Checkup", description: "Post-treatment routine review", price: "300", durationMins: "15" }
    ],
    availability: [
      { dayOfWeek: 0, isOpen: false, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 1, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 6, isOpen: true, startTime: "09:00", endTime: "17:00" },
    ],
    websiteConfig: {
      templateId: "template-1",
      primaryColor: "#00A1AC",
      fontStyle: "Plus Jakarta Sans",
      buttonStyle: "rounded-full",
      showSections: { about: true, services: true, timings: true, contact: true }
    }
  });

  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const wizardRes = await fetch("/api/onboarding/wizard");
        const wizardJson = await wizardRes.json();

        if (wizardJson.success && wizardJson.data) {
          const { user, clinic, doctorProfile, services, availability, websiteConfig, subscription } = wizardJson.data;
          
          if (user?.hasCompletedOnboarding) {
            router.push("/dashboard");
            return;
          }

          setFormData(prev => ({
            ...prev,
            plan: subscription ? {
              planId: subscription.planId || prev.plan.planId || "BASIC",
              billingCycle: subscription.billingCycle || prev.plan.billingCycle || "MONTHLY",
              price: subscription.price || prev.plan.price || 499,
              isTrial: subscription.status === "TRIAL" || subscription.status === "trial" || prev.plan.isTrial || true
            } : prev.plan,
            doctorProfile: {
              fullName: doctorProfile?.fullName || (user?.name ? getDisplayDoctorName(user.name) : "") || prev.doctorProfile.fullName || "",
              qualification: doctorProfile?.qualification || prev.doctorProfile.qualification || "",
              specialization: doctorProfile?.specialization || user?.specialization || prev.doctorProfile.specialization || "",
              experienceYrs: doctorProfile?.experienceYrs !== undefined && doctorProfile?.experienceYrs !== null ? String(doctorProfile.experienceYrs) : prev.doctorProfile.experienceYrs || "",
              regNumber: doctorProfile?.regNumber || prev.doctorProfile.regNumber || "",
              bio: doctorProfile?.bio || prev.doctorProfile.bio || "",
              profilePhoto: doctorProfile?.profilePhoto || doctorProfile?.avatarUrl || prev.doctorProfile.profilePhoto || "",
            },
            clinicDetails: {
              name: clinic?.name || user?.practiceName || user?.name || user?.clinicName || user?.hospitalName || prev.clinicDetails.name || "",
              phone: clinic?.phone || user?.phone || prev.clinicDetails.phone || "",
              email: clinic?.email || user?.email || prev.clinicDetails.email || "",
              address: clinic?.address || prev.clinicDetails.address || "",
              city: clinic?.city || prev.clinicDetails.city || "",
              state: clinic?.state || prev.clinicDetails.state || "",
              pincode: clinic?.pincode || prev.clinicDetails.pincode || "",
              slug: clinic?.slug || user?.slug || prev.clinicDetails.slug || "",
            },
            services: services?.length > 0 ? services.map(s => ({
              name: s.name || "",
              description: s.description || "",
              price: s.price !== undefined && s.price !== null ? String(s.price) : "500",
              durationMins: s.durationMins !== undefined && s.durationMins !== null ? String(s.durationMins) : "15"
            })) : prev.services,
            availability: availability?.length > 0 ? availability : prev.availability,
            websiteConfig: websiteConfig || prev.websiteConfig,
          }));
        }
      } catch (err) {
        console.error("Onboarding fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    initOnboarding();
  }, [router]);

  const updateForm = (section, field, value) => {
    setFormData(prev => {
      const updatedSection = { ...prev[section], [field]: value };
      
      if (section === 'clinicDetails' && field === 'name' && !prev.clinicDetails.slug) {
        updatedSection.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }

      return {
        ...prev,
        [section]: updatedSection
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 3) {
      if (!formData.clinicDetails.name?.trim()) {
        alert("Please enter your Clinic Name to continue.");
        return;
      }
      if (!formData.clinicDetails.phone?.trim()) {
        alert("Please enter a Contact Phone Number for patients.");
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 10));
  };

  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCompleteOnboarding = async () => {
    const { name, phone } = formData.clinicDetails;
    if (!name || !phone) {
      alert("Clinic Name and Phone are required. Please verify them in Clinic Details.");
      setCurrentStep(3);
      return;
    }

    setSaving(true);
    try {
      const selectedPlanId = (formData.plan.planId || "BASIC").toUpperCase();
      const isBasicTrial = selectedPlanId === "BASIC" || selectedPlanId === "STARTER";

      const submissionPayload = {
        ...formData,
        plan: {
          ...formData.plan,
          planId: selectedPlanId,
          billingCycle,
          subscription_status: isBasicTrial ? "trial" : "active",
          trial_ends_at: isBasicTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
          website_status: "published",
        }
      };

      const res = await fetch("/api/onboarding/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload)
      });
      const json = await res.json();
      if (json.success) {
        setSuccessSlug(json.slug || formData.clinicDetails.slug);
        setIsCompleted(true);
      } else {
        alert("Error completing setup: " + (json.error || "Please check all fields."));
      }
    } catch (err) {
      alert("Network connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGoToDashboard = async () => {
    try {
      if (typeof window !== "undefined") {
        document.cookie = "is_onboarding_completed=true; path=/; max-age=2592000";
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00A1AC] via-[#008790] to-[#006e76]">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#00A1AC] via-[#008790] to-[#006e76] text-slate-900 flex items-center justify-center p-6 font-sans relative">
        <div className="rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-8 sm:p-14 shadow-2xl max-w-xl w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-3xl bg-[#00A1AC]/10 border border-[#00A1AC]/20 p-4 inline-flex items-center justify-center text-[#00A1AC] mb-6 shadow-md">
            <Sparkles className="w-10 h-10 text-[#00A1AC]" />
          </div>

          <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase mb-4 shadow-sm">
            🎉 Setup Completed & Verified
          </div>

          <h1 className="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Your Clinic Website is Live!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 font-medium">
            Congratulations! Patients can now visit your verified portal, review your medical services, and book appointments online 24/7.
          </p>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8 flex items-center justify-between text-left shadow-inner">
            <div className="min-w-0 pr-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Live Website URL</span>
              <span className="font-bold text-[#006e76] text-sm truncate block">
                {typeof window !== "undefined" ? window.location.origin : ""}/{successSlug}
              </span>
            </div>
            <a
              href={`/${successSlug}`}
              target="_blank"
              className="p-2.5 rounded-xl bg-[#00A1AC]/15 hover:bg-[#00A1AC]/25 text-[#006e76] shrink-0 transition-colors"
              title="Open Public Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`/${successSlug}`}
              target="_blank"
              className="w-full sm:w-auto bg-[#00A1AC] hover:bg-[#008790] text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-[#00A1AC]/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Globe className="w-4 h-4" /> Visit Website
            </a>
            <button
              onClick={handleGoToDashboard}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-8 py-3.5 rounded-2xl transition-all text-sm cursor-pointer"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlanCode = (formData.plan.planId || "BASIC").toUpperCase();
  const isBasicSelected = selectedPlanCode === "BASIC" || selectedPlanCode === "STARTER";

  return (
    <div className="h-screen max-h-screen overflow-hidden w-full font-sans antialiased bg-gradient-to-br from-[#00A1AC] via-[#008790] to-[#006e76] text-slate-900 relative flex flex-col justify-between selection:bg-[#00A1AC] selection:text-white">
      
      {/* 1. Header Progress Bar */}
      <header className="w-full border-b border-white/10 bg-transparent shrink-0 z-50">
        <div className="w-full px-6 sm:px-12 lg:px-16 py-5 flex items-center justify-between">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-wide">
              DocPulse Setup
            </span>
          </div>

          {/* Right: Step Indicator & Progress */}
          <div className="flex items-center gap-3">
            <span className="bg-white/10 backdrop-blur-sm text-white border border-white/20 text-xs font-semibold px-3 py-1 rounded-full">
              {currentStep === 0 ? "Getting Started" : `Step ${currentStep} of 10`}
            </span>
            <div className="w-24 sm:w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 rounded-full" 
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Step Content Container */}
      <main className={`w-full mx-auto flex-1 flex flex-col items-center justify-center overflow-y-auto ${currentStep === 9 ? "max-w-6xl w-full px-4 py-2" : currentStep === 10 ? "max-w-7xl px-4 sm:px-8 py-2" : "max-w-4xl px-4 sm:px-6 py-4"}`}>
        
        {/* STEP 1: Welcome */}
        {currentStep === 1 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-10 sm:p-16 shadow-2xl text-center relative overflow-hidden text-slate-900 animate-in fade-in duration-300 flex flex-col items-center justify-center">
            <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight mb-4">
              Welcome to DocPulse
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-8 font-medium">
              Let&apos;s build and configure your professional clinic website in 10 quick steps. You&apos;ll set up your doctor profile, OPD hours, medical services, design theme, and select your subscription tier.
            </p>
            <button 
              onClick={handleNext} 
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white px-10 py-4 text-sm font-black shadow-xl shadow-[#00A1AC]/30 transition-all hover:scale-105 cursor-pointer"
            >
              <span>Begin Setup</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: Doctor Profile */}
        {currentStep === 2 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                <UserCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">Doctor Profile</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Enter your medical credentials and clinical biography</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center shrink-0">
                  {formData.doctorProfile.profilePhoto ? (
                    <img src={formData.doctorProfile.profilePhoto} alt="Doctor" className="w-full h-full object-cover object-top" />
                  ) : (
                    <UserCircle className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="block text-slate-700 font-bold uppercase text-[11px]">Doctor Profile Photo URL (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/doctor-photo.jpg" 
                    value={formData.doctorProfile.profilePhoto || ""} 
                    onChange={e => updateForm('doctorProfile', 'profilePhoto', e.target.value)} 
                    className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Doctor Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Jane Smith" 
                  value={formData.doctorProfile.fullName || ""} 
                  onChange={e => updateForm('doctorProfile', 'fullName', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Medical Qualification</label>
                <input 
                  type="text" 
                  placeholder="e.g. MBBS, MD, MS" 
                  value={formData.doctorProfile.qualification || ""} 
                  onChange={e => updateForm('doctorProfile', 'qualification', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Specialization</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cardiologist / General Physician" 
                  value={formData.doctorProfile.specialization || ""} 
                  onChange={e => updateForm('doctorProfile', 'specialization', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Years of Experience</label>
                <input 
                  type="number" 
                  placeholder="e.g. 8" 
                  value={formData.doctorProfile.experienceYrs || ""} 
                  onChange={e => updateForm('doctorProfile', 'experienceYrs', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Medical Registration Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. MCI-294829" 
                  value={formData.doctorProfile.regNumber || ""} 
                  onChange={e => updateForm('doctorProfile', 'regNumber', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Short Clinical Bio</label>
                <textarea 
                  placeholder="Tell patients about your expertise, background, and patient care philosophy..." 
                  rows={3} 
                  value={formData.doctorProfile.bio || ""} 
                  onChange={e => updateForm('doctorProfile', 'bio', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Clinic Details & Slug */}
        {currentStep === 3 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">Clinic Details & Public URL</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Location, patient coordinates, and custom website slug</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Clinic Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Heart & Dental Center" 
                  value={formData.clinicDetails.name || ""} 
                  onChange={e => updateForm('clinicDetails', 'name', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Public Website URL Slug</label>
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00A1AC]/20 focus-within:border-[#00A1AC] transition-all">
                  <span className="text-slate-500 font-mono text-xs pr-1">/</span>
                  <input 
                    type="text" 
                    placeholder="my-clinic" 
                    value={formData.clinicDetails.slug || ""} 
                    onChange={e => updateForm('clinicDetails', 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))} 
                    className="w-full bg-transparent text-[#006e76] font-bold focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Contact Phone *</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210" 
                  value={formData.clinicDetails.phone || ""} 
                  onChange={e => updateForm('clinicDetails', 'phone', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Contact Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. clinic@example.com" 
                  value={formData.clinicDetails.email || ""} 
                  onChange={e => updateForm('clinicDetails', 'email', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Street Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. 45 Park Avenue, Healthcare Hub" 
                  value={formData.clinicDetails.address || ""} 
                  onChange={e => updateForm('clinicDetails', 'address', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">City</label>
                <input 
                  type="text" 
                  placeholder="e.g. New Delhi" 
                  value={formData.clinicDetails.city || ""} 
                  onChange={e => updateForm('clinicDetails', 'city', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Pincode</label>
                <input 
                  type="text" 
                  placeholder="e.g. 110001" 
                  value={formData.clinicDetails.pincode || ""} 
                  onChange={e => updateForm('clinicDetails', 'pincode', e.target.value)} 
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Services & Consultation Fees */}
        {currentStep === 4 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">Services & Consultation Fees</h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">List the services and fees displayed on your website booking engine</p>
                </div>
              </div>
              <button 
                onClick={() => setFormData(p => ({...p, services: [...p.services, { name: "", description: "Standard Consultation", price: "500", durationMins: "15" }] }))} 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#00A1AC] hover:bg-[#008790] px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {formData.services.map((s, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <input 
                    type="text" 
                    placeholder="Service Name (e.g. Dental Checkup)" 
                    value={s.name || ""} 
                    onChange={e => {
                      const newArr = [...formData.services];
                      newArr[idx].name = e.target.value;
                      setFormData({...formData, services: newArr});
                    }} 
                    className="flex-1 w-full sm:w-auto rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC]" 
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                      <input 
                        type="number" 
                        placeholder="Fee" 
                        value={s.price || ""} 
                        onChange={e => {
                          const newArr = [...formData.services];
                          newArr[idx].price = e.target.value;
                          setFormData({...formData, services: newArr});
                        }} 
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC]" 
                      />
                    </div>
                    <div className="relative w-24">
                      <input 
                        type="number" 
                        placeholder="Mins" 
                        value={s.durationMins || ""} 
                        onChange={e => {
                          const newArr = [...formData.services];
                          newArr[idx].durationMins = e.target.value;
                          setFormData({...formData, services: newArr});
                        }} 
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC]" 
                      />
                    </div>
                    {formData.services.length > 1 && (
                      <button 
                        onClick={() => {
                          const newArr = formData.services.filter((_, i) => i !== idx);
                          setFormData({...formData, services: newArr});
                        }}
                        className="p-2 rounded-xl hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 5: OPD Timings / Weekly Schedule */}
        {currentStep === 5 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">OPD Timings & Availability</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Configure your active consultation days and appointment slot hours</p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => {
                const day = formData.availability.find(d => d.dayOfWeek === idx) || { dayOfWeek: idx, isOpen: false, startTime: "09:00", endTime: "17:00" };
                return (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-4 rounded-2xl border transition-all ${!day.isOpen ? 'bg-slate-100/60 border-slate-200' : 'bg-[#00A1AC]/10 border-[#00A1AC]/30'}`}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <span className="text-xs font-bold text-slate-800 w-24">{dayName}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newArr = [...formData.availability];
                          const di = newArr.findIndex(d => d.dayOfWeek === idx);
                          if (di !== -1) {
                            newArr[di].isOpen = !day.isOpen;
                          } else {
                            newArr.push({ dayOfWeek: idx, isOpen: true, startTime: "09:00", endTime: "17:00" });
                          }
                          setFormData({...formData, availability: newArr});
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          day.isOpen ? 'bg-[#00A1AC]' : 'bg-slate-300'
                        }`}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                            day.isOpen ? 'translate-x-5' : 'translate-x-0'
                          }`} 
                        />
                      </button>
                      <span className={`text-[11px] font-bold ${day.isOpen ? 'text-[#006e76]' : 'text-slate-400'}`}>
                        {day.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    {day.isOpen && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="time" 
                          value={day.startTime || "09:00"} 
                          onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).startTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} 
                          className="py-1.5 px-3 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] shadow-sm" 
                        />
                        <span className="text-slate-500 font-bold text-xs">to</span>
                        <input 
                          type="time" 
                          value={day.endTime || "17:00"} 
                          onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).endTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} 
                          className="py-1.5 px-3 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00A1AC]/20 focus:border-[#00A1AC] shadow-sm" 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 6: Branding & Colors */}
        {currentStep === 6 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                <Palette className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">Branding & Color Theme</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Select accent palette and button styles for your public portal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[11px] mb-3">Primary Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'Teal/Cyan (Brand)', hex: '#00A1AC' },
                      { name: 'Clinical Blue', hex: '#2563eb' },
                      { name: 'Deep Oceanic', hex: '#0d3b4d' },
                      { name: 'Care Emerald', hex: '#059669' },
                      { name: 'Gentle Rose', hex: '#e11d48' },
                      { name: 'Royal Indigo', hex: '#4f46e5' }
                    ].map(color => (
                      <button 
                        key={color.hex} 
                        onClick={() => updateForm('websiteConfig', 'primaryColor', color.hex)} 
                        style={{ backgroundColor: color.hex }} 
                        title={color.name}
                        className={`h-10 w-10 rounded-full transition-transform flex items-center justify-center cursor-pointer ${formData.websiteConfig.primaryColor === color.hex ? 'ring-4 ring-[#00A1AC] scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105 shadow-sm'}`} 
                      >
                        {formData.websiteConfig.primaryColor === color.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[11px] mb-3">CTA Button Style</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'rounded-full', label: 'Pill (Full)' },
                      { id: 'rounded-xl', label: 'Soft (XL)' },
                      { id: 'rounded-none', label: 'Sharp' }
                    ].map(style => (
                      <button 
                        key={style.id} 
                        onClick={() => updateForm('websiteConfig', 'buttonStyle', style.id)}
                        className={`flex-1 py-3 px-4 border font-bold text-xs transition-all cursor-pointer ${style.id} ${formData.websiteConfig.buttonStyle === style.id ? 'border-[#00A1AC] bg-[#00A1AC]/10 text-[#006e76] shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Live Button & Color Preview</p>
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 w-full max-w-xs text-slate-900 space-y-3">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-black shadow-md" style={{ backgroundColor: formData.websiteConfig.primaryColor }}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-base">{getDisplayDoctorName(formData.doctorProfile.fullName)}</h4>
                    <p className="text-xs font-bold text-slate-500">{formData.doctorProfile.specialization || "Medical Specialist"}</p>
                  </div>
                  <button 
                    className={`w-full py-3 text-white font-black text-xs shadow-md transition-all cursor-pointer ${formData.websiteConfig.buttonStyle}`} 
                    style={{ backgroundColor: formData.websiteConfig.primaryColor }}
                  >
                    Book Appointment →
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 7: Website Sections Configuration */}
        {currentStep === 7 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                <Sliders className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">Website Sections Configuration</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Choose which informational modules appear on your public landing page</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'about', label: 'Doctor About & Credentials', desc: 'Display qualifications, experience, and short biography' },
                { key: 'services', label: 'Services & Transparent Fees', desc: 'Show clinical OPD services and procedure pricing' },
                { key: 'timings', label: 'OPD Schedule & Hours', desc: 'Display weekly working schedule and consultation slots' },
                { key: 'contact', label: 'Clinic Address & Location', desc: 'Show interactive address, phone, and coordinates' }
              ].map(sec => {
                const isEnabled = formData.websiteConfig?.showSections?.[sec.key] ?? true;
                return (
                  <div key={sec.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{sec.label}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{sec.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.websiteConfig?.showSections || { about: true, services: true, timings: true, contact: true };
                        updateForm('websiteConfig', 'showSections', { ...current, [sec.key]: !isEnabled });
                      }}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        isEnabled ? 'bg-[#00A1AC]' : 'bg-slate-300'
                      }`}
                    >
                      <span 
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} 
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 8: Website Template Selection */}
        {currentStep === 8 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20">
                <LayoutTemplate className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">Choose Website Template</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Pick a tailored responsive layout for your medical practice</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { id: 'template-1', name: 'Modern Minimal', desc: 'Clean high-contrast layout for solo doctors', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop' },
                { id: 'template-2', name: 'Premium Care', desc: 'Rich aesthetic for specialized clinical centers', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop' },
                { id: 'template-3', name: 'Family Health', desc: 'Warm, approachable design for family clinics', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop' }
              ].map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => updateForm('websiteConfig', 'templateId', t.id)} 
                  className={`cursor-pointer rounded-3xl overflow-hidden border-2 transition-all p-2 flex flex-col justify-between ${
                    formData.websiteConfig.templateId === t.id 
                      ? 'border-[#00A1AC] bg-[#00A1AC]/10 shadow-xl shadow-[#00A1AC]/20 ring-2 ring-[#00A1AC]' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 relative">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    {formData.websiteConfig.templateId === t.id && (
                      <span className="absolute top-3 right-3 bg-[#00A1AC] text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="font-black text-sm text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={handlePrev} className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer">Back</button>
              <button onClick={handleNext} className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs cursor-pointer active:scale-95">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 9: Live Preview (Enlarged Single Viewport Layout with Clean White Card) */}
        {currentStep === 9 && (
          <div className="w-full rounded-3xl border border-white/50 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-2xl relative overflow-hidden text-slate-900 animate-in fade-in duration-300 flex flex-col justify-between">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-[#00A1AC]/10 border border-[#00A1AC]/20 text-[#00A1AC] flex items-center justify-center shrink-0 shadow-md">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  Review & Live Website Preview
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                  Inspect how your clinic landing page, OPD schedule, and booking CTA appear to patients
                </p>
              </div>
            </div>

            {/* Mockup Browser Frame */}
            <div className="w-full rounded-2xl border border-slate-300 bg-slate-900 shadow-2xl overflow-hidden text-slate-100 font-sans mb-3">
              {/* Browser Top Bar */}
              <div className="flex items-center justify-between py-2 px-5 bg-slate-950 rounded-t-2xl border-b border-slate-800 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                </div>

                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 py-1 px-4 rounded-full text-xs font-medium tracking-wide text-slate-300 font-mono shadow-inner max-w-md w-full justify-center truncate">
                  <Globe className="w-3.5 h-3.5 text-[#00A1AC] shrink-0" />
                  <span className="truncate">https://docpulse.com/{formData.clinicDetails.slug || "your-clinic"}</span>
                  <span className="text-[10px] bg-[#00A1AC]/30 text-[#00A1AC] px-1.5 py-0.2 rounded font-sans font-bold uppercase shrink-0">Live</span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Preview</span>
                </div>
              </div>

              {/* Mockup Canvas Body */}
              <div className="p-5 sm:p-6 space-y-4 bg-slate-100 text-slate-900">
                {/* Mini Navbar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0" 
                      style={{ backgroundColor: formData.websiteConfig.primaryColor || '#00A1AC' }}
                    >
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">{formData.clinicDetails.name || "Clinic Name"}</h4>
                      <p className="text-xs text-slate-500">{formData.clinicDetails.city || "City"}, India</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    className={`text-xs font-semibold py-2 px-4 rounded-xl text-white shadow-md transition-all ${formData.websiteConfig.buttonStyle || 'rounded-xl'}`}
                    style={{ backgroundColor: formData.websiteConfig.primaryColor || '#00A1AC' }}
                  >
                    Book Consultation
                  </button>
                </div>

                {/* Hero Practice Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Left Column */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00A1AC]/30 bg-[#00A1AC]/10 flex items-center justify-center shrink-0">
                          {formData.doctorProfile.profilePhoto ? (
                            <img src={formData.doctorProfile.profilePhoto} alt="Doctor" className="w-full h-full object-cover object-top" />
                          ) : (
                            <UserCircle className="w-8 h-8 text-[#00A1AC]" />
                          )}
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold py-0.5 px-2.5 rounded-full uppercase bg-[#00A1AC]/10 text-[#006e76] border border-[#00A1AC]/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00A1AC]" /> Verified Practice
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                            {formData.clinicDetails.name || "Noori Clinic"}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900 font-bold">{getDisplayDoctorName(formData.doctorProfile.fullName)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#006e76] font-bold">{formData.doctorProfile.specialization || "Cardiologist"}</span>
                        {formData.doctorProfile.qualification && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 text-xs">{formData.doctorProfile.qualification}</span>
                          </>
                        )}
                      </p>

                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <button 
                          type="button"
                          className={`py-2 px-4 text-xs font-bold rounded-xl text-white shadow-md flex items-center gap-1.5 ${formData.websiteConfig.buttonStyle || 'rounded-xl'}`}
                          style={{ backgroundColor: formData.websiteConfig.primaryColor || '#00A1AC' }}
                        >
                          <span>Book Appointment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        
                        <button 
                          type="button"
                          className="py-2 px-4 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#00A1AC]" />
                          <span>Call Clinic</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shrink-0 md:min-w-[210px] shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Consultation Fee</span>
                        <span className="text-2xl font-black text-[#00A1AC] block mt-0.5">
                          ₹{formData.services?.[0]?.price || "500"}
                        </span>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Location</span>
                        <span className="text-xs font-medium text-slate-700 leading-normal flex items-center gap-1.5 mt-0.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#00A1AC] shrink-0" />
                          <span className="truncate">{formData.clinicDetails.city || "Patna"}, India</span>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Helpline</span>
                        <span className="text-xs font-medium text-slate-700 leading-normal font-mono block mt-0.5 truncate">
                          {formData.clinicDetails.phone || "+91 9999999999"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Split Grid (Services & OPD Schedule) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Consultation Services Box */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#00A1AC]" />
                        Consultation Services
                      </h4>
                      <span className="text-xs font-bold text-[#006e76] bg-[#00A1AC]/10 border border-[#00A1AC]/20 px-2.5 py-0.5 rounded-full">
                        {formData.services?.length || 1} Services
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(formData.services || []).slice(0, 2).map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" /> {s.durationMins || "15"} Mins
                            </p>
                          </div>
                          <span className="text-sm font-bold py-1 px-3 text-[#006e76] bg-[#00A1AC]/10 border border-[#00A1AC]/20 rounded-lg">
                            ₹{s.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OPD Consultation Hours Box */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-[#00A1AC]" />
                        OPD Consultation Hours
                      </h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Live Sync
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                        const dayData = formData.availability?.find(d => d.dayOfWeek === idx);
                        const isOpen = dayData ? dayData.isOpen : idx !== 0;
                        const times = dayData && isOpen ? `${dayData.startTime}-${dayData.endTime}` : "09:00-17:00";
                        return (
                          <div key={dayName} className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200/60">
                            <span>{dayName}</span>
                            {isOpen ? (
                              <span className="font-mono font-bold text-[#006e76] truncate">{times}</span>
                            ) : (
                              <span className="text-rose-600 font-bold">Closed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button 
                onClick={handlePrev} 
                className="bg-slate-100 hover:bg-slate-200 text-[#006e76] font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-all text-xs sm:text-sm cursor-pointer"
              >
                ← Back
              </button>
              
              <button 
                onClick={handleNext} 
                className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#00A1AC]/30 transition-all text-xs sm:text-sm cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Choose Plan & Finish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 10 (FINAL STEP): White-Card Modern Layout with Exact PDF Specs & 14-Day Free Trial */}
        {currentStep === 10 && (
          <div className="w-full flex flex-col justify-between animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
              <h2 className="font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                Select Your Subscription Plan
              </h2>
              
              <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                Choose the right practice tier for your clinic. Upgrade, downgrade, or cancel anytime.
              </p>

              {/* Pill Billing Switcher Toggle */}
              <div className="inline-flex bg-white/95 p-1.5 rounded-full border border-white/40 mt-3 shadow-xl items-center">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === "MONTHLY"
                      ? "bg-[#00A1AC] text-white shadow-md font-bold"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === "YEARLY"
                      ? "bg-[#00A1AC] text-white shadow-md font-bold"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Yearly Billing</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Modern White Pricing Cards with Larger Size & Highlighting */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-4 max-w-6xl mx-auto w-full">
              {modernWhitePlans.map((p) => {
                const isSelected = selectedPlanCode === p.planId || (p.planId === "BASIC" && selectedPlanCode === "STARTER");
                const price = billingCycle === "YEARLY" ? p.priceYearly : p.priceMonthly;
                const isFreeTrial = p.planId === "BASIC" || p.planId === "STARTER";

                return (
                  <div
                    key={p.planId}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        plan: {
                          planId: p.planId,
                          price,
                          billingCycle,
                          isTrial: isFreeTrial,
                        },
                      }))
                    }
                    className={`bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border flex flex-col justify-between transition-all duration-200 relative cursor-pointer min-h-[520px] ${
                      isSelected
                        ? "border-2 border-[#00A1AC] ring-4 ring-[#00A1AC]/25 shadow-2xl shadow-[#00A1AC]/30 scale-[1.02] z-10"
                        : p.isPopular
                        ? "border-2 border-slate-900 shadow-2xl scale-[1.01]"
                        : isFreeTrial
                        ? "border-2 border-emerald-500/60 shadow-xl"
                        : "border-white/70 hover:border-[#00A1AC]/40 hover:shadow-2xl"
                    }`}
                  >
                    {/* Top Pinned High-Contrast Badge */}
                    {p.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className={`text-[11px] px-4 py-1 rounded-full shadow-lg border uppercase tracking-wider block font-black ${p.badgeClass}`}>
                          {p.badge}
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Title & Subtitle */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{p.name}</h3>
                          {isSelected && (
                            <span className="text-xs font-bold text-white bg-[#00A1AC] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.subtitle}</p>
                      </div>

                      {/* Price Header */}
                      <div className="py-2 border-b border-slate-100 flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{price}</span>
                        <span className="text-xs font-semibold text-slate-400">/mo</span>
                        {billingCycle === "YEARLY" && (
                          <span className="text-xs text-emerald-600 font-bold ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
                            ₹{price * 12}/yr
                          </span>
                        )}
                      </div>

                      {/* Action CTA Button */}
                      <div>
                        {isSelected ? (
                          <button
                            type="button"
                            className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#00A1AC] hover:bg-[#008790] text-white shadow-lg shadow-[#00A1AC]/30 transition-all active:scale-95 cursor-pointer"
                          >
                            Selected Plan ✓
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-[#00A1AC] hover:text-white text-[#006e76] border border-slate-200 transition-all active:scale-95 cursor-pointer"
                          >
                            {p.planId === "BASIC" ? "Select Free Trial" : "Get Started"}
                          </button>
                        )}
                      </div>

                      {/* Features Checklist with Circular Green Checkmarks */}
                      <div className="pt-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                          FEATURES INCLUDED:
                        </span>
                        <ul className="space-y-2">
                          {p.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-tight">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar with Enhanced Back Button */}
            <div className="bg-white/95 backdrop-blur-md border border-white/60 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl mt-2 text-slate-900 max-w-6xl mx-auto w-full">
              <button
                type="button"
                onClick={handlePrev}
                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold px-7 py-3 rounded-2xl border border-slate-300 transition-all text-xs sm:text-sm shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700 stroke-[2.5]" />
                <span>Back to Preview</span>
              </button>

              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-600 hidden md:inline font-medium">
                  {isBasicSelected ? "✨ 14-Day Free Evaluation included • No Credit Card Required" : "🔒 100% Encrypted & Instant Setup"}
                </span>

                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  disabled={saving}
                  className="bg-[#00A1AC] hover:bg-[#008790] active:bg-[#006e76] text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-[#00A1AC]/35 text-xs sm:text-sm transition-all flex items-center gap-2 active:scale-95 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBasicSelected ? "Activating 14-Day Free Trial..." : "Processing & Launching..."}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isBasicSelected
                          ? "Start 14-Day Free Trial & Launch Website →"
                          : "Proceed to Payment & Launch →"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

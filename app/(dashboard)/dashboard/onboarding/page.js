"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, Sparkles, Building, UserCircle, 
  Stethoscope, Clock, Clock3, LayoutTemplate, Palette, Globe, Play, ArrowRight, ShieldCheck,
  Zap, Check, ExternalLink, Sliders, MapPin, Phone, Mail, Award, Plus, Trash2
} from "lucide-react";

const getDisplayDoctorName = (name) => {
  if (!name) return "Dr. Doctor";
  const stripped = name.replace(/^Dr\.?\s*/i, "").trim();
  return `Dr. ${stripped}`;
};

export default function OnboardingWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successSlug, setSuccessSlug] = useState("");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [availablePlans, setAvailablePlans] = useState([]);

  const [formData, setFormData] = useState({
    plan: { planId: "PRO", billingCycle: "MONTHLY", price: 1299 },
    doctorProfile: { fullName: "", qualification: "", specialization: "", experienceYrs: "", regNumber: "", bio: "" },
    clinicDetails: { name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", slug: "" },
    services: [
      { name: "General Consultation", description: "Standard clinical examination and prescription", price: "500", durationMins: "15" },
      { name: "Follow-up Checkup", description: "Post-treatment routine review", price: "300", durationMins: "15" }
    ],
    availability: [
      { dayOfWeek: 0, isOpen: false, startTime: "09:00", endTime: "17:00" }, // Sunday
      { dayOfWeek: 1, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, isOpen: true, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 6, isOpen: true, startTime: "09:00", endTime: "17:00" }, // Saturday
    ],
    websiteConfig: {
      templateId: "template-1",
      primaryColor: "#0f766e",
      fontStyle: "Plus Jakarta Sans",
      buttonStyle: "rounded-full",
      showSections: { about: true, services: true, timings: true, contact: true }
    }
  });

  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const [wizardRes, plansRes] = await Promise.all([
          fetch("/api/onboarding/wizard"),
          fetch("/api/plans")
        ]);

        const [wizardJson, plansJson] = await Promise.all([
          wizardRes.json(),
          plansRes.json()
        ]);

        if (plansJson.success && plansJson.plans?.length > 0) {
          setAvailablePlans(plansJson.plans);
        }

        if (wizardJson.success && wizardJson.data) {
          const { user, clinic, doctorProfile, services, availability, websiteConfig, subscription } = wizardJson.data;
          
          if (user?.hasCompletedOnboarding) {
            router.push("/dashboard");
            return;
          }

          setFormData(prev => ({
            ...prev,
            plan: subscription || prev.plan,
            doctorProfile: doctorProfile || { ...prev.doctorProfile, fullName: user?.name ? getDisplayDoctorName(user.name) : "" },
            clinicDetails: clinic || { ...prev.clinicDetails, email: user?.email || "", phone: user?.phone || "" },
            services: services?.length > 0 ? services : prev.services,
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
      const submissionPayload = {
        ...formData,
        plan: {
          ...formData.plan,
          billingCycle
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e]">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white flex items-center justify-center p-6 font-sans">
        <div className="rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur-2xl p-8 sm:p-14 shadow-2xl max-w-xl w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-3xl bg-teal-400/20 border border-teal-300/40 p-4 inline-flex items-center justify-center text-teal-300 mb-6 shadow-xl">
            <Sparkles className="w-10 h-10 text-teal-300" />
          </div>

          <div className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase mb-4">
            🎉 Setup Completed & Verified
          </div>

          <h1 className="font-black text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Your Clinic Website is Live!
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-8">
            Congratulations! Patients can now visit your verified portal, review your medical services, and book appointments online 24/7.
          </p>

          <div className="bg-black/30 border border-white/15 p-4 rounded-2xl mb-8 flex items-center justify-between text-left">
            <div className="min-w-0 pr-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Website URL</span>
              <span className="font-bold text-teal-300 text-sm truncate block">
                {typeof window !== "undefined" ? window.location.origin : ""}/{successSlug}
              </span>
            </div>
            <a
              href={`/${successSlug}`}
              target="_blank"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0 transition-colors"
              title="Open Public Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`/${successSlug}`}
              target="_blank"
              className="w-full sm:w-auto bg-teal-400 hover:bg-teal-300 text-[#081e2b] font-black px-8 py-3.5 rounded-full shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Globe className="w-4 h-4" /> Visit Website
            </a>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-8 py-3.5 rounded-full transition-all text-sm"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans antialiased bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white flex flex-col justify-between selection:bg-teal-400 selection:text-[#0a2635]">
      {/* 1. Header Progress Bar */}
      <header className="w-full px-6 sm:px-12 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5 font-black text-white tracking-tight text-lg">
            <Stethoscope className="w-6 h-6 text-teal-300" />
            <span>DocPulse Clinic Setup</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-xs text-teal-200 bg-white/10 px-3.5 py-1 rounded-full border border-white/10">
              Step {currentStep} of 10
            </span>
            <div className="bg-white/10 border border-white/10 h-2.5 w-28 sm:w-44 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-300 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Step Content Container */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 my-auto">
        
        {/* STEP 1: Welcome */}
        {currentStep === 1 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-14 shadow-2xl text-center relative overflow-hidden animate-in fade-in duration-300">
            <div className="rounded-3xl bg-teal-400/20 border border-teal-300/30 p-5 inline-flex text-teal-300 mb-6 shadow-inner">
              <Sparkles className="w-12 h-12" />
            </div>
            <h1 className="font-black text-3xl sm:text-4xl text-white tracking-tight mb-3">
              Welcome to DocPulse
            </h1>
            <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed mb-8 font-medium">
              Let&apos;s build and configure your professional clinic website in 10 quick steps. You&apos;ll set up your doctor profile, OPD hours, medical services, design theme, and select your subscription tier.
            </p>
            <button 
              onClick={handleNext} 
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-400 hover:bg-teal-300 text-[#081e2b] px-10 py-4 text-sm font-black shadow-xl shadow-teal-500/20 transition-all hover:scale-105"
            >
              <span>Begin Setup</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: Doctor Profile */}
        {currentStep === 2 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                <UserCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white tracking-tight">Doctor Profile</h2>
                <p className="text-xs text-slate-300">Enter your medical credentials and clinical biography</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Doctor Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Jane Smith" 
                  value={formData.doctorProfile.fullName} 
                  onChange={e => updateForm('doctorProfile', 'fullName', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Medical Qualification</label>
                <input 
                  type="text" 
                  placeholder="e.g. MBBS, MD, MS" 
                  value={formData.doctorProfile.qualification} 
                  onChange={e => updateForm('doctorProfile', 'qualification', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Specialization</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cardiologist / General Physician" 
                  value={formData.doctorProfile.specialization} 
                  onChange={e => updateForm('doctorProfile', 'specialization', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Years of Experience</label>
                <input 
                  type="number" 
                  placeholder="e.g. 8" 
                  value={formData.doctorProfile.experienceYrs} 
                  onChange={e => updateForm('doctorProfile', 'experienceYrs', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Medical Registration Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. MCI-294829" 
                  value={formData.doctorProfile.regNumber} 
                  onChange={e => updateForm('doctorProfile', 'regNumber', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Short Clinical Bio</label>
                <textarea 
                  placeholder="Tell patients about your expertise, background, and patient care philosophy..." 
                  rows={3} 
                  value={formData.doctorProfile.bio} 
                  onChange={e => updateForm('doctorProfile', 'bio', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 p-4 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Clinic Details & Slug */}
        {currentStep === 3 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white tracking-tight">Clinic Details & Public URL</h2>
                <p className="text-xs text-slate-300">Location, patient coordinates, and custom website slug</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Clinic Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Heart & Dental Center" 
                  value={formData.clinicDetails.name} 
                  onChange={e => updateForm('clinicDetails', 'name', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Public Website URL Slug</label>
                <div className="flex items-center rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5">
                  <span className="text-slate-400 font-mono text-xs pr-1">/</span>
                  <input 
                    type="text" 
                    placeholder="my-clinic" 
                    value={formData.clinicDetails.slug} 
                    onChange={e => updateForm('clinicDetails', 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))} 
                    className="w-full bg-transparent text-teal-300 font-bold focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Contact Phone *</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210" 
                  value={formData.clinicDetails.phone} 
                  onChange={e => updateForm('clinicDetails', 'phone', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Contact Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. clinic@example.com" 
                  value={formData.clinicDetails.email} 
                  onChange={e => updateForm('clinicDetails', 'email', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Street Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. 45 Park Avenue, Healthcare Hub" 
                  value={formData.clinicDetails.address} 
                  onChange={e => updateForm('clinicDetails', 'address', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">City</label>
                <input 
                  type="text" 
                  placeholder="e.g. New Delhi" 
                  value={formData.clinicDetails.city} 
                  onChange={e => updateForm('clinicDetails', 'city', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-2">Pincode</label>
                <input 
                  type="text" 
                  placeholder="e.g. 110001" 
                  value={formData.clinicDetails.pincode} 
                  onChange={e => updateForm('clinicDetails', 'pincode', e.target.value)} 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Services & Consultation Fees */}
        {currentStep === 4 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-black text-2xl text-white tracking-tight">Services & Consultation Fees</h2>
                  <p className="text-xs text-slate-300">List the services and fees displayed on your website booking engine</p>
                </div>
              </div>
              <button 
                onClick={() => setFormData(p => ({...p, services: [...p.services, { name: "", description: "Standard Consultation", price: "500", durationMins: "15" }] }))} 
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0a2635] bg-teal-400 hover:bg-teal-300 px-4 py-2 rounded-full transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {formData.services.map((s, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <input 
                    type="text" 
                    placeholder="Service Name (e.g. Dental Checkup)" 
                    value={s.name} 
                    onChange={e => {
                      const newArr = [...formData.services];
                      newArr[idx].name = e.target.value;
                      setFormData({...formData, services: newArr});
                    }} 
                    className="flex-1 w-full sm:w-auto rounded-xl bg-black/20 border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-400" 
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                      <input 
                        type="number" 
                        placeholder="Fee" 
                        value={s.price} 
                        onChange={e => {
                          const newArr = [...formData.services];
                          newArr[idx].price = e.target.value;
                          setFormData({...formData, services: newArr});
                        }} 
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-black/20 border border-white/15 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-teal-400" 
                      />
                    </div>
                    <div className="relative w-24">
                      <input 
                        type="number" 
                        placeholder="Mins" 
                        value={s.durationMins} 
                        onChange={e => {
                          const newArr = [...formData.services];
                          newArr[idx].durationMins = e.target.value;
                          setFormData({...formData, services: newArr});
                        }} 
                        className="w-full px-3 py-2.5 rounded-xl bg-black/20 border border-white/15 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-teal-400" 
                      />
                    </div>
                    {formData.services.length > 1 && (
                      <button 
                        onClick={() => {
                          const newArr = formData.services.filter((_, i) => i !== idx);
                          setFormData({...formData, services: newArr});
                        }}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 5: OPD Timings / Weekly Schedule */}
        {currentStep === 5 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white tracking-tight">OPD Timings & Availability</h2>
                <p className="text-xs text-slate-300">Configure your active consultation days and appointment slot hours</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => {
                const day = formData.availability.find(d => d.dayOfWeek === idx) || { dayOfWeek: idx, isOpen: false, startTime: "09:00", endTime: "17:00" };
                return (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between py-2 px-4 rounded-2xl border transition-all ${!day.isOpen ? 'bg-black/20 border-white/5' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <span className="text-xs font-bold text-white w-24">{dayName}</span>
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
                          day.isOpen ? 'bg-teal-400' : 'bg-slate-500'
                        }`}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                            day.isOpen ? 'translate-x-5' : 'translate-x-0'
                          }`} 
                        />
                      </button>
                      <span className={`text-[11px] font-bold ${day.isOpen ? 'text-teal-300' : 'text-slate-400'}`}>
                        {day.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    {day.isOpen && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="time" 
                          value={day.startTime} 
                          onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).startTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} 
                          className="py-1.5 px-3 text-xs rounded-xl bg-black/30 border border-white/15 text-white font-bold focus:outline-none focus:ring-1 focus:ring-teal-400" 
                        />
                        <span className="text-slate-400 font-bold text-xs">to</span>
                        <input 
                          type="time" 
                          value={day.endTime} 
                          onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).endTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} 
                          className="py-1.5 px-3 text-xs rounded-xl bg-black/30 border border-white/15 text-white font-bold focus:outline-none focus:ring-1 focus:ring-teal-400" 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 6: Branding & Colors */}
        {currentStep === 6 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                <Palette className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white tracking-tight">Branding & Color Theme</h2>
                <p className="text-xs text-slate-300">Select accent palette and button styles for your public portal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] mb-3">Primary Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'Ocean Teal', hex: '#0f766e' },
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
                        className={`h-10 w-10 rounded-full transition-transform flex items-center justify-center ${formData.websiteConfig.primaryColor === color.hex ? 'ring-4 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105 shadow-sm'}`} 
                      >
                        {formData.websiteConfig.primaryColor === color.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] mb-3">CTA Button Style</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'rounded-full', label: 'Pill (Full)' },
                      { id: 'rounded-xl', label: 'Soft (XL)' },
                      { id: 'rounded-none', label: 'Sharp' }
                    ].map(style => (
                      <button 
                        key={style.id} 
                        onClick={() => updateForm('websiteConfig', 'buttonStyle', style.id)}
                        className={`flex-1 py-3 px-4 border font-bold text-xs transition-all ${style.id} ${formData.websiteConfig.buttonStyle === style.id ? 'border-teal-400 bg-teal-400/20 text-teal-200 shadow-md' : 'border-white/10 bg-black/20 text-slate-300 hover:border-white/30'}`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Live Button & Color Preview</p>
                <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xs text-slate-900 space-y-3">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-black" style={{ backgroundColor: formData.websiteConfig.primaryColor }}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-base">{getDisplayDoctorName(formData.doctorProfile.fullName)}</h4>
                    <p className="text-xs font-bold text-slate-500">{formData.doctorProfile.specialization || "Medical Specialist"}</p>
                  </div>
                  <button 
                    className={`w-full py-3 text-white font-black text-xs shadow-md transition-all ${formData.websiteConfig.buttonStyle}`} 
                    style={{ backgroundColor: formData.websiteConfig.primaryColor }}
                  >
                    Book Appointment →
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 7: Website Sections Toggle */}
        {currentStep === 7 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                <Sliders className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white tracking-tight">Website Sections Configuration</h2>
                <p className="text-xs text-slate-300">Choose which informational modules appear on your public landing page</p>
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
                  <div key={sec.key} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{sec.label}</h4>
                      <p className="text-[11px] text-slate-300 font-medium">{sec.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.websiteConfig?.showSections || { about: true, services: true, timings: true, contact: true };
                        updateForm('websiteConfig', 'showSections', { ...current, [sec.key]: !isEnabled });
                      }}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        isEnabled ? 'bg-teal-400' : 'bg-slate-500'
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

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 8: Website Template Selection */}
        {currentStep === 8 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 text-teal-300">
                <LayoutTemplate className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white tracking-tight">Choose Website Template</h2>
                <p className="text-xs text-slate-300">Pick a tailored responsive layout for your medical practice</p>
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
                      ? 'border-teal-400 bg-white/15 shadow-xl shadow-teal-500/20' 
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="h-40 rounded-2xl overflow-hidden bg-black/20 relative">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity" />
                    {formData.websiteConfig.templateId === t.id && (
                      <span className="absolute top-3 right-3 bg-teal-400 text-[#081e2b] font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="font-black text-sm text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button onClick={handlePrev} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2">Back</button>
              <button onClick={handleNext} className="bg-white hover:bg-slate-100 text-[#0a2635] font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {/* STEP 9: Live Preview */}
        {currentStep === 9 && (
          <div className="rounded-[2.5rem] bg-[#0a202c] border border-[#133748] p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#0b3342] border border-[#164e63] text-[#2dd4bf]">
                <Play className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-extrabold text-2xl text-white tracking-tight">Review & Live Website Preview</h2>
                <p className="text-xs text-[#62879a]">Inspect how your clinic landing page, OPD schedule, and booking call-to-action will appear to patients</p>
              </div>
            </div>

            {/* Interactive Mini-Browser / Webpage Mockup Canvas */}
            <div className="w-full rounded-2xl border border-[#163c4e] bg-[#06151f] shadow-2xl overflow-hidden text-slate-100 font-sans">
              
              {/* Window Frame Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0a202c] border-b border-[#133748] select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                </div>

                <div className="flex items-center gap-2 bg-[#06151f] border border-[#163c4e] px-4 py-1.5 rounded-full text-xs text-slate-300 font-mono shadow-inner max-w-md w-full justify-center truncate">
                  <Globe className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                  <span className="truncate">https://docpulse.com/{formData.clinicDetails.slug || "your-clinic"}</span>
                  <span className="text-[10px] bg-[#0d3443] text-[#2dd4bf] px-1.5 py-0.2 rounded font-sans font-bold uppercase shrink-0">Live</span>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Preview</span>
                </div>
              </div>

              {/* Webpage Mockup Canvas Body */}
              <div className="p-6 sm:p-8 space-y-8 bg-gradient-to-b from-[#0a202c]/60 to-[#06151f]">
                
                {/* Mockup Clinic Navbar */}
                <div className="flex items-center justify-between pb-5 border-b border-[#133748]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: formData.websiteConfig.primaryColor || '#0f766e' }}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white tracking-tight">{formData.clinicDetails.name || "Clinic Name"}</h4>
                      <p className="text-[11px] text-[#62879a]">{formData.clinicDetails.city || "City"}, India</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    className={`px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${formData.websiteConfig.buttonStyle || 'rounded-full'}`}
                    style={{ backgroundColor: formData.websiteConfig.primaryColor || '#0f766e' }}
                  >
                    Book Consultation
                  </button>
                </div>

                {/* Webpage Hero Section Preview */}
                <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#063b36] text-[#2dd4bf] border border-[#0d5952]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Medical Practice
                      </div>
                      
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {formData.clinicDetails.name || "Noori Clinic"}
                      </h3>
                      
                      <p className="text-sm font-semibold text-slate-300 flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold">{getDisplayDoctorName(formData.doctorProfile.fullName)}</span>
                        <span className="text-[#3b6072]">•</span>
                        <span className="text-[#2dd4bf] font-bold">{formData.doctorProfile.specialization || "Cardiologist"}</span>
                        {formData.doctorProfile.qualification && (
                          <>
                            <span className="text-[#3b6072]">•</span>
                            <span className="text-slate-400 text-xs">{formData.doctorProfile.qualification}</span>
                          </>
                        )}
                      </p>

                      {formData.doctorProfile.bio && (
                        <p className="text-xs text-[#62879a] max-w-xl leading-relaxed">
                          {formData.doctorProfile.bio}
                        </p>
                      )}

                      {/* Quick Action Buttons Mockup */}
                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <button 
                          type="button"
                          className={`px-6 py-3 text-xs font-black text-white shadow-lg transition-all flex items-center gap-2 ${formData.websiteConfig.buttonStyle || 'rounded-full'}`}
                          style={{ backgroundColor: formData.websiteConfig.primaryColor || '#0f766e' }}
                        >
                          <span>Book Appointment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        
                        <button 
                          type="button"
                          className="px-5 py-3 text-xs font-bold text-slate-200 bg-[#0d2a38] hover:bg-[#12394c] border border-[#1c485d] rounded-full transition-all flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#2dd4bf]" />
                          <span>Call Clinic</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Highlights Bar */}
                    <div className="bg-[#06151f] border border-[#163c4e] rounded-2xl p-5 space-y-4 shrink-0 min-w-[220px]">
                      <div>
                        <span className="text-[10px] font-bold text-[#62879a] uppercase tracking-wider block">Consultation Fee</span>
                        <span className="text-xl font-black text-[#facc15]">
                          ₹{formData.services?.[0]?.price || "500"}
                        </span>
                      </div>
                      
                      <div className="pt-3 border-t border-[#163c4e]">
                        <span className="text-[10px] font-bold text-[#62879a] uppercase tracking-wider block">Clinic Location</span>
                        <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                          <span className="truncate">{formData.clinicDetails.address || "Patliputra"}, {formData.clinicDetails.city || "Patna"}</span>
                        </span>
                      </div>

                      <div className="pt-3 border-t border-[#163c4e]">
                        <span className="text-[10px] font-bold text-[#62879a] uppercase tracking-wider block">Helpline Number</span>
                        <span className="text-xs font-mono font-bold text-slate-200 block mt-0.5">
                          {formData.clinicDetails.phone || "+91 9999999999"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services & Schedule Sneak-Peek (2 Column Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Services Sneak-Peek */}
                  <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#2dd4bf]" />
                        Consultation Services
                      </h4>
                      <span className="text-[10px] font-black text-[#2dd4bf] bg-[#0d3443] px-2.5 py-0.5 rounded-full">
                        {formData.services?.length || 1} Services
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(formData.services || []).slice(0, 3).map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#06151f] border border-[#163c4e]">
                          <div>
                            <p className="text-xs font-bold text-white">{s.name}</p>
                            <p className="text-[10px] text-[#62879a] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {s.durationMins || "15"} Mins Duration
                            </p>
                          </div>
                          <span className="text-xs font-black text-[#2dd4bf] bg-[#0d3443] border border-[#164e63] px-2.5 py-1 rounded-lg">
                            ₹{s.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule Sneak-Peek */}
                  <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-[#2dd4bf]" />
                        OPD Consultation Hours
                      </h4>
                      <span className="text-[10px] font-black text-emerald-400 bg-[#063b36] px-2.5 py-0.5 rounded-full">
                        Live Sync
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto hide-scrollbar">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => {
                        const dayData = formData.availability?.find(d => d.dayOfWeek === idx);
                        const isOpen = dayData ? dayData.isOpen : idx !== 0;
                        const times = dayData && isOpen ? `${dayData.startTime} - ${dayData.endTime}` : "09:00 - 17:00";
                        return (
                          <div key={dayName} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-[#06151f]/60">
                            <span className="font-semibold text-slate-300">{dayName}</span>
                            {isOpen ? (
                              <span className="font-mono font-bold text-[#2dd4bf]">{times}</span>
                            ) : (
                              <span className="text-[11px] text-rose-400 italic">Closed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Step 9 Footer Navigation */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button 
                onClick={handlePrev} 
                className="text-xs font-bold text-slate-300 hover:text-white px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                ← Back
              </button>
              
              <button 
                onClick={handleNext} 
                className="bg-[#00c9a7] hover:bg-[#00b596] text-[#051a24] font-black text-xs px-8 py-3.5 rounded-full shadow-lg shadow-[#00c9a7]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Choose Plan & Finish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 10 (FINAL STEP): Choose Your Plan */}
        {currentStep === 10 && (
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-teal-400/20 text-teal-300 border border-teal-300/30 mb-3">
                Final Step 10 of 10
              </div>
              <h2 className="font-black text-3xl sm:text-4xl text-white tracking-tight">Choose Your Plan</h2>
              <p className="text-sm text-slate-200 mt-2 font-medium">Select a subscription plan that fits your clinic&apos;s needs.</p>

              {/* Monthly / Yearly Billing Toggle */}
              <div className="inline-flex bg-black/30 p-1.5 rounded-full border border-white/15 mt-6">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    billingCycle === "MONTHLY" ? "bg-teal-400 text-[#081e2b] shadow-md" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    billingCycle === "YEARLY" ? "bg-teal-400 text-[#081e2b] shadow-md" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-black">Save 20%</span>
                </button>
              </div>
            </div>

            {/* 3 Dynamic Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {(availablePlans.length > 0
                ? availablePlans
                : [
                    { planId: "starter", name: "Starter", priceMonthly: 499, priceYearly: 399, isPopular: false, description: "For solo practitioners" },
                    { planId: "pro", name: "Pro", priceMonthly: 1299, priceYearly: 999, isPopular: true, description: "Complete clinic automation" },
                    { planId: "premium", name: "Premium", priceMonthly: 2999, priceYearly: 2499, isPopular: false, description: "Multi-doctor custom domains" }
                  ]
              ).map((p) => {
                const planCode = p.planId.toUpperCase();
                const isSelected = formData.plan.planId === planCode || (formData.plan.planId === "PROFESSIONAL" && planCode === "PRO");
                const price = billingCycle === "YEARLY" ? p.priceYearly || Math.round(p.priceMonthly * 0.8) : p.priceMonthly;

                return (
                  <div
                    key={p.planId}
                    onClick={() => setFormData(prev => ({ ...prev, plan: { planId: planCode, price, billingCycle } }))}
                    className={`rounded-3xl p-6 cursor-pointer transition-all flex flex-col justify-between space-y-5 relative ${
                      isSelected
                        ? "border-2 border-teal-400 bg-white/15 shadow-2xl shadow-teal-500/20 scale-[1.02]"
                        : "border border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    {p.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-400 text-[#081e2b] font-black px-3.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-md">
                        Most Popular
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl text-white">{p.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] font-black text-teal-300 bg-teal-400/20 border border-teal-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-3xl sm:text-4xl font-black text-white">₹{price}</span>
                        <span className="text-xs font-bold text-slate-300"> / mo</span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {p.description || "Clinic online presence and appointments"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-full font-bold text-xs transition-all ${
                          isSelected
                            ? "bg-teal-400 text-[#081e2b] font-black shadow-md"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {isSelected ? "Selected Plan" : "Choose Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final CTA Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                type="button" 
                onClick={handlePrev} 
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 order-2 sm:order-1"
              >
                ← Back to Preview
              </button>

              <button 
                type="button" 
                onClick={handleCompleteOnboarding} 
                disabled={saving} 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-teal-400 hover:bg-teal-300 text-[#081e2b] px-10 py-4 text-sm font-black shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 order-1 sm:order-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publishing Clinic Website...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Launch Clinic Website →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 3. Footer */}
      <footer className="w-full text-center py-4 text-slate-400 text-xs border-t border-white/5 bg-black/10">
        DocPulse SaaS Engine • 100% Encrypted & HIPAA Compliant Data Infrastructure
      </footer>
    </div>
  );
}

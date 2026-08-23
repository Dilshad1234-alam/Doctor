"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ChevronRight, Loader2, Sparkles, Building, UserCircle, 
  Stethoscope, Clock, LayoutTemplate, Palette, Globe, Play, ArrowRight 
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
  const [successSlug, setSuccessSlug] = useState("");

  const [formData, setFormData] = useState({
    plan: { planId: "STARTER", billingCycle: "MONTHLY", price: 499 },
    doctorProfile: { fullName: "", qualification: "", specialization: "", experienceYrs: "", regNumber: "", bio: "" },
    clinicDetails: { name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", slug: "" },
    services: [
      { name: "General Consultation", description: "Standard consultation", price: "500", durationMins: "15" }
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
      primaryColor: "#2563eb",
      fontStyle: "Plus Jakarta Sans",
      buttonStyle: "rounded-2xl",
      showSections: { about: true, services: true, timings: true, contact: true }
    }
  });

  useEffect(() => {
    // Fetch existing state
    const fetchState = async () => {
      try {
        const res = await fetch("/api/onboarding/wizard");
        const json = await res.json();
        if (json.success && json.data) {
          const { user, clinic, doctorProfile, services, availability, websiteConfig, subscription } = json.data;
          
          if (user?.hasCompletedOnboarding) {
            router.push("/dashboard");
            return;
          }

          setFormData(prev => ({
            ...prev,
            plan: subscription || prev.plan,
            doctorProfile: doctorProfile || prev.doctorProfile,
            clinicDetails: clinic || prev.clinicDetails,
            services: services?.length > 0 ? services : prev.services,
            availability: availability?.length > 0 ? availability : prev.availability,
            websiteConfig: websiteConfig || prev.websiteConfig,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchState();
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

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 10));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    const { name, phone } = formData.clinicDetails;
    if (!name || !phone) {
      alert("Clinic Name and Phone are required. Please fill them out in Step 4.");
      setCurrentStep(4);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/onboarding/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setSuccessSlug(json.slug);
        setCurrentStep(10);
      } else {
        alert("Error saving: " + json.error);
      }
    } catch (err) {
      alert("Network error. Please try again.");
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

  return (
    <div className="h-screen max-h-screen overflow-hidden w-full font-sans antialiased bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white flex flex-col justify-between">
      {/* Progress Bar */}
      <div className="w-full px-6 sm:px-12 lg:px-16 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex w-full items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-white tracking-tight">
            <Stethoscope className="w-6 h-6 text-teal-300 drop-shadow-md" /> DocPulse Setup
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-xs text-teal-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">Step {currentStep} of 10</span>
            <div className="bg-white/10 border border-white/10 h-2 w-32 sm:w-48 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-300 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 10) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 py-12 my-auto">
{currentStep === 1 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="rounded-2xl bg-teal-400/20 border border-teal-300/30 p-4 inline-flex text-teal-300 mb-6 shadow-inner">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-4">Welcome to DocPulse</h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-lg mx-auto leading-relaxed mb-10">
              You are just a few steps away from launching your professional clinic website and starting to accept online appointments.
            </p>
            <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Start Setup <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">Choose Your Plan</h2>
            <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-lg mx-auto leading-relaxed mb-8">Select a subscription plan that fits your clinic&apos;s needs.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: "STARTER", name: "Starter", price: 499 },
                { id: "PRO", name: "Pro", price: 1299 },
                { id: "ENTERPRISE", name: "Enterprise", price: 2999 },
              ].map(plan => (
                <div key={plan.id} onClick={() => setFormData(p => ({ ...p, plan: { planId: plan.id, price: plan.price, billingCycle: "MONTHLY" } }))} 
                  className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${formData.plan.planId === plan.id ? 'border-teal-400 bg-white/10 shadow-md' : 'border-white/10 hover:border-teal-400/50'}`}>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="text-3xl font-black my-2">₹{plan.price}<span className="text-sm font-medium text-slate-300">/mo</span></div>
                  {formData.plan.planId === plan.id && <div className="mt-4 flex items-center gap-1 text-sm font-bold text-teal-300"><CheckCircle2 className="w-4 h-4" /> Selected</div>}
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-6">
              <UserCircle className="w-8 h-8 text-teal-300" />
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Doctor Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Full Name (e.g. Dr. John Doe)" value={formData.doctorProfile.fullName} onChange={e => updateForm('doctorProfile', 'fullName', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Qualification (e.g. MBBS, MD)" value={formData.doctorProfile.qualification} onChange={e => updateForm('doctorProfile', 'qualification', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Specialization (e.g. Cardiologist)" value={formData.doctorProfile.specialization} onChange={e => updateForm('doctorProfile', 'specialization', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="number" placeholder="Experience (Years)" value={formData.doctorProfile.experienceYrs} onChange={e => updateForm('doctorProfile', 'experienceYrs', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Medical Registration Number" value={formData.doctorProfile.regNumber} onChange={e => updateForm('doctorProfile', 'regNumber', e.target.value)} className="border border-slate-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-600 outline-none md:col-span-2" />
              <textarea placeholder="Short Bio / Description" rows={3} value={formData.doctorProfile.bio} onChange={e => updateForm('doctorProfile', 'bio', e.target.value)} className="border border-slate-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-600 outline-none md:col-span-2"></textarea>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition-all mt-8">Back</button>
              <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building className="w-8 h-8 text-teal-300" />
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Clinic Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Clinic Name" value={formData.clinicDetails.name} onChange={e => updateForm('clinicDetails', 'name', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Website Slug (e.g. my-clinic)" value={formData.clinicDetails.slug} onChange={e => updateForm('clinicDetails', 'slug', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Phone Number" value={formData.clinicDetails.phone} onChange={e => updateForm('clinicDetails', 'phone', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="email" placeholder="Email Address" value={formData.clinicDetails.email} onChange={e => updateForm('clinicDetails', 'email', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Full Address" value={formData.clinicDetails.address} onChange={e => updateForm('clinicDetails', 'address', e.target.value)} className="border border-slate-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-600 outline-none md:col-span-2" />
              <input type="text" placeholder="City" value={formData.clinicDetails.city} onChange={e => updateForm('clinicDetails', 'city', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
              <input type="text" placeholder="Pincode" value={formData.clinicDetails.pincode} onChange={e => updateForm('clinicDetails', 'pincode', e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition-all mt-8">Back</button>
              <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-teal-300" />
                <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Services & Pricing</h2>
              </div>
              <button onClick={() => setFormData(p => ({...p, services: [...p.services, { name: "", price: "", durationMins: "15" }] }))} className="text-sm font-bold text-teal-300 bg-blue-50 px-3 py-1.5 rounded-lg">Add Row</button>
            </div>
            <div className="space-y-4">
              {formData.services.map((s, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <input type="text" placeholder="Service Name" value={s.name} onChange={e => {
                    const newArr = [...formData.services];
                    newArr[idx].name = e.target.value;
                    setFormData({...formData, services: newArr});
                  }} className="flex-1 border border-slate-200 rounded-2xl p-3" />
                  <input type="number" placeholder="Fee (₹)" value={s.price} onChange={e => {
                    const newArr = [...formData.services];
                    newArr[idx].price = e.target.value;
                    setFormData({...formData, services: newArr});
                  }} className="w-32 border border-slate-200 rounded-2xl p-3" />
                  <input type="number" placeholder="Mins" value={s.durationMins} onChange={e => {
                    const newArr = [...formData.services];
                    newArr[idx].durationMins = e.target.value;
                    setFormData({...formData, services: newArr});
                  }} className="w-24 border border-slate-200 rounded-2xl p-3" />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition-all mt-8">Back</button>
              <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="w-full max-w-2xl mx-auto px-5 py-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-teal-300" />
              <h2 className="font-extrabold text-xl text-white tracking-tight">OPD Timings</h2>
            </div>
            <div className="space-y-1">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => {
                const day = formData.availability.find(d => d.dayOfWeek === idx);
                return (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between py-1.5 px-3.5 my-1 rounded-xl border transition-colors ${!day.isOpen ? 'bg-black/20 border-white/5' : 'bg-white/5 border-white/10 hover:border-teal-400/50'}`}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <span className="text-sm font-semibold text-white w-24">{dayName}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            const newArr = [...formData.availability];
                            const di = newArr.findIndex(d => d.dayOfWeek === idx);
                            newArr[di].isOpen = !day.isOpen;
                            setFormData({...formData, availability: newArr});
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            day.isOpen ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span 
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              day.isOpen ? 'translate-x-4' : 'translate-x-0'
                            }`} 
                          />
                        </button>
                        {day.isOpen ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-teal-400/20 px-2 py-0.5 text-xs font-semibold text-teal-300 border border-teal-400/30">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-300">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                    {day.isOpen ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Start Time</label>
                          <input type="time" value={day.startTime} onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).startTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} className="py-1 px-2 text-xs rounded-lg bg-black/20 border border-white/15 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none" />
                        </div>
                        <span className="text-slate-300 font-black mt-3">-</span>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">End Time</label>
                          <input type="time" value={day.endTime} onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).endTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} className="py-1 px-2 text-xs rounded-lg bg-black/20 border border-white/15 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none" />
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex text-xs text-slate-400 italic py-1">Clinic is closed on this day</div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-bold px-6 py-2.5 transition-all mt-3">Back</button>
              <button onClick={handleNext} className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-100 text-[#0a2635] py-2.5 px-6 text-xs font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-6">
              <LayoutTemplate className="w-8 h-8 text-teal-300" />
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Choose Website Template</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'template-1', name: 'Modern Minimal', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop' },
                { id: 'template-2', name: 'Premium Care', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=400&auto=format&fit=crop' },
                { id: 'template-3', name: 'Family Health', image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ce2cb?q=80&w=400&auto=format&fit=crop' }
              ].map((t) => (
                <div key={t.id} onClick={() => updateForm('websiteConfig', 'templateId', t.id)} 
                  className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${formData.websiteConfig.templateId === t.id ? 'border-teal-400 shadow-xl shadow-teal-500/20' : 'border-transparent border-white/10 hover:border-white/20'}`}>
                  <div className="h-48 bg-white/5 relative">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                  <div className={`p-4 text-center font-bold transition-colors ${formData.websiteConfig.templateId === t.id ? 'bg-teal-500 text-white' : 'bg-white/10 text-white'}`}>
                    {t.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition-all mt-8">Back</button>
              <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Palette className="w-8 h-8 text-teal-300" />
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Customize Website</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left items-stretch">
              {/* Controls */}
              <div className="space-y-8 flex flex-col justify-center">
                <div>
                  <label className="font-bold text-slate-200 block mb-4 uppercase text-xs tracking-wider">Primary Color Theme</label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { name: 'Ocean Teal', hex: '#0f766e', accent: '#ccfbf1', text: '#115e59' },
                      { name: 'Clinical Blue', hex: '#2563eb', accent: '#dbeafe', text: '#1e40af' },
                      { name: 'Deep Oceanic', hex: '#0d3b4d', accent: '#e0f2fe', text: '#0369a1' },
                      { name: 'Care Emerald', hex: '#059669', accent: '#d1fae5', text: '#065f46' },
                      { name: 'Gentle Rose', hex: '#e11d48', accent: '#ffe4e6', text: '#9f1239' },
                      { name: 'Royal Indigo', hex: '#4f46e5', accent: '#e0e7ff', text: '#3730a3' }
                    ].map(color => (
                      <button key={color.hex} onClick={() => updateForm('websiteConfig', 'primaryColor', color.hex)} style={{ backgroundColor: color.hex }} title={color.name}
                        className={`h-9 w-9 rounded-full transition-transform cursor-pointer flex items-center justify-center ${formData.websiteConfig.primaryColor === color.hex ? 'ring-4 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105 shadow-sm'}`} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-200 block mb-4 uppercase text-xs tracking-wider">Button Style</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'rounded-xl', label: 'Soft (xl)' },
                      { id: 'rounded-full', label: 'Pill (full)' },
                      { id: 'rounded-none', label: 'Sharp (none)' }
                    ].map(style => (
                      <button key={style.id} onClick={() => updateForm('websiteConfig', 'buttonStyle', style.id)}
                        className={`flex-1 py-3 px-4 border-2 font-bold text-sm transition-all ${style.id} ${formData.websiteConfig.buttonStyle === style.id ? 'border-teal-400 bg-teal-400/20 text-teal-200 shadow-md' : 'border-white/10 bg-black/20 text-slate-300 hover:border-white/30 hover:bg-black/40'}`}>
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Mini Preview Box */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: formData.websiteConfig.primaryColor }}></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: formData.websiteConfig.primaryColor }}></div>
                
                <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider relative z-10">Live Preview</p>
                <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-sm flex flex-col items-center gap-4 border border-slate-100 relative z-10 hover:shadow-3xl transition-shadow duration-500">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: `${formData.websiteConfig.primaryColor}20` }}>
                    <Stethoscope className="w-8 h-8" style={{ color: formData.websiteConfig.primaryColor }} />
                  </div>
                  <div className="text-center mb-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{getDisplayDoctorName(formData.doctorProfile.fullName)}</h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: formData.websiteConfig.primaryColor }}>{formData.doctorProfile.specialization || 'Specialization'}</p>
                  </div>
                  <button className={`w-full py-4 text-white font-bold text-base shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 ${formData.websiteConfig.buttonStyle}`} style={{ backgroundColor: formData.websiteConfig.primaryColor, boxShadow: `0 10px 15px -3px ${formData.websiteConfig.primaryColor}40` }}>
                    Book Appointment <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition-all mt-8">Back</button>
              <button onClick={handleNext} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 9 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Play className="w-8 h-8 text-teal-300" />
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Live Preview</h2>
            </div>
            <div className="w-full h-[500px] bg-white/5 rounded-2xl border-4 border-slate-800 overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-slate-900 text-white">
                  <h3 className="text-3xl font-black" style={{ color: formData.websiteConfig.primaryColor }}>{formData.clinicDetails.name || 'My Clinic'}</h3>
                  <p className="text-white font-medium text-sm mt-1">{getDisplayDoctorName(formData.doctorProfile.fullName)}</p>
                  <button className={`px-6 py-2 text-white ${formData.websiteConfig.buttonStyle}`} style={{ backgroundColor: formData.websiteConfig.primaryColor }}>Book Appointment</button>
               </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition-all mt-8">Back</button>
              <button onClick={handleFinish} disabled={saving} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/5 text-[#0a2635] px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />} Publish Website
              </button>
            </div>
          </div>
        )}

        {currentStep === 10 && (
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-black/30 text-center relative overflow-hidden">
            <div className="rounded-2xl bg-teal-400/20 border border-teal-300/30 p-4 inline-flex text-teal-300 mb-6 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-4">Website Published!</h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-lg mx-auto leading-relaxed mb-10">
              Your clinic is now online. Patients can visit your website and book appointments immediately.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl inline-block mb-10 text-lg font-bold text-slate-800 font-mono">
              {typeof window !== "undefined" ? window.location.origin : ""}/{successSlug}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={`/${successSlug}`} target="_blank" className="bg-teal-500 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                <Globe className="w-5 h-5" /> Visit Website
              </a>
              <button onClick={() => router.push("/dashboard")} className="bg-transparent text-white border-2 border-white/20 font-bold px-8 py-4 rounded-full shadow-sm hover:bg-slate-50 transition-all">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

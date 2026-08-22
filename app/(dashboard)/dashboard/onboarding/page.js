"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ChevronRight, Loader2, Sparkles, Building, UserCircle, 
  Stethoscope, Clock, LayoutTemplate, Palette, Globe, Play 
} from "lucide-react";

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
      buttonStyle: "rounded-xl",
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Globe className="w-6 h-6 text-blue-600" /> DocPulse Setup
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            Step {currentStep} of 10
            <div className="w-48 h-2 bg-slate-100 rounded-full ml-4 overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(currentStep / 10) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">Welcome to DocPulse</h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
              You are just a few steps away from launching your professional clinic website and starting to accept online appointments.
            </p>
            <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              Start Setup <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Choose Your Plan</h2>
            <p className="text-slate-500 mb-8">Select a subscription plan that fits your clinic's needs.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: "STARTER", name: "Starter", price: 499 },
                { id: "PRO", name: "Pro", price: 1299 },
                { id: "ENTERPRISE", name: "Enterprise", price: 2999 },
              ].map(plan => (
                <div key={plan.id} onClick={() => setFormData(p => ({ ...p, plan: { planId: plan.id, price: plan.price, billingCycle: "MONTHLY" } }))} 
                  className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${formData.plan.planId === plan.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="text-3xl font-black my-2">₹{plan.price}<span className="text-sm font-medium text-slate-500">/mo</span></div>
                  {formData.plan.planId === plan.id && <div className="mt-4 flex items-center gap-1 text-sm font-bold text-blue-600"><CheckCircle2 className="w-4 h-4" /> Selected</div>}
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <UserCircle className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-black text-slate-900">Doctor Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Full Name (e.g. Dr. John Doe)" value={formData.doctorProfile.fullName} onChange={e => updateForm('doctorProfile', 'fullName', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Qualification (e.g. MBBS, MD)" value={formData.doctorProfile.qualification} onChange={e => updateForm('doctorProfile', 'qualification', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Specialization (e.g. Cardiologist)" value={formData.doctorProfile.specialization} onChange={e => updateForm('doctorProfile', 'specialization', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="number" placeholder="Experience (Years)" value={formData.doctorProfile.experienceYrs} onChange={e => updateForm('doctorProfile', 'experienceYrs', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Medical Registration Number" value={formData.doctorProfile.regNumber} onChange={e => updateForm('doctorProfile', 'regNumber', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none md:col-span-2" />
              <textarea placeholder="Short Bio / Description" rows={3} value={formData.doctorProfile.bio} onChange={e => updateForm('doctorProfile', 'bio', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none md:col-span-2"></textarea>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-8 h-8 text-emerald-600" />
              <h2 className="text-2xl font-black text-slate-900">Clinic Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Clinic Name" value={formData.clinicDetails.name} onChange={e => updateForm('clinicDetails', 'name', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Website Slug (e.g. my-clinic)" value={formData.clinicDetails.slug} onChange={e => updateForm('clinicDetails', 'slug', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Phone Number" value={formData.clinicDetails.phone} onChange={e => updateForm('clinicDetails', 'phone', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="email" placeholder="Email Address" value={formData.clinicDetails.email} onChange={e => updateForm('clinicDetails', 'email', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Full Address" value={formData.clinicDetails.address} onChange={e => updateForm('clinicDetails', 'address', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none md:col-span-2" />
              <input type="text" placeholder="City" value={formData.clinicDetails.city} onChange={e => updateForm('clinicDetails', 'city', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" placeholder="Pincode" value={formData.clinicDetails.pincode} onChange={e => updateForm('clinicDetails', 'pincode', e.target.value)} className="border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-black text-slate-900">Services & Pricing</h2>
              </div>
              <button onClick={() => setFormData(p => ({...p, services: [...p.services, { name: "", price: "", durationMins: "15" }] }))} className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">Add Row</button>
            </div>
            <div className="space-y-4">
              {formData.services.map((s, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <input type="text" placeholder="Service Name" value={s.name} onChange={e => {
                    const newArr = [...formData.services];
                    newArr[idx].name = e.target.value;
                    setFormData({...formData, services: newArr});
                  }} className="flex-1 border border-slate-200 rounded-xl p-3" />
                  <input type="number" placeholder="Fee (₹)" value={s.price} onChange={e => {
                    const newArr = [...formData.services];
                    newArr[idx].price = e.target.value;
                    setFormData({...formData, services: newArr});
                  }} className="w-32 border border-slate-200 rounded-xl p-3" />
                  <input type="number" placeholder="Mins" value={s.durationMins} onChange={e => {
                    const newArr = [...formData.services];
                    newArr[idx].durationMins = e.target.value;
                    setFormData({...formData, services: newArr});
                  }} className="w-24 border border-slate-200 rounded-xl p-3" />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-black text-slate-900">OPD Timings</h2>
            </div>
            <div className="space-y-3">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => {
                const day = formData.availability.find(d => d.dayOfWeek === idx);
                return (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${!day.isOpen ? 'bg-slate-50 border-slate-200' : 'bg-white border-blue-100 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <span className="font-bold w-24">{dayName}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={() => {
                            const newArr = [...formData.availability];
                            const di = newArr.findIndex(d => d.dayOfWeek === idx);
                            newArr[di].isOpen = !day.isOpen;
                            setFormData({...formData, availability: newArr});
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            day.isOpen ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span 
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              day.isOpen ? 'translate-x-5' : 'translate-x-0'
                            }`} 
                          />
                        </button>
                        {day.isOpen ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                    {day.isOpen ? (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Start Time</label>
                          <input type="time" value={day.startTime} onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).startTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50" />
                        </div>
                        <span className="text-slate-300 font-black mt-4">-</span>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">End Time</label>
                          <input type="time" value={day.endTime} onChange={e => {
                            const newArr = [...formData.availability];
                            newArr.find(d => d.dayOfWeek === idx).endTime = e.target.value;
                            setFormData({...formData, availability: newArr});
                          }} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-slate-400 italic py-2">Clinic is closed on this day</div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <LayoutTemplate className="w-8 h-8 text-indigo-600" />
              <h2 className="text-2xl font-black text-slate-900">Choose Website Template</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['template-1', 'template-2', 'template-3'].map((t, idx) => (
                <div key={t} onClick={() => updateForm('websiteConfig', 'templateId', t)} 
                  className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${formData.websiteConfig.templateId === t ? 'border-blue-600 shadow-xl' : 'border-transparent border-slate-200'}`}>
                  <div className="h-48 bg-slate-200 relative">
                    <img src={`https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop&${idx}`} alt={t} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 bg-white text-center font-bold">Template {idx + 1}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-8 h-8 text-pink-600" />
              <h2 className="text-2xl font-black text-slate-900">Customize Website</h2>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div>
                <label className="font-bold text-slate-700 block mb-3">Primary Color</label>
                <div className="flex gap-4">
                  {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0f172a'].map(color => (
                    <button key={color} onClick={() => updateForm('websiteConfig', 'primaryColor', color)} style={{ backgroundColor: color }}
                      className={`w-10 h-10 rounded-full border-2 ${formData.websiteConfig.primaryColor === color ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent'}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-3">Button Style</label>
                <div className="flex gap-4">
                  {['rounded-xl', 'rounded-full', 'rounded-none'].map(style => (
                    <button key={style} onClick={() => updateForm('websiteConfig', 'buttonStyle', style)}
                      className={`px-6 py-2 border-2 bg-slate-100 ${style} ${formData.websiteConfig.buttonStyle === style ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>
                      {style.replace('rounded-', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl">Next Step</button>
            </div>
          </div>
        )}

        {currentStep === 9 && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Play className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-black text-slate-900">Live Preview</h2>
            </div>
            <div className="w-full h-[500px] bg-slate-100 rounded-2xl border-4 border-slate-800 overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-slate-900 text-white">
                  <h3 className="text-3xl font-black" style={{ color: formData.websiteConfig.primaryColor }}>{formData.clinicDetails.name || 'My Clinic'}</h3>
                  <p>Dr. {formData.doctorProfile.fullName || 'Name'}</p>
                  <button className={`px-6 py-2 bg-blue-600 text-white ${formData.websiteConfig.buttonStyle}`} style={{ backgroundColor: formData.websiteConfig.primaryColor }}>Book Appointment</button>
               </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={handlePrev} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleFinish} disabled={saving} className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl inline-flex items-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />} Publish Website
              </button>
            </div>
          </div>
        )}

        {currentStep === 10 && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">Website Published!</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
              Your clinic is now online. Patients can visit your website and book appointments immediately.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block mb-10 text-lg font-bold text-slate-800 font-mono">
              {window.location.origin}/{successSlug}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={`/${successSlug}`} target="_blank" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                <Globe className="w-5 h-5" /> Visit Website
              </a>
              <button onClick={() => router.push("/dashboard")} className="bg-white text-slate-900 border-2 border-slate-200 font-bold px-8 py-4 rounded-full shadow-sm hover:bg-slate-50 transition-all">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Palette, LayoutTemplate, Loader2, Save, ExternalLink, 
  CheckCircle2, Eye, LayoutGrid, Sparkles, Image as ImageIcon, 
  Upload, Trash2, User, RefreshCw, Building, Lock, ArrowUpRight,
  ShieldCheck, Link2, Code, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { PLAN_CONFIG, getPlanConfig } from "../../../../lib/planLimits.js";

export default function WebsiteBuilderPage() {
  const [config, setConfig] = useState({
    templateId: 'template-1',
    doctorPhoto: '',
    clinicLogo: '',
    primaryColor: '#00A1AC',
    fontStyle: 'Plus Jakarta Sans',
    buttonStyle: 'rounded-xl',
    showSections: { about: true, services: true, timings: true, contact: true }
  });
  const [clinic, setClinic] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const syncConfigFromServer = async () => {
    try {
      const res = await fetch("/api/dashboard/website-builder", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        const photo = json.websiteConfig?.doctorPhoto || json.doctor?.profilePhoto || json.doctor?.image || json.doctor?.avatarUrl || '';
        const logo = json.websiteConfig?.clinicLogo || json.clinic?.logo || '';
        
        if (json.websiteConfig) {
          setConfig(prev => ({
            ...prev,
            ...json.websiteConfig,
            templateId: 'template-1', // Basic plan locked to template-1
            doctorPhoto: photo || prev.doctorPhoto || '',
            clinicLogo: logo || prev.clinicLogo || ''
          }));
        } else {
          setConfig(prev => ({
            ...prev,
            templateId: 'template-1',
            doctorPhoto: photo || prev.doctorPhoto || '',
            clinicLogo: logo || prev.clinicLogo || ''
          }));
        }
        setClinic(json.clinic);
        setDoctor(json.doctor);
        setSlug(json.slug);
      }
    } catch (err) {
      console.error("Failed to fetch website config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncConfigFromServer();
  }, []);

  const savePayload = async (payloadToSave) => {
    setSaving(true);
    try {
      const payload = {
        ...config,
        ...payloadToSave,
        templateId: 'template-1', // Basic plan stays template-1
        doctorPhoto: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        profilePhoto: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        image: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        avatarUrl: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        clinicLogo: payloadToSave?.clinicLogo !== undefined ? payloadToSave.clinicLogo : (config.clinicLogo || ""),
        logo: payloadToSave?.clinicLogo !== undefined ? payloadToSave.clinicLogo : (config.clinicLogo || ""),
        themeColor: config.primaryColor || "#00A1AC",
        primaryColor: config.primaryColor || "#00A1AC"
      };

      const res = await fetch("/api/dashboard/website-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        if (json.doctor) setDoctor(json.doctor);
        if (json.clinic) setClinic(json.clinic);
        if (json.websiteConfig) {
          setConfig(prev => ({ 
            ...prev, 
            ...json.websiteConfig,
            doctorPhoto: json.websiteConfig.doctorPhoto || json.doctor?.profilePhoto || json.doctor?.image || prev.doctorPhoto || '',
            clinicLogo: json.websiteConfig.clinicLogo || json.clinic?.logo || prev.clinicLogo || ''
          }));
        }
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Failed to save: " + (json.error || "Please check all fields."));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while saving website config.");
    } finally {
      setSaving(false);
    }
  };

  const saveConfig = async () => {
    await savePayload(config);
  };

  const updateConfig = (field, value) => {
    setConfig(p => ({ ...p, [field]: value }));
  };

  const updateSection = (section, value) => {
    setConfig(p => ({ ...p, showSections: { ...p.showSections, [section]: value }}));
  };

  const promptUpgrade = (featureName) => {
    setUpgradeReason(featureName);
    setShowUpgradeModal(true);
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        
        updateConfig(field, compressedBase64);
        savePayload({ [field]: compressedBase64 });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  const templates = [
    { 
      id: 'template-1', 
      name: 'Executive Modern Minimalist', 
      desc: 'Clean high-contrast layout for clinical specialists',
      img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
      isLocked: false
    },
    { 
      id: 'template-2', 
      name: 'Medical Oceanic Pro', 
      desc: 'High-tech oceanic theme for specialized healthcare centers',
      img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
      isLocked: true,
      tier: 'Pro'
    },
    { 
      id: 'template-3', 
      name: 'Family Health Care', 
      desc: 'Warm, approachable layout for family & general practice',
      img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
      isLocked: true,
      tier: 'Pro'
    }
  ];

  const colors = [
    { name: 'Teal/Cyan (Brand)', value: '#00A1AC' },
    { name: 'Clinical Blue', value: '#2563eb' },
    { name: 'Care Emerald', value: '#059669' },
    { name: 'Executive Navy', value: '#0a2635' },
    { name: 'Gentle Rose', value: '#e11d48' },
    { name: 'Royal Indigo', value: '#4f46e5' }
  ];

  const buttonStyles = [
    { id: 'rounded-xl', label: 'Soft (xl)' },
    { id: 'rounded-2xl', label: 'Curved (2xl)' },
    { id: 'rounded-full', label: 'Pill (full)' },
    { id: 'rounded-none', label: 'Sharp (none)' }
  ];

  const cleanDocName = doctor?.fullName ? `Dr. ${doctor.fullName.replace(/^Dr\.?\s*/i, '')}` : 'Dr. Doctor Name';
  const effectiveDoctorPhoto = config.doctorPhoto || doctor?.profilePhoto || doctor?.image || doctor?.avatarUrl || '';
  const effectiveClinicLogo = config.clinicLogo || clinic?.logo || '';

  return (
    <div className="p-6 sm:p-10 max-w-[1600px] mx-auto space-y-8 font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      {/* Top Bar (White Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
              <Globe className="w-7 h-7 text-[#00A1AC]" />
              Website Customizer & Theme
            </h1>
            <span className="text-[11px] font-black text-[#00A1AC] bg-[#00A1AC]/10 border border-[#00A1AC]/20 px-3 py-0.5 rounded-full">
              Basic Plan (₹499/mo)
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Customize your public landing page theme, doctor photo, clinic logo, and layout in real-time.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {slug && (
            <a 
              href={`/${slug}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-[#00A1AC]/10 hover:bg-[#00A1AC]/20 text-[#00A1AC] border border-[#00A1AC]/20 px-4 py-2 rounded-2xl font-bold transition-all text-xs active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00A1AC]" /> /{slug}
            </a>
          )}
          <button 
            onClick={saveConfig} 
            disabled={saving} 
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-[#00A1AC]/30 text-xs active:scale-95 cursor-pointer ${
              savedSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-[#00A1AC] hover:bg-[#008790] text-white disabled:opacity-70'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
            {savedSuccess ? "Changes Saved Live! ✓" : "Publish & Save Website"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Controls (White Card) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('templates')} 
                className={`flex-1 min-w-[85px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'templates' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> Templates
              </button>
              <button 
                onClick={() => setActiveTab('media')} 
                className={`flex-1 min-w-[85px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'media' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ImageIcon className="w-4 h-4" /> Photos & Logo
              </button>
              <button 
                onClick={() => setActiveTab('domain')} 
                className={`flex-1 min-w-[85px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'domain' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Link2 className="w-4 h-4" /> Domain
              </button>
              <button 
                onClick={() => setActiveTab('theme')} 
                className={`flex-1 min-w-[85px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'theme' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Palette className="w-4 h-4" /> Theme
              </button>
              <button 
                onClick={() => setActiveTab('sections')} 
                className={`flex-1 min-w-[85px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'sections' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" /> Sections
              </button>
            </div>
            
            <div className="p-6 h-[540px] overflow-y-auto hide-scrollbar">
              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-medium flex items-center justify-between">
                    <span>Basic Plan: Standard Modern Template Included</span>
                    <span className="font-bold text-[#00A1AC]">1 Template Unlocked</span>
                  </div>

                  {templates.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        if (t.isLocked) {
                          promptUpgrade(`${t.name} (Premium Layout)`);
                        } else {
                          updateConfig('templateId', t.id);
                          savePayload({ templateId: t.id });
                        }
                      }} 
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                        t.isLocked 
                          ? 'border-slate-200 opacity-80 hover:opacity-100' 
                          : config.templateId === t.id 
                            ? 'border-[#00A1AC] shadow-lg ring-2 ring-[#00A1AC]/30' 
                            : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="h-36 bg-slate-100 relative overflow-hidden">
                        <img 
                          src={t.img} 
                          alt={t.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                        
                        {t.isLocked ? (
                          <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20 backdrop-blur-sm">
                            <Lock className="w-3 h-3" /> Upgrade to Pro
                          </div>
                        ) : config.templateId === t.id ? (
                          <div className="absolute top-3 right-3 bg-[#00A1AC] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Active Template
                          </div>
                        ) : null}

                        <div className="absolute bottom-2 left-3 right-3 text-white pointer-events-none">
                          <p className="font-extrabold text-sm text-white drop-shadow-md">{t.name}</p>
                          <p className="text-[10px] text-slate-200 drop-shadow-sm line-clamp-1">{t.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Photos & Logo Tab */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Doctor Profile Photo Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#00A1AC]" /> Doctor Profile Photo
                      </h3>
                      {effectiveDoctorPhoto && (
                        <button 
                          type="button" 
                          onClick={() => {
                            updateConfig('doctorPhoto', '');
                            savePayload({ doctorPhoto: '' });
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center shrink-0 relative group">
                        {effectiveDoctorPhoto ? (
                          <img 
                            src={effectiveDoctorPhoto} 
                            alt="Doctor Preview" 
                            className="w-full h-full object-cover object-top" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                            <User className="w-8 h-8 text-slate-300" />
                            <span className="text-[9px] font-bold uppercase mt-1 text-slate-400">No Photo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Image URL or Base64</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/doctor-photo.jpg" 
                          value={config.doctorPhoto || ""} 
                          onChange={(e) => updateConfig('doctorPhoto', e.target.value)} 
                          onBlur={(e) => savePayload({ doctorPhoto: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all" 
                        />
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer shadow-sm active:scale-95 transition-all">
                            <Upload className="w-3 h-3 text-[#00A1AC]" /> Browse & Auto-Save
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'doctorPhoto')} 
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Auto-saves)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Logo Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#00A1AC]" /> Clinic Brand Logo
                      </h3>
                      {effectiveClinicLogo && (
                        <button 
                          type="button" 
                          onClick={() => {
                            updateConfig('clinicLogo', '');
                            savePayload({ clinicLogo: '' });
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center shrink-0 p-2 relative group">
                        {effectiveClinicLogo ? (
                          <img 
                            src={effectiveClinicLogo} 
                            alt="Clinic Logo Preview" 
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                            <Building className="w-8 h-8 text-slate-300" />
                            <span className="text-[9px] font-bold uppercase mt-1 text-slate-400">No Logo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Logo URL or Base64</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/clinic-logo.png" 
                          value={config.clinicLogo || ""} 
                          onChange={(e) => updateConfig('clinicLogo', e.target.value)} 
                          onBlur={(e) => savePayload({ clinicLogo: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all" 
                        />
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer shadow-sm active:scale-95 transition-all">
                            <Upload className="w-3 h-3 text-[#00A1AC]" /> Browse & Auto-Save
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'clinicLogo')} 
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">PNG with transparency</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Domain & URL Tab */}
              {activeTab === 'domain' && (
                <div className="space-y-6">
                  {/* Platform Subdomain (Allowed on Basic) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#00A1AC]" /> Platform Subdomain (Active)
                      </h3>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Included</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                      <span className="font-mono text-slate-400">docpulse.com/</span>
                      <span className="font-bold text-[#00A1AC] font-mono">{slug || 'clinic-slug'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Your public booking website is live and shareable under this URL.</p>
                  </div>

                  {/* Custom Domain (Locked on Basic Plan) */}
                  <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-amber-500" /> Custom Domain (e.g. drdilshad.com)
                      </h3>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Pro Feature
                      </span>
                    </div>

                    <div className="relative">
                      <input 
                        type="text" 
                        disabled
                        placeholder="e.g. www.drdilshadclinic.com" 
                        value={customDomain}
                        className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-3 py-2.5 text-xs font-medium cursor-not-allowed" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        <span className="font-bold block mb-0.5">Custom Domain linking is available on Advanced & Premium plans.</span>
                        Upgrade to link your personal domain, configure automated SSL certificates, and remove DocPulse branding.
                      </div>
                    </div>

                    <button 
                      onClick={() => promptUpgrade("Custom Domain Linking")}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" /> Unlock Custom Domain (Upgrade)
                    </button>
                  </div>
                </div>
              )}

              {/* Theme & Styling Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Primary Brand Color</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {colors.map(color => (
                        <div 
                          key={color.value} 
                          onClick={() => {
                            updateConfig('primaryColor', color.value);
                            savePayload({ primaryColor: color.value, themeColor: color.value });
                          }} 
                          className={`cursor-pointer flex items-center gap-3 p-3 rounded-2xl border transition-all ${config.primaryColor === color.value ? 'border-[#00A1AC] bg-[#00A1AC]/5 shadow-sm ring-1 ring-[#00A1AC]/30' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                        >
                          <div className="w-6 h-6 rounded-full shadow-sm shrink-0" style={{ backgroundColor: color.value }} />
                          <span className="font-bold text-xs text-[#0f172a]">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Button Shape</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {buttonStyles.map(style => (
                        <button 
                          key={style.id} 
                          onClick={() => {
                            updateConfig('buttonStyle', style.id);
                            savePayload({ buttonStyle: style.id });
                          }} 
                          className={`py-2.5 px-3 border text-xs font-bold transition-all ${style.id} ${config.buttonStyle === style.id ? 'border-[#00A1AC] bg-[#00A1AC] text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Locked Advanced Customizations */}
                  <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-slate-500" /> Custom CSS & Header Scripts
                      </span>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Pro Only
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Injecting custom CSS and third-party analytics pixels is available on Advanced & Premium plans.</p>
                  </div>
                </div>
              )}

              {/* Sections Tab */}
              {activeTab === 'sections' && (
                <div className="space-y-3">
                  {Object.keys(config.showSections).map(section => {
                    const labels = { about: 'About Doctor Section', services: 'Services & Pricing', timings: 'OPD Timings', contact: 'Contact & Directions' };
                    return (
                      <div key={section} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="font-bold text-xs sm:text-sm text-[#0f172a]">{labels[section] || section}</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            const updated = !config.showSections[section];
                            updateSection(section, updated);
                            savePayload({ showSections: { ...config.showSections, [section]: updated } });
                          }} 
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${config.showSections[section] ? 'bg-[#00A1AC]' : 'bg-slate-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${config.showSections[section] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview Mockup Window */}
        <div className="lg:col-span-7">
          <div className="bg-[#0c2e3d] rounded-3xl p-3 h-[600px] flex flex-col border-[4px] border-slate-200 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#08202b] rounded-t-2xl border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-xs font-mono text-teal-300 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#00A1AC]" /> Interactive Website Preview</div>
              <div className="w-8"></div>
            </div>
            
            <div className="flex-1 bg-slate-950 overflow-y-auto rounded-b-2xl relative text-white hide-scrollbar" style={{ fontFamily: config.fontStyle }}>
              {/* Preview Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0c2e3d]/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-2.5">
                  {effectiveClinicLogo ? (
                    <img src={effectiveClinicLogo} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#00A1AC] flex items-center justify-center font-bold text-white text-xs">
                      {clinic?.name?.charAt(0) || 'C'}
                    </div>
                  )}
                  <div className="font-black text-base text-white tracking-tight">{clinic?.name || 'Clinic Name'}</div>
                </div>
                <button 
                  className={`px-4 py-2 text-xs font-bold text-white shadow-md transition-all ${config.buttonStyle}`} 
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Book Appointment
                </button>
              </div>
              
              {/* Preview Hero */}
              <div className="p-8 text-center bg-gradient-to-b from-[#0a2635] to-slate-950 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 opacity-40" style={{ backgroundColor: config.primaryColor }}></div>
                
                {/* Hero Avatar Preview */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl mx-auto mb-4 flex items-center justify-center bg-[#0D3648]">
                  {effectiveDoctorPhoto ? (
                    <img 
                      src={effectiveDoctorPhoto} 
                      alt={cleanDocName} 
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#092734] text-white">
                      <svg className="w-10 h-10 text-teal-400 fill-none stroke-current" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">{cleanDocName}</h2>
                <p className="text-teal-400 font-bold text-xs mb-3">{doctor?.specialization || 'Medical Specialist'}</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mb-5">Skip the queue. Book your confirmed OPD consultation slot online.</p>
                <button 
                  className={`px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all ${config.buttonStyle}`} 
                  style={{ backgroundColor: config.primaryColor }}
                >
                  View Available Slots
                </button>
              </div>

              <div className="p-6 space-y-8">
                {config.showSections.about && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>About The Doctor</h3>
                    <div className="flex gap-4 items-start bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shrink-0 overflow-hidden flex items-center justify-center font-bold text-white">
                        {effectiveDoctorPhoto ? (
                          <img src={effectiveDoctorPhoto} alt="Doctor" className="w-full h-full object-cover object-top" />
                        ) : (
                          cleanDocName.charAt(4) || "D"
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-base text-white">{cleanDocName}</div>
                        <div className="text-xs font-semibold" style={{ color: config.primaryColor }}>{doctor?.specialization || 'Medical Specialist'}</div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{doctor?.bio || 'Dedicated medical professional with extensive clinical expertise.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {config.showSections.services && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>Services Offered</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="font-bold text-white text-xs mb-1">General Consultation</div>
                        <div className="text-[11px] text-slate-400">15 mins • ₹500</div>
                      </div>
                      <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="font-bold text-white text-xs mb-1">Follow-up Visit</div>
                        <div className="text-[11px] text-slate-400">10 mins • ₹300</div>
                      </div>
                    </div>
                  </div>
                )}

                {config.showSections.timings && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>OPD Timings</h3>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Mon - Sat</span><span className="font-bold text-white">09:00 AM - 05:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Sunday</span><span className="font-bold text-rose-400">Closed</span></div>
                    </div>
                  </div>
                )}
                
                {config.showSections.contact && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>Location & Contact</h3>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1.5">
                      <div>📍 {clinic?.address || 'Main Road, Clinic Location'}</div>
                      <div>📞 {clinic?.phone || '+91 9999999999'}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enforced Platform Branding Footer */}
              <div className="p-6 bg-[#071720] text-slate-400 text-center text-xs border-t border-white/10 mt-6 space-y-1">
                <p>© {new Date().getFullYear()} {clinic?.name || 'Clinic'}. All rights reserved.</p>
                <p className="text-slate-500">
                  Powered by <span className="font-bold text-[#00A1AC]">DocPulse CRM</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Upgrade to Unlock Feature</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              <strong>{upgradeReason}</strong> is available on Advanced (₹999/mo) and Premium (₹1499/mo) plans. Upgrade now to unlock custom domains, multi-templates, and full white-labeling.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <Link 
                href="/dashboard/subscription"
                className="px-6 py-2.5 rounded-xl bg-[#00A1AC] hover:bg-[#008790] text-white font-black text-xs shadow-lg shadow-[#00A1AC]/25 transition-all flex items-center gap-1.5"
              >
                View Plans & Upgrade <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

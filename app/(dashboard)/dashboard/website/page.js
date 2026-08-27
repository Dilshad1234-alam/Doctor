"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Palette, LayoutTemplate, Loader2, Save, ExternalLink, 
  CheckCircle2, Eye, LayoutGrid, Sparkles, Image as ImageIcon, 
  Upload, Trash2, User, RefreshCw, Building, Lock, ArrowUpRight,
  ShieldCheck, Link2, Code, ShieldAlert, Check, Copy, Crown, Video, EyeOff
} from "lucide-react";
import Link from "next/link";
import { PLAN_CONFIG, getPlanConfig, getPlanTier } from "../../../../lib/planLimits.js";
import { THEME_COLOR_MAP, BUTTON_SHAPE_MAP, getThemeConfig, getButtonShapeClass } from "../../../../lib/themeColors.js";
import { SPECIALTY_PRESETS, getSpecialtyPreset } from "../../../../lib/specialtyPresets.js";

export default function WebsiteBuilderPage() {
  const [config, setConfig] = useState({
    templateId: 'template-1',
    doctorPhoto: '',
    clinicLogo: '',
    primaryColor: '#00A1AC',
    themeColor: 'teal',
    fontStyle: 'Plus Jakarta Sans',
    buttonStyle: 'rounded-2xl',
    buttonShape: 'curved',
    hideBranding: false,
    videoBioUrl: '',
    showSections: { about: true, services: true, timings: true, contact: true }
  });
  const [clinic, setClinic] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [copiedDns, setCopiedDns] = useState(false);
  const [applyingPreset, setApplyingPreset] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("general_opd");

  const syncConfigFromServer = async () => {
    try {
      const res = await fetch("/api/dashboard/website-builder", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        const photo = json.websiteConfig?.doctorPhoto || json.doctor?.profilePhoto || json.doctor?.image || json.doctor?.avatarUrl || '';
        const logo = json.websiteConfig?.clinicLogo || json.clinic?.logo || '';
        const advanced = Boolean(json.isAdvanced);
        const premium = Boolean(json.isPremium);
        setIsAdvanced(advanced);
        setIsPremium(premium);
        
        if (json.websiteConfig) {
          setConfig(prev => ({
            ...prev,
            ...json.websiteConfig,
            templateId: advanced ? (json.websiteConfig.templateId || 'template-1') : 'template-1',
            doctorPhoto: photo || prev.doctorPhoto || '',
            clinicLogo: logo || prev.clinicLogo || '',
            hideBranding: premium ? Boolean(json.websiteConfig.hideBranding) : false,
            videoBioUrl: json.websiteConfig.videoBioUrl || ''
          }));
        } else {
          setConfig(prev => ({
            ...prev,
            templateId: 'template-1',
            doctorPhoto: photo || prev.doctorPhoto || '',
            clinicLogo: logo || prev.clinicLogo || '',
            hideBranding: false,
            videoBioUrl: ''
          }));
        }
        setClinic(json.clinic);
        setDoctor(json.doctor);
        setSlug(json.slug);
        setCustomDomain(json.customDomain || json.clinic?.customDomain || "");
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
      const selectedColor = payloadToSave?.primaryColor || payloadToSave?.themeColor || config.primaryColor || config.themeColor || "#00A1AC";
      const payload = {
        ...config,
        ...payloadToSave,
        customDomain: payloadToSave?.customDomain !== undefined ? payloadToSave.customDomain : customDomain,
        templateId: isAdvanced ? (payloadToSave?.templateId || config.templateId || 'template-1') : 'template-1',
        doctorPhoto: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        profilePhoto: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        image: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        avatarUrl: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        clinicLogo: payloadToSave?.clinicLogo !== undefined ? payloadToSave.clinicLogo : (config.clinicLogo || ""),
        logo: payloadToSave?.clinicLogo !== undefined ? payloadToSave.clinicLogo : (config.clinicLogo || ""),
        themeColor: selectedColor,
        primaryColor: selectedColor,
        buttonStyle: payloadToSave?.buttonStyle !== undefined ? payloadToSave.buttonStyle : (config.buttonStyle || "rounded-xl"),
        hideBranding: isPremium ? (payloadToSave?.hideBranding !== undefined ? payloadToSave.hideBranding : config.hideBranding) : false,
        videoBioUrl: payloadToSave?.videoBioUrl !== undefined ? payloadToSave.videoBioUrl : (config.videoBioUrl || "")
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
            primaryColor: json.websiteConfig.primaryColor || json.websiteConfig.themeColor || selectedColor,
            themeColor: json.websiteConfig.themeColor || json.websiteConfig.primaryColor || selectedColor,
            doctorPhoto: json.websiteConfig.doctorPhoto || json.doctor?.profilePhoto || json.doctor?.image || prev.doctorPhoto || '',
            clinicLogo: json.websiteConfig.clinicLogo || json.clinic?.logo || prev.clinicLogo || '',
            hideBranding: json.websiteConfig.hideBranding || false,
            videoBioUrl: json.websiteConfig.videoBioUrl || ''
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
    await savePayload({ ...config, customDomain });
  };

  const handleApplyPreset = async (presetId) => {
    setApplyingPreset(true);
    try {
      const res = await fetch("/api/dashboard/specialty-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId, seedServices: false })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedSpecialty(presetId);
        if (json.doctor) setDoctor(json.doctor);
        if (json.websiteConfig) {
          setConfig(prev => ({
            ...prev,
            ...json.websiteConfig,
            themeColor: json.websiteConfig.themeColor || json.preset?.color || 'teal',
            primaryColor: json.websiteConfig.primaryColor || '#00A1AC'
          }));
        }
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(json.error || "Could not apply preset.");
      }
    } catch (err) {
      console.error("Error applying preset:", err);
    } finally {
      setApplyingPreset(false);
    }
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

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2500);
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
      isLocked: !isAdvanced,
      tier: 'Pro'
    },
    { 
      id: 'template-3', 
      name: 'Family Health Care', 
      desc: 'Warm, approachable layout for family & general practice',
      img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
      isLocked: !isAdvanced,
      tier: 'Pro'
    },
    { 
      id: 'template-4', 
      name: 'Luxury Elite Specialist', 
      isLocked: !isPremium,
      tier: 'Premium'
    }
  ];

  const userPlanId = isPremium ? 'PREMIUM' : isAdvanced ? 'ADVANCED' : 'BASIC';
  const tierConfig = getPlanTier(userPlanId);

  const THEME_COLORS = [
    { id: 'teal', name: 'Teal/Cyan (Brand)', hex: '#00A1AC', value: '#00A1AC', isLocked: false, tier: 'Basic' },
    { id: 'blue', name: 'Clinical Blue', hex: '#2563EB', value: '#2563EB', isLocked: false, tier: 'Basic' },
    { id: 'emerald', name: 'Care Emerald', hex: '#059669', value: '#059669', isLocked: !tierConfig.allowedColors.includes('emerald'), tier: 'Advanced' },
    { id: 'navy', name: 'Executive Navy', hex: '#0D3648', value: '#0D3648', isLocked: !tierConfig.allowedColors.includes('navy'), tier: 'Advanced' },
    { id: 'rose', name: 'Gentle Rose', hex: '#E11D48', value: '#E11D48', isLocked: !tierConfig.allowedColors.includes('rose'), tier: 'Premium' },
    { id: 'indigo', name: 'Royal Indigo', hex: '#4F46E5', value: '#4F46E5', isLocked: !tierConfig.allowedColors.includes('indigo'), tier: 'Premium' },
    { id: 'gold', name: 'Luxury Gold', hex: '#D97706', value: '#D97706', isLocked: !tierConfig.allowedColors.includes('gold'), tier: 'Premium' }
  ];

  const buttonStyles = [
    { id: 'curved', label: 'Curved (2xl)', shapeClass: 'rounded-2xl', isLocked: false, tier: 'Basic' },
    { id: 'soft', label: 'Soft (xl)', shapeClass: 'rounded-xl', isLocked: !tierConfig.allowedShapes.includes('soft'), tier: 'Advanced' },
    { id: 'pill', label: 'Pill (full)', shapeClass: 'rounded-full', isLocked: !tierConfig.allowedShapes.includes('pill'), tier: 'Advanced' },
    { id: 'sharp', label: 'Sharp (none)', shapeClass: 'rounded-none', isLocked: !tierConfig.allowedShapes.includes('sharp'), tier: 'Premium' }
  ];

  const activeTheme = getThemeConfig(config.themeColor || config.primaryColor);
  const activeShape = getButtonShapeClass(config.buttonShape || config.buttonStyle);

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
            <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
              isPremium 
                ? 'text-amber-800 bg-amber-100 border-amber-300 flex items-center gap-1' 
                : isAdvanced 
                  ? 'text-emerald-800 bg-emerald-100 border-emerald-200' 
                  : 'text-[#00A1AC] bg-[#00A1AC]/10 border-[#00A1AC]/20'
            }`}>
              {isPremium ? <><Crown className="w-3 h-3 text-amber-600" /> Premium VIP Tier</> : isAdvanced ? "Advanced Plan (All Unlocked)" : "Basic Plan (₹499/mo)"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Customize your public landing page theme, doctor photo, clinic logo, video bio, and layout in real-time.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {customDomain && isAdvanced ? (
            <a 
              href={`https://${customDomain.replace(/^https?:\/\//, '')}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-2xl font-bold transition-all text-xs active:scale-95 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" /> {customDomain}
            </a>
          ) : slug ? (
            <a 
              href={`/${slug}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-[#00A1AC]/10 hover:bg-[#00A1AC]/20 text-[#00A1AC] border border-[#00A1AC]/20 px-4 py-2 rounded-2xl font-bold transition-all text-xs active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00A1AC]" /> /{slug}
            </a>
          ) : null}
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

          {/* 1-Click Specialty Presets Quick Setup Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A1AC]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Specialty Clinic Presets</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">1-Click Auto Setup</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {Object.values(SPECIALTY_PRESETS).map(preset => {
                const isSelected = selectedSpecialty === preset.id || (doctor?.specialty || '').toLowerCase() === preset.id.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={applyingPreset}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#00A1AC] text-white border-[#00A1AC] shadow-md shadow-[#00A1AC]/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{preset.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('templates')} 
                className={`flex-1 min-w-[75px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'templates' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> Templates
              </button>
              <button 
                onClick={() => setActiveTab('media')} 
                className={`flex-1 min-w-[75px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'media' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ImageIcon className="w-4 h-4" /> Media & Bio
              </button>
              <button 
                onClick={() => setActiveTab('whitelabel')} 
                className={`flex-1 min-w-[75px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'whitelabel' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Crown className="w-4 h-4 text-amber-500" /> White-label
              </button>
              <button 
                onClick={() => setActiveTab('domain')} 
                className={`flex-1 min-w-[75px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'domain' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Link2 className="w-4 h-4" /> Domain
              </button>
              <button 
                onClick={() => setActiveTab('theme')} 
                className={`flex-1 min-w-[75px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'theme' ? 'bg-white text-[#00A1AC] border-b-2 border-[#00A1AC] font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Palette className="w-4 h-4" /> Theme
              </button>
            </div>
            
            <div className="p-6 h-[540px] overflow-y-auto hide-scrollbar">
              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-medium flex items-center justify-between">
                    <span>{isPremium ? "Premium Tier: All 4 Luxury & Executive Templates Unlocked" : isAdvanced ? "Advanced Plan: 3 Templates Unlocked" : "Basic Plan: Standard Modern Template"}</span>
                    <span className="font-bold text-[#00A1AC]">{isPremium ? "4 / 4 Unlocked" : isAdvanced ? "3 / 4 Unlocked" : "1 / 4 Unlocked"}</span>
                  </div>

                  {templates.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        if (t.isLocked) {
                          promptUpgrade(`${t.name} (${t.tier} Layout)`);
                        } else {
                          updateConfig('templateId', t.id);
                          savePayload({ templateId: t.id });
                        }
                      }} 
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                        t.isLocked 
                          ? 'border-slate-200 opacity-70 hover:opacity-90' 
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
                            <Lock className="w-3 h-3" /> Upgrade to {t.tier}
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

              {/* Photos, Logo & Video Bio Tab */}
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
                          <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
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

                  {/* Video Bio / Intro Hero Link (Premium Feature) */}
                  <div className={`p-5 rounded-2xl border space-y-3 ${isPremium ? 'bg-white border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Video className={`w-4 h-4 ${isPremium ? 'text-amber-500' : 'text-slate-400'}`} /> Video Bio & Intro Link
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isPremium ? 'text-amber-800 bg-amber-100 border border-amber-200' : 'text-slate-500 bg-slate-200'
                      }`}>
                        {isPremium ? <><Crown className="w-3 h-3 text-amber-600" /> Unlocked</> : <><Lock className="w-3 h-3 text-amber-600" /> Premium</>}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-600">YouTube or Vimeo Video URL</label>
                      <input 
                        type="text" 
                        disabled={!isPremium}
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={config.videoBioUrl || ""}
                        onChange={(e) => updateConfig('videoBioUrl', e.target.value)}
                        onBlur={(e) => isPremium && savePayload({ videoBioUrl: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition-all ${
                          isPremium 
                            ? 'bg-white border-slate-200 text-slate-900 focus:border-amber-400' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      />
                      <p className="text-[10px] text-slate-400">Embeds an interactive video consultation introduction on your public landing hero.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* White-label Switch Tab (Premium Feature) */}
              {activeTab === 'whitelabel' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
                    isPremium ? 'bg-gradient-to-br from-amber-500/10 via-white to-teal-50 border-amber-300' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h3 className="font-black text-sm text-slate-900">100% White-Label Branding</h3>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isPremium ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPremium ? "VIP Premium Active" : "Premium Tier Only"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Completely remove &ldquo;Powered by DocPulse&rdquo; and any third-party SaaS badges from your public clinic website, booking slips, and patient portals.
                    </p>

                    {/* Toggle Switch */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">Remove Platform Branding</span>
                        <span className="text-[11px] text-slate-400 font-medium">Render only your clinic copyright on footer</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!isPremium) {
                            promptUpgrade("100% White-Label Branding Switch");
                          } else {
                            const updated = !config.hideBranding;
                            updateConfig('hideBranding', updated);
                            savePayload({ hideBranding: updated });
                          }
                        }} 
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          config.hideBranding ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          config.hideBranding ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {!isPremium && (
                      <button 
                        onClick={() => promptUpgrade("100% White-Label Mode")}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" /> Unlock White-Label (Upgrade to Premium)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Domain & URL Tab */}
              {activeTab === 'domain' && (
                <div className="space-y-6">
                  {/* Platform Subdomain */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#00A1AC]" /> Platform Subdomain
                      </h3>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                      <span className="font-mono text-slate-400">docpulse.com/</span>
                      <span className="font-bold text-[#00A1AC] font-mono">{slug || 'clinic-slug'}</span>
                    </div>
                  </div>

                  {/* Custom Domain */}
                  <div className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden ${isAdvanced ? 'border-emerald-200' : 'border-amber-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Link2 className={`w-4 h-4 ${isAdvanced ? 'text-emerald-600' : 'text-amber-500'}`} /> Custom Domain
                      </h3>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isAdvanced ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                      }`}>
                        {isAdvanced ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isAdvanced ? "Unlocked" : "Pro Feature"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Your Custom Domain URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          disabled={!isAdvanced}
                          placeholder="e.g. drdilshadclinic.com" 
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          className={`flex-1 border rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none transition-all ${
                            isAdvanced 
                              ? 'bg-white border-slate-200 text-slate-900 focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20' 
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        />
                        {isAdvanced && (
                          <button
                            type="button"
                            onClick={() => savePayload({ customDomain })}
                            className="px-4 py-2 bg-[#00A1AC] hover:bg-[#008790] text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            Save Domain
                          </button>
                        )}
                      </div>
                    </div>

                    {isAdvanced && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>DNS CNAME Verification Record:</span>
                          <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> SSL Auto-Provisioned
                          </span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                          <span>CNAME &nbsp; @ &nbsp; points to &nbsp; <strong>cname.docpulse.com</strong></span>
                          <button 
                            type="button"
                            onClick={() => copyToClipboard("cname.docpulse.com")}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Copy CNAME value"
                          >
                            {copiedDns ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Theme & Styling Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Primary Brand Color</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {THEME_COLORS.map((color) => {
                        const isSelected = 
                          (config.themeColor || '').toLowerCase() === color.id.toLowerCase() ||
                          (config.primaryColor || '').toLowerCase() === color.hex.toLowerCase();

                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              if (color.isLocked) {
                                setUpgradeReason(`The "${color.name}" palette requires the ${color.tier} Plan. Upgrade now to unlock premium brand colors.`);
                                setShowUpgradeModal(true);
                                return;
                              }
                              updateConfig('primaryColor', color.hex);
                              updateConfig('themeColor', color.id);
                              savePayload({ primaryColor: color.hex, themeColor: color.id });
                            }}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left w-full cursor-pointer ${
                              isSelected
                                ? 'border-[#00A1AC] bg-[#00A1AC]/5 shadow-sm ring-2 ring-[#00A1AC]/30 font-bold'
                                : color.isLocked
                                  ? 'border-slate-200 bg-slate-50/80 opacity-75 hover:opacity-100 hover:border-amber-300'
                                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-5 h-5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs font-bold text-slate-900">{color.name}</span>
                            </div>
                            {color.isLocked && (
                              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                                <Lock className="w-2.5 h-2.5" /> {color.tier}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Button Shape</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {buttonStyles.map(style => {
                        const isSelected = 
                          (config.buttonShape || '').toLowerCase() === style.id.toLowerCase() ||
                          (config.buttonStyle || '').toLowerCase() === style.shapeClass.toLowerCase() ||
                          (config.buttonStyle || '').toLowerCase() === style.id.toLowerCase();

                        return (
                          <button 
                            key={style.id} 
                            type="button"
                            onClick={() => {
                              if (style.isLocked) {
                                setUpgradeReason(`The "${style.label}" button shape requires the ${style.tier} Plan. Upgrade now to unlock custom styling.`);
                                setShowUpgradeModal(true);
                                return;
                              }
                              updateConfig('buttonStyle', style.shapeClass);
                              updateConfig('buttonShape', style.id);
                              savePayload({ buttonStyle: style.shapeClass, buttonShape: style.id });
                            }} 
                            className={`py-2.5 px-3 border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${style.shapeClass} ${
                              isSelected 
                                ? 'border-[#00A1AC] bg-[#00A1AC] text-white shadow-sm' 
                                : style.isLocked
                                  ? 'border-slate-200 bg-slate-50/80 text-slate-500 opacity-75 hover:opacity-100 hover:border-amber-300'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{style.label}</span>
                            {style.isLocked && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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

              {/* Preview Footer */}
              {isPremium && config.hideBranding ? (
                <div className="py-6 text-center text-xs text-slate-500 border-t border-white/10 mt-6 font-medium">
                  © {new Date().getFullYear()} {clinic?.name || 'Clinic'}. All rights reserved.
                </div>
              ) : isAdvanced ? (
                <div className="text-[11px] text-slate-500 py-3 text-center border-t border-white/10 mt-6">
                  Powered by DocPulse
                </div>
              ) : (
                <div className="p-6 bg-[#071720] text-slate-400 text-center text-xs border-t border-white/10 mt-6 space-y-1">
                  <p>© {new Date().getFullYear()} {clinic?.name || 'Clinic'}. All rights reserved.</p>
                  <p className="text-slate-500">
                    Powered by <span className="font-bold text-[#00A1AC]">DocPulse CRM</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Premium Feature Locked</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              <strong>{upgradeReason}</strong> is exclusive to the <strong>Premium Tier (₹1,499/mo)</strong>. Upgrade now to remove all SaaS branding, unlock luxury executive templates, and video bio embeds.
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
              >
                Upgrade to Premium (₹1,499/mo) <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

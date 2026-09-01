"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, Palette, LayoutTemplate, Loader2, Save, ExternalLink, 
  CheckCircle2, Sparkles, Image as ImageIcon, Upload, Trash2, 
  User, Building, Lock, ArrowUpRight, ShieldCheck, Link2, 
  Crown, Video, Check, Copy, Eye, MessageCircle, Star, Phone,
  Settings2, MapPin, Clock, Shield, Search, CheckCircle, Moon, Sun, Type, Stethoscope
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { THEME_COLOR_MAP, getThemeConfig } from "../../../../lib/themeColors.js";
import { SPECIALTY_PRESETS, getSpecialtyPreset } from "../../../../lib/specialtyPresets.js";
import PublicFooter from "../../../../components/public/Footer";
import PublicNavbar from "../../../../components/public/Navbar";
import MinimalSolo from "../../../../components/public/templates/MinimalSolo";
import OceanicPro from "../../../../components/public/templates/OceanicPro";
import CareGrid from "../../../../components/public/templates/CareGrid";
import CleanClinic from "../../../../components/public/templates/CleanClinic";

const basicTemplates = ['minimal-solo', 'clean-clinic'];

const TEMPLATE_PRESETS = [
  // BASIC TIER (2 Templates unlocked)
  { id: 'minimal-solo', name: 'Minimal Solo', tier: 'BASIC', badge: 'Active' },
  { id: 'clean-clinic', name: 'Clean Clinic', tier: 'BASIC', badge: 'Basic' },

  // ADVANCED TIER (5 Total - unlocks 3 additional)
  { id: 'oceanic-pro', name: 'Oceanic Pro', tier: 'ADVANCED', badge: 'Adv' },
  { id: 'pulse-compact', name: 'Pulse Compact', tier: 'ADVANCED', badge: 'Adv' },
  { id: 'care-grid', name: 'Care Grid', tier: 'ADVANCED', badge: 'Adv' },

  // PREMIUM VIP TIER (9 Total - unlocks 4 exclusive VIP templates)
  { id: 'executive-vip', name: 'Executive VIP', tier: 'PREMIUM', badge: 'Prem' },
  { id: 'apex-specialty', name: 'Apex Specialty', tier: 'PREMIUM', badge: 'Prem' },
  { id: 'elite-hospital', name: 'Elite Hub', tier: 'PREMIUM', badge: 'Prem' },
  { id: 'radiance-modern', name: 'Radiance Modern', tier: 'PREMIUM', badge: 'Prem' }
];

const COLOR_PALETTES = [
  // BASIC TIER (Always Unlocked)
  { id: 'teal', name: 'Teal', hex: '#0A8692', tier: 'BASIC' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6', tier: 'BASIC' },
  { id: 'navy', name: 'Navy', hex: '#334155', tier: 'BASIC' },
  { id: 'green', name: 'Green', hex: '#10B981', tier: 'BASIC' },
  { id: 'rose', name: 'Rose', hex: '#F43F5E', tier: 'BASIC' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6', tier: 'BASIC' },

  // ADVANCED EXCLUSIVE COLORS (Locked on Basic Tier)
  { id: 'emerald-pro', name: 'Emerald', hex: '#059669', tier: 'ADVANCED' },
  { id: 'royal-indigo', name: 'Indigo', hex: '#4F46E5', tier: 'ADVANCED' },
  { id: 'luxury-gold', name: 'Gold', hex: '#D97706', tier: 'ADVANCED' },
  { id: 'sunset-amber', name: 'Amber', hex: '#EA580C', tier: 'ADVANCED' },
  { id: 'magenta-luxe', name: 'Magenta', hex: '#C026D3', tier: 'ADVANCED' },
  { id: 'slate-graphite', name: 'Graphite', hex: '#1E293B', tier: 'ADVANCED' }
];

export default function WebsiteBuilderPage() {
  const router = useRouter();
  const [config, setConfig] = useState({
    templateId: "template-1",
    doctorPhoto: "",
    clinicLogo: "",
    primaryColor: "#0A8692",
    themeColor: "teal",
    fontStyle: "sans", // 'sans' | 'serif'
    buttonStyle: "rounded-2xl",
    buttonShape: "rounded", // 'subtle' | 'rounded' | 'pill'
    previewMode: "light", // 'light' | 'dark'
    headline: "",
    bio: "",
    enableWhatsApp: true,
    enableEmergencyBanner: false,
    enableMaps: true,
    hideBranding: false,
    videoBioUrl: "",
    showSections: { about: true, services: true, timings: true, contact: true }
  });

  const [clinic, setClinic] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [planId, setPlanId] = useState("BASIC");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("theme"); // 'theme' | 'profile' | 'opd' | 'whitelabel'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [copiedDns, setCopiedDns] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("dental");

  // 3-Plan Live Simulator Mode: 'BASIC' | 'ADVANCED' | 'PREMIUM'
  const [simulatedPlan, setSimulatedPlan] = useState("BASIC");
  const [activeTopTab, setActiveTopTab] = useState("home");

  const syncConfigFromServer = async () => {
    try {
      const res = await fetch("/api/dashboard/website-builder", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        const photo = json.websiteConfig?.doctorPhoto || json.doctor?.profilePhoto || json.doctor?.image || json.doctor?.avatarUrl || "";
        const logo = json.websiteConfig?.clinicLogo || json.clinic?.logo || "";
        const adv = Boolean(json.isAdvanced);
        const prem = Boolean(json.isPremium);
        const detectedPlan = prem ? "PREMIUM" : adv ? "ADVANCED" : (json.planId || "BASIC").toUpperCase();

        setIsAdvanced(adv);
        setIsPremium(prem);
        setPlanId(detectedPlan);
        setSimulatedPlan(detectedPlan);

        const initialSpecialty = json.doctor?.specialty?.toLowerCase().includes("dent") ? "dental" : "dental";
        setSelectedSpecialty(initialSpecialty);
        const preset = getSpecialtyPreset(initialSpecialty);
        
        if (json.websiteConfig) {
          const loadedThemeColor = (json.websiteConfig.themeColor === "blue" || !json.websiteConfig.themeColor) ? "teal" : json.websiteConfig.themeColor;
          const loadedPrimaryColor = (json.websiteConfig.primaryColor === "#3B82F6" || !json.websiteConfig.primaryColor) ? "#0A8692" : json.websiteConfig.primaryColor;

          setConfig(prev => ({
            ...prev,
            ...json.websiteConfig,
            themeColor: loadedThemeColor,
            primaryColor: loadedPrimaryColor,
            templateId: json.websiteConfig.template || json.websiteConfig.templateId || "minimal-solo",
            doctorPhoto: photo || prev.doctorPhoto || "",
            clinicLogo: logo || prev.clinicLogo || "",
            headline: json.websiteConfig.headline || preset?.headline || "Modern, Painless Dental Care & Precision Smile Aesthetics",
            bio: json.websiteConfig.bio || preset?.description || "State-of-the-art clinical solutions with computerized painless anesthesia and zero wait tokens.",
            hideBranding: prem ? Boolean(json.websiteConfig.hideBranding) : false,
            videoBioUrl: json.websiteConfig.videoBioUrl || "",
            enableWhatsApp: json.websiteConfig.enableWhatsappChat !== undefined ? json.websiteConfig.enableWhatsappChat : true,
            enableEmergencyBanner: json.websiteConfig.emergencyDayOff !== undefined ? json.websiteConfig.emergencyDayOff : false,
          }));
        } else {
          setConfig(prev => ({
            ...prev,
            themeColor: "teal",
            primaryColor: "#0A8692",
            headline: preset?.headline || "Modern, Painless Dental Care & Precision Smile Aesthetics",
            bio: preset?.description || "State-of-the-art clinical solutions with computerized painless anesthesia and zero wait tokens."
          }));
        }
        setClinic(json.clinic);
        setDoctor(json.doctor);
        setSlug(json.slug || json.clinic?.slug || "alam-dental-clinic-3021");
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
      const selectedColorHex = payloadToSave?.primaryColor || payloadToSave?.themeColor || config.primaryColor || config.themeColor || "#0A8692";
      const selectedTheme = payloadToSave?.themeColor || config.themeColor || "teal";
      const selectedTemplate = payloadToSave?.templateId || config.templateId || "template-1";
      const selectedButtonStyle = payloadToSave?.buttonStyle !== undefined ? payloadToSave.buttonStyle : (config.buttonStyle || "rounded-2xl");
      const selectedTypography = payloadToSave?.fontStyle || config.fontStyle || "sans";
      const selectedMockupTheme = payloadToSave?.previewMode || config.previewMode || "light";

      const enableWhatsappChat = payloadToSave?.enableWhatsApp !== undefined ? payloadToSave.enableWhatsApp : config.enableWhatsApp;
      const emergencyNoticeActive = payloadToSave?.enableEmergencyBanner !== undefined ? payloadToSave.enableEmergencyBanner : config.enableEmergencyBanner;

      const payload = {
        ...config,
        ...payloadToSave,
        customDomain: payloadToSave?.customDomain !== undefined ? payloadToSave.customDomain : customDomain,
        templateId: selectedTemplate,
        doctorPhoto: payloadToSave?.doctorPhoto !== undefined ? payloadToSave.doctorPhoto : (config.doctorPhoto || ""),
        clinicLogo: payloadToSave?.clinicLogo !== undefined ? payloadToSave.clinicLogo : (config.clinicLogo || ""),
        themeColor: selectedTheme,
        primaryColor: selectedColorHex,
        buttonStyle: selectedButtonStyle,
        hideBranding: isPremium ? (payloadToSave?.hideBranding !== undefined ? payloadToSave.hideBranding : config.hideBranding) : false,
        videoBioUrl: payloadToSave?.videoBioUrl !== undefined ? payloadToSave.videoBioUrl : (config.videoBioUrl || ""),
        websiteConfig: {
          themeColor: selectedColorHex,
          buttonStyle: selectedButtonStyle,
          typography: selectedTypography,
          mockupTheme: selectedMockupTheme,
          template: selectedTemplate,
          enableWhatsappChat: Boolean(enableWhatsappChat),
          emergencyDayOff: Boolean(emergencyNoticeActive)
        }
      };

      // Save to localStorage for immediate client-side sync
      if (typeof window !== "undefined") {
        localStorage.setItem(`docpulse_website_config_${slug || 'default'}`, JSON.stringify(payload.websiteConfig));
        window.dispatchEvent(new Event('storage'));
      }

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
        router.refresh();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to publish changes");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = (presetId) => {
    setSelectedSpecialty(presetId);
    const preset = getSpecialtyPreset(presetId);
    if (preset) {
      const hex = THEME_COLOR_MAP[preset.color]?.primary || "#00A1AC";
      setConfig(prev => ({
        ...prev,
        themeColor: preset.color || "teal",
        primaryColor: hex,
        headline: preset.headline || prev.headline,
        bio: preset.description || prev.bio
      }));
      savePayload({
        themeColor: preset.color || "teal",
        primaryColor: hex,
        headline: preset.headline,
        bio: preset.description
      });
    }
  };

  const updateConfig = (field, value) => {
    setConfig(p => ({ ...p, [field]: value }));
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
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  // Active theme and styling tokens
  const activeTheme = getThemeConfig(config.themeColor || config.primaryColor);
  const doctorSpecialty = doctor?.specialization || doctor?.specialty || clinic?.category || "Dental Care";
  const currentPreset = getSpecialtyPreset(selectedSpecialty);
  const doctorName = doctor?.fullName ? `Dr. ${doctor.fullName.replace(/^Dr\.?\s*/i, "")}` : (doctor?.name || "Dr. Dilshad Alam");
  const clinicTitle = clinic?.name || "Alam Dental & Speciality Clinic";

  // Simulated features based on simulator pill
  const simIsBasic = simulatedPlan === "BASIC";
  const simIsAdvanced = simulatedPlan === "ADVANCED";
  const simIsPremium = simulatedPlan === "PREMIUM";
  const simIsAdvOrPrem = simIsAdvanced || simIsPremium;
  const isAdvancedOrHigher = isAdvanced || isPremium || simIsAdvOrPrem;

  const currentPlan = planId || 'BASIC';
  const isBasic = !isAdvancedOrHigher;

  // Allowed button styles for Basic plan:
  const basicAllowedButtonStyles = ['pill', 'soft', 'sharp'];
  // Locked button styles for Advanced+:
  const advancedButtonStyles = ['block', 'slight', 'circle'];

  // Canvas Enforcement Logic
  const enforceBasic = !isAdvancedOrHigher;
  
  // Enforced config values for the canvas
  const canvasConfig = {
    ...config,
    previewMode: isBasic ? 'light' : config.previewMode,
    fontStyle: isBasic ? 'sans' : config.fontStyle,
    buttonShape: (isBasic && advancedButtonStyles.includes(config.buttonShape)) ? 'pill' : config.buttonShape,
    enableWhatsApp: enforceBasic ? false : config.enableWhatsApp,
    enableMaps: enforceBasic ? false : config.enableMaps,
  };

  const cornerRadiusClass = canvasConfig.buttonShape === "pill" || canvasConfig.buttonStyle === "rounded-full"
    ? "rounded-full" 
    : canvasConfig.buttonShape === "sharp" || canvasConfig.buttonStyle === "rounded-none"
      ? "rounded-none" 
      : "rounded-2xl";

  const fontClass = canvasConfig.fontStyle === "serif" ? "font-serif" : "font-sans";
  const canvasServices = enforceBasic ? [
    { title: "Comprehensive Dental Consultation", price: "₹300", desc: "Comprehensive clinical consultation with verified digital prescription.", duration: "20 mins" },
    { title: "Root Canal Treatment (Single Sitting)", price: "₹2,500", desc: "Specialized endodontic therapy with painless computerized anesthesia.", duration: "45 mins" },
    { title: "Teeth Cleaning & Ultrasonic Polishing", price: "₹800", desc: "Full mouth deep ultrasonic scaling and stain removal polish.", duration: "30 mins" }
  ].slice(0, 5) : [
    { title: "Comprehensive Dental Consultation", price: "₹300", desc: "Comprehensive clinical consultation with verified digital prescription.", duration: "20 mins" },
    { title: "Root Canal Treatment (Single Sitting)", price: "₹2,500", desc: "Specialized endodontic therapy with painless computerized anesthesia.", duration: "45 mins" },
    { title: "Teeth Cleaning & Ultrasonic Polishing", price: "₹800", desc: "Full mouth deep ultrasonic scaling and stain removal polish.", duration: "30 mins" }
  ];

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden p-4 sm:p-5 bg-[#F8FAFC] font-sans text-[#0f172a]">
      
      {/* 2. Header & Live Simulator Strip */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-slate-200/80">
        
        {/* Left: Globe Icon + Title + Tier Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center shrink-0 border border-[#00A1AC]/20 shadow-2xs">
            <Globe className="w-4 h-4 text-[#00A1AC]" />
          </div>
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
              Website Studio &amp; Theme Engine
            </h1>
            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-teal-50 border border-amber-300 text-[10px] font-black text-amber-900 shadow-2xs">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>👑 Premium Tier</span>
              </span>
            ) : isAdvanced ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-black text-[#00A1AC] shadow-2xs">
                <span>✨ Advanced</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 shadow-2xs">
                <span>Basic Tier</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Active Plan Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 self-start md:self-auto text-xs font-black text-slate-800">
          <span className="w-2 h-2 rounded-full bg-[#00A1AC]"></span>
          <span>{planId === 'PREMIUM' || planId === 'ENTERPRISE' ? 'Premium VIP (₹1,499)' : planId === 'ADVANCED' || planId === 'PRO' ? 'Advanced Clinic (₹999)' : 'Basic OPD (₹499)'}</span>
        </div>

        {/* Right: Slug Chip + Publish Button */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
          >
            <span>/{slug}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={() => savePayload({ ...config, customDomain })}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-white ${
              savedSuccess
                ? "bg-emerald-600"
                : "bg-[#00A1AC] hover:bg-[#008790] shadow-[#00A1AC]/25"
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? "Saved Live!" : "Publish & Save Changes"}</span>
          </button>
        </div>

      </div>

      {/* 3. Registered Clinical Specialty Badge Strip */}
      <div className="shrink-0 flex items-center justify-between gap-2 overflow-x-auto py-1.5 border-b border-slate-200/50 hide-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00A1AC]" /> REGISTERED CLINICAL SPECIALTY:
          </span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20 flex items-center gap-1.5 shadow-2xs">
            ✓ {doctorSpecialty}
          </span>
          <span className="text-[10px] text-slate-400 italic">(Synced from Onboarding Profile)</span>
        </div>
      </div>

      {/* 4. 2-COLUMN BALANCED STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden py-1.5 items-stretch min-h-0">
        
        {/* =========================================================================
            LEFT CONTROLLER PANEL (5 Cols)
            ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          
          {/* Top Tab Navigator (4 Modern Icons + Pills) */}
          <div className="shrink-0 flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 overflow-x-auto hide-scrollbar mb-2.5">
            {[
              { id: "theme", label: "Theme & Style", icon: Palette },
              { id: "profile", label: "Profile & Bio", icon: ImageIcon },
              { id: "opd", label: "OPD & Social", icon: Settings2 },
              { id: "whitelabel", label: "White-Label", icon: Crown }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#00A1AC] shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body (Filled vertically, balanced) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 min-h-0 text-xs">
            
            {/* TAB 1: THEME & STYLE */}
            {activeTab === "theme" && (
              <div className="space-y-3">
                
                {/* 1. Primary Accent Palette (6 Basic + 6 Advanced Exclusive) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700 text-[11px]">Primary Accent Palette</span>
                      {!isAdvancedOrHigher && (
                        <span className="text-[8.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                          🔒 6 Adv Colors
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase" style={{ color: activeTheme.primary }}>
                      {activeTheme.id.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_PALETTES.map(c => {
                      const isSelected = 
                        (config.themeColor || "").toLowerCase() === c.id.toLowerCase() || 
                        (config.primaryColor || "").toLowerCase() === c.hex.toLowerCase() ||
                        (activeTheme?.id || "").toLowerCase() === c.id.toLowerCase() ||
                        (activeTheme?.primary || "").toLowerCase() === c.hex.toLowerCase();
                      const isLocked = c.tier === "ADVANCED" && !isAdvancedOrHigher;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              setUpgradeReason(`${c.name} accent palette requires an Advanced Plan (₹999).`);
                              setShowUpgradeModal(true);
                              return;
                            }
                            updateConfig("themeColor", c.id);
                            updateConfig("primaryColor", c.hex);
                            savePayload({ themeColor: c.id, primaryColor: c.hex });
                          }}
                          className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer relative ${
                            isSelected 
                              ? "bg-slate-50 shadow-xs ring-2 font-black" 
                              : isLocked
                                ? "border-slate-200 bg-slate-50/50 hover:border-amber-300 opacity-75"
                                : "border-slate-200 hover:border-slate-300"
                          }`}
                          style={isSelected ? { borderColor: c.hex, ringColor: c.hex } : {}}
                        >
                          <div 
                            className="w-7 h-7 rounded-full shadow-2xs flex items-center justify-center transition-transform hover:scale-105 relative"
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                            {isLocked && (
                              <div className="absolute -top-1 -right-1 bg-white/95 rounded-full p-0.5 shadow-2xs border border-slate-200">
                                <Lock className="w-2.5 h-2.5 text-amber-600" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-600 truncate w-full text-center">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Button Style (6 Options: 3 Basic, 3 Advanced) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700 text-[11px]">Button Style</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "pill", label: "Pill (Full)", shapeClass: "rounded-full" },
                      { id: "soft", label: "Soft (XL)", shapeClass: "rounded-2xl" },
                      { id: "sharp", label: "Sharp", shapeClass: "rounded-none" },
                      { id: "block", label: "Block (Md)", shapeClass: "rounded-md", tier: "ADVANCED" },
                      { id: "slight", label: "Slight (Sm)", shapeClass: "rounded-sm", tier: "ADVANCED" },
                      { id: "circle", label: "Circle", shapeClass: "rounded-3xl", tier: "ADVANCED" }
                    ].map(s => {
                      const isLocked = isBasic && advancedButtonStyles.includes(s.id);
                      const isSelected = !isLocked && (
                        config.buttonShape === s.id || 
                        config.buttonStyle === s.shapeClass ||
                        (s.id === "pill" && (config.buttonShape === "pill" || config.buttonStyle === "rounded-full")) ||
                        (s.id === "soft" && (config.buttonShape === "soft" || config.buttonShape === "curved" || config.buttonStyle === "rounded-2xl" || config.buttonStyle === "rounded-xl")) ||
                        (s.id === "sharp" && (config.buttonShape === "sharp" || config.buttonStyle === "rounded-none" || config.buttonStyle === "rounded-sm"))
                      );
                      
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              setUpgradeReason(`${s.label} button style requires an Advanced Plan.`);
                              setShowUpgradeModal(true);
                              return;
                            }
                            updateConfig("buttonShape", s.id);
                            updateConfig("buttonStyle", s.shapeClass);
                            savePayload({ buttonShape: s.id, buttonStyle: s.shapeClass });
                          }}
                          className={`py-2 px-2 text-xs font-bold border transition-all flex items-center justify-center relative ${s.shapeClass} ${
                            isSelected
                              ? "shadow-xs font-black ring-1"
                              : isLocked
                                ? "bg-slate-50/50 text-slate-400 border-slate-200 cursor-pointer hover:border-amber-300"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer"
                          }`}
                          style={isSelected ? { 
                            borderColor: activeTheme.primary, 
                            color: activeTheme.primary, 
                            backgroundColor: `${activeTheme.primary}0D`, 
                            boxShadow: `0 0 0 1px ${activeTheme.primary}` 
                          } : {}}
                        >
                          {s.label}
                          {isLocked && <span className="absolute -top-1.5 -right-1.5 text-[8px] flex items-center justify-center w-3.5 h-3.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 shadow-xs">🔒</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Typography & Preview Mode */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px]">Typography</span>
                      {!isAdvanced && !isPremium && (
                        <span className="text-[8.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                          🔒 Advanced
                        </span>
                      )}
                    </div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateConfig("fontStyle", "sans")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          config.fontStyle === "sans" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Modern Sans
                      </button>
                      <button
                        type="button"
                        disabled={!isAdvanced && !isPremium}
                        onClick={() => {
                          if (!isAdvanced && !isPremium) {
                            setUpgradeReason("Executive Serif typography requires an Advanced Plan.");
                            setShowUpgradeModal(true);
                            return;
                          }
                          updateConfig("fontStyle", "serif");
                        }}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md font-serif transition-all ${
                          !isAdvanced && !isPremium
                            ? "opacity-50 cursor-not-allowed text-slate-400"
                            : config.fontStyle === "serif"
                              ? "bg-white text-slate-900 shadow-2xs font-black cursor-pointer"
                              : "text-slate-500 hover:text-slate-800 cursor-pointer"
                        }`}
                      >
                        Executive Serif
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px]">Mockup Theme</span>
                      {!isAdvanced && !isPremium && (
                        <span className="text-[8.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                          🔒 Advanced
                        </span>
                      )}
                    </div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateConfig("previewMode", "light")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          config.previewMode === "light" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Sun className="w-3 h-3 text-amber-500" /> Light
                      </button>
                      <button
                        type="button"
                        disabled={!isAdvanced && !isPremium}
                        onClick={() => {
                          if (!isAdvanced && !isPremium) {
                            setUpgradeReason("Dark mode website preview requires an Advanced Plan.");
                            setShowUpgradeModal(true);
                            return;
                          }
                          updateConfig("previewMode", "dark");
                        }}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                          !isAdvanced && !isPremium
                            ? "opacity-50 cursor-not-allowed text-slate-400"
                            : config.previewMode === "dark"
                              ? "bg-slate-800 text-white shadow-2xs font-black cursor-pointer"
                              : "text-slate-500 hover:text-slate-800 cursor-pointer"
                        }`}
                      >
                        <Moon className="w-3 h-3 text-indigo-400" /> Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Template Style */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-[11px]">Template Structure</span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {isPremium ? "9 VIP Templates Unlocked" : isAdvanced ? "5 Templates Unlocked" : "2 Basic Templates"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TEMPLATE_PRESETS.map(t => {
                      const isSelected = config.templateId === t.id || (t.id === 'minimal-solo' && (!config.templateId || config.templateId === 'template-1'));
                      const isLocked = (t.tier === 'ADVANCED' && !isAdvanced && !isPremium) || (t.tier === 'PREMIUM' && !isPremium);

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            if (isBasic && !basicTemplates.includes(t.id)) {
                              setUpgradeReason(`${t.name} template requires an Advanced or Premium VIP Plan.`);
                              setShowUpgradeModal(true);
                              return;
                            }
                            if (isLocked) {
                              setUpgradeReason(`${t.name} template requires a ${t.tier === 'PREMIUM' ? 'Premium VIP' : 'Advanced'} Plan.`);
                              setShowUpgradeModal(true);
                              return;
                            }
                            updateConfig("templateId", t.id);
                            savePayload({ templateId: t.id });
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[10.5px] font-bold border transition-all text-center relative ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs cursor-pointer"
                              : isLocked
                                ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100/70 cursor-pointer opacity-70"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          <div className="truncate">{t.name}</div>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            {isLocked && <span className="text-[8px]">🔒</span>}
                            <span className={`text-[8px] font-semibold ${
                              isSelected ? "text-teal-300" : isLocked ? "text-amber-700/80 font-bold" : "text-slate-400"
                            }`}>
                              {t.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PROFILE & BIO */}
            {activeTab === "profile" && (
              <div className="space-y-2.5">
                {/* Headline Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Doctor &amp; Clinic Headline</label>
                  <input
                    type="text"
                    value={config.headline || ""}
                    onChange={(e) => updateConfig("headline", e.target.value)}
                    onBlur={(e) => savePayload({ headline: e.target.value })}
                    placeholder="e.g. Modern, Painless Dental Care & Precision Smile Aesthetics"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                  />
                </div>

                {/* Sub-bio Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Practice Summary (2-Line Bio)</label>
                  <textarea
                    rows={2}
                    value={config.bio || ""}
                    onChange={(e) => updateConfig("bio", e.target.value)}
                    onBlur={(e) => savePayload({ bio: e.target.value })}
                    placeholder="Short summary of clinical expertise, painless procedures, and sterilized care..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A1AC] resize-none"
                  />
                </div>

                {/* Doctor Photo & Logo In 2-Col Grid */}
                <div className="pt-1 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Header 1: Doctor Photo */}
                    <div className="p-2 rounded-xl border space-y-1.5 transition-all bg-slate-50 border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-slate-700">Doctor Photo</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {config.doctorPhoto ? (
                            <img src={config.doctorPhoto} alt="Doc" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <label className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs cursor-pointer hover:bg-slate-50">
                          <Upload className="w-3 h-3 text-[#0A8692]" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, "doctorPhoto")} 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Header 2: Clinic Logo */}
                    <div className="p-2 rounded-xl border space-y-1.5 transition-all bg-slate-50 border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-slate-700">Clinic Logo</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                          {config.clinicLogo ? (
                            <img src={config.clinicLogo} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <Building className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <label className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs cursor-pointer hover:bg-slate-50">
                          <Upload className="w-3 h-3 text-[#0A8692]" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, "clinicLogo")} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Consultation Embed */}
                <div className={`p-2.5 rounded-xl border space-y-1 ${isPremium ? "bg-white border-amber-300 shadow-2xs" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-slate-700 flex items-center gap-1">
                      <Video className={`w-3.5 h-3.5 ${isPremium ? "text-amber-500" : "text-slate-400"}`} />
                      <span>Video Consultation Hero Embed</span>
                    </span>
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded ${isPremium ? "bg-amber-100 text-amber-900" : "bg-slate-200 text-slate-500"}`}>
                      {isPremium ? "VIP Active" : "👑 Premium"}
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={!isPremium}
                    placeholder="https://youtube.com/watch?v=..."
                    value={config.videoBioUrl || ""}
                    onChange={(e) => updateConfig("videoBioUrl", e.target.value)}
                    onBlur={(e) => isPremium && savePayload({ videoBioUrl: e.target.value })}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:outline-none ${
                      isPremium ? "bg-white border-slate-200 text-slate-900 focus:border-amber-400" : "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: OPD & SOCIAL */}
            {activeTab === "opd" && (
              <div className="space-y-2.5">
                {/* 1. Emergency Day-OFF Sync Toggle (All tiers / Basic active) */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Emergency Day-OFF Notice Sync</div>
                      <div className="text-[10px] text-slate-500">Shows urgent closure banner on top</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableEmergencyBanner}
                      onChange={(e) => {
                        updateConfig("enableEmergencyBanner", e.target.checked);
                        savePayload({ enableEmergencyBanner: e.target.checked });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {/* 2. WhatsApp Toggle (Locked for Basic / Unlocked for Advanced & Premium) */}
                <div 
                  onClick={() => {
                    if (!isAdvancedOrHigher) {
                      promptUpgrade("Floating WhatsApp Chat is unlocked in the Advanced Plan (₹999).");
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs transition-all ${
                    !isAdvancedOrHigher ? "bg-slate-50/80 border-slate-200 cursor-pointer hover:border-amber-300" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold text-xs text-slate-900">Floating WhatsApp Direct Chat</span>
                        {!isAdvancedOrHigher && (
                          <span className="ml-2 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            🔒 Advanced
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">Live booking support button on site</div>
                    </div>
                  </div>
                  <label className={`relative inline-flex items-center ${!isAdvancedOrHigher ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      disabled={!isAdvancedOrHigher}
                      checked={isAdvancedOrHigher && config.enableWhatsApp}
                      onChange={(e) => {
                        updateConfig("enableWhatsApp", e.target.checked);
                        savePayload({ enableWhatsApp: e.target.checked });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 3. Google Maps Direct Nav (Locked for Basic / Unlocked for Advanced & Premium) */}
                <div 
                  onClick={() => {
                    if (!isAdvancedOrHigher) {
                      promptUpgrade("Direct Google Maps Navigation is unlocked in the Advanced & Premium Plans.");
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs transition-all ${
                    !isAdvancedOrHigher ? "bg-slate-50/80 border-slate-200 cursor-pointer hover:border-[#00A1AC]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold text-xs text-slate-900">Direct Google Maps Navigation</span>
                        {!isAdvancedOrHigher && (
                          <span className="ml-2 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            🔒 Advanced
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">1-click directions on contact card</div>
                    </div>
                  </div>
                  <label className={`relative inline-flex items-center ${!isAdvancedOrHigher ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      disabled={!isAdvancedOrHigher}
                      checked={isAdvancedOrHigher && config.enableMaps}
                      onChange={(e) => {
                        updateConfig("enableMaps", e.target.checked);
                        savePayload({ enableMaps: e.target.checked });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0A8692]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: WHITE-LABEL */}
            {activeTab === "whitelabel" && (
              <div className="space-y-3">
                {/* Master White-label Switch */}
                <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isPremium ? "bg-gradient-to-br from-amber-500/10 via-white to-teal-50 border-amber-300" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="font-black text-slate-900 text-xs">Remove DocPulse Platform Branding</span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      isPremium ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-slate-200 text-slate-600"
                    }`}>
                      {isPremium ? "Active" : "Premium Tier"}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Render only your clinic copyright on footer. Hides all third-party branding.
                  </p>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <span className="font-bold text-slate-800 text-[11px]">100% White-Label Mode</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isPremium) {
                          promptUpgrade("100% White-Label Branding Switch");
                        } else {
                          const updated = !config.hideBranding;
                          updateConfig("hideBranding", updated);
                          savePayload({ hideBranding: updated });
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        config.hideBranding ? "bg-amber-500" : "bg-slate-300"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        config.hideBranding ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Custom Domain Input */}
                <div className={`p-3 rounded-xl border space-y-2 ${isAdvanced || isPremium ? "bg-white border-teal-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-[#00A1AC]" /> Custom Domain
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isAdvanced || isPremium ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-500"}`}>
                      {isAdvanced || isPremium ? "Unlocked" : "🔒 Pro Feature"}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      disabled={!isAdvanced && !isPremium}
                      placeholder="e.g. drdilshad.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className={`flex-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:outline-none ${
                        isAdvanced || isPremium ? "bg-white border-slate-200 text-slate-900 focus:border-[#00A1AC]" : "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                      }`}
                    />
                    {(isAdvanced || isPremium) && (
                      <button
                        type="button"
                        onClick={() => savePayload({ customDomain })}
                        className="px-3 py-1.5 bg-[#00A1AC] hover:bg-[#008790] text-white font-bold text-xs rounded-lg shadow-2xs"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* =========================================================================
            RIGHT MOCKUP CANVAS (7 Cols)
            ========================================================================= */}
        <div className="lg:col-span-7 bg-[#0F172A] rounded-2xl border border-slate-800 p-3 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Realistic Browser Chrome */}
          <div className="shrink-0 flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="bg-slate-800/90 border border-slate-700 px-3 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                <Search className="w-2.5 h-2.5 text-slate-400" />
                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                  https://{slug}.docpulse.com
                </span>
              </div>
            </div>

            {/* Live Mode Tag */}
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-2xs bg-slate-800 text-slate-300 border-slate-700">
              Live Mode: Basic OPD
            </span>
          </div>

          {/* Mockup Screen Viewport (Scrollable inside container) */}
          <div className={`flex-1 w-full overflow-y-auto max-h-[620px] scrollbar-thin scrollbar-thumb-slate-400/40 rounded-xl border border-slate-800/80 shadow-inner min-h-0 text-xs transition-colors ${
            (!isBasic && config.previewMode === "dark") ? "bg-[#070F14] text-slate-100" : "bg-white text-slate-900"
          } ${fontClass}`}>
            
            <div>
              {config.enableEmergencyBanner && (
                <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-[9px] font-bold flex items-center justify-center gap-2 shadow-xs w-full">
                  <span>⚠️ Urgent Clinic Notice:</span>
                  <span>OPD is temporarily paused for emergency maintenance today. Online bookings are on hold.</span>
                </div>
              )}
              {/* 1. True Public Navbar */}
              <div className="w-full relative z-20 pointer-events-none [&_button]:pointer-events-none [&_a]:pointer-events-none">
                <PublicNavbar
                  clinic={clinic}
                  doctor={doctor}
                  planId={currentPlan}
                  navbarType="basic"
                  slug={slug}
                  activeTheme={activeTheme}
                  buttonShapeClass={cornerRadiusClass}
                  isCompact={true}
                />
              </div>

              {isBasic ? (
                <>
                  {/* ===================== HERO SECTION ===================== */}
                  {canvasConfig.templateId === 'clean-clinic' || canvasConfig.templateId === 'clean_clinic' ? (
                    /* --- TEMPLATE 2: CLEAN CLINIC (Centered Clinical Hero) --- */
                    <section id="home" className="w-full max-w-4xl mx-auto px-4 py-8 text-center transition-all duration-200">
                      {/* Doctor Avatar Bubble & Badges */}
                      <div className="flex flex-col items-center justify-center mb-5">
                        <div className="w-20 h-20 rounded-full p-1 border-2 shadow-md mb-3 bg-white" style={{ borderColor: activeTheme.primary }}>
                          <img 
                            src={canvasConfig.doctorPhoto || config.doctorPhoto || doctor?.avatarUrl || '/images/default-doctor.jpg'} 
                            alt={doctorName || 'Doctor'} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                            {doctorSpecialty || 'Dentistry & Oral Surgery'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                            {doctor?.experience || '5+'} Yrs Exp
                          </span>
                        </div>
                      </div>

                      {/* Centered Headline & Bio */}
                      <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-3 max-w-2xl mx-auto">
                        {canvasConfig.headline || config.headline || doctor?.headline || 'Modern, Painless Dental Care & Precision Smile Aesthetics'}
                      </h1>
                      <p className="text-[10px] md:text-xs text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
                        {canvasConfig.bio || config.bio || doctor?.bio || 'Comprehensive clinical care with verified digital appointments and zero queue wait times.'}
                      </p>

                      {/* Centered Action Buttons */}
                      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        <button 
                          className={`px-5 py-2.5 ${cornerRadiusClass} text-white font-bold text-[10px] shadow-md transition-all hover:opacity-95`} 
                          style={{ backgroundColor: activeTheme.primary }}
                        >
                          📅 Book Confirmed OPD Slot →
                        </button>
                        <button 
                          className={`px-4 py-2.5 ${cornerRadiusClass} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all`}
                        >
                          📞 Call Clinic
                        </button>
                      </div>

                      {/* Centered 4-Pill Highlights Strip */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 max-w-3xl mx-auto">
                        {['Autoclave Sterilized', 'Painless Care', 'Digital RVG X-Ray', 'Zero Wait Token'].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-700">
                            <span className="text-emerald-500 font-black">✓</span>
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : (
                    /* --- TEMPLATE 1: MINIMAL SOLO (Classic 2-Column Split Hero - Default Fallback) --- */
                    <section id="home" className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 transition-all duration-200">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        
                        {/* Left Column: Headline, Bio & CTAs */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                              {doctorSpecialty || 'Dentistry & Oral Surgery'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-700">
                              {doctor?.qualification || 'BDS, MDS'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                              {doctor?.experience || '5+'} Years Experience
                            </span>
                          </div>

                          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                            {canvasConfig.headline || config.headline || doctor?.headline || 'Modern, Painless Dental Care & Precision Smile Aesthetics'}
                          </h1>

                          <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed max-w-xl">
                            {canvasConfig.bio || config.bio || doctor?.bio || 'Dental refers to anything relating to the teeth, gums, and overall oral cavity, including healthcare services, diagnostics, and treatments provided by a dentist.'}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                            {['100% Autoclave Sterilized', 'Painless Anesthesia', 'Digital RVG X-Ray', 'Zero Wait Token'].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[9px] font-bold text-slate-700">
                                <span className="text-emerald-600 font-black">✓</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <button 
                              className={`px-4 py-2 ${cornerRadiusClass} text-white font-bold text-[10px] shadow-md transition-all hover:opacity-95`} 
                              style={{ backgroundColor: activeTheme.primary }}
                            >
                              📅 Book Confirmed OPD Slot →
                            </button>
                            <button 
                              className={`px-4 py-2 ${cornerRadiusClass} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all`}
                            >
                              📞 Call Clinic
                            </button>
                          </div>
                        </div>

                        {/* Right Column: Doctor Photo Card */}
                        <div className="lg:col-span-5 flex justify-center lg:justify-end">
                          <div className="w-full max-w-[200px] bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xl">
                            <div className="relative w-full aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                              <img 
                                src={canvasConfig.doctorPhoto || config.doctorPhoto || doctor?.avatarUrl || '/images/default-doctor.jpg'} 
                                alt={doctorName || 'Doctor'} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="text-center pb-1">
                              <h3 className="text-sm font-black text-slate-900">{doctorName || 'Alam'}</h3>
                              <p className="text-[9px] font-bold mt-0.5" style={{ color: activeTheme.primary }}>{doctorSpecialty || 'Dentist & Oral Surgeon'}</p>
                              <p className="text-[8px] text-slate-400 mt-0.5">{clinic?.name || doctor?.clinicName || 'Alam Dental Clinic'} • {doctor?.city || 'Patna'}</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </section>
                  )}
                </>
              ) : (
                (() => {
                  const templateProps = {
                    clinic: clinic || { name: doctor?.clinicName || "Alam Dental Clinic" },
                    doctor: doctor || { fullName: doctorName, specialty: doctorSpecialty },
                    websiteConfig: canvasConfig,
                    currentTier: isAdvancedOrHigher ? 'ADVANCED' : 'BASIC',
                    tier: { navbarType: 'basic' },
                    slug: slug,
                    activeTheme: activeTheme,
                    buttonShapeClass: cornerRadiusClass,
                    isDarkMode: canvasConfig.previewMode === 'dark',
                    containerClass: "",
                    specialtyPreset: getSpecialtyPreset(doctorSpecialty),
                    compact: true
                  };
                  
                  switch (canvasConfig.templateId) {
                    case 'oceanic-pro':
                      return <OceanicPro {...templateProps} />;
                    case 'care-grid':
                      return <CareGrid {...templateProps} />;
                    case 'clean-clinic':
                      return <CleanClinic {...templateProps} />;
                    case 'minimal-solo':
                    default:
                      return <MinimalSolo {...templateProps} />;
                  }
                })()
              )}

              {/* 3. Clinical Consultation & Treatments Catalog Section */}
              <div className={`py-3.5 px-4 border-t transition-colors ${
                canvasConfig.previewMode === "dark" ? "border-slate-800 bg-[#0a1219]" : "border-slate-100 bg-slate-50/40"
              }`}>
                {/* Center Header Block */}
                <div className="text-center max-w-sm mx-auto">
                  <span 
                    style={{ 
                      color: activeTheme.primary, 
                      backgroundColor: `${activeTheme.primary}15`, 
                      borderColor: `${activeTheme.primary}30` 
                    }}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase tracking-wider"
                  >
                    SERVICES &amp; RATE CATALOG
                  </span>
                  <h2 className={`text-sm font-black mt-1 tracking-tight ${canvasConfig.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    Clinical Consultation &amp; Treatments
                  </h2>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Select a clinical service below to book an instant confirmed OPD slot.
                  </p>
                </div>

                {/* Dynamic Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                  {canvasServices.map((srv, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                        canvasConfig.previewMode === "dark" 
                          ? "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200" 
                          : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <h3 className={`font-bold text-[10px] leading-tight ${canvasConfig.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {srv.title}
                          </h3>
                          <span 
                            style={{ color: activeTheme.primary }} 
                            className="font-black text-xs shrink-0"
                          >
                            {srv.price}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                          {srv.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-auto">
                        <span className="text-[8px] font-semibold text-slate-400 flex items-center gap-0.5">
                          ⏱ {srv.duration}
                        </span>
                        <button
                          type="button"
                          style={{ 
                            backgroundColor: `${activeTheme.primary}15`, 
                            color: activeTheme.primary 
                          }}
                          className={`px-2.5 py-1 ${cornerRadiusClass} text-[8.5px] font-bold transition-all hover:opacity-80 active:scale-95 cursor-pointer`}
                        >
                          Select Slot →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OPD Schedule Section */}
            <div className={`py-4 px-5 border-t transition-colors ${
              canvasConfig.previewMode === "dark" ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50/80"
            }`}>
              <div className="text-center max-w-sm mx-auto mb-4">
                <span style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}15`, borderColor: `${activeTheme.primary}30` }} className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase tracking-wider">
                  Doctor Shift Timings
                </span>
                <h2 className={`text-sm font-black mt-1 tracking-tight ${canvasConfig.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  Weekly OPD Schedule
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Left CTA Card */}
                <div style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, #0f172a)` }} className={`rounded-xl p-4 shadow-lg text-white flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-sm font-black">{clinicTitle}</h3>
                    <p className="text-[9px] text-white/80 mt-1">Walk-in & Online Slots Available</p>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-2 mt-3">
                      <div className="text-[10px] font-black">✨ Instant Digital Token</div>
                    </div>
                  </div>
                  <button type="button" className={`w-full py-2 mt-4 bg-white text-slate-900 text-[10px] font-bold ${cornerRadiusClass} shadow-md`} style={{ color: activeTheme.primary }}>
                    Schedule Consultation →
                  </button>
                </div>
                
                {/* Right Timing Table */}
                <div className={`rounded-xl border p-3 shadow-sm ${canvasConfig.previewMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2 mb-2 text-[8px] font-black uppercase text-slate-400">
                    <span>Day</span>
                    <div className="flex gap-4">
                      <span className="text-amber-500">Morning</span>
                      <span className="text-indigo-500">Evening</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-[9px]">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                      <div key={day} className={`flex justify-between ${i===0 ? 'font-bold' : ''}`} style={i===0 ? {color: activeTheme.primary} : {}}>
                        <span>{day} {i===0 && '(TODAY)'}</span>
                        <div className={`flex gap-4 opacity-90 ${canvasConfig.previewMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className="w-16 text-center">10:00 - 14:00</span>
                          <span className="w-16 text-center">17:00 - 20:00</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className={`py-4 px-5 border-t transition-colors ${
              canvasConfig.previewMode === "dark" ? "border-slate-800 bg-[#0a1219]" : "border-slate-100 bg-white"
            }`}>
              <div className="text-center max-w-sm mx-auto mb-4">
                <span style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}15`, borderColor: `${activeTheme.primary}30` }} className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase tracking-wider">
                  Contact & Location
                </span>
                <h2 className={`text-sm font-black mt-1 tracking-tight ${canvasConfig.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  Visit or Connect
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Address & Navigation */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between ${canvasConfig.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <h3 className={`text-[10px] font-black ${canvasConfig.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Clinic Address</h3>
                    <p className={`text-[9px] mt-1 leading-snug ${canvasConfig.previewMode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{clinic?.address || doctor?.address || "Sultanganj, Patna"}</p>
                  </div>
                  <span className="text-[9px] font-bold inline-flex items-center gap-1 mt-3" style={{ color: activeTheme.primary }}>
                    Get Directions ↗
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className={`p-2 rounded-xl border flex justify-between items-center ${canvasConfig.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Reception Line</span>
                      <p className={`text-[10px] font-black ${canvasConfig.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{doctor?.phone || clinic?.phone || "1234567898"}</p>
                    </div>
                    <span style={{ color: activeTheme.primary }}>📞</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex justify-between items-center ${canvasConfig.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-[#25D366]/5 border-[#25D366]/20'}`}>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">WhatsApp OPD</span>
                      <p className={`text-[10px] font-black ${canvasConfig.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Direct Desk</p>
                    </div>
                    <span className="text-[#25D366]">💬</span>
                  </div>
                </div>
              </div>
              
              {/* Advanced Maps view visual */}
              {isAdvancedOrHigher && canvasConfig.enableMaps && (
                <div className={`mt-3 h-24 rounded-xl border flex items-center justify-center overflow-hidden ${canvasConfig.previewMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">📍 Google Maps View (Simulated)</span>
                </div>
              )}
            </div>

            {/* 4. Fully Integrated Clinic Footer (Bottom of Viewport) */}
            <div className={`w-full mt-4 transition-colors ${
              canvasConfig.previewMode === "dark" ? "bg-slate-900/90" : "bg-slate-50/70"
            }`}>
              <PublicFooter 
                clinic={clinic} 
                doctor={{
                  ...doctor,
                  name: doctorName,
                  fullName: doctorName,
                  clinicName: clinicTitle,
                  phone: doctor?.phone || clinic?.phone || "1234567898",
                  address: doctor?.address || clinic?.address || "Sultanganj",
                  city: doctor?.city || clinic?.city || "Patna"
                }} 
                websiteConfig={{
                  ...config,
                  primaryColor: activeTheme.primary
                }} 
                planId={simulatedPlan}
                specialtyPreset={currentPreset}
                compact={true}
              />
            </div>



          </div>

        </div>

      </div>

      {/* 5. Bottom Studio Status Bar */}
      <div className="shrink-0 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>● Real-time canvas active • All modifications preview instantly</span>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href={`/${slug}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#00A1AC] hover:text-[#008790] font-bold transition-colors flex items-center gap-1"
          >
            <span>Preview Fullscreen Public Site</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                Premium Studio Feature
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2">Unlock {upgradeReason || "Exclusive Studio Feature"}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                100% white-labeling, custom domain mapping, and video consultation embeds are unlocked on higher tier plans.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <Link 
                href="/dashboard/billing"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
              >
                <span>Upgrade Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Settings, Building2, MapPin, Phone, MessageSquare, 
  Save, Loader2, Sparkles, Check, Globe, Link2, ExternalLink,
  ShieldCheck, User, Stethoscope, AlertCircle, Crown, Lock, ArrowUpRight, X
} from "lucide-react";
import Link from "next/link";

export default function ClinicSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPlan, setCurrentPlan] = useState("BASIC");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    clinicName: "",
    phone: "",
    address: "",
    city: "",
    googleMapsUrl: "",
    whatsAppNotifications: false,
    whatsAppWebhookUrl: "",
    doctorName: "",
    qualification: "",
    specialization: "",
    experienceYrs: "",
    bio: ""
  });

  const [clinicSlug, setClinicSlug] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/settings", { cache: "no-store" });
      const data = await res.json();
      
      if (data.success) {
        const c = data.clinic || {};
        const d = data.doctorProfile || {};
        const adv = Boolean(data.isAdvanced);
        const prem = Boolean(data.isPremium);
        const plan = (data.planId || "BASIC").toUpperCase();

        setIsAdvanced(adv);
        setIsPremium(prem);
        setCurrentPlan(plan);
        setClinicSlug(c.slug || "");
        
        setFormData({
          clinicName: c.name || "",
          phone: c.phone || "",
          address: c.address || "",
          city: c.city || "",
          googleMapsUrl: c.googleMapsUrl || "",
          whatsAppNotifications: adv || prem ? (c.whatsAppNotifications !== undefined ? Boolean(c.whatsAppNotifications) : true) : false,
          whatsAppWebhookUrl: c.whatsAppWebhookUrl || "",
          doctorName: d.fullName || "",
          qualification: d.qualification || "",
          specialization: d.specialization || "",
          experienceYrs: d.experienceYrs ? String(d.experienceYrs) : "",
          bio: d.bio || ""
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load clinic settings", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleWhatsAppToggleClick = () => {
    if (!isAdvanced && !isPremium) {
      setUpgradeReason("Automated WhatsApp Patient Notifications are unlocked in the Advanced Plan (₹999).");
      setShowUpgradeModal(true);
      return;
    }
    setFormData(prev => ({ ...prev, whatsAppNotifications: !prev.whatsAppNotifications }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clinic/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");

      showToast("Clinic Profile & Settings saved successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-slate-50">
        <Loader2 className="h-9 w-9 animate-spin text-[#0A8692]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col h-[calc(100vh-74px)] max-w-7xl mx-auto font-sans bg-[#F8FAFC] text-[#0f172a] gap-4 overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-3 ${
          toast.type === "error" 
            ? "bg-rose-900 text-rose-100 border-rose-700" 
            : "bg-[#0c2e3d] text-teal-100 border-[#0A8692]"
        }`}>
          <Sparkles className="w-4 h-4 text-[#0A8692]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0A8692]/10 text-[#0A8692] flex items-center justify-center shrink-0 border border-[#0A8692]/20 shadow-2xs">
            <Settings className="w-4 h-4 text-[#0A8692]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                Clinic Profile &amp; Practice Settings
              </h1>
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#0A8692]/10 text-[#0A8692] px-2 py-0.5 rounded-full border border-[#0A8692]/20 shrink-0">
                Module 6
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">
              Manage clinical identity, contact channels, location coordinates, and lead practitioner credentials.
            </p>
          </div>
        </div>

        {/* Current Plan Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Plan: <strong className="text-slate-900">{currentPlan}</strong></span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pr-2 space-y-4 pb-2">

        {/* 2. Top Notification Bar (Clean Glass Pill) */}
        <div 
          onClick={(!isAdvanced && !isPremium) ? handleWhatsAppToggleClick : undefined}
          className="px-4 py-3 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 rounded-xl border border-emerald-200/60 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 ${
              formData.whatsAppNotifications && (isAdvanced || isPremium)
                ? "bg-emerald-500 text-white shadow-2xs" 
                : "bg-emerald-100 text-emerald-700"
            }`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 truncate">
                  Automated WhatsApp Patient Notifications
                </span>
                {(!isAdvanced && !isPremium) ? (
                  <span className="ml-2 text-[9px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                    🔒 Advanced
                  </span>
                ) : (
                  <span className="ml-2 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                Instantly dispatch confirmed tokens and clinic location to patient&apos;s WhatsApp.
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-3">
            <label className={`relative inline-flex items-center ${(!isAdvanced && !isPremium) ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                disabled={!isAdvanced && !isPremium}
                checked={Boolean(formData.whatsAppNotifications && (isAdvanced || isPremium))}
                onChange={(e) => setFormData({ ...formData, whatsAppNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* 3. Side-by-Side 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* CARD 1: Clinic Profile & Location Details (Left Column) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#0A8692]/10 text-[#0A8692] flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-800">Clinic Profile &amp; Location Details</h2>
            </div>

            <div className="space-y-3">
              {/* Row 1 (2 Cols): Clinic Name | Direct Reception Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="e.g. Alam Dental Clinic"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Direct Reception Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Row 2 (2 Cols): Complete Clinic Address | City / Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Complete Clinic Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Shop 4, Main Market Road"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. New Delhi"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Row 3 (Full Width): Google Maps Location / Embed URL (Advanced Locked) */}
              <div 
                onClick={!(isAdvanced || isPremium) ? () => {
                  setUpgradeReason("Direct Google Maps navigation & live map embed are unlocked in the Advanced Plan (₹999).");
                  setShowUpgradeModal(true);
                } : undefined}
                className={`space-y-1.5 ${!(isAdvanced || isPremium) ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0A8692]" />
                    <span>Google Maps Location / Embed URL</span>
                  </label>
                  {!(isAdvanced || isPremium) && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
                      🔒 Advanced
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={!(isAdvanced || isPremium)}
                  placeholder={!(isAdvanced || isPremium) ? "Upgrade to Advanced to embed live Google Maps & 1-click directions" : "e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=..."}
                  value={(isAdvanced || isPremium) ? formData.googleMapsUrl : ""}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                    !(isAdvanced || isPremium) 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-300" 
                      : "bg-white border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Lead Doctor Profile & Credentials (Right Column) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#0A8692]/10 text-[#0A8692] flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-800">Lead Doctor Profile &amp; Credentials</h2>
            </div>

            <div className="space-y-3">
              {/* Row 1 (2 Cols): Doctor Full Name | Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Doctor Full Name</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Dilshad Alam"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. BDS, MDS (Oral Surgery)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Row 2 (2 Cols): Clinical Specialization | Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Clinical Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Dentist & Oral Surgeon"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Experience (Years)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={formData.experienceYrs}
                    onChange={(e) => setFormData({ ...formData, experienceYrs: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Row 3 (Full Width): Doctor Bio / Practice Note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Doctor Bio / Practice Note</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of clinical expertise, painless procedures, and sterilized patient care..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-[#0A8692]/20 focus:border-[#0A8692] resize-none leading-relaxed transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Premium Upgrade Teaser Banner */}
        {!isPremium && (
          <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-100 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-purple-950 font-medium">
              <span className="text-sm">👑</span>
              <span>Unlock <strong>Custom Domain (.com)</strong>, <strong>100% White-Label</strong> (Remove DocPulse badge), and <strong>Live Google Maps</strong> with Premium VIP.</span>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setUpgradeReason("Direct Google Maps navigation, custom domains, and white-labeling unlock with Premium VIP (₹1,499).");
                setShowUpgradeModal(true);
              }} 
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] shadow-xs cursor-pointer shrink-0 ml-3"
            >
              Upgrade (₹1,499) →
            </button>
          </div>
        )}

        </div>

        {/* 5. Action Footer Bar */}
        <div className="shrink-0 mt-4 px-4 py-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            ⚡ All changes sync directly with your live clinic booking portal.
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {clinicSlug && (
              <Link
                href={`/${clinicSlug}`}
                target="_blank"
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#0A8692] hover:bg-[#086f79] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save All Clinic Settings</span>
            </button>
          </div>
        </div>

      </form>

      {/* Plan Upgrade Guidance Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3 relative text-center">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Advanced Feature Locked</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {upgradeReason || "Automated WhatsApp Patient Notifications are unlocked in the Advanced Plan (₹999)."}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Advanced Plan (₹999/mo) Includes:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[10px]">
                <li>Automated WhatsApp booking tokens</li>
                <li>Custom Doctor Photo &amp; Clinic Logo</li>
                <li>Floating WhatsApp direct chat button</li>
                <li>Custom domain mapping</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Dismiss
              </button>
              <Link
                href="/dashboard/subscription"
                className="flex-1 py-2 rounded-xl bg-[#0A8692] hover:bg-[#086e78] text-white text-xs font-black shadow-md flex items-center justify-center gap-1 cursor-pointer"
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

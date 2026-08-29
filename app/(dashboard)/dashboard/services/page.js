"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  PlusCircle, Trash2, Loader2, Stethoscope, Sparkles, Clock, 
  ArrowUpRight, Check, X, Crown, TrendingUp, Eye, Activity
} from "lucide-react";
import Link from "next/link";

// Helper to determine clinical icon based on service name
const getServiceIcon = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("dent") || lower.includes("tooth") || lower.includes("teeth") || lower.includes("root canal")) return "🦷";
  if (lower.includes("heart") || lower.includes("cardio") || lower.includes("ecg")) return "❤️";
  if (lower.includes("eye") || lower.includes("vision") || lower.includes("optom")) return "👁️";
  if (lower.includes("skin") || lower.includes("derma") || lower.includes("laser")) return "✨";
  if (lower.includes("child") || lower.includes("pedia") || lower.includes("baby")) return "👶";
  if (lower.includes("bone") || lower.includes("ortho") || lower.includes("joint")) return "🦴";
  if (lower.includes("brain") || lower.includes("neuro") || lower.includes("psych")) return "🧠";
  if (lower.includes("ear") || lower.includes("nose") || lower.includes("ent") || lower.includes("throat")) return "👂";
  return "🩺";
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [newService, setNewService] = useState({ 
    name: "", 
    price: "", 
    durationMins: "15",
    isActive: true 
  });
  
  const [planInfo, setPlanInfo] = useState({ planId: "BASIC", maxServices: 5, name: "Basic Plan" });
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServicesAndPlan = useCallback(async () => {
    try {
      const [servicesRes, subRes] = await Promise.all([
        fetch("/api/clinic/services", { cache: "no-store" }),
        fetch("/api/subscription/upgrade", { cache: "no-store" })
      ]);

      const servicesJson = await servicesRes.json();
      const subJson = await subRes.json();

      if (servicesJson.success) {
        setServices(servicesJson.services || []);
        if (servicesJson.plan) {
          setPlanInfo(servicesJson.plan);
        }
      }

      if (subJson.success) {
        setIsAdvanced(Boolean(subJson.isAdvanced));
        setIsPremium(Boolean(subJson.isPremium));
        if (subJson.planId) {
          setPlanInfo(prev => ({ ...prev, planId: subJson.planId }));
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch clinic services", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesAndPlan();
  }, [fetchServicesAndPlan]);

  const currentPlanId = (planInfo.planId || "BASIC").toUpperCase();
  const isAdvancedOrPro = isAdvanced || isPremium || currentPlanId === "ADVANCED" || currentPlanId === "PRO" || currentPlanId === "PREMIUM";
  const isLimitReached = !isAdvancedOrPro && services.length >= 5;

  const handleOpenAdd = () => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }
    setShowAddModal(true);
  };

  // Toggle Service Active Status
  const handleToggleActive = async (serviceId, currentActive) => {
    setActionLoadingId(serviceId);
    try {
      const res = await fetch("/api/clinic/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          isActive: !currentActive
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Toggle failed");

      setServices(prev =>
        prev.map(s => (s._id === serviceId ? { ...s, isActive: !currentActive } : s))
      );
      showToast(`Service ${!currentActive ? "enabled" : "hidden"} on live booking site`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add New Service
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name.trim() || !newService.price) {
      showToast("Service name and fee are required", "error");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/clinic/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newService.name.trim(),
          price: Number(newService.price),
          durationMins: Number(newService.durationMins || 15),
          isActive: true
        })
      });
      const json = await res.json();
      if (json.success) {
        setServices(prev => [...prev, json.service]);
        setNewService({ name: "", price: "", durationMins: "15", isActive: true });
        setShowAddModal(false);
        showToast("Service added to rate catalog successfully!");
      } else {
        showToast(json.error || "Failed to add service", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id) => {
    try {
      const res = await fetch(`/api/clinic/services?serviceId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices(prev => prev.filter(s => s._id !== id));
        showToast("Service removed from catalog");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-slate-50/60">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  // Analytics Metrics Calculation
  const activeServices = services.filter(s => s.isActive !== false);
  const totalFees = services.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const avgFee = services.length > 0 ? Math.round(totalFees / services.length) : 0;
  const usedPercentage = Math.min(100, Math.round((services.length / 5) * 100));

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden p-6 bg-slate-50/60 font-sans text-[#0f172a]">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-bottom-4 ${
          toast.type === "error" 
            ? "bg-rose-900 text-rose-100 border-rose-700" 
            : "bg-[#0c2e3d] text-teal-100 border-[#00A1AC]"
        }`}>
          <Sparkles className="w-4 h-4 text-[#00A1AC]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP SECTION: Header Row & Analytics Metric Strip */}
      <div className="shrink-0 space-y-3.5 mb-2">
        
        {/* Row 1: Header Row */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-[#00A1AC] flex items-center justify-center shrink-0 border border-[#00A1AC]/20 shadow-xs">
              <Stethoscope className="w-5 h-5 text-[#00A1AC]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                  Services &amp; Rate Catalog
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A1AC]/10 text-[#00A1AC] px-2.5 py-0.5 rounded-full border border-[#00A1AC]/20">
                  Module 3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                Configure OPD fees, slot durations, and live booking visibility.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#00A1AC]/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Service</span>
          </button>
        </div>

        {/* Row 2: Analytics & Plan Status Strip (3 Quick Metric Pills) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Card A: Capacity Status */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isAdvancedOrPro ? "Plan Status" : "Capacity Status"}
                </span>
                {!isAdvancedOrPro && isLimitReached && (
                  <button 
                    onClick={() => setShowUpgradeModal(true)} 
                    className="text-[10px] font-black text-[#00A1AC] hover:underline shrink-0"
                  >
                    Upgrade
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 truncate">
                  {isAdvancedOrPro 
                    ? "👑 Premium (Unlimited)" 
                    : `${services.length} / 5 Active Services`}
                </span>
                {!isAdvancedOrPro && (
                  <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isLimitReached ? "bg-amber-500" : "bg-[#00A1AC]"}`}
                      style={{ width: `${usedPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A1AC] flex items-center justify-center shrink-0 border border-teal-100/80">
              {isAdvancedOrPro ? <Crown className="w-4 h-4 text-amber-500" /> : <Sparkles className="w-4 h-4" />}
            </div>
          </div>

          {/* Card B: Average OPD Fee */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Average OPD Fee
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-black text-slate-900">
                  ₹{avgFee.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">avg consultation ticket</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Card C: Live Visibility */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Live Visibility
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-sm font-black text-slate-900">
                  {activeServices.length} Visible
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">on Public Site</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
              <Eye className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>

      {/* 3. Professional High-Density Service Cards (2-Column Grid with Rich Clinical Card Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 flex-1 overflow-y-auto content-start py-2 pr-1 min-h-0">
        {services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-auto">
            <Stethoscope className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-bold text-xs text-slate-700">No Services in Catalog</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;+ Add New Service&quot; above to create your consultation rate list</p>
          </div>
        ) : (
          services.map((service) => {
            const isActive = service.isActive !== false;
            const isBusy = actionLoadingId === service._id;
            const iconEmoji = getServiceIcon(service.name);

            return (
              <div
                key={service._id}
                className={`bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-[#00A1AC]/50 hover:shadow-md transition-all flex items-center justify-between gap-4 ${
                  !isActive ? "bg-slate-50/70 opacity-75 border-dashed" : ""
                }`}
              >
                {/* Left: Specialty Icon + Service Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 border ${
                    isActive 
                      ? "bg-teal-50 text-[#00A1AC] border-teal-100/60" 
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}>
                    {iconEmoji}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={service.name}>
                        {service.name}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        isActive 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {isActive ? "Live" : "Hidden"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        ⏱️ {service.durationMins || 15} mins
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 truncate">In-Clinic Consultation</span>
                    </div>
                  </div>
                </div>

                {/* Right: Fee Badge + Interactive Controls */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-[#00A1AC] leading-none">
                      ₹{service.price}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">per visit</div>
                  </div>

                  <div className="h-8 w-px bg-slate-100" />

                  {/* iOS-style toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      disabled={isBusy}
                      onChange={() => handleToggleActive(service._id, isActive)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A1AC]"></div>
                  </label>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center text-xs cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Fixed Bottom Bar */}
      <div className="shrink-0 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            ● {activeServices.length} of {services.length} services visible to patients on your live booking site
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/opd-availability" 
            className="text-[#00A1AC] hover:text-[#008790] font-bold transition-colors flex items-center gap-1"
          >
            <span>Configure OPD Timings</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Compact Modal for "+ Add New Service" */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00A1AC] text-white flex items-center justify-center font-bold shadow-xs">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add Service</h3>
                  <p className="text-[10px] text-slate-500">Set consultation fee & duration</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Service / Procedure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Consultation"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Slot Duration</label>
                  <select
                    value={newService.durationMins}
                    onChange={(e) => setNewService({ ...newService, durationMins: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                  >
                    <option value="15">15 mins</option>
                    <option value="20">20 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-1.5 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-xl text-xs font-black shadow-md shadow-[#00A1AC]/25 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#00A1AC] text-white flex items-center justify-center font-black shadow-md shadow-[#00A1AC]/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2 py-0.5 rounded-full border border-teal-200">
                Advanced Plan Feature
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Unlock Unlimited Clinic Services
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                You have reached the 5-service limit of the Basic Plan. Upgrade to <strong>Advanced Plan (₹999/mo)</strong> to add unlimited consultation offerings and specialized procedures.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Maybe Later
              </button>
              <Link
                href="/dashboard/billing"
                className="px-4 py-1.5 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-xl text-xs font-black shadow-md shadow-[#00A1AC]/25 flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
              >
                <span>Upgrade to Advanced</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

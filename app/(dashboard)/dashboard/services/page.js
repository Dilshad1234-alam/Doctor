"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PlusCircle, Trash2, Loader2, Stethoscope, AlertCircle, 
  Sparkles, Clock, CheckCircle2, Lock, ArrowUpRight, ShieldAlert 
} from "lucide-react";
import Link from "next/link";
import { PLAN_CONFIG, getPlanConfig } from "../../../../lib/planLimits.js";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", durationMins: "15" });
  const [planInfo, setPlanInfo] = useState({ planId: "BASIC", maxServices: 5, name: "Basic Plan" });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/clinic/services");
      const json = await res.json();
      if (json.success) {
        setServices(json.services || []);
        if (json.plan) {
          setPlanInfo(json.plan);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const maxServices = planInfo.maxServices || 5;
  const isLimitReached = services.length >= maxServices;

  const addService = async (e) => {
    e.preventDefault();
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/clinic/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService)
      });
      const json = await res.json();
      if (json.success) {
        setServices([...services, json.service]);
        setNewService({ name: "", price: "", durationMins: "15" });
      } else {
        alert(json.error || "Failed to add service");
        if (json.error?.includes("limit reached")) {
          setShowUpgradeModal(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsAdding(false);
  };

  const deleteService = async (id) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      const res = await fetch(`/api/clinic/services?serviceId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices(services.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  const usagePercent = Math.min(100, Math.round((services.length / maxServices) * 100));

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
            <Stethoscope className="w-7 h-7 text-[#00A1AC]" />
            Clinic Consultation Services
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Add, configure, or remove consultation offerings. Changes reflect live on your public booking page.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/subscription" 
            className="flex items-center gap-2 bg-[#00A1AC]/10 hover:bg-[#00A1AC]/20 text-[#00A1AC] border border-[#00A1AC]/20 px-4 py-2 rounded-2xl font-bold transition-all text-xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00A1AC]" /> {planInfo.name || "Basic Plan"}
          </Link>
        </div>
      </div>

      {/* Live Usage Meter Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900">Services Usage:</span>
              <span className={`text-sm font-black px-2.5 py-0.5 rounded-full ${isLimitReached ? 'bg-amber-100 text-amber-800' : 'bg-[#00A1AC]/10 text-[#00A1AC]'}`}>
                {services.length} / {maxServices} Used
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isLimitReached 
                ? "Basic Plan limit reached (5/5 services). Upgrade to Advanced for unlimited services." 
                : `You can add ${maxServices - services.length} more services on your current Basic Plan.`}
            </p>
          </div>
          {isLimitReached && (
            <Link 
              href="/dashboard/subscription" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" /> Upgrade to Advanced <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${isLimitReached ? 'bg-amber-500' : 'bg-[#00A1AC]'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Add New Service Card (White Card) */}
      <div className={`bg-white border rounded-3xl p-6 sm:p-8 shadow-sm transition-all ${isLimitReached ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-[#0f172a] flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-[#00A1AC]" /> Add New Offering
          </h2>
          {isLimitReached && (
            <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Capped at 5 Services
            </span>
          )}
        </div>

        <form onSubmit={addService} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Title</label>
            <input 
              required 
              disabled={isLimitReached}
              type="text" 
              placeholder="e.g. Comprehensive Consultation" 
              value={newService.name} 
              onChange={e => setNewService({...newService, name: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 text-xs focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
            />
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fee (₹)</label>
            <input 
              required 
              disabled={isLimitReached}
              type="number" 
              placeholder="500" 
              value={newService.price} 
              onChange={e => setNewService({...newService, price: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 text-xs focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
            />
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Mins)</label>
            <input 
              required 
              disabled={isLimitReached}
              type="number" 
              placeholder="15" 
              value={newService.durationMins} 
              onChange={e => setNewService({...newService, durationMins: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 text-xs focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={isAdding || isLimitReached} 
              className={`w-full md:w-auto h-[42px] font-bold rounded-2xl px-6 py-2 text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${
                isLimitReached 
                  ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed' 
                  : 'bg-[#00A1AC] hover:bg-[#008790] text-white shadow-[#00A1AC]/25 disabled:opacity-70'
              }`}
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : isLimitReached ? <Lock className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />} 
              {isLimitReached ? "Limit Reached (5/5)" : "Add Service"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Services List (White Card) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Active Consultation Services</h2>
          <span className="text-xs font-black text-[#00A1AC] bg-[#00A1AC]/10 px-3 py-1 rounded-full border border-[#00A1AC]/20">
            {services.length} / {maxServices} Services
          </span>
        </div>
        
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
            <AlertCircle className="w-10 h-10 mb-3 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No consultation services created yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the form above to add your first clinic service.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(s => (
              <div 
                key={s._id} 
                className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#00A1AC]/40 hover:bg-white transition-all group shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-[#00A1AC] transition-colors">{s.name}</h3>
                  <div className="flex gap-2 mt-2 text-xs font-bold">
                    <span className="bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20 px-2.5 py-0.5 rounded-md font-black">₹{s.price}</span>
                    <span className="bg-slate-200/60 text-slate-600 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {s.durationMins} Mins
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteService(s._id)} 
                  className="w-8 h-8 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Remove Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Service Limit Reached</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              Basic Plan limit reached (5/5 services). Upgrade to Advanced for unlimited services, custom domain support, and priority booking workflows.
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
                Upgrade to Pro (₹999/mo) <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

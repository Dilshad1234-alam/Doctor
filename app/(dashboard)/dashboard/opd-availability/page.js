"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Clock, AlertTriangle, CheckCircle2, Save, Loader2, 
  Sparkles, Power, Sun, Moon, Calendar, ShieldAlert, ArrowRight, Check, X,
  Crown, Lock, ArrowUpRight, Activity, ShieldCheck, Users
} from "lucide-react";
import Link from "next/link";

const DAYS = [
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
  { id: 0, name: "Sunday", short: "Sun" },
];

export default function OPDAvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [emergencyClosed, setEmergencyClosed] = useState(false);
  const [slotDuration, setSlotDuration] = useState(15);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [planId, setPlanId] = useState("BASIC");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [dailyPatientLimit, setDailyPatientLimit] = useState(30);
  const [enableDailyLimit, setEnableDailyLimit] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/upgrade", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setIsAdvanced(Boolean(json.isAdvanced));
        setIsPremium(Boolean(json.isPremium));
        if (json.planId) setPlanId(json.planId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/availability", { cache: "no-store" });
      const data = await res.json();
      
      if (data.success) {
        setEmergencyClosed(Boolean(data.emergencyClosed));
        
        // Match 7 days
        const rawSchedule = data.availability || [];
        const formatted = DAYS.map(d => {
          const found = rawSchedule.find(item => Number(item.dayOfWeek) === d.id);
          return {
            dayOfWeek: d.id,
            dayName: d.name,
            shortName: d.short,
            isOpen: found ? (found.isOpen !== undefined ? Boolean(found.isOpen) : true) : (d.id !== 0),
            morningStartTime: found?.morningStartTime || "09:00",
            morningEndTime: found?.morningEndTime || "13:00",
            eveningStartTime: found?.eveningStartTime || "17:00",
            eveningEndTime: found?.eveningEndTime || "21:00",
            slotDuration: found?.slotDuration || 15,
          };
        });

        setSchedule(formatted);
        if (formatted[0]?.slotDuration) {
          setSlotDuration(formatted[0].slotDuration);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load OPD schedule", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLimits = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/opd-settings");
      const json = await res.json();
      if (json.success) {
        setDailyPatientLimit(json.dailyPatientLimit || 30);
        setEnableDailyLimit(json.enableDailyLimit || false);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    fetchAvailability();
    fetchLimits();
  }, [fetchAvailability, fetchLimits]);

  // Tier Detection Engine
  const activePlan = planId?.toUpperCase() || "BASIC";
  const isBasic = activePlan === "BASIC";
  const isAdvancedTier = activePlan === "ADVANCED" || activePlan === "PRO" || isAdvanced;
  const isPremiumTier = activePlan === "PREMIUM" || activePlan === "ENTERPRISE" || isPremium;
  const isAdvancedOrHigher = isAdvancedTier || isPremiumTier;

  // Toggle Day Open/Close
  const handleToggleDay = (dayOfWeek) => {
    setSchedule(prev =>
      prev.map(item =>
        item.dayOfWeek === dayOfWeek ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  // Change Shift Time
  const handleTimeChange = (dayOfWeek, field, value) => {
    setSchedule(prev =>
      prev.map(item =>
        item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item
      )
    );
  };

  // Change Global Slot Duration
  const handleSlotDurationChange = (mins) => {
    if (!isAdvancedOrHigher && (mins === 15 || mins === 20)) {
      setUpgradeFeature(`${mins}-Minute Slot Duration Intervals`);
      setShowUpgradeModal(true);
      return;
    }

    setSlotDuration(mins);
    setSchedule(prev =>
      prev.map(item => ({ ...item, slotDuration: mins }))
    );
  };

  // Save Schedule
  const handleSave = async () => {
    setSaving(true);
    try {
      const getDay = (id) => schedule.find(s => s.dayOfWeek === id);
      const mon = getDay(1);
      const tue = getDay(2);
      const wed = getDay(3);
      const thu = getDay(4);
      const fri = getDay(5);
      const sat = getDay(6);
      const sun = getDay(0);

      const opdSchedulePayload = {
        monday: { isEnabled: mon?.isOpen ?? true, morningStart: mon?.morningStartTime || "", morningEnd: mon?.morningEndTime || "" },
        tuesday: { isEnabled: tue?.isOpen ?? true, morningStart: tue?.morningStartTime || "", morningEnd: tue?.morningEndTime || "" },
        wednesday: { isEnabled: wed?.isOpen ?? true, morningStart: wed?.morningStartTime || "", morningEnd: wed?.morningEndTime || "" },
        thursday: { isEnabled: thu?.isOpen ?? true, morningStart: thu?.morningStartTime || "", morningEnd: thu?.morningEndTime || "" },
        friday: { isEnabled: fri?.isOpen ?? true, morningStart: fri?.morningStartTime || "", morningEnd: fri?.morningEndTime || "" },
        saturday: { isEnabled: sat?.isOpen ?? true, morningStart: sat?.morningStartTime || "", morningEnd: sat?.morningEndTime || "" },
        sunday: { isEnabled: sun?.isOpen ?? false, morningStart: sun?.morningStartTime || "", morningEnd: sun?.morningEndTime || "" }
      };

      const res = await fetch("/api/clinic/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule,
          shifts: opdSchedulePayload,
          emergencyClosed
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("doctor_shifts", JSON.stringify(opdSchedulePayload));
        } catch (e) {}
      }

      showToast("OPD Schedule and Emergency status saved successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLimits = async () => {
    setSavingLimit(true);
    try {
      const res = await fetch("/api/dashboard/opd-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyPatientLimit, enableDailyLimit }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      showToast("Daily OPD limit settings saved successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingLimit(false);
    }
  };

  // Master Emergency Toggle
  const handleToggleEmergency = async (newValue) => {
    setEmergencyClosed(newValue);
    try {
      const res = await fetch("/api/clinic/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyClosed: newValue }),
      });
      if (res.ok) {
        showToast(newValue ? "🚨 Emergency Mode ACTIVATED: Live bookings paused!" : "Emergency Mode deactivated. Bookings open.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-slate-50/70">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  const openDaysCount = schedule.filter(d => d.isOpen).length;

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden p-4 sm:p-5 lg:p-6 bg-slate-50/70 font-sans text-[#0f172a]">
      
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

      {/* 2. Compact Top Header Row */}
      <div className="shrink-0 flex flex-row items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-[#00A1AC] flex items-center justify-center shrink-0 border border-[#00A1AC]/20 shadow-xs">
            <Clock className="w-5 h-5 text-[#00A1AC]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                OPD Shift Timings &amp; Emergency Controls
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A1AC]/10 text-[#00A1AC] px-2.5 py-0.5 rounded-full border border-[#00A1AC]/20">
                Module 2
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
              Configure Morning &amp; Evening split shifts, slot intervals, and instant emergency Day-OFF booking pause.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Plan Indicator Pill */}
          {isPremiumTier ? (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-teal-50 border border-amber-300 text-[11px] font-black text-amber-900 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>👑 Premium Tier</span>
            </span>
          ) : isAdvancedTier ? (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-black text-[#00A1AC] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#00A1AC]" />
              <span>✨ Advanced Plan</span>
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 shadow-xs">
              <span>Basic Tier</span>
            </span>
          )}

          {/* Compact Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#00A1AC] hover:bg-[#008790] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-[#00A1AC]/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save OPD Settings</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN CLINICAL COCKPIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0 py-2.5">
        
        {/* LEFT COLUMN: Controls & Operational Cockpit (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1">
          
          {/* Card 1: Day-OFF Emergency Master Switch */}
          <div className={`p-4 rounded-2xl border transition-all ${
            emergencyClosed
              ? "bg-rose-50 border-rose-300 shadow-sm"
              : "bg-white border-slate-200/90 shadow-2xs"
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  emergencyClosed ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      Emergency Day-OFF
                    </h2>
                    {emergencyClosed && (
                      <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    Instantly pause public bookings for urgent duty
                  </p>
                </div>
              </div>

              {/* iOS Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={emergencyClosed}
                  onChange={(e) => handleToggleEmergency(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Live Banner Preview when Toggled ON */}
            {emergencyClosed && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-600 text-white flex items-center justify-between gap-2 animate-in fade-in-50 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                  <span className="font-bold truncate text-[11px]">
                    Notice Active: &quot;OPD Closed Today for Emergency Duty&quot;
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase bg-white text-rose-600 px-2 py-0.5 rounded shrink-0">
                  Live
                </span>
              </div>
            )}
          </div>

          {/* Card 1.5: Daily Patient Quota & Token Cap */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">Daily Patient Quota & Token Cap</h3>
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Jab yeh quota poora ho jayega, public website par 'Today's OPD Quota Full' badge show hoga aur bache patients agle din ke liye book honge.</p>
                </div>
              </div>
              <button
                onClick={() => setEnableDailyLimit(!enableDailyLimit)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  enableDailyLimit ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableDailyLimit ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            
            {enableDailyLimit && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between animate-in fade-in-50">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Max Patients / Day</label>
                  <input
                    type="number"
                    min="1"
                    value={dailyPatientLimit}
                    onChange={(e) => setDailyPatientLimit(Number(e.target.value))}
                    className="w-20 text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleSaveLimits}
                  disabled={savingLimit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {savingLimit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Limit
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Slot Duration Interval Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900">Slot Duration Interval</h2>
                <p className="text-[11px] text-slate-500 font-medium">Subdivides appointment slots on booking page</p>
              </div>
              <span className="text-[11px] font-black text-[#00A1AC] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                {slotDuration} mins
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[15, 20, 30, 45, 60].map(mins => {
                const isGated = !isAdvancedOrHigher && (mins === 15 || mins === 20);
                const isSelected = slotDuration === mins;

                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSlotDurationChange(mins)}
                    className={`py-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                      isSelected
                        ? "bg-[#00A1AC] text-white border-[#00A1AC] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{mins}m</span>
                    {isGated && (
                      <span className="text-[8px] bg-amber-200 text-amber-900 px-1 rounded font-black">
                        ADV
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Clinical Operational Quick Metrics */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Weekly OPD Availability
                </span>
                <span className="text-xs font-black text-slate-900">
                  {openDaysCount} / 7 Days Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                  <div className="font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${emergencyClosed ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                    <span>{emergencyClosed ? "Paused" : "Live Bookings"}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Shift Model</div>
                  <div className="font-black text-slate-800 mt-0.5 truncate">
                    {isAdvancedOrHigher ? "Split Shift (M/E)" : "Single Shift"}
                  </div>
                </div>
              </div>
            </div>

            {!isAdvancedOrHigher && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-teal-50 border border-amber-200/70 flex items-center justify-between gap-2">
                <div className="text-[11px] text-amber-900 font-bold">
                  🔒 Unlock Evening Shifts &amp; 15m Intervals
                </div>
                <button
                  onClick={() => {
                    setUpgradeFeature("Split Shifts & 15m Intervals");
                    setShowUpgradeModal(true);
                  }}
                  className="text-[10px] font-black text-white bg-[#00A1AC] hover:bg-[#008790] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer shadow-xs"
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Weekly OPD Split Shifts (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-4 overflow-hidden">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2 shrink-0">
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900">Weekly Shift Configuration</h2>
              <p className="text-[11px] text-slate-500 font-medium">Set Morning &amp; Evening hours for each day</p>
            </div>
            {!isAdvancedOrHigher && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Evening Shift Locked
              </span>
            )}
          </div>

          {/* 7-Day High-Density List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {schedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                  day.isOpen
                    ? "bg-slate-50/70 border-slate-200"
                    : "bg-slate-100/50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  
                  {/* Day Toggle */}
                  <div className="flex items-center gap-2.5 w-28 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={() => handleToggleDay(day.dayOfWeek)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00A1AC]"></div>
                    </label>
                    <span className={`text-xs font-black ${day.isOpen ? "text-slate-900" : "text-slate-400"}`}>
                      {day.dayName}
                    </span>
                  </div>

                  {day.isOpen ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      
                      {/* Morning Shift */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">M:</span>
                        <input
                          type="time"
                          value={day.morningStartTime}
                          onChange={(e) => handleTimeChange(day.dayOfWeek, "morningStartTime", e.target.value)}
                          className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold focus:outline-none focus:border-[#00A1AC] w-full"
                        />
                        <span className="text-[10px] text-slate-400">-</span>
                        <input
                          type="time"
                          value={day.morningEndTime}
                          onChange={(e) => handleTimeChange(day.dayOfWeek, "morningEndTime", e.target.value)}
                          className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold focus:outline-none focus:border-[#00A1AC] w-full"
                        />
                      </div>

                      {/* Evening Shift (Gated on Advanced) */}
                      {isAdvancedOrHigher ? (
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                          <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">E:</span>
                          <input
                            type="time"
                            value={day.eveningStartTime}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, "eveningStartTime", e.target.value)}
                            className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold focus:outline-none focus:border-[#00A1AC] w-full"
                          />
                          <span className="text-[10px] text-slate-400">-</span>
                          <input
                            type="time"
                            value={day.eveningEndTime}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, "eveningEndTime", e.target.value)}
                            className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold focus:outline-none focus:border-[#00A1AC] w-full"
                          />
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setUpgradeFeature("Evening Shift Timings");
                            setShowUpgradeModal(true);
                          }}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100/80 border border-dashed border-slate-300 text-[11px] text-slate-500 cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-all"
                        >
                          <div className="flex items-center gap-1.5">
                            <Moon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-[10px]">Evening Shift</span>
                          </div>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            🔒 Upgrade
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 text-[11px] font-bold text-slate-400 italic py-1">
                      Clinic Closed on {day.dayName}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* 4. Fixed Bottom Bar */}
      <div className="shrink-0 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${emergencyClosed ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></span>
          <span>
            {emergencyClosed
              ? "🚨 Emergency Day-OFF Active (Online appointments paused)"
              : `Operating ${openDaysCount} days a week with ${slotDuration}-minute consultation slots`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/services" 
            className="text-[#00A1AC] hover:text-[#008790] font-bold transition-colors flex items-center gap-1"
          >
            <span>Manage Services &amp; Fees</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

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
                Advanced Feature
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Unlock {upgradeFeature || "Split Shifts & Flexible Intervals"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Separate Morning &amp; Evening shifts, 15m/20m slot intervals, and unlimited services are available on the <strong>Advanced Plan (₹999/mo)</strong>.
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

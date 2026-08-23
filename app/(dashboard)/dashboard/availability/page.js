"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Loader2, Save, CheckCircle2 } from "lucide-react";

const DEFAULT_SCHEDULE = [
  { dayOfWeek: 0, dayName: "Sunday", isOpen: false, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 1, dayName: "Monday", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, dayName: "Tuesday", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, dayName: "Wednesday", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 4, dayName: "Thursday", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 5, dayName: "Friday", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 6, dayName: "Saturday", isOpen: true, startTime: "09:00", endTime: "17:00" }
];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/clinic/availability", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.availability) && json.availability.length > 0) {
        // Merge with DEFAULT_SCHEDULE to guarantee all 7 days 0-6 exist
        const merged = DEFAULT_SCHEDULE.map(defDay => {
          const found = json.availability.find(a => a.dayOfWeek === defDay.dayOfWeek);
          if (!found) return defDay;
          return {
            dayOfWeek: defDay.dayOfWeek,
            dayName: defDay.dayName,
            isOpen: found.isOpen !== undefined ? Boolean(found.isOpen) : (found.isClosed !== undefined ? !found.isClosed : defDay.isOpen),
            startTime: found.startTime || defDay.startTime,
            endTime: found.endTime || defDay.endTime
          };
        });
        setSchedule(merged);
      } else {
        setSchedule(DEFAULT_SCHEDULE);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
      setSchedule(DEFAULT_SCHEDULE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const payload = schedule.map(day => ({
        dayOfWeek: day.dayOfWeek,
        dayName: day.dayName || DEFAULT_SCHEDULE[day.dayOfWeek]?.dayName,
        isOpen: Boolean(day.isOpen),
        startTime: day.startTime || "09:00",
        endTime: day.endTime || "17:00"
      }));

      const res = await fetch("/api/clinic/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: payload })
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        alert(json.error || "Failed to save schedule");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index, field, value) => {
    setSchedule(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] max-h-screen overflow-hidden flex flex-col justify-between p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Clock className="w-6 h-6 text-teal-300" />
            OPD Operating Hours
          </h1>
          <p className="text-xs text-slate-300 font-medium">Configure weekly consultation timings. Real-time slots are synchronized with patient bookings.</p>
        </div>
      </div>

      {/* Main Single-Screen Container */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-3 sm:p-4 shadow-2xl flex-1 flex flex-col justify-between overflow-hidden my-1">
        {/* 7 Day Rows */}
        <div className="space-y-1 flex-1 flex flex-col justify-around">
          {schedule.map((day, idx) => (
            <div 
              key={day.dayOfWeek} 
              className={`flex items-center justify-between py-1.5 px-4 my-0.5 rounded-xl border transition-all ${
                !day.isOpen 
                ? 'bg-black/20 border-white/5 opacity-70' 
                : 'bg-white/5 border-white/10 hover:border-teal-400/30 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-24 font-bold text-white text-xs sm:text-sm">{day.dayName || DEFAULT_SCHEDULE[day.dayOfWeek]?.dayName}</div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleChange(idx, 'isOpen', !day.isOpen)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      day.isOpen ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        day.isOpen ? 'translate-x-4' : 'translate-x-0'
                      }`} 
                    />
                  </button>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                    day.isOpen 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-white/5 text-slate-400 border-white/10'
                  }`}>
                    {day.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {day.isOpen ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-teal-200 uppercase">From:</span>
                    <input 
                      type="time" 
                      value={day.startTime} 
                      onChange={(e) => handleChange(idx, 'startTime', e.target.value)} 
                      className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs font-bold text-teal-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 outline-none" 
                    />
                  </div>
                  <span className="text-slate-400 font-bold text-xs">-</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-teal-200 uppercase">To:</span>
                    <input 
                      type="time" 
                      value={day.endTime} 
                      onChange={(e) => handleChange(idx, 'endTime', e.target.value)} 
                      className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs font-bold text-teal-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 outline-none" 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-medium text-slate-400 italic">Clinic Closed</div>
              )}
            </div>
          ))}
        </div>

        {/* Fixed Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between shrink-0 mt-1">
          <p className="text-[11px] text-slate-400 font-medium">Slots will be automatically generated at 30-min intervals.</p>
          <button
            type="button"
            onClick={saveSchedule}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-lg transition-all active:scale-95 ${
              savedSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-[#081e2b] shadow-teal-500/20 disabled:opacity-60"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved Successfully! ✓
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Availability
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

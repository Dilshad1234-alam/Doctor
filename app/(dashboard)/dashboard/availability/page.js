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
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center bg-[#071720]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2dd4bf]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] max-h-screen overflow-hidden flex flex-col justify-between p-4 md:p-6 max-w-5xl mx-auto font-sans bg-[#071720] text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Clock className="w-6 h-6 text-[#2dd4bf]" />
            OPD Operating Hours
          </h1>
          <p className="text-xs text-[#62879a] font-medium">Configure weekly consultation timings. Real-time slots are synchronized with patient bookings.</p>
        </div>
      </div>

      {/* Main Single-Screen Container */}
      <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-4 sm:p-6 shadow-xl flex-1 flex flex-col justify-between overflow-hidden my-1">
        {/* 7 Day Rows */}
        <div className="space-y-1.5 flex-1 flex flex-col justify-around">
          {schedule.map((day, idx) => (
            <div 
              key={day.dayOfWeek} 
              className={`flex items-center justify-between py-2 px-4 rounded-2xl border transition-all ${
                !day.isOpen 
                ? 'bg-[#040d13] border-[#0f2c3b] opacity-60' 
                : 'bg-[#06151f] border-[#163c4e] hover:border-[#2dd4bf]/40 hover:bg-[#0b3342]/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-24 font-bold text-white text-xs sm:text-sm">{day.dayName || DEFAULT_SCHEDULE[day.dayOfWeek]?.dayName}</div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleChange(idx, 'isOpen', !day.isOpen)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      day.isOpen ? 'bg-[#00c9a7] shadow-sm shadow-[#00c9a7]/30' : 'bg-[#0d2a38]'
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
                    ? 'bg-[#063b36] text-[#2dd4bf] border-[#0d5952]' 
                    : 'bg-[#06151f] text-[#62879a] border-[#163c4e]'
                  }`}>
                    {day.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {day.isOpen ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#62879a] uppercase">From:</span>
                    <input 
                      type="time" 
                      value={day.startTime} 
                      onChange={(e) => handleChange(idx, 'startTime', e.target.value)} 
                      className="rounded-xl border border-[#163c4e] bg-[#040d13] px-2.5 py-1 text-xs font-bold text-[#2dd4bf] focus:border-[#2dd4bf] outline-none" 
                    />
                  </div>
                  <span className="text-[#3b6072] font-bold text-xs">-</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#62879a] uppercase">To:</span>
                    <input 
                      type="time" 
                      value={day.endTime} 
                      onChange={(e) => handleChange(idx, 'endTime', e.target.value)} 
                      className="rounded-xl border border-[#163c4e] bg-[#040d13] px-2.5 py-1 text-xs font-bold text-[#2dd4bf] focus:border-[#2dd4bf] outline-none" 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-medium text-[#62879a] italic">Clinic Closed</div>
              )}
            </div>
          ))}
        </div>

        {/* Fixed Footer */}
        <div className="pt-3 border-t border-[#133748] flex items-center justify-between shrink-0 mt-1">
          <p className="text-[11px] text-[#62879a] font-medium">Slots will be automatically generated at 30-min intervals.</p>
          <button
            type="button"
            onClick={saveSchedule}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer ${
              savedSuccess
                ? "bg-[#063b36] text-[#2dd4bf] border border-[#0d5952]"
                : "bg-[#00c9a7] hover:bg-[#00b596] text-[#051a24] font-black shadow-[#00c9a7]/20 disabled:opacity-60"
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

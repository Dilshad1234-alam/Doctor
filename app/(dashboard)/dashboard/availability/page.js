"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Loader2, Save, CheckCircle2 } from "lucide-react";

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/clinic/availability", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setSchedule(json.availability.sort((a,b) => a.dayOfWeek - b.dayOfWeek));
      }
    } catch (err) {
      console.error(err);
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
      const res = await fetch("/api/clinic/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule })
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          OPD Timings
        </h1>
        <p className="mt-2 text-slate-500">Set your weekly operating hours. Patients will only be able to book slots within these specific times.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="space-y-4">
          {schedule.map((day, idx) => (
            <div key={day._id || idx} className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border p-5 transition-colors ${!day.isOpen ? 'bg-slate-50 border-slate-200' : 'bg-white border-blue-100 hover:border-blue-300'}`}>
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-28 font-bold text-slate-800 text-lg">{days[day.dayOfWeek]}</div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleChange(idx, 'isOpen', !day.isOpen)}
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
                    <input type="time" value={day.startTime} onChange={(e) => handleChange(idx, 'startTime', e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50" />
                  </div>
                  <span className="text-slate-300 font-black mt-4">-</span>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">End Time</label>
                    <input type="time" value={day.endTime} onChange={(e) => handleChange(idx, 'endTime', e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50" />
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-400 italic py-2">Clinic is closed on this day</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={saveSchedule}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-sm transition-all ${
              savedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Saved Successfully!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Availability
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Building, UserCircle, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [data, setData] = useState({
    clinicName: "", phone: "", address: "", city: "",
    doctorName: "", qualification: "", specialization: "", experienceYrs: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/clinic/settings");
        const json = await res.json();
        if (json.success) {
          setData({
            clinicName: json.clinic?.name || "",
            phone: json.clinic?.phone || "",
            address: json.clinic?.address || "",
            city: json.clinic?.city || "",
            doctorName: json.doctorProfile?.fullName ? json.doctorProfile.fullName.replace(/^Dr\.?\s*/i, "") : "",
            qualification: json.doctorProfile?.qualification || "",
            specialization: json.doctorProfile?.specialization || "",
            experienceYrs: json.doctorProfile?.experienceYrs || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clinic/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Failed to save settings: " + json.error);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#0a2635]" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
          <Settings className="w-7 h-7 text-[#00A1AC]" />
          Clinic & Doctor Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Manage practice metadata, physical address, and doctor credentials.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-8">
        
        {/* Clinic Info Card (White Card) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <h2 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2.5 tracking-tight">
            <Building className="w-5 h-5 text-[#00A1AC]" /> Clinic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Clinic Name</label>
              <input 
                required 
                type="text" 
                value={data.clinicName} 
                onChange={(e) => updateField('clinicName', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Contact Phone</label>
              <input 
                required 
                type="text" 
                value={data.phone} 
                onChange={(e) => updateField('phone', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Address</label>
              <input 
                required 
                type="text" 
                value={data.address} 
                onChange={(e) => updateField('address', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">City</label>
              <input 
                required 
                type="text" 
                value={data.city} 
                onChange={(e) => updateField('city', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Doctor Info Card (White Card) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <h2 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2.5 tracking-tight">
            <UserCircle className="w-5 h-5 text-[#00A1AC]" /> Doctor Profile & Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Doctor Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs select-none">Dr.</span>
                <input 
                  required 
                  type="text" 
                  value={data.doctorName} 
                  onChange={(e) => updateField('doctorName', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 pl-10 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
                  placeholder="Doctor Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Qualification</label>
              <input 
                required 
                type="text" 
                value={data.qualification} 
                onChange={(e) => updateField('qualification', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
                placeholder="e.g. MBBS, MD"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Specialization</label>
              <input 
                required 
                type="text" 
                value={data.specialization} 
                onChange={(e) => updateField('specialization', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
                placeholder="e.g. Cardiologist"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Experience (Years)</label>
              <input 
                required 
                type="number" 
                value={data.experienceYrs} 
                onChange={(e) => updateField('experienceYrs', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
                placeholder="e.g. 10"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving} 
            className={`h-[42px] px-8 rounded-2xl font-bold transition-all shadow-lg shadow-[#00A1AC]/25 text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
              savedSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-[#00A1AC] hover:bg-[#008790] text-white disabled:opacity-70'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
            {savedSuccess ? "Saved Successfully! ✓" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
      <div className="flex h-[80vh] items-center justify-center bg-[#071720]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2dd4bf]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans bg-[#071720] text-slate-100">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
          <Settings className="w-8 h-8 text-[#2dd4bf]" />
          Clinic & Profile Settings
        </h1>
        <p className="mt-1 text-sm text-[#62879a] font-medium">Manage practice metadata, physical address, and doctor credentials.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-8">
        
        {/* Clinic Info Card */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 md:p-10 shadow-xl">
          <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5 tracking-tight">
            <Building className="w-6 h-6 text-[#2dd4bf]" /> Clinic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Clinic Name</label>
              <input 
                required 
                type="text" 
                value={data.clinicName} 
                onChange={(e) => updateField('clinicName', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Contact Phone</label>
              <input 
                required 
                type="text" 
                value={data.phone} 
                onChange={(e) => updateField('phone', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Full Address</label>
              <input 
                required 
                type="text" 
                value={data.address} 
                onChange={(e) => updateField('address', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">City</label>
              <input 
                required 
                type="text" 
                value={data.city} 
                onChange={(e) => updateField('city', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Doctor Info Card */}
        <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 md:p-10 shadow-xl">
          <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5 tracking-tight">
            <UserCircle className="w-6 h-6 text-[#2dd4bf]" /> Doctor Profile & Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Doctor Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2dd4bf] font-bold text-sm select-none">Dr.</span>
                <input 
                  required 
                  type="text" 
                  value={data.doctorName} 
                  onChange={(e) => updateField('doctorName', e.target.value)} 
                  className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 pl-11 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
                  placeholder="Doctor Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Qualification</label>
              <input 
                required 
                type="text" 
                value={data.qualification} 
                onChange={(e) => updateField('qualification', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
                placeholder="e.g. MBBS, MD"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Specialization</label>
              <input 
                required 
                type="text" 
                value={data.specialization} 
                onChange={(e) => updateField('specialization', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
                placeholder="e.g. Cardiologist"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#62879a] mb-2 uppercase tracking-wider">Experience (Years)</label>
              <input 
                required 
                type="number" 
                value={data.experienceYrs} 
                onChange={(e) => updateField('experienceYrs', e.target.value)} 
                className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2dd4bf] font-medium text-sm transition-all" 
                placeholder="e.g. 10"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving} 
            className={`h-[44px] px-8 rounded-xl font-black transition-all shadow-lg text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
              savedSuccess 
              ? 'bg-[#063b36] text-[#2dd4bf] border border-[#0d5952]' 
              : 'bg-[#00c9a7] hover:bg-[#00b596] text-[#051a24] shadow-[#00c9a7]/20 disabled:opacity-70'
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

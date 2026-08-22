"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Building, UserCircle } from "lucide-react";

export default function SettingsPage() {
  const [data, setData] = useState({
    clinicName: "", phone: "", address: "", city: "",
    doctorName: "", qualification: "", specialization: "", experienceYrs: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
            doctorName: json.doctorProfile?.fullName || "",
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
        alert("Settings saved successfully!");
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
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="mt-2 text-slate-500">Manage your clinic details and professional profile information.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-8">
        
        {/* Clinic Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-600" /> Clinic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Clinic Name</label>
              <input required type="text" value={data.clinicName} onChange={(e) => updateField('clinicName', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Contact Phone</label>
              <input required type="text" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Address</label>
              <input required type="text" value={data.address} onChange={(e) => updateField('address', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">City</label>
              <input required type="text" value={data.city} onChange={(e) => updateField('city', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-indigo-600" /> Doctor Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Doctor Name</label>
              <input required type="text" value={data.doctorName} onChange={(e) => updateField('doctorName', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Qualification</label>
              <input required type="text" value={data.qualification} onChange={(e) => updateField('qualification', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Specialization</label>
              <input required type="text" value={data.specialization} onChange={(e) => updateField('specialization', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Experience (Years)</label>
              <input required type="number" value={data.experienceYrs} onChange={(e) => updateField('experienceYrs', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="h-[55px] px-10 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-lg transition-colors">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

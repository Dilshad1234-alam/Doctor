"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, Loader2, Building, UserCircle, CheckCircle2, 
  AlertCircle, Sparkles, Image as ImageIcon, Upload, Trash2, User,
  Lock, Users, ShieldAlert, ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [data, setData] = useState({
    clinicName: "", phone: "", address: "", city: "", logo: "",
    doctorName: "", qualification: "", specialization: "", experienceYrs: "",
    profilePhoto: "", bio: ""
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
            logo: json.clinic?.logo || json.websiteConfig?.clinicLogo || "",
            doctorName: json.doctorProfile?.fullName ? json.doctorProfile.fullName.replace(/^Dr\.?\s*/i, "") : "",
            qualification: json.doctorProfile?.qualification || "",
            specialization: json.doctorProfile?.specialization || "",
            experienceYrs: json.doctorProfile?.experienceYrs || "",
            profilePhoto: json.doctorProfile?.profilePhoto || json.doctorProfile?.avatarUrl || json.websiteConfig?.doctorPhoto || "",
            bio: json.doctorProfile?.bio || ""
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
        body: JSON.stringify({
          ...data,
          doctorPhoto: data.profilePhoto,
          clinicLogo: data.logo
        })
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

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        updateField(field, canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
            <Settings className="w-7 h-7 text-[#00A1AC]" />
            Clinic & Doctor Profile Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Update your clinic details, doctor bio, contact information, and branding assets.</p>
        </div>
        <div>
          <span className="text-xs font-black text-[#00A1AC] bg-[#00A1AC]/10 border border-[#00A1AC]/20 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Basic Plan (1 Doctor Seat)
          </span>
        </div>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        {/* Clinic Info Card (White Card) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#0f172a] flex items-center gap-2.5 tracking-tight">
            <Building className="w-5 h-5 text-[#00A1AC]" /> Clinic Information & Branding
          </h2>

          {/* Clinic Brand Logo Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center shrink-0 p-2">
              {data.logo ? (
                <img src={data.logo} alt="Clinic Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-slate-400">
                  <Building className="w-7 h-7 mx-auto text-slate-300" />
                  <span className="text-[9px] font-bold uppercase mt-0.5 block">No Logo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Clinic Logo URL</label>
                {data.logo && (
                  <button 
                    type="button" 
                    onClick={() => updateField('logo', '')} 
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                  </button>
                )}
              </div>
              <input 
                type="text" 
                placeholder="https://example.com/clinic-logo.png" 
                value={data.logo} 
                onChange={(e) => updateField('logo', e.target.value)} 
                className="w-full bg-white border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all" 
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-sm active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#00A1AC]" /> Browse Logo File
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'logo')} 
                  />
                </label>
                <span className="text-[11px] text-slate-400 font-medium">PNG or SVG with transparent background</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Clinic Display Name</label>
              <input 
                required 
                type="text" 
                value={data.clinicName} 
                onChange={(e) => updateField('clinicName', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Public Support Phone</label>
              <input 
                required 
                type="text" 
                value={data.phone} 
                onChange={(e) => updateField('phone', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Clinic Address</label>
              <input 
                required 
                type="text" 
                value={data.address} 
                onChange={(e) => updateField('address', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-2xl px-4 py-2.5 focus:bg-white focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 font-medium text-xs transition-all" 
              />
            </div>
            <div>
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0f172a] flex items-center gap-2.5 tracking-tight">
              <UserCircle className="w-5 h-5 text-[#00A1AC]" /> Doctor Profile Photo & Credentials
            </h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Primary Doctor (1 / 1)
            </span>
          </div>

          {/* Doctor Profile Photo Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center shrink-0">
              {data.profilePhoto ? (
                <img src={data.profilePhoto} alt="Doctor" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="text-center text-slate-400">
                  <User className="w-7 h-7 mx-auto text-slate-300" />
                  <span className="text-[9px] font-bold uppercase mt-0.5 block">No Photo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Doctor Photo URL</label>
                {data.profilePhoto && (
                  <button 
                    type="button" 
                    onClick={() => updateField('profilePhoto', '')} 
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                  </button>
                )}
              </div>
              <input 
                type="text" 
                placeholder="https://example.com/doctor-photo.jpg" 
                value={data.profilePhoto} 
                onChange={(e) => updateField('profilePhoto', e.target.value)} 
                className="w-full bg-white border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all" 
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-sm active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#00A1AC]" /> Browse Image File
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'profilePhoto')} 
                  />
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Crisp portrait photo (JPG or PNG)</span>
              </div>
            </div>
          </div>

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

        {/* Multi-Doctor Staffing (Locked on Basic Plan) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  Staff & Secondary Doctors <Lock className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-slate-500 font-medium">Add receptionists, associate doctors, and staff login credentials.</p>
              </div>
            </div>
            <Link 
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" /> Upgrade Tier <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1 font-medium">
              <p className="font-bold">Multi-doctor staffing is available on Clinic & Hospital tiers.</p>
              <p className="text-amber-700">The Basic Plan (₹499/mo) is strictly configured for 1 Doctor seat. Upgrade your subscription to add multi-doctor scheduling.</p>
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

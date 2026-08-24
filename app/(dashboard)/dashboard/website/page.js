"use client";

import { useState, useEffect } from "react";
import { Globe, Palette, LayoutTemplate, Loader2, Save, ExternalLink, CheckCircle2, Eye, LayoutGrid, Sparkles } from "lucide-react";

export default function WebsiteBuilderPage() {
  const [config, setConfig] = useState({
    templateId: 'template-1',
    primaryColor: '#0f766e',
    fontStyle: 'Plus Jakarta Sans',
    buttonStyle: 'rounded-xl',
    showSections: { about: true, services: true, timings: true, contact: true }
  });
  const [clinic, setClinic] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/clinic/website", { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          if (json.websiteConfig) setConfig(json.websiteConfig);
          setClinic(json.clinic);
          setDoctor(json.doctor);
          setSlug(json.slug);
        }
      } catch (err) {
        console.error("Failed to fetch website config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clinic/website", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field, value) => setConfig(p => ({ ...p, [field]: value }));
  const updateSection = (section, value) => setConfig(p => ({ ...p, showSections: { ...p.showSections, [section]: value }}));

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#0a2635]" />
      </div>
    );
  }

  const templates = [
    { 
      id: 'template-1', 
      name: 'Executive Modern Minimalist', 
      desc: 'Clean high-contrast layout for clinical specialists',
      img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      id: 'template-2', 
      name: 'Medical Oceanic Pro', 
      desc: 'High-tech oceanic theme for specialized healthcare centers',
      img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      id: 'template-3', 
      name: 'Family Health Care', 
      desc: 'Warm, approachable layout for family & general practice',
      img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop' 
    }
  ];

  const colors = [
    { name: 'Ocean Teal', value: '#0f766e' },
    { name: 'Clinical Blue', value: '#2563eb' },
    { name: 'Care Emerald', value: '#059669' },
    { name: 'Executive Navy', value: '#0a2635' },
    { name: 'Gentle Rose', value: '#e11d48' },
    { name: 'Royal Indigo', value: '#4f46e5' }
  ];

  const buttonStyles = [
    { id: 'rounded-xl', label: 'Soft (xl)' },
    { id: 'rounded-2xl', label: 'Curved (2xl)' },
    { id: 'rounded-full', label: 'Pill (full)' },
    { id: 'rounded-none', label: 'Sharp (none)' }
  ];

  const cleanDocName = doctor?.fullName ? `Dr. ${doctor.fullName.replace(/^Dr\.?\s*/i, '')}` : 'Dr. Doctor Name';

  return (
    <div className="p-6 sm:p-10 max-w-[1600px] mx-auto space-y-8 font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      {/* Top Bar (White Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
            <Globe className="w-7 h-7 text-[#164e63]" />
            Website Customizer & Theme
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Customize your public landing page theme, branding colors, and layout in real-time.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {slug && (
            <a 
              href={`/${slug}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0f172a] px-4 py-2 rounded-full font-bold transition-all text-xs active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#164e63]" /> /{slug}
            </a>
          )}
          <button 
            onClick={saveConfig} 
            disabled={saving} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md text-xs active:scale-95 cursor-pointer ${
              savedSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-[#0f172a] hover:bg-[#1e293b] text-white disabled:opacity-70'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
            {savedSuccess ? "Changes Saved Live! ✓" : "Publish & Save Theme"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Controls (White Card) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 bg-slate-50">
              <button 
                onClick={() => setActiveTab('templates')} 
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'templates' ? 'bg-white text-[#0f172a] border-b-2 border-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> Templates
              </button>
              <button 
                onClick={() => setActiveTab('theme')} 
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'theme' ? 'bg-white text-[#0f172a] border-b-2 border-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Palette className="w-4 h-4" /> Theme
              </button>
              <button 
                onClick={() => setActiveTab('sections')} 
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'sections' ? 'bg-white text-[#0f172a] border-b-2 border-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" /> Sections
              </button>
            </div>
            
            <div className="p-6 h-[520px] overflow-y-auto hide-scrollbar">
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  {templates.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => updateConfig('templateId', t.id)} 
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${config.templateId === t.id ? 'border-[#0f172a] shadow-md ring-2 ring-[#0f172a]/20' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="h-36 bg-slate-100 relative overflow-hidden">
                        <img 
                          src={t.img} 
                          alt={t.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        {config.templateId === t.id && (
                          <div className="absolute top-3 right-3 bg-[#0f172a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Selected
                          </div>
                        )}
                        <div className="absolute bottom-2 left-3 right-3 text-white pointer-events-none">
                          <p className="font-extrabold text-sm text-white drop-shadow-md">{t.name}</p>
                          <p className="text-[10px] text-slate-200 drop-shadow-sm line-clamp-1">{t.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Primary Brand Color</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {colors.map(color => (
                        <div 
                          key={color.value} 
                          onClick={() => updateConfig('primaryColor', color.value)} 
                          className={`cursor-pointer flex items-center gap-3 p-3 rounded-2xl border transition-all ${config.primaryColor === color.value ? 'border-[#0f172a] bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                        >
                          <div className="w-6 h-6 rounded-full shadow-sm shrink-0" style={{ backgroundColor: color.value }} />
                          <span className="font-bold text-xs text-[#0f172a]">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Button Shape</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {buttonStyles.map(style => (
                        <button 
                          key={style.id} 
                          onClick={() => updateConfig('buttonStyle', style.id)} 
                          className={`py-2.5 px-3 border text-xs font-bold transition-all ${style.id} ${config.buttonStyle === style.id ? 'border-[#0f172a] bg-[#0f172a] text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sections' && (
                <div className="space-y-3">
                  {Object.keys(config.showSections).map(section => {
                    const labels = { about: 'About Doctor Section', services: 'Services & Pricing', timings: 'OPD Timings', contact: 'Contact & Directions' };
                    return (
                      <div key={section} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="font-bold text-xs sm:text-sm text-[#0f172a]">{labels[section] || section}</span>
                        <button 
                          type="button" 
                          onClick={() => updateSection(section, !config.showSections[section])} 
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${config.showSections[section] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${config.showSections[section] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview Mockup Window */}
        <div className="lg:col-span-7">
          <div className="bg-[#0f172a] rounded-3xl p-3 h-[585px] flex flex-col border-[4px] border-slate-200 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a202c] rounded-t-2xl border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-emerald-400" /> Interactive Website Preview</div>
              <div className="w-8"></div>
            </div>
            
            <div className="flex-1 bg-slate-950 overflow-y-auto rounded-b-2xl relative text-white hide-scrollbar" style={{ fontFamily: config.fontStyle }}>
              {/* Preview Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a2635]/95 backdrop-blur-md z-10">
                <div className="font-black text-lg text-white">{clinic?.name || 'Clinic Name'}</div>
                <button 
                  className={`px-4 py-2 text-xs font-bold text-white shadow-md transition-all ${config.buttonStyle}`} 
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Book Appointment
                </button>
              </div>
              
              {/* Preview Hero */}
              <div className="p-8 text-center bg-gradient-to-b from-[#0a2635] to-slate-950 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 opacity-40" style={{ backgroundColor: config.primaryColor }}></div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Consult with World-Class Specialists</h2>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">Skip the queue. Book your confirmed OPD consultation slot online.</p>
                <button 
                  className={`px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all ${config.buttonStyle}`} 
                  style={{ backgroundColor: config.primaryColor }}
                >
                  View Available Slots
                </button>
              </div>

              <div className="p-6 space-y-8">
                {config.showSections.about && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>About The Doctor</h3>
                    <div className="flex gap-4 items-start bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shrink-0 flex items-center justify-center font-bold text-white">
                        {cleanDocName.charAt(4) || "D"}
                      </div>
                      <div>
                        <div className="font-bold text-base text-white">{cleanDocName}</div>
                        <div className="text-xs font-semibold" style={{ color: config.primaryColor }}>{doctor?.specialization || 'Medical Specialist'}</div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{doctor?.bio || 'Dedicated medical professional with extensive clinical expertise.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {config.showSections.services && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>Services Offered</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="font-bold text-white text-xs mb-1">General Consultation</div>
                        <div className="text-[11px] text-slate-400">15 mins • ₹500</div>
                      </div>
                      <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="font-bold text-white text-xs mb-1">Follow-up Visit</div>
                        <div className="text-[11px] text-slate-400">10 mins • ₹300</div>
                      </div>
                    </div>
                  </div>
                )}

                {config.showSections.timings && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>OPD Timings</h3>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Mon - Sat</span><span className="font-bold text-white">09:00 AM - 05:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Sunday</span><span className="font-bold text-rose-400">Closed</span></div>
                    </div>
                  </div>
                )}
                
                {config.showSections.contact && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.primaryColor }}>Location & Contact</h3>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1.5">
                      <div>📍 {clinic?.address || 'Main Road, Clinic Location'}</div>
                      <div>📞 {clinic?.phone || '+91 9999999999'}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-[#071720] text-slate-500 text-center text-xs border-t border-white/5 mt-6">
                Powered by DocPulse CRM
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

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
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
      </div>
    );
  }

  const templates = [
    { id: 'template-1', name: 'Modern Minimalist', img: '1576091160550-2173dba999ef' },
    { id: 'template-2', name: 'Medical Oceanic Pro', img: '1538108149393-fbbd81477488' },
    { id: 'template-3', name: 'Family Health Elegant', img: '1511174511562-5844066b90c0' }
  ];

  const colors = [
    { name: 'Ocean Teal', value: '#0f766e' },
    { name: 'Clinical Blue', value: '#2563eb' },
    { name: 'Care Emerald', value: '#059669' },
    { name: 'Deep Oceanic', value: '#0d3b4d' },
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <Globe className="w-8 h-8 text-teal-300" />
            Website Customizer & Theme
          </h1>
          <p className="mt-1 text-sm text-slate-300 font-medium">Customize your public landing page theme, branding colors, and layout in real-time.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {slug && (
            <a 
              href={`/${slug}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-teal-300" /> /{slug}
            </a>
          )}
          <button 
            onClick={saveConfig} 
            disabled={saving} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm active:scale-95 ${
              savedSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-[#081e2b] shadow-teal-500/20 disabled:opacity-70'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
            {savedSuccess ? "Changes Saved Live! ✓" : "Publish & Save Theme"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex border-b border-white/10 bg-[#081e2b]/60">
              <button 
                onClick={() => setActiveTab('templates')} 
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'templates' ? 'bg-white/10 text-teal-300 border-b-2 border-teal-400' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> Templates
              </button>
              <button 
                onClick={() => setActiveTab('theme')} 
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'theme' ? 'bg-white/10 text-teal-300 border-b-2 border-teal-400' : 'text-slate-400 hover:text-white'}`}
              >
                <Palette className="w-4 h-4" /> Theme
              </button>
              <button 
                onClick={() => setActiveTab('sections')} 
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'sections' ? 'bg-white/10 text-teal-300 border-b-2 border-teal-400' : 'text-slate-400 hover:text-white'}`}
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
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${config.templateId === t.id ? 'border-teal-400 shadow-xl shadow-teal-500/20' : 'border-white/10 hover:border-white/25'}`}
                    >
                      <div className="h-32 bg-slate-800 relative">
                        <img src={`https://images.unsplash.com/photo-${t.img}?q=80&w=600&auto=format&fit=crop`} alt={t.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                        {config.templateId === t.id && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-[#081e2b] text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white/5 font-bold text-white text-sm">{t.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-teal-200 text-xs uppercase tracking-wider mb-4">Primary Brand Color</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {colors.map(color => (
                        <div 
                          key={color.value} 
                          onClick={() => updateConfig('primaryColor', color.value)} 
                          className={`cursor-pointer flex items-center gap-3 p-3 rounded-2xl border transition-all ${config.primaryColor === color.value ? 'border-teal-400 bg-white/10 shadow-md' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                        >
                          <div className="w-7 h-7 rounded-full shadow-md shrink-0" style={{ backgroundColor: color.value }} />
                          <span className="font-bold text-xs text-white">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-teal-200 text-xs uppercase tracking-wider mb-4">Button Shape</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {buttonStyles.map(style => (
                        <button 
                          key={style.id} 
                          onClick={() => updateConfig('buttonStyle', style.id)} 
                          className={`py-3 px-3 border text-xs font-bold transition-all ${style.id} ${config.buttonStyle === style.id ? 'border-teal-400 bg-teal-500/20 text-teal-200 shadow-md' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'}`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sections' && (
                <div className="space-y-3.5">
                  {Object.keys(config.showSections).map(section => {
                    const labels = { about: 'About Doctor Section', services: 'Services & Pricing', timings: 'OPD Timings', contact: 'Contact & Directions' };
                    return (
                      <div key={section} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-teal-400/30 transition-all">
                        <span className="font-bold text-sm text-white">{labels[section] || section}</span>
                        <button 
                          type="button" 
                          onClick={() => updateSection(section, !config.showSections[section])} 
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${config.showSections[section] ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-700'}`}
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
          <div className="bg-[#081e2b] rounded-3xl p-3 h-[585px] flex flex-col border-[6px] border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#061822] rounded-t-2xl border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-xs font-mono text-teal-300 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Interactive Website Preview</div>
              <div className="w-8"></div>
            </div>
            
            <div className="flex-1 bg-slate-950 overflow-y-auto rounded-b-2xl relative text-white hide-scrollbar" style={{ fontFamily: config.fontStyle }}>
              {/* Preview Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#081e2b]/95 backdrop-blur-md z-10">
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
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 shrink-0 flex items-center justify-center font-bold text-teal-300">
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
              
              <div className="p-6 bg-[#061822] text-slate-500 text-center text-xs border-t border-white/5 mt-6">
                Powered by DocPulse CRM
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

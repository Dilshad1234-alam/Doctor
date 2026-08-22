"use client";

import { useState, useEffect } from "react";
import { Globe, Palette, LayoutTemplate, Loader2, Save, ExternalLink, CheckCircle2, Eye, LayoutGrid } from "lucide-react";

export default function WebsiteBuilderPage() {
  const [config, setConfig] = useState({
    templateId: 'template-1',
    primaryColor: '#2563eb',
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const templates = [
    { id: 'template-1', name: 'Modern Minimalist', img: '1576091160550-2173dba999ef' },
    { id: 'template-2', name: 'Medical Blue Pro', img: '1538108149393-fbbd81477488' },
    { id: 'template-3', name: 'Healthcare Elegant', img: '1511174511562-5844066b90c0' }
  ];

  const colors = [
    { name: 'Medical Blue', value: '#2563eb' },
    { name: 'Emerald Teal', value: '#0d9488' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Slate Dark', value: '#0f172a' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            Website Customizer & Builder
          </h1>
          <p className="mt-2 text-slate-500">Design your public clinic website in real-time.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {slug && (
            <a href={`/${slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm">
              <ExternalLink className="w-4 h-4" /> /{slug}
            </a>
          )}
          <button onClick={saveConfig} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md text-sm ${savedSuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
            {savedSuccess ? "Changes Published Live! ✓" : "Publish & Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button onClick={() => setActiveTab('templates')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'templates' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><LayoutTemplate className="w-4 h-4" /> Templates</button>
              <button onClick={() => setActiveTab('theme')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'theme' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><Palette className="w-4 h-4" /> Theme</button>
              <button onClick={() => setActiveTab('sections')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'sections' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid className="w-4 h-4" /> Sections</button>
            </div>
            
            <div className="p-6 h-[500px] overflow-y-auto">
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  {templates.map((t) => (
                    <div key={t.id} onClick={() => updateConfig('templateId', t.id)} className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${config.templateId === t.id ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="h-32 bg-slate-100 relative">
                        <img src={`https://images.unsplash.com/photo-${t.img}?q=80&w=600&auto=format&fit=crop`} alt={t.name} className="w-full h-full object-cover opacity-90" />
                        {config.templateId === t.id && (
                          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white font-bold text-slate-800">{t.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Primary Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {colors.map(color => (
                        <div key={color.value} onClick={() => updateConfig('primaryColor', color.value)} className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${config.primaryColor === color.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: color.value }} />
                          <span className="font-bold text-sm text-slate-700">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Button Shape</h3>
                    <div className="flex gap-3">
                      {['rounded-xl', 'rounded-full', 'rounded-none'].map(style => (
                        <button key={style} onClick={() => updateConfig('buttonStyle', style)} className={`flex-1 py-3 border-2 text-sm font-bold transition-colors ${style} ${config.buttonStyle === style ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          {style.replace('rounded-', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sections' && (
                <div className="space-y-4">
                  {Object.keys(config.showSections).map(section => {
                    const labels = { about: 'About Doctor', services: 'Services Offered', timings: 'OPD Timings', contact: 'Contact Info' };
                    return (
                      <div key={section} className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-colors shadow-sm">
                        <span className="font-bold text-slate-700">{labels[section] || section}</span>
                        <button type="button" onClick={() => updateSection(section, !config.showSections[section])} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${config.showSections[section] ? 'bg-blue-600' : 'bg-slate-300'}`}>
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

        {/* Live Preview */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 rounded-3xl p-2 h-[565px] flex flex-col border-[8px] border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-t-2xl">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</div>
              <div className="w-8"></div>
            </div>
            
            <div className="flex-1 bg-white overflow-y-auto rounded-b-2xl relative" style={{ fontFamily: config.fontStyle }}>
              {/* Fake Website Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <div className="font-black text-xl" style={{ color: config.primaryColor }}>{clinic?.name || 'Clinic Name'}</div>
                <button className={`px-4 py-2 text-sm font-bold text-white shadow-md ${config.buttonStyle}`} style={{ backgroundColor: config.primaryColor }}>Book Appointment</button>
              </div>
              
              {/* Fake Hero */}
              <div className="p-10 text-center bg-slate-50 border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" style={{ color: config.primaryColor }}></div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Welcome to {clinic?.name || 'our clinic'}</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Professional healthcare services tailored to your needs. Book an appointment today.</p>
                <button className={`px-8 py-3 font-bold text-white shadow-lg shadow-current/20 ${config.buttonStyle}`} style={{ backgroundColor: config.primaryColor }}>View Available Slots</button>
              </div>

              <div className="p-8 space-y-12">
                {config.showSections.about && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: config.primaryColor }}>About Doctor</h2>
                    <div className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0"></div>
                      <div>
                        <div className="font-bold text-lg text-slate-900">Dr. {doctor?.fullName || 'Doctor Name'}</div>
                        <div className="text-slate-500">{doctor?.specialization || 'Specialization'}</div>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{doctor?.bio || 'Experienced medical professional dedicated to providing the highest quality of care.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {config.showSections.services && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: config.primaryColor }}>Services Offered</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="font-bold text-slate-900 mb-1">General Consultation</div>
                        <div className="text-sm text-slate-500">15 mins • ₹500</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="font-bold text-slate-900 mb-1">Follow-up Visit</div>
                        <div className="text-sm text-slate-500">10 mins • ₹300</div>
                      </div>
                    </div>
                  </div>
                )}

                {config.showSections.timings && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: config.primaryColor }}>OPD Timings</h2>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Mon - Sat</span><span className="font-bold text-slate-900">09:00 AM - 05:00 PM</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Sunday</span><span className="font-bold text-slate-400">Closed</span></div>
                    </div>
                  </div>
                )}
                
                {config.showSections.contact && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: config.primaryColor }}>Contact Info</h2>
                    <div className="text-slate-600 text-sm space-y-2">
                      <div>📍 {clinic?.address || 'Clinic Address, City, State'}</div>
                      <div>📞 {clinic?.phone || '+91 9999999999'}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-900 text-slate-400 text-center text-xs mt-10">
                Powered by DocPulse CRM
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

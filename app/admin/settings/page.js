"use client";
import React, { useState } from "react";
import {
  Settings,
  Shield,
  Server,
  Database,
  Lock,
  Globe,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Mail,
  Key,
  Sliders
} from "lucide-react";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("DocPulse SaaS");
  const [supportEmail, setSupportEmail] = useState("admin@gmail.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [platformFeePercent, setPlatformFeePercent] = useState(2.5);
  const [smtpHost, setSmtpHost] = useState("smtp.sendgrid.net");
  const [smtpPort, setSmtpPort] = useState("587");
  const [apiKey, setApiKey] = useState("dp_live_sec_89437298472918");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }, 600);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans text-[#0f172a]">
      {/* 1. Hero Header Banner */}
      <div className="w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
            Configuration
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Platform & Engine Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl">
            Configure global multi-tenant parameters, support contacts, security credentials, and transactional email relays.
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-5 py-2.5 rounded-full animate-in fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: General Platform & Onboarding Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#f8fafc] text-[#164e63] border border-slate-100">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-[#0f172a]">General & Tenancy Controls</h3>
              <p className="text-xs text-slate-500 font-medium">Default variables applied across all clinics</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                Support / Admin Contact Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                  Default Trial Period (Days)
                </label>
                <input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                  Gateway Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
                />
              </div>
            </div>

            {/* Maintenance Toggle */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 flex items-center justify-between mt-2">
              <div>
                <h4 className="font-black text-[#0f172a] text-xs">Global Maintenance Mode</h4>
                <p className="text-[11px] text-slate-500 font-medium">Temporarily redirect public clinic websites</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  maintenanceMode ? "bg-[#0f172a]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    maintenanceMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Security & SMTP Relay Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#f8fafc] text-[#0f172a] border border-slate-100">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-[#0f172a]">Security & SMTP Relay</h3>
                <p className="text-xs text-slate-500 font-medium">API tokens & transactional mail configuration</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                  Platform Master API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-mono focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                    SMTP Relay Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-bold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
                  />
                </div>
              </div>

              {/* Infrastructure indicators */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-bold">Database Engine:</span>
                  <span className="font-black text-[#059669] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
                    MongoDB Connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-bold">Theme Alignment:</span>
                  <span className="font-black text-[#164e63]">DocPulse Landing Page Suite</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

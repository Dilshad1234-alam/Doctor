"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
  Search, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, 
  ExternalLink, LogIn, Edit, Wrench, Globe, RefreshCw, Loader2, 
  X, Save, Plus, Trash2, Clock, Stethoscope, HeartPulse, 
  MapPin, Phone, Mail, UserCheck, Play, ArrowRight, Eye, Check, Power
} from "lucide-react";

export default function ClinicsManagerPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  // Modals state
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [inspectingClinic, setInspectingClinic] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/doctor-override", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setDoctors(json.doctors || []);
      } else {
        showToast(json.message || "Failed to load doctor diagnostics", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to diagnostic server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        doc.name.toLowerCase().includes(q) ||
        doc.email.toLowerCase().includes(q) ||
        doc.phone.toLowerCase().includes(q) ||
        doc.clinic?.name?.toLowerCase().includes(q) ||
        doc.clinic?.slug?.toLowerCase().includes(q) ||
        doc.specialization?.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "HEALTHY") matchesStatus = doc.diagnostics?.healthStatus === "HEALTHY";
      if (statusFilter === "ISSUES") matchesStatus = doc.diagnostics?.healthStatus !== "HEALTHY";
      if (statusFilter === "INCOMPLETE") matchesStatus = !doc.hasCompletedOnboarding;
      if (statusFilter === "LIVE") matchesStatus = Boolean(doc.diagnostics?.isWebsiteLive);

      return matchesSearch && matchesStatus;
    });
  }, [doctors, searchQuery, statusFilter]);

  // Telemetry Counts
  const counts = useMemo(() => {
    return {
      total: doctors.length,
      healthy: doctors.filter(d => d.diagnostics?.healthStatus === "HEALTHY").length,
      issues: doctors.filter(d => d.diagnostics?.healthStatus !== "HEALTHY").length,
      incomplete: doctors.filter(d => !d.hasCompletedOnboarding).length,
      live: doctors.filter(d => d.diagnostics?.isWebsiteLive).length
    };
  }, [doctors]);

  // 1-Click Impersonate Action
  const handleImpersonate = async (doctorId) => {
    setImpersonatingId(doctorId);
    try {
      const res = await fetch("/api/admin/doctor-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorUserId: doctorId })
      });
      const json = await res.json();
      if (json.success && json.token) {
        showToast(`Impersonating ${json.doctorName || 'Doctor'}... Opening Dashboard`, "success");
        window.open(`/api/auth/impersonate?token=${encodeURIComponent(json.token)}`, "_blank");
      } else {
        showToast(json.message || "Failed to generate impersonation token", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating doctor session", "error");
    } finally {
      setImpersonatingId(null);
    }
  };

  // Open Quick Edit Modal & fetch detailed doctor data
  const handleOpenEdit = async (doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      doctorUserId: doctor._id,
      userUpdates: {
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        hasCompletedOnboarding: doctor.hasCompletedOnboarding
      },
      doctorProfile: {
        fullName: doctor.name,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experienceYrs: doctor.experienceYrs,
        avatarUrl: doctor.avatarUrl
      },
      clinicDetails: doctor.clinic ? {
        name: doctor.clinic.name,
        slug: doctor.clinic.slug,
        address: doctor.clinic.address || "",
        city: doctor.clinic.city || "",
        phone: doctor.clinic.phone || doctor.phone
      } : {
        name: `${doctor.name}'s Clinic`,
        slug: doctor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        address: "Clinic Address",
        city: "City",
        phone: doctor.phone
      },
      forceCompleteOnboarding: doctor.hasCompletedOnboarding,
      subscription: {
        planId: doctor.subscription?.planId || "PRO",
        status: doctor.subscription?.status || "ACTIVE",
        billingCycle: doctor.subscription?.billingCycle || "MONTHLY"
      },
      websiteConfig: {
        isPublished: doctor.websiteConfig?.isPublished ?? true,
        templateId: doctor.websiteConfig?.templateId || "template-1",
        primaryColor: doctor.websiteConfig?.primaryColor || "#0f766e"
      },
      services: [],
      availability: []
    });

    // Fetch full services and availability for this doctor
    try {
      const res = await fetch(`/api/admin/doctor-override?doctorId=${doctor._id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setEditFormData(prev => ({
          ...prev,
          services: json.data.services || [],
          availability: json.data.availability?.length > 0 ? json.data.availability : [
            { dayOfWeek: 0, isOpen: false, startTime: "09:00", endTime: "17:00" },
            { dayOfWeek: 1, isOpen: true, startTime: "09:00", endTime: "17:00" },
            { dayOfWeek: 2, isOpen: true, startTime: "09:00", endTime: "17:00" },
            { dayOfWeek: 3, isOpen: true, startTime: "09:00", endTime: "17:00" },
            { dayOfWeek: 4, isOpen: true, startTime: "09:00", endTime: "17:00" },
            { dayOfWeek: 5, isOpen: true, startTime: "09:00", endTime: "17:00" },
            { dayOfWeek: 6, isOpen: true, startTime: "09:00", endTime: "17:00" }
          ]
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Quick Fix Edits
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/doctor-override", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData)
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Clinic configuration repaired & updated!", "success");
        setEditingDoctor(null);
        fetchDoctors();
      } else {
        showToast(json.message || "Failed to update configuration", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving doctor changes", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 border ${toast.type === 'success' ? 'bg-[#0f172a] text-white border-[#1e293b]' : 'bg-rose-900 text-white border-rose-700'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" /> Super Admin Diagnostics & Remote Control
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Clinic Remote Management & Support Hub
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-3xl">
              Inspect live telemetry, debug broken clinic configs, force-complete stuck onboarding wizards, and 1-click impersonate any doctor session.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDoctors}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Health Diagnostic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0f172a] text-white p-6 rounded-3xl shadow-lg border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Doctors</span>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{counts.total}</h3>
          <p className="text-xs text-slate-300">Registered platform practitioners</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Healthy & Live</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-600">{counts.healthy}</h3>
          <p className="text-xs text-slate-500">100% configured & bookable</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Needs Attention</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-amber-600">{counts.issues}</h3>
          <p className="text-xs text-slate-500">Missing timings, services, or slugs</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-[#0f172a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stuck In Onboarding</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-rose-600">{counts.incomplete}</h3>
          <p className="text-xs text-slate-500">Requires 1-click override</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by doctor, clinic name, email, phone, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#164e63] text-xs font-medium outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap">
          {[
            { id: "ALL", label: "All Clinics", count: counts.total },
            { id: "HEALTHY", label: "Healthy", count: counts.healthy },
            { id: "ISSUES", label: "Diagnostic Flags", count: counts.issues },
            { id: "INCOMPLETE", label: "Incomplete", count: counts.incomplete },
            { id: "LIVE", label: "Live Slugs", count: counts.live }
          ].map(tab => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-[#0f172a] text-white shadow-md font-black" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? "bg-white text-[#0f172a]" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden min-h-[420px] relative">
        {loading && doctors.length === 0 ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#164e63] animate-spin" />
            <p className="mt-2 text-sm font-bold text-slate-700">Loading clinic diagnostics...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3 font-black">Doctor & Clinic</th>
                  <th className="pb-3 font-black">Onboarding</th>
                  <th className="pb-3 font-black">Live Status</th>
                  <th className="pb-3 font-black">System Diagnostics</th>
                  <th className="pb-3 font-black text-right">Support Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                      No doctor records match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map(doc => {
                    const diag = doc.diagnostics || {};
                    return (
                      <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* 1. Doctor & Clinic Info */}
                        <td className="py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-[#0f172a] font-black text-sm flex items-center justify-center shadow-sm shrink-0 border border-slate-200">
                              {doc.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-[#0f172a] flex items-center gap-2">
                                <span>{doc.name}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-bold border border-slate-200">
                                  {doc.specialization}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                <span>{doc.email}</span>
                                <span>•</span>
                                <span className="font-mono">{doc.phone}</span>
                              </div>
                              <div className="text-xs text-[#164e63] font-bold mt-0.5">
                                {doc.clinic?.name || "Clinic Pending"} • <span className="font-mono text-slate-500">/{doc.clinic?.slug || "no-slug"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Onboarding Status */}
                        <td className="py-4">
                          {doc.hasCompletedOnboarding ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                              <AlertCircle className="w-3.5 h-3.5" /> Incomplete
                            </span>
                          )}
                        </td>

                        {/* 3. Live Website Status */}
                        <td className="py-4">
                          {diag.isWebsiteLive ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                              </span>
                              <p className="text-[10px] text-slate-400 font-mono">/{doc.clinic?.slug}</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                              Needs Config
                            </span>
                          )}
                        </td>

                        {/* 4. Diagnostics & Issues Flags */}
                        <td className="py-4 max-w-xs">
                          {diag.issues && diag.issues.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {diag.issues.map((issue, i) => (
                                <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {issue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> All Systems Healthy
                            </span>
                          )}
                        </td>

                        {/* 5. Support Actions */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            
                            {/* 1-Click Impersonate Button */}
                            <button
                              type="button"
                              onClick={() => handleImpersonate(doc._id)}
                              disabled={impersonatingId === doc._id}
                              className="inline-flex items-center gap-1 bg-[#0f172a] hover:bg-[#1e293b] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              title="Login to Doctor Dashboard without password"
                            >
                              {impersonatingId === doc._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                              )}
                              <span>Login As Doctor</span>
                            </button>

                            {/* Quick Fix / Edit Modal Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(doc)}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                              title="Override credentials, services, or timings"
                            >
                              <Wrench className="w-3.5 h-3.5 text-[#164e63]" />
                              <span>Fix / Edit</span>
                            </button>

                            {/* Live Site Preview Inspector */}
                            {doc.clinic?.slug && (
                              <button
                                type="button"
                                onClick={() => setInspectingClinic(doc)}
                                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-[#164e63] border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                                title="Inspect Live Website"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK FIX & DOCTOR OVERRIDE MODAL */}
      {editingDoctor && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar text-[#0f172a]">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0f172a]">Remote Doctor & Clinic Override</h3>
                  <p className="text-xs text-slate-500">Directly repair doctor records, force onboarding, and update services</p>
                </div>
              </div>
              <button onClick={() => setEditingDoctor(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              
              {/* Force Complete Onboarding Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-amber-900">Force Complete Onboarding</p>
                  <p className="text-[11px] text-amber-700">Enables full dashboard access for doctors stuck in onboarding wizard.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFormData(prev => ({ ...prev, forceCompleteOnboarding: !prev.forceCompleteOnboarding }))}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    editFormData.forceCompleteOnboarding 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {editFormData.forceCompleteOnboarding ? "✓ Onboarded (Active)" : "✕ Incomplete"}
                </button>
              </div>

              {/* Doctor Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Doctor Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Doctor Name</label>
                    <input 
                      type="text"
                      value={editFormData.doctorProfile.fullName}
                      onChange={e => setEditFormData(p => ({ 
                        ...p, 
                        userUpdates: { ...p.userUpdates, name: e.target.value },
                        doctorProfile: { ...p.doctorProfile, fullName: e.target.value } 
                      }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Specialization</label>
                    <input 
                      type="text"
                      value={editFormData.doctorProfile.specialization}
                      onChange={e => setEditFormData(p => ({ ...p, doctorProfile: { ...p.doctorProfile, specialization: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                    <input 
                      type="email"
                      value={editFormData.userUpdates.email}
                      onChange={e => setEditFormData(p => ({ ...p, userUpdates: { ...p.userUpdates, email: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                    <input 
                      type="text"
                      value={editFormData.userUpdates.phone}
                      onChange={e => setEditFormData(p => ({ ...p, userUpdates: { ...p.userUpdates, phone: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                </div>
              </div>

              {/* Clinic Info */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinic & Public URL</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Clinic Name</label>
                    <input 
                      type="text"
                      value={editFormData.clinicDetails.name}
                      onChange={e => setEditFormData(p => ({ ...p, clinicDetails: { ...p.clinicDetails, name: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Public URL Slug</label>
                    <input 
                      type="text"
                      value={editFormData.clinicDetails.slug}
                      onChange={e => setEditFormData(p => ({ ...p, clinicDetails: { ...p.clinicDetails, slug: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Address & City</label>
                    <input 
                      type="text"
                      value={editFormData.clinicDetails.address}
                      onChange={e => setEditFormData(p => ({ ...p, clinicDetails: { ...p.clinicDetails, address: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#164e63]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Services Fix */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation Offerings</h4>
                  <button
                    type="button"
                    onClick={() => setEditFormData(p => ({ ...p, services: [...p.services, { name: "General Consultation", price: 500, durationMins: 15 }] }))}
                    className="text-xs font-bold text-[#164e63] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Service
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {editFormData.services.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No services configured for this clinic yet.</p>
                  ) : (
                    editFormData.services.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={s.name} 
                          placeholder="Service Name"
                          onChange={e => {
                            const arr = [...editFormData.services];
                            arr[idx].name = e.target.value;
                            setEditFormData(p => ({ ...p, services: arr }));
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium" 
                        />
                        <input 
                          type="number" 
                          value={s.price} 
                          placeholder="Fee ₹"
                          onChange={e => {
                            const arr = [...editFormData.services];
                            arr[idx].price = e.target.value;
                            setEditFormData(p => ({ ...p, services: arr }));
                          }}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const arr = editFormData.services.filter((_, i) => i !== idx);
                            setEditFormData(p => ({ ...p, services: arr }));
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-5 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-7 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save & Repair Clinic</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIVE WEBSITE PREVIEW & INSPECTOR MODAL */}
      {inspectingClinic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6">
          <div className="bg-[#0a202c] border border-white/10 rounded-2xl p-4 flex items-center justify-between text-white mb-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Live Site Inspector: {inspectingClinic.clinic?.name || inspectingClinic.name}</h3>
                <p className="text-xs text-slate-300 font-mono">https://docpulse.com/{inspectingClinic.clinic?.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a 
                href={`/${inspectingClinic.clinic?.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-white text-[#0f172a] hover:bg-slate-100 px-4 py-1.5 rounded-full text-xs font-bold shadow-md"
              >
                <span>Open in Real Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button 
                onClick={() => setInspectingClinic(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <iframe 
              src={`/${inspectingClinic.clinic?.slug}`} 
              title="Live Clinic Preview" 
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}

    </div>
  );
}

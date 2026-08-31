"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  Users, Search, Calendar, FileText, Plus, Loader2, 
  Sparkles, Phone, Clock, ChevronRight, Check, X, 
  CheckCircle2, History, AlertCircle, Edit3, MessageSquare
} from "lucide-react";

export default function PatientsDirectoryPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Plan & Capacity State
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [planId, setPlanId] = useState("BASIC");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Note Modal / Drawer State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [activePatientForNote, setActivePatientForNote] = useState(null);
  const [clinicalNoteText, setClinicalNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/upgrade", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setIsAdvanced(Boolean(json.isAdvanced));
        setIsPremium(Boolean(json.isPremium));
        if (json.planId) setPlanId(json.planId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/dashboard/patients";
      if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load patient directory", "error");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchSubscription();
    fetchPatients();
  }, [fetchPatients]);

  const handleOpenNoteModal = (patient) => {
    if (!isAdvanced) {
      setShowUpgradeModal(true);
      return;
    }
    setActivePatientForNote(patient);
    setClinicalNoteText(patient.lastPrescribedNote || "");
    setShowNoteModal(true);
  };

  const handleSaveClinicalNote = async (e) => {
    e.preventDefault();
    if (!activePatientForNote) return;

    setSavingNote(true);
    try {
      const res = await fetch("/api/dashboard/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: activePatientForNote.latestAppointmentId,
          patientPhone: activePatientForNote.patientPhone,
          clinicalNotes: clinicalNoteText
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save note");

      showToast("Clinical prescription note saved!");
      setShowNoteModal(false);
      
      // Update in memory
      setPatients(prev =>
        prev.map(p =>
          p.patientKey === activePatientForNote.patientKey
            ? { ...p, lastPrescribedNote: clinicalNoteText }
            : p
        )
      );

      if (selectedPatient && selectedPatient.patientKey === activePatientForNote.patientKey) {
        setSelectedPatient(prev => ({ ...prev, lastPrescribedNote: clinicalNoteText }));
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingNote(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      p =>
        p.patientName.toLowerCase().includes(q) ||
        p.patientPhone.includes(q) ||
        (p.lastPrescribedNote && p.lastPrescribedNote.toLowerCase().includes(q))
    );
  }, [patients, searchQuery]);

  return (
    <div className="p-4 sm:p-6 flex flex-col h-[calc(100vh-74px)] gap-4 max-w-[1600px] mx-auto font-sans bg-slate-50 text-[#0f172a] overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-black animate-in slide-in-from-bottom-5 ${
          toast.type === "error" 
            ? "bg-rose-900 text-rose-100 border-rose-700" 
            : "bg-[#0c2e3d] text-teal-100 border-[#00A1AC]"
        }`}>
          <Sparkles className="w-4 h-4 text-[#00A1AC]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-[#00A1AC]" />
              Patient History & Clinical Records
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A1AC]/10 text-[#00A1AC] px-2.5 py-1 rounded-full border border-[#00A1AC]/20">
              Module 4
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Centralized patient database, historical visits timeline, and 1-line quick prescription notes.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by Name, Phone, or Note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC] focus:ring-1 focus:ring-[#00A1AC] shadow-sm"
          />
        </div>
      </div>

      {/* Patients Table & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Left: Patient Directory Table (2 Cols) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Registered Patients Directory</h2>
            <span className="text-xs text-slate-400 font-bold">{filteredPatients.length} Unique Patients</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
                <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-6 font-black">Patient Profile</th>
                  <th className="py-3.5 px-4 font-black">Total Visits</th>
                  <th className="py-3.5 px-4 font-black">Last Visit Date</th>
                  <th className="py-3.5 px-4 font-black">Last Prescribed Clinical Note</th>
                  <th className="py-3.5 px-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00A1AC] mb-2" />
                      <p className="font-bold text-xs">Loading patient directory...</p>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <p className="font-bold text-sm text-slate-600">No patient records found</p>
                      <p className="text-xs text-slate-400 mt-1">Patients will automatically appear here as appointments are booked</p>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const isSelected = selectedPatient?.patientKey === patient.patientKey;
                    const dateFormatted = patient.lastVisitDate 
                      ? new Date(patient.lastVisitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Recent";

                    return (
                      <tr 
                        key={patient.patientKey}
                        onClick={() => setSelectedPatient(patient)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                          isSelected ? "bg-teal-50/50" : ""
                        }`}
                      >
                        {/* Patient Name & Mobile */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] font-black flex items-center justify-center text-sm shrink-0 border border-[#00A1AC]/20">
                              {patient.patientName?.charAt(0).toUpperCase() || "P"}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm group-hover:text-[#00A1AC] transition-colors">
                                {patient.patientName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {patient.patientPhone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Total Visits */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black border border-slate-200">
                            {patient.totalVisits} {patient.totalVisits === 1 ? "visit" : "visits"}
                          </span>
                        </td>

                        {/* Last Visit Date */}
                        <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                          {dateFormatted}
                        </td>

                        {/* Last Prescribed Note */}
                        <td className="py-4 px-4">
                          {patient.lastPrescribedNote ? (
                            <p className="text-xs text-slate-700 font-medium max-w-xs truncate bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                              {patient.lastPrescribedNote}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No notes recorded</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNoteModal(patient);
                            }}
                            className="px-3 py-1.5 bg-[#00A1AC]/10 hover:bg-[#00A1AC] text-[#00A1AC] hover:text-white rounded-xl text-xs font-bold transition-all border border-[#00A1AC]/20 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Add Note</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Patient Timeline & History Card */}
        <div className="flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2">
          {selectedPatient ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black text-base shadow-md">
                    {selectedPatient.patientName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{selectedPatient.patientName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedPatient.patientPhone}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenNoteModal(selectedPatient)}
                  className="p-2 rounded-xl bg-[#00A1AC]/10 text-[#00A1AC] hover:bg-[#00A1AC] hover:text-white transition-all"
                  title="Edit Clinical Note"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Latest Clinical Note Highlight */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#00A1AC] uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Clinical Prescription Note</span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {selectedPatient.lastPrescribedNote || "No clinical note recorded yet. Click '+ Add Note' to prescribe."}
                </p>
              </div>

              {/* Visit History Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Visit History ({selectedPatient.visits?.length || 1})</span>
                </h4>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {selectedPatient.visits?.map((v, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800">{v.serviceName || "OPD Visit"}</span>
                        <span className="font-bold text-[#00A1AC]">
                          {new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Slot: {v.timeSlot}</span>
                        <span className="font-bold text-slate-700 uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {v.status}
                        </span>
                      </div>
                      {v.clinicalNotes && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200 mt-1">
                          📝 {v.clinicalNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-black text-sm text-slate-700">Select a Patient</h3>
              <p className="text-xs text-slate-400">
                Click any patient from the directory table to inspect their complete visit timeline and clinical prescription history.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Quick Clinical Note Modal */}
      {showNoteModal && activePatientForNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Clinical Prescription Note</h3>
                  <p className="text-xs text-slate-500">For {activePatientForNote.patientName} ({activePatientForNote.patientPhone})</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClinicalNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor Clinical Note / Prescription *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Prescribed Amoxicillin 500mg (1-0-1) for 5 days, review with CBC report if fever persists."
                  value={clinicalNoteText}
                  onChange={(e) => setClinicalNoteText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-6 py-2.5 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#00A1AC]/25 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Note to History</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal for Clinical Notes */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black shadow-lg shadow-[#00A1AC]/30">
                <FileText className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A1AC] px-2.5 py-1 rounded-full border border-teal-200">
                Advanced Plan Feature
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Unlock 1-Line Clinical Notes &amp; Rx History
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Recording digital clinical prescription notes, review schedules, and historical EMR records is unlocked on the <strong>Advanced Plan (₹999/mo)</strong> and <strong>Premium Tier</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Maybe Later
              </button>
              <Link
                href="/dashboard/billing"
                className="px-6 py-2.5 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#00A1AC]/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <span>Upgrade to Advanced</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

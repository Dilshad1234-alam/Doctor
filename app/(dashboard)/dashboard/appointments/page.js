"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Filter, Loader2, AlertCircle, RefreshCw, Sparkles, User,
  Check, X, Ban, ShieldCheck, Power, ArrowRight, Download, Lock,
  Plus, DollarSign, CreditCard, ChevronRight, Phone, Stethoscope, Tag, Eye
} from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Walk-in Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const [walkInData, setWalkInData] = useState({
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "Male",
    serviceId: "",
    paymentMethod: "Cash",
    clinicalNotes: ""
  });

  // Action Loading & Toast State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Plan & Capacity State
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [planId, setPlanId] = useState("BASIC");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  const fetchSubscriptionStatus = async () => {
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

  const handleExportData = () => {
    if (!isPremium) {
      setUpgradeFeature("1-Click CSV & PDF Patient Roster Export");
      setShowUpgradeModal(true);
      return;
    }

    // Generate CSV for Premium Doctors
    if (appointments.length === 0) {
      showToast("No appointment records to export", "error");
      return;
    }

    const headers = "Token,Patient Name,Mobile,Service,Price,Time Slot,Queue Status,Payment Status,Date\n";
    const rows = appointments.map((a, i) => 
      `"${a.tokenNumber || i + 1}","${a.patientName || ''}","${a.patientPhone || ''}","${a.serviceName || ''}","${a.price || 500}","${a.timeSlot || ''}","${a.status || 'WAITING'}","${a.paymentStatus || 'PENDING'}","${new Date(a.appointmentDate || a.createdAt).toLocaleDateString()}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clinic_roster_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Patient Roster downloaded successfully!");
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/clinic/services");
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
        if (data.services.length > 0 && !walkInData.serviceId) {
          setWalkInData(prev => ({ ...prev, serviceId: data.services[0]._id }));
        }
      }
    } catch (e) {
      console.error("Fetch services error:", e);
    }
  };

  const fetchAppointments = useCallback(async (isBackground = false) => {
    if (!isBackground && appointments.length === 0) setLoading(true);
    setError("");
    try {
      let url = `/api/dashboard/appointments?status=${activeFilter}`;
      if (dateFilter) url += `&date=${dateFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch appointments");
      
      const incoming = data.appointments || [];
      setAppointments(incoming);
    } catch (err) {
      if (!isBackground) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, dateFilter, searchQuery, appointments.length]);

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchServices();
    fetchAppointments(false);

    const pollInterval = setInterval(() => {
      fetchAppointments(true);
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [fetchAppointments]);

  // Handle 1-Click State Transitions
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setActionLoadingId(appointmentId);
    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");

      setAppointments(prev =>
        prev.map(apt => (apt._id === appointmentId ? { ...apt, status: newStatus } : apt))
      );
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Payment Status Toggle
  const handleTogglePayment = async (appointmentId, currentPaymentStatus) => {
    setActionLoadingId(appointmentId);
    let nextStatus = "PAID_CASH";
    let nextMethod = "Cash";

    if (currentPaymentStatus === "PAID_CASH") {
      nextStatus = "PAID_UPI";
      nextMethod = "UPI / Online";
    } else if (currentPaymentStatus === "PAID_UPI" || currentPaymentStatus === "PAID_ONLINE") {
      nextStatus = "PENDING";
      nextMethod = "Unpaid";
    } else {
      nextStatus = "PAID_CASH";
      nextMethod = "Cash";
    }

    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          appointmentId, 
          paymentStatus: nextStatus,
          paymentMethod: nextMethod
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment status update failed");

      setAppointments(prev =>
        prev.map(apt => (apt._id === appointmentId ? { ...apt, paymentStatus: nextStatus, paymentMethod: nextMethod } : apt))
      );
      showToast(`Payment updated to ${nextStatus.replace('_', ' ')}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Walk-in Submission
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInData.patientName || !walkInData.patientPhone) {
      showToast("Please enter patient name and phone", "error");
      return;
    }

    setIsSubmittingWalkIn(true);
    try {
      const selectedServiceObj = services.find(s => s._id === walkInData.serviceId);
      const res = await fetch("/api/dashboard/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...walkInData,
          serviceName: selectedServiceObj?.name || "General Consultation",
          price: selectedServiceObj?.price || 500,
          paymentStatus: walkInData.paymentMethod === "Cash" ? "PAID_CASH" : (walkInData.paymentMethod === "UPI / Online" ? "PAID_UPI" : "PENDING")
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register walk-in patient");

      showToast(`Walk-in Token #${data.appointment.tokenNumber || 1} generated successfully!`);
      setShowWalkInModal(false);
      setWalkInData({
        patientName: "",
        patientPhone: "",
        patientAge: "",
        patientGender: "Male",
        serviceId: services[0]?._id || "",
        paymentMethod: "Cash",
        clinicalNotes: ""
      });
      fetchAppointments(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchFilter = 
        activeFilter === "ALL" ||
        (activeFilter === "WAITING" && (apt.status === "WAITING" || apt.status === "PENDING")) ||
        apt.status === activeFilter;

      const matchSearch = 
        !searchQuery ||
        apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientPhone?.includes(searchQuery) ||
        apt.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [appointments, activeFilter, searchQuery]);

  // Queue Counters
  const queueStats = useMemo(() => {
    const waiting = appointments.filter(a => a.status === "WAITING" || a.status === "PENDING" || !a.status).length;
    const inConsultation = appointments.filter(a => a.status === "IN_CONSULTATION").length;
    const completed = appointments.filter(a => a.status === "COMPLETED").length;
    const cancelled = appointments.filter(a => a.status === "CANCELLED").length;
    const totalCollected = appointments
      .filter(a => a.paymentStatus === "PAID_CASH" || a.paymentStatus === "PAID_UPI" || a.paymentStatus === "PAID_ONLINE" || a.status === "COMPLETED")
      .reduce((sum, a) => sum + (Number(a.price) || 500), 0);

    return { waiting, inConsultation, completed, cancelled, total: appointments.length, totalCollected };
  }, [appointments]);

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-black animate-in slide-in-from-bottom-5 ${
          toast.type === "error" 
            ? "bg-rose-900 text-rose-100 border-rose-700" 
            : "bg-[#0c2e3d] text-teal-100 border-[#00A1AC]"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4 text-[#00A1AC]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-7 h-7 text-[#00A1AC]" />
              Live Appointments & Queue Manager
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A1AC]/10 text-[#00A1AC] px-2.5 py-1 rounded-full border border-[#00A1AC]/20">
              Module 1 & 5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time patient tokens, 1-click consultation state transitions, and instant cash/UPI billing settlement.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportData}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              isPremium
                ? "bg-slate-900 text-amber-300 hover:bg-slate-800 border border-amber-500/30"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isPremium ? <Download className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
            <span>Export Roster (CSV)</span>
            {!isPremium && (
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">VIP</span>
            )}
          </button>

          <button
            onClick={() => fetchAppointments(false)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </button>

          {/* Quick Walk-in Button */}
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#00A1AC]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Walk-in Patient</span>
          </button>
        </div>
      </div>

      {/* 2. Queue KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Waiting in Queue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Waiting Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{queueStats.waiting}</p>
          <span className="text-[10px] text-slate-400 font-medium">In waiting area</span>
        </div>

        {/* In-Consultation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">In-Consultation</span>
            <Stethoscope className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600">{queueStats.inConsultation}</p>
          <span className="text-[10px] text-slate-400 font-medium">Currently with doctor</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Consulted Done</span>
            <CheckCircle2 className="w-4 h-4 text-[#00A1AC]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#00A1AC]">{queueStats.completed}</p>
          <span className="text-[10px] text-slate-400 font-medium">Completed visits</span>
        </div>

        {/* Cancelled */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Cancelled / No Show</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">{queueStats.cancelled}</p>
          <span className="text-[10px] text-slate-400 font-medium">Missed slots</span>
        </div>

        {/* Revenue Collected */}
        <div className="bg-[#0c2e3d] text-white p-5 rounded-3xl border border-[#15465c] shadow-md space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-teal-200">
            <span className="text-[11px] font-black uppercase tracking-wider">Settled Billing</span>
            <DollarSign className="w-4 h-4 text-[#00A1AC]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{queueStats.totalCollected}</p>
          <span className="text-[10px] text-teal-200/70 font-medium">Cash + UPI collected</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {[
            { id: "ALL", label: `All Patients (${queueStats.total})` },
            { id: "WAITING", label: `Waiting (${queueStats.waiting})` },
            { id: "IN_CONSULTATION", label: `In-Consultation (${queueStats.inConsultation})` },
            { id: "COMPLETED", label: `Completed (${queueStats.completed})` },
            { id: "CANCELLED", label: `Cancelled (${queueStats.cancelled})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-[#00A1AC] text-white shadow-md shadow-[#00A1AC]/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Date */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name / Mobile / Service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC] focus:ring-1 focus:ring-[#00A1AC]"
            />
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-600 focus:outline-none focus:border-[#00A1AC]"
          />
        </div>
      </div>

      {/* 4. Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6 font-black">Token & Patient</th>
                <th className="py-4 px-4 font-black">Consultation Service</th>
                <th className="py-4 px-4 font-black">Slot / Time</th>
                <th className="py-4 px-4 font-black">Queue Status</th>
                <th className="py-4 px-4 font-black">Billing & Payment Mode</th>
                <th className="py-4 px-6 font-black text-right">1-Click Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00A1AC] mb-2" />
                    <p className="font-bold text-xs">Syncing today&apos;s queue...</p>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-600">No appointments found</p>
                    <p className="text-xs text-slate-400 mt-1">Use the &quot;+ Add Walk-in Patient&quot; button above to register queue patients</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt, index) => {
                  const tokenNum = apt.tokenNumber || index + 1;
                  const isBusy = actionLoadingId === apt._id;

                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Token & Patient Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] font-black uppercase text-slate-400">Token</span>
                            <span className="text-sm font-black -mt-1 text-[#00A1AC]">#{tokenNum}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{apt.patientName}</span>
                              {apt.isWalkIn && (
                                <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                  Walk-in
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{apt.patientPhone}</span>
                              {apt.patientAge && <span>• {apt.patientAge}y</span>}
                              {apt.patientGender && <span>• {apt.patientGender}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service & Price */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 text-xs">{apt.serviceName || "General OPD"}</p>
                        <p className="text-[11px] font-extrabold text-[#00A1AC] mt-0.5">₹{apt.price || 500}</p>
                      </td>

                      {/* Time Slot */}
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-xl text-xs inline-flex items-center gap-1.5 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {apt.timeSlot || "Walk-in Queue"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          apt.status === "COMPLETED"
                            ? "bg-[#00A1AC]/15 text-[#00A1AC] border border-[#00A1AC]/30"
                            : apt.status === "IN_CONSULTATION"
                            ? "bg-teal-100 text-teal-800 border border-teal-200 animate-pulse"
                            : apt.status === "CONFIRMED"
                            ? "bg-teal-50 text-[#00A1AC] border border-teal-200"
                            : apt.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : apt.status === "REJECTED" || apt.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {apt.status === "IN_CONSULTATION" 
                            ? "In-Consultation" 
                            : apt.status === "CONFIRMED" 
                            ? "Confirmed"
                            : apt.status === "PENDING"
                            ? "Pending Approval"
                            : apt.status === "REJECTED"
                            ? "Declined"
                            : (apt.status || "WAITING")}
                        </span>
                      </td>

                      {/* Payment Mode Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePayment(apt._id, apt.paymentStatus)}
                          disabled={isBusy}
                          title="Click to cycle payment mode"
                          className={`px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            apt.paymentStatus === "PAID_CASH"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : apt.paymentStatus === "PAID_UPI" || apt.paymentStatus === "PAID_ONLINE"
                              ? "bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100"
                              : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>
                            {apt.paymentStatus === "PAID_CASH" 
                              ? "Paid (Cash)" 
                              : apt.paymentStatus === "PAID_UPI" || apt.paymentStatus === "PAID_ONLINE" 
                              ? "Paid (UPI)" 
                              : "Pending (Unpaid)"}
                          </span>
                        </button>
                      </td>

                      {/* 1-Click State Transitions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === "PENDING" ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateStatus(apt._id, "CONFIRMED")}
                                disabled={isBusy}
                                className="px-3.5 py-1.5 rounded-xl bg-[#00A1AC] text-white text-xs font-bold hover:bg-[#008c96] shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                              >
                                <span>✓ Confirm</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt._id, "REJECTED")}
                                disabled={isBusy}
                                className="w-7 h-7 rounded-xl text-rose-500 hover:bg-rose-50 hover:border-rose-200 border border-transparent flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
                                title="Decline / Slots Full"
                              >
                                ✕
                              </button>
                            </div>
                          ) : apt.status === "CONFIRMED" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(apt._id, "IN_CONSULTATION")}
                                disabled={isBusy}
                                className="px-3.5 py-1.5 rounded-xl bg-[#00A1AC] text-white text-xs font-bold hover:bg-[#008c96] shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                              >
                                <span>Start Consult &gt;</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt._id, "CANCELLED")}
                                disabled={isBusy}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Cancel Appointment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : apt.status === "WAITING" || !apt.status ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(apt._id, "IN_CONSULTATION")}
                                disabled={isBusy}
                                className="px-3.5 py-1.5 bg-[#00A1AC] hover:bg-[#008c96] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00A1AC]/20 active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <span>Start Consult</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt._id, "CANCELLED")}
                                disabled={isBusy}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Cancel Appointment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : apt.status === "IN_CONSULTATION" ? (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, "COMPLETED")}
                              disabled={isBusy}
                              className="px-3.5 py-1.5 bg-[#00A1AC] hover:bg-[#008c96] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00A1AC]/20 active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Done</span>
                            </button>
                          ) : apt.status === "COMPLETED" ? (
                            <span className="text-xs font-bold text-[#00A1AC] flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Consulted
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-500">
                              {apt.status === "REJECTED" ? "Declined" : "Cancelled"}
                            </span>
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
      </div>

      {/* 5. "+ Add Walk-in Patient" Quick Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00A1AC] text-white flex items-center justify-center font-black shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Add Walk-in Patient</h3>
                  <p className="text-xs text-slate-500">Auto-assigns next token for today&apos;s queue</p>
                </div>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={walkInData.patientName}
                  onChange={(e) => setWalkInData({ ...walkInData, patientName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                />
              </div>

              {/* Mobile & Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={walkInData.patientPhone}
                    onChange={(e) => setWalkInData({ ...walkInData, patientPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age & Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      value={walkInData.patientAge}
                      onChange={(e) => setWalkInData({ ...walkInData, patientAge: e.target.value })}
                      className="w-1/2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                    />
                    <select
                      value={walkInData.patientGender}
                      onChange={(e) => setWalkInData({ ...walkInData, patientGender: e.target.value })}
                      className="w-1/2 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Select Service */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Service</label>
                <select
                  value={walkInData.serviceId}
                  onChange={(e) => setWalkInData({ ...walkInData, serviceId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#00A1AC]"
                >
                  {services.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} (₹{s.price}) - {s.durationMins}m
                    </option>
                  ))}
                  {services.length === 0 && (
                    <option value="">General OPD Consultation (₹500)</option>
                  )}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Cash", "UPI / Online"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWalkInData({ ...walkInData, paymentMethod: mode })}
                      className={`py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        walkInData.paymentMethod === mode
                          ? "bg-[#00A1AC] text-white border-[#00A1AC] shadow-md shadow-[#00A1AC]/20"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="px-6 py-2.5 bg-[#00A1AC] hover:bg-[#008790] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#00A1AC]/25 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingWalkIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Generate Token & Add to Queue</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal for Gated Features */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
                <Crown className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                Premium VIP Feature
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Unlock {upgradeFeature || "Data Export & VIP Analytics"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                1-Click CSV Roster downloads, multi-session clinical tracking, and priority VIP SLA support are available exclusively on the <strong>Premium Tier (₹1,499/mo)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
              <p className="font-bold text-amber-900">Included with Premium Tier:</p>
              <ul className="space-y-1.5 text-amber-800/90 font-medium">
                <li className="flex items-center gap-2">✓ Unlimited CSV &amp; PDF financial/patient exports</li>
                <li className="flex items-center gap-2">✓ 100% White-Label (zero DocPulse branding)</li>
                <li className="flex items-center gap-2">✓ Custom Domain with instant SSL &amp; CNAME</li>
                <li className="flex items-center gap-2">✓ Executive Luxury website templates with Video Bio</li>
              </ul>
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
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade to Premium</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

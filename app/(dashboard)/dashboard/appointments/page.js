"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Filter, Loader2, AlertCircle, RefreshCw, Sparkles, User,
  Check, X, Ban, ShieldCheck, Power, ArrowRight, Download, Lock, FileSpreadsheet,
  ArrowUpRight, FileText, CalendarRange, Crown, Printer
} from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Plan & Capacity State
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [isTogglingToday, setIsTogglingToday] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  const todayDayOfWeek = new Date().getDay();

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch("/api/subscription/upgrade", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setIsAdvanced(Boolean(json.isAdvanced));
        setIsPremium(Boolean(json.isPremium));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await fetch("/api/clinic/availability");
      const data = await res.json();
      if (data.success && Array.isArray(data.availability)) {
        const today = data.availability.find(d => Number(d.dayOfWeek) === todayDayOfWeek);
        setTodaySchedule(today || { dayOfWeek: todayDayOfWeek, isOpen: true });
      }
    } catch (e) {
      console.error("Fetch availability error:", e);
    }
  };

  const fetchAppointments = async (isBackground = false) => {
    if (!isBackground && appointments.length === 0) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/appointments?status=ALL", { cache: "no-store" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch appointments");
      
      const incoming = data.appointments || [];
      
      setAppointments(prev => {
        if (prev.length > 0 && incoming.length > prev.length) {
          const newApts = incoming.filter(item => !prev.some(p => p._id === item._id));
          if (newApts.length > 0) {
            showToast(`🔔 New Appointment received: ${newApts[0].patientName} (${newApts[0].timeSlot})`, "success");
          }
        }
        return incoming;
      });
    } catch (err) {
      if (!isBackground) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchAvailability();
    fetchAppointments(false);

    const pollInterval = setInterval(() => {
      fetchAppointments(true);
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Unique service names for treatment filter pills
  const availableServices = useMemo(() => {
    const set = new Set();
    appointments.forEach(apt => {
      if (apt.serviceName) set.add(apt.serviceName);
    });
    return Array.from(set);
  }, [appointments]);

  // Instant In-Memory Filter
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'PENDING' && (item.status === 'PENDING' || !item.status)) ||
        item.status === activeFilter;

      const matchesService =
        selectedServiceFilter === 'ALL' || item.serviceName === selectedServiceFilter;

      const matchesSearch =
        !searchQuery ||
        item.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientPhone?.includes(searchQuery);

      let matchesDate = true;
      const itemDateStr = new Date(item.appointmentDate).toISOString().split('T')[0];

      if (dateFilter && endDateFilter) {
        matchesDate = itemDateStr >= dateFilter && itemDateStr <= endDateFilter;
      } else if (dateFilter) {
        matchesDate = itemDateStr === dateFilter || String(item.appointmentDate).startsWith(dateFilter);
      }

      return matchesFilter && matchesService && matchesSearch && matchesDate;
    });
  }, [appointments, activeFilter, selectedServiceFilter, searchQuery, dateFilter, endDateFilter]);

  const counts = useMemo(() => {
    const res = { ALL: appointments.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointments.forEach(apt => {
      const st = apt.status || 'PENDING';
      if (res[st] !== undefined) {
        res[st]++;
      }
    });
    return res;
  }, [appointments]);

  const exportCSV = () => {
    if (!isAdvanced) {
      handleProFeatureClick("CSV & Excel Patient Data Export");
      return;
    }

    if (filteredAppointments.length === 0) {
      showToast("No appointment records to export", "error");
      return;
    }

    const headers = ["Patient Name", "Phone", "Age", "Gender", "Service", "Fee (INR)", "Date", "Time Slot", "Status"];
    const rows = filteredAppointments.map(apt => [
      `"${apt.patientName || ''}"`,
      `"${apt.patientPhone || ''}"`,
      apt.patientAge || '',
      `"${apt.patientGender || ''}"`,
      `"${apt.serviceName || 'Consultation'}"`,
      apt.price || 500,
      new Date(apt.appointmentDate).toISOString().split('T')[0],
      `"${apt.timeSlot || ''}"`,
      `"${apt.status || 'PENDING'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DocPulse_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("✅ CSV exported successfully!", "success");
  };

  const printPatientRoster = () => {
    if (!isPremium) {
      handleProFeatureClick("Download Financial Report & Print Roster (Premium)");
      return;
    }
    window.print();
  };

  const toggleTodayCapacity = async () => {
    if (isTogglingToday) return;
    setIsTogglingToday(true);
    try {
      const resGet = await fetch("/api/clinic/availability");
      const dataGet = await resGet.json();
      let schedule = dataGet.availability || [];
      
      const newIsOpen = todaySchedule ? !todaySchedule.isOpen : false;

      const existingIdx = schedule.findIndex(d => Number(d.dayOfWeek) === todayDayOfWeek);
      if (existingIdx !== -1) {
        schedule[existingIdx].isOpen = newIsOpen;
      } else {
        schedule.push({ dayOfWeek: todayDayOfWeek, isOpen: newIsOpen, startTime: "09:00", endTime: "17:00" });
      }

      const resPut = await fetch("/api/clinic/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule })
      });
      const dataPut = await resPut.json();

      if (dataPut.success) {
        setTodaySchedule(prev => ({ ...prev, isOpen: newIsOpen }));
        showToast(
          newIsOpen ? "Today's slots are now OPEN for patient bookings" : "Today's slots marked as FULL / CLOSED",
          "success"
        );
      } else {
        throw new Error(dataPut.error || "Failed to update today's capacity");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsTogglingToday(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    setActionLoadingId(appointmentId);
    try {
      setAppointments(prev => prev.map(apt => apt._id === appointmentId ? { ...apt, status: newStatus } : apt));

      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update status");
      
      const label = newStatus === 'CONFIRMED' ? 'Approved & Confirmed' : newStatus === 'CANCELLED' ? 'Cancelled' : newStatus;
      showToast(`Appointment ${label}`, "success");
    } catch (err) {
      showToast(err.message, "error");
      fetchAppointments(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProFeatureClick = (featureName) => {
    setUpgradeFeature(featureName);
    setShowUpgradeModal(true);
  };

  const getStatusBadge = (status) => {
    const st = status || 'PENDING';
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      CONFIRMED: "bg-teal-50 text-[#00A1AC] border-[#00A1AC]/30",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-rose-50 text-rose-700 border-rose-200"
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${styles[st] || styles.PENDING}`}>
        {st === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
        {st === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-[#00A1AC]" />}
        {st === 'COMPLETED' && <Check className="w-3 h-3 text-emerald-600" />}
        {st === 'CANCELLED' && <X className="w-3 h-3 text-rose-600" />}
        <span>{st}</span>
      </span>
    );
  };

  const isTodayOpen = todaySchedule ? todaySchedule.isOpen !== false : true;

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-[1600px] mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 border ${toast.type === 'success' ? 'bg-[#0c2e3d] text-white border-[#15465c]' : 'bg-rose-900 text-white border-rose-700'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-teal-300" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header with Quick Capacity Switch & Pro Export Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-7 h-7 text-[#00A1AC]" />
              Appointments Queue
            </h1>
            <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
              isPremium
                ? 'bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1'
                : isAdvanced 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-[#00A1AC]/10 text-[#00A1AC] border-[#00A1AC]/20'
            }`}>
              {isPremium ? <><Crown className="w-3 h-3 text-amber-600" /> Premium VIP Full Suite</> : isAdvanced ? "Advanced Plan (Full Suite)" : "Basic Patient List"}
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">Review patient booking requests, approve consultations, and manage daily capacity.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* CSV Export Button */}
          <button 
            type="button"
            onClick={exportCSV}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              isAdvanced 
                ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
            title={isAdvanced ? "Download patient data as CSV spreadsheet" : "Export patient records (Upgrade to Pro)"}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00A1AC]" />
            <span>Export CSV</span>
            {!isAdvanced && <Lock className="w-3 h-3 text-amber-600" />}
          </button>

          {/* Print Roster PDF Button (Premium Feature) */}
          <button 
            type="button"
            onClick={printPatientRoster}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              isPremium 
                ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
            title={isPremium ? "Print daily OPD roster or save as PDF" : "Print OPD Roster (Upgrade to Premium)"}
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            <span>Print / PDF Roster</span>
            {!isPremium && <Lock className="w-3 h-3 text-amber-600" />}
          </button>

          {/* Quick Switch: Mark Today's Slots as Full / Closed */}
          <button
            type="button"
            onClick={toggleTodayCapacity}
            disabled={isTogglingToday}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
              isTodayOpen 
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
            title="Toggle whether patients can book slots for today"
          >
            {isTogglingToday ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isTodayOpen ? (
              <Ban className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isTodayOpen ? "Mark Today's Slots Full" : "Re-open Today's Slots"}</span>
          </button>

          <button 
            onClick={() => fetchAppointments(false)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0f172a] border border-slate-200 font-bold rounded-full px-4 py-2 text-xs cursor-pointer shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00A1AC]" /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="w-full flex flex-col gap-3 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
          {/* Search Input Container */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patient name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 focus:bg-white focus:outline-none text-xs text-[#0f172a] placeholder-slate-400 transition-all font-medium"
            />
          </div>
          
          {/* Date Range Filter */}
          <div className="relative shrink-0 flex items-center gap-2">
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="min-w-[130px] bg-slate-50 border border-slate-200 text-[#0f172a] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all font-medium"
            />
            {isAdvanced ? (
              <>
                <span className="text-xs text-slate-400 font-bold">to</span>
                <input 
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="min-w-[130px] bg-slate-50 border border-slate-200 text-[#0f172a] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all font-medium"
                />
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleProFeatureClick("Date Range Multi-Month Filter")}
                className="text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-2xl flex items-center gap-1 border border-slate-200 transition-all cursor-pointer"
                title="Date range filters unlocked on Advanced tier"
              >
                Range <Lock className="w-3 h-3 text-amber-600" />
              </button>
            )}

            {(dateFilter || endDateFilter) && (
              <button 
                onClick={() => { setDateFilter(""); setEndDateFilter(""); }} 
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Clear date"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-hidden flex-wrap shrink-0">
            {[
              { id: 'ALL', label: 'All Queue' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map(tab => {
              const isSelected = activeFilter === tab.id;
              const count = counts[tab.id] || 0;
              return (
                <button 
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`transition-all duration-200 cursor-pointer flex items-center gap-1.5 rounded-full px-4 py-2 text-xs ${
                    isSelected 
                    ? 'bg-[#00A1AC] text-white font-black shadow-md shadow-[#00A1AC]/25' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black transition-colors ${
                      isSelected 
                        ? 'bg-white text-[#00A1AC]' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Treatment Service Filter Pills */}
        {isAdvanced && availableServices.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider shrink-0">Treatments:</span>
            <button
              onClick={() => setSelectedServiceFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedServiceFilter === "ALL" ? "bg-[#00A1AC] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Services
            </button>
            {availableServices.map(srv => (
              <button
                key={srv}
                onClick={() => setSelectedServiceFilter(srv)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedServiceFilter === srv ? "bg-[#00A1AC] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {srv}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Data Table / List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden min-h-[420px] relative">
        
        {loading && appointments.length === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00A1AC] animate-spin" />
            <p className="mt-2 text-sm font-bold text-slate-700">Loading appointments queue...</p>
          </div>
        )}

        {error ? (
          <div className="p-12 text-center text-rose-700 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-3 text-rose-500" />
            <p className="font-bold">{error}</p>
            <button onClick={() => fetchAppointments(false)} className="mt-4 px-5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold hover:bg-rose-100 flex items-center gap-2 transition-all cursor-pointer">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto transition-opacity duration-300">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3 font-black">Patient Info</th>
                  <th className="pb-3 font-black">Date & Time</th>
                  <th className="pb-3 font-black">Service & Fee</th>
                  <th className="pb-3 font-black">Status</th>
                  <th className="pb-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 px-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                          <CalendarIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0f172a] mb-1">
                          No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} appointments found
                        </h3>
                        <p className="text-slate-500 text-xs max-w-sm">
                          Try selecting a different status filter or clearing your search criteria.
                        </p>
                        {(activeFilter !== "ALL" || dateFilter || endDateFilter || selectedServiceFilter !== "ALL" || searchQuery) && (
                          <button 
                            type="button"
                            onClick={() => { setActiveFilter("ALL"); setDateFilter(""); setEndDateFilter(""); setSelectedServiceFilter("ALL"); setSearchQuery(""); }} 
                            className="mt-4 text-xs text-[#00A1AC] font-bold hover:underline cursor-pointer"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] border border-[#00A1AC]/20 font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {apt.patientName?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#0f172a] group-hover:text-[#00A1AC] transition-colors">{apt.patientName}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{apt.patientPhone}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{apt.patientAge ? `${apt.patientAge} Yrs` : ''} {apt.patientGender ? `• ${apt.patientGender}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs font-black text-[#00A1AC] flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-[#00A1AC]" />
                          {apt.timeSlot}
                        </div>
                      </td>
                      <td className="py-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700">{apt.serviceName || "Consultation"}</div>
                        <div className="text-xs font-black text-slate-900 mt-0.5">₹{apt.price || 500}</div>
                      </td>
                      <td className="py-4 whitespace-nowrap">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-2">
                          
                          {/* PENDING: Show Approve Button and Reject Button */}
                          {(apt.status === 'PENDING' || !apt.status) && (
                            <>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CONFIRMED')}
                                disabled={actionLoadingId === apt._id}
                                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-black text-white bg-[#00A1AC] hover:bg-[#008790] rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Approve / Confirm Appointment"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CANCELLED')}
                                disabled={actionLoadingId === apt._id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-all border border-rose-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Reject / Cancel Appointment"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* CONFIRMED: Mark Completed or Cancel */}
                          {apt.status === 'CONFIRMED' && (
                            <>
                              <button 
                                onClick={() => updateStatus(apt._id, 'COMPLETED')}
                                disabled={actionLoadingId === apt._id}
                                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-all border border-emerald-200 disabled:opacity-50 active:scale-95 shadow-sm cursor-pointer"
                                title="Mark as Completed"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                <span>Complete</span>
                              </button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CANCELLED')}
                                disabled={actionLoadingId === apt._id}
                                className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-all border border-rose-200 disabled:opacity-50 active:scale-95 shadow-sm cursor-pointer"
                                title="Cancel Appointment"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                          
                          {apt.status === 'CANCELLED' && (
                            <span className="text-xs text-slate-400 italic px-3 py-1.5">Cancelled</span>
                          )}
                          
                          {apt.status === 'COMPLETED' && (
                            <span className="text-xs text-emerald-700 font-bold px-3 py-1.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Pro Feature Locked</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              <strong>{upgradeFeature}</strong> is available on Advanced (₹999/mo) and Premium (₹1,499/mo) tiers.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <Link 
                href="/dashboard/subscription"
                className="px-6 py-2.5 rounded-xl bg-[#00A1AC] hover:bg-[#008790] text-white font-black text-xs shadow-lg shadow-[#00A1AC]/25 transition-all flex items-center gap-1.5"
              >
                Upgrade to Pro / Premium <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

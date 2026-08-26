"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Filter, Loader2, AlertCircle, RefreshCw, Sparkles, User,
  Check, X, Ban, ShieldCheck, Power, ArrowRight
} from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // UI & Capacity State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [isTogglingToday, setIsTogglingToday] = useState(false);

  const todayDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday ...

  // Fetch current clinic availability to check today's capacity status
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
        // Detect newly booked appointments in real-time
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
    fetchAvailability();
    fetchAppointments(false);

    const pollInterval = setInterval(() => {
      fetchAppointments(true);
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Instant In-Memory Filter (0ms delay & no page reload)
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'PENDING' && (item.status === 'PENDING' || !item.status)) ||
        item.status === activeFilter;

      const matchesSearch =
        !searchQuery ||
        item.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientPhone?.includes(searchQuery);

      let matchesDate = true;
      if (dateFilter) {
        const itemDate = new Date(item.appointmentDate).toISOString().split('T')[0];
        matchesDate = itemDate === dateFilter || String(item.appointmentDate).startsWith(dateFilter);
      }

      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [appointments, activeFilter, searchQuery, dateFilter]);

  // Count calculations for filter badges
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

  // Toggle Today's Slots as Full / Closed
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
        body: JSON.stringify({ schedule: payload || schedule })
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
      // Optimistic instant update
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

      {/* Header with Quick Capacity Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-[#00A1AC]" />
            Appointments Queue
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">Review patient booking requests, approve consultations, and manage daily capacity.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* Filters Bar (Clean White Card) */}
      <div className="w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        
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
        
        {/* Date Filter Input */}
        <div className="relative shrink-0">
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="min-w-[130px] bg-slate-50 border border-slate-200 text-[#0f172a] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#00A1AC] focus:ring-2 focus:ring-[#00A1AC]/20 transition-all font-medium"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter("")} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              title="Clear date"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs (Instant Client-Side Filtering with #00A1AC) */}
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

      {/* Data Table / List (White Card) */}
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
                        {(activeFilter !== "ALL" || dateFilter || searchQuery) && (
                          <button 
                            type="button"
                            onClick={() => { setActiveFilter("ALL"); setDateFilter(""); setSearchQuery(""); }} 
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
                            <div className="text-[11px] text-slate-400 mt-0.5">{apt.patientAge} Yrs • {apt.patientGender}</div>
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
                        <div className="text-xs font-bold text-slate-700">{apt.serviceName}</div>
                        <div className="text-xs font-black text-slate-900 mt-0.5">₹{apt.price}</div>
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

    </div>
  );
}

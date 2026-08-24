"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Filter, Loader2, AlertCircle, RefreshCw, Sparkles, User,
  Check, X, Ban, ShieldCheck, Power
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
      PENDING: "bg-[#3d3215] text-[#facc15] border-[#6b581e]",
      CONFIRMED: "bg-[#063b36] text-[#2dd4bf] border-[#0d5952]",
      COMPLETED: "bg-[#063b36] text-[#2dd4bf] border-[#0d5952]",
      CANCELLED: "bg-[#3b1219] text-[#f43f5e] border-[#591b26]"
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${styles[st] || styles.PENDING}`}>
        {st === 'PENDING' && <Clock className="w-3 h-3 text-[#facc15]" />}
        {st === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-[#2dd4bf]" />}
        {st === 'COMPLETED' && <Check className="w-3 h-3 text-[#2dd4bf]" />}
        {st === 'CANCELLED' && <X className="w-3 h-3 text-[#f43f5e]" />}
        <span>{st}</span>
      </span>
    );
  };

  const isTodayOpen = todaySchedule ? todaySchedule.isOpen !== false : true;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans bg-[#071720] text-slate-100">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 border ${toast.type === 'success' ? 'bg-[#0a202c] border-[#133748] text-white' : 'bg-[#3b1219] border-[#591b26] text-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#2dd4bf]" /> : <AlertCircle className="w-5 h-5 text-[#f43f5e]" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header with Quick Capacity Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-[#2dd4bf]" />
            Manage Appointments
          </h1>
          <p className="text-[#62879a] mt-1 text-sm font-medium">Review patient booking requests, approve consultations, and manage daily capacity.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Switch: Mark Today's Slots as Full / Closed */}
          <button
            type="button"
            onClick={toggleTodayCapacity}
            disabled={isTogglingToday}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
              isTodayOpen 
                ? 'bg-[#3b1219] hover:bg-[#4d1822] text-[#f43f5e] border-[#591b26]' 
                : 'bg-[#063b36] hover:bg-[#094d46] text-[#2dd4bf] border-[#0d5952]'
            }`}
            title="Toggle whether patients can book slots for today"
          >
            {isTogglingToday ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isTodayOpen ? (
              <Ban className="w-4 h-4 text-[#f43f5e]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2dd4bf]" />
            )}
            <span>{isTodayOpen ? "Mark Today's Slots Full / Closed" : "Re-open Today's Slots"}</span>
          </button>

          <button 
            onClick={() => fetchAppointments(false)}
            className="inline-flex items-center gap-2 bg-[#0d2a38] hover:bg-[#12394c] text-white border border-[#1c485d] font-semibold rounded-xl px-4 py-2 text-xs cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#2dd4bf]" /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 bg-[#0a202c] border border-[#133748] rounded-2xl p-3 shadow-xl">
        
        {/* Search Input Container */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#62879a]" />
          <input 
            type="text" 
            placeholder="Search patient name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#06151f] border border-[#163c4e] rounded-xl focus:border-[#2dd4bf] focus:outline-none text-xs text-white placeholder-[#456b7e] transition-all font-medium"
          />
        </div>
        
        {/* Date Filter Input */}
        <div className="relative shrink-0">
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="min-w-[130px] bg-[#06151f] border border-[#163c4e] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2dd4bf] transition-all"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter("")} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#62879a] hover:text-white"
              title="Clear date"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs (Instant Client-Side Filtering) */}
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
                className={`transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                  ? 'bg-[#0b3342] text-[#2dd4bf] font-bold border border-[#164e63] shadow-md rounded-xl px-3.5 py-1.5 text-xs' 
                  : 'bg-[#06151f] hover:bg-white/5 text-[#62879a] hover:text-white rounded-xl px-3 py-1.5 text-xs font-medium border border-[#163c4e]'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-colors ${
                    isSelected 
                      ? 'bg-[#071720] text-[#2dd4bf]' 
                      : tab.id === 'PENDING' 
                      ? 'bg-[#3d3215] text-[#facc15]' 
                      : 'bg-[#0d2a38] text-[#62879a]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Data Table / List */}
      <div className="bg-[#0a202c] border border-[#133748] rounded-3xl shadow-xl overflow-hidden min-h-[420px] relative">
        
        {loading && appointments.length === 0 && (
          <div className="absolute inset-0 bg-[#071720]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#2dd4bf] animate-spin" />
            <p className="mt-2 text-sm font-bold text-[#2dd4bf]">Loading appointments queue...</p>
          </div>
        )}

        {error ? (
          <div className="p-12 text-center text-rose-300 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-3 text-[#f43f5e]" />
            <p className="font-bold">{error}</p>
            <button onClick={() => fetchAppointments(false)} className="mt-4 px-5 py-2.5 bg-[#3b1219] border border-[#591b26] text-rose-200 rounded-xl text-sm font-bold hover:bg-[#4d1822] flex items-center gap-2 transition-all cursor-pointer">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto transition-opacity duration-300">
            <table className="min-w-full divide-y divide-[#133748] text-left text-sm">
              <thead className="bg-[#06151f]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-[#62879a] uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#62879a] uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#62879a] uppercase tracking-wider">Service & Fee</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#62879a] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#62879a] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#133748]/60">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 px-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#06151f] border border-[#163c4e] rounded-full flex items-center justify-center text-[#2dd4bf] mb-4 shadow-inner">
                          <CalendarIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} appointments found
                        </h3>
                        <p className="text-[#62879a] text-sm max-w-sm">
                          Try selecting a different status filter or clearing your search criteria.
                        </p>
                        {(activeFilter !== "ALL" || dateFilter || searchQuery) && (
                          <button 
                            type="button"
                            onClick={() => { setActiveFilter("ALL"); setDateFilter(""); setSearchQuery(""); }} 
                            className="mt-5 text-sm text-[#2dd4bf] font-bold hover:underline cursor-pointer"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-[#0b3342] border border-[#164e63] flex items-center justify-center text-[#2dd4bf] font-black text-sm shrink-0 shadow-inner">
                            {apt.patientName?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-[#2dd4bf] transition-colors">{apt.patientName}</div>
                            <div className="text-xs text-[#62879a] font-mono mt-0.5">{apt.patientPhone}</div>
                            <div className="text-[11px] text-[#3b6072] mt-0.5">{apt.patientAge} Yrs • {apt.patientGender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-[#2dd4bf]" />
                          {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs font-bold text-[#2dd4bf] flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-[#2dd4bf]" />
                          {apt.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-200">{apt.serviceName}</div>
                        <div className="text-sm font-black text-[#2dd4bf] mt-0.5">₹{apt.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-2">
                          
                          {/* PENDING: Show Green Approve Button and Red Reject Button */}
                          {(apt.status === 'PENDING' || !apt.status) && (
                            <>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CONFIRMED')}
                                disabled={actionLoadingId === apt._id}
                                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-black text-[#051a24] bg-[#00c9a7] hover:bg-[#00b596] rounded-xl transition-all shadow-md shadow-[#00c9a7]/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Approve / Confirm Appointment"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CANCELLED')}
                                disabled={actionLoadingId === apt._id}
                                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#f43f5e] bg-[#3b1219] hover:bg-[#4d1822] rounded-xl transition-all border border-[#591b26] active:scale-95 disabled:opacity-50 cursor-pointer"
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
                                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#2dd4bf] bg-[#063b36] hover:bg-[#094d46] rounded-xl transition-all border border-[#0d5952] disabled:opacity-50 active:scale-95 shadow-sm cursor-pointer"
                                title="Mark as Completed"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                <span>Complete</span>
                              </button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CANCELLED')}
                                disabled={actionLoadingId === apt._id}
                                className="p-2 text-[#f43f5e] bg-[#3b1219] hover:bg-[#4d1822] rounded-xl transition-all border border-[#591b26] disabled:opacity-50 active:scale-95 shadow-sm cursor-pointer"
                                title="Cancel Appointment"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                          
                          {apt.status === 'CANCELLED' && (
                            <span className="text-xs text-[#62879a] italic px-3 py-2">Cancelled</span>
                          )}
                          
                          {apt.status === 'COMPLETED' && (
                            <span className="text-xs text-[#2dd4bf] font-bold px-3 py-2 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Completed
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

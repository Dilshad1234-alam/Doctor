"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Filter, Loader2, AlertCircle, RefreshCw, Sparkles, User
} from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // UI State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/dashboard/appointments?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      if (dateFilter) url += `date=${dateFilter}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch appointments");
      
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search query
    const timeoutId = setTimeout(() => {
      fetchAppointments();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, dateFilter, searchQuery]);

  const updateStatus = async (appointmentId, newStatus) => {
    setActionLoadingId(appointmentId);
    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      
      // Optimistic/Instant update
      setAppointments(prev => prev.map(apt => apt._id === appointmentId ? { ...apt, status: newStatus } : apt));
      
      showToast(`Appointment marked as ${newStatus}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      CONFIRMED: "bg-teal-500/20 text-teal-300 border-teal-400/30",
      COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      CANCELLED: "bg-rose-500/20 text-rose-300 border-rose-500/30"
    };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || styles.PENDING}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 border ${toast.type === 'success' ? 'bg-[#081e2b]/95 border-teal-500/40 text-white' : 'bg-rose-950/90 border-rose-500/40 text-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-teal-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-teal-300" />
            Manage Appointments
          </h1>
          <p className="text-slate-300 mt-1 text-sm font-medium">View, confirm, and complete patient consultations in real-time.</p>
        </div>
        <button 
          onClick={fetchAppointments}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/15 active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4 text-teal-300" /> Refresh Queue
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/15 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300" />
            <input 
              type="text" 
              placeholder="Search patient name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none text-sm text-white placeholder:text-slate-400 transition-all font-medium"
            />
          </div>
          
          {/* Date Filter */}
          <div className="relative">
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white/10 border border-white/15 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none text-sm text-white font-medium transition-all"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 ${
                statusFilter === status 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-[#081e2b] shadow-lg shadow-teal-500/20 scale-105' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {status === 'CONFIRMED' ? 'Confirmed / Pending' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

      </div>

      {/* Data Table / List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden min-h-[420px] relative">
        
        {loading && appointments.length === 0 && (
          <div className="absolute inset-0 bg-[#081e2b]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="mt-2 text-sm font-bold text-teal-200">Loading appointments queue...</p>
          </div>
        )}

        {error ? (
          <div className="p-12 text-center text-rose-300 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-3 text-rose-400" />
            <p className="font-bold">{error}</p>
            <button onClick={fetchAppointments} className="mt-4 px-5 py-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-xl text-sm font-bold hover:bg-rose-500/30 flex items-center gap-2 transition-all">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : appointments.length === 0 && !loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-teal-300 mb-4 shadow-inner">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">No appointments found</h3>
            <p className="text-slate-300 text-sm max-w-sm">Try adjusting your search query, status, or date filters to view records.</p>
            {(statusFilter !== "ALL" || dateFilter || searchQuery) && (
              <button 
                onClick={() => { setStatusFilter("ALL"); setDateFilter(""); setSearchQuery(""); }} 
                className="mt-6 text-sm text-teal-300 font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-[#081e2b]/60">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-teal-300/90 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-teal-300/90 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-teal-300/90 uppercase tracking-wider">Service & Fee</th>
                  <th className="px-6 py-4 text-xs font-bold text-teal-300/90 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-teal-300/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-black text-sm shrink-0 shadow-inner">
                          {apt.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors">{apt.patientName}</div>
                          <div className="text-xs text-slate-300 font-mono mt-0.5">{apt.patientPhone}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{apt.patientAge} Yrs • {apt.patientGender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-teal-300" />
                        {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {apt.timeSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-200">{apt.serviceName}</div>
                      <div className="text-sm font-black text-teal-300 mt-0.5">₹{apt.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                          <>
                            <button 
                              onClick={() => updateStatus(apt._id, 'COMPLETED')}
                              disabled={actionLoadingId === apt._id}
                              className="p-2.5 text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all border border-emerald-500/30 disabled:opacity-50 active:scale-95 shadow-sm"
                              title="Mark as Completed"
                            >
                              {actionLoadingId === apt._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => updateStatus(apt._id, 'CANCELLED')}
                              disabled={actionLoadingId === apt._id}
                              className="p-2.5 text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition-all border border-rose-500/30 disabled:opacity-50 active:scale-95 shadow-sm"
                              title="Cancel Appointment"
                            >
                              {actionLoadingId === apt._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        
                        {apt.status === 'CANCELLED' && (
                          <span className="text-xs text-slate-400 italic px-3 py-2">Cancelled</span>
                        )}
                        
                        {apt.status === 'COMPLETED' && (
                          <span className="text-xs text-emerald-400 font-bold px-3 py-2 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

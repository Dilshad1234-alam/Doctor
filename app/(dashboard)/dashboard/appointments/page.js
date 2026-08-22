"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Filter, Loader2, AlertCircle, RefreshCw
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
      PENDING: "bg-amber-100 text-amber-800 border-amber-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200"
    };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.PENDING}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Manage Appointments</h1>
          <p className="text-slate-600 mt-1">View, confirm, and complete patient consultations.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search patient name or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            
            {/* Date Filter */}
            <div className="relative">
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {status === 'CONFIRMED' ? 'Confirmed/Pending' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

        </div>

        {/* Data Table / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative">
          
          {loading && appointments.length === 0 && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="mt-2 text-sm font-medium text-slate-500">Loading appointments...</p>
            </div>
          )}

          {error ? (
            <div className="p-8 text-center text-red-600 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
              <button onClick={fetchAppointments} className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : appointments.length === 0 && !loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No appointments found</h3>
              <p className="text-slate-500 max-w-sm">Try adjusting your filters or date selection to see more results.</p>
              {(statusFilter !== "ALL" || dateFilter || searchQuery) && (
                <button onClick={() => { setStatusFilter("ALL"); setDateFilter(""); setSearchQuery(""); }} className="mt-6 text-sm text-blue-600 font-medium hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Service & Fee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                            {apt.patientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{apt.patientName}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{apt.patientPhone}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{apt.patientAge} Yrs • {apt.patientGender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-sm font-bold text-blue-600 flex items-center gap-1.5 mt-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          {apt.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-800">{apt.serviceName}</div>
                        <div className="text-sm font-semibold text-green-600 mt-0.5">₹{apt.price}</div>
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
                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200 disabled:opacity-50"
                                title="Mark as Completed"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'CANCELLED')}
                                disabled={actionLoadingId === apt._id}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                                title="Cancel Appointment"
                              >
                                {actionLoadingId === apt._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                              </button>
                            </>
                          )}
                          
                          {apt.status === 'CANCELLED' && (
                            <span className="text-xs text-slate-400 italic px-2 py-2">No actions</span>
                          )}
                          
                          {apt.status === 'COMPLETED' && (
                            <span className="text-xs text-green-600 italic font-medium px-2 py-2 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Done
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
    </div>
  );
}

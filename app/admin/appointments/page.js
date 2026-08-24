"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  Phone,
  Building2,
  Stethoscope,
  DollarSign,
  Check,
  X,
  Sparkles
} from "lucide-react";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedStatus !== "ALL") query.set("status", selectedStatus);

      const res = await fetch(`/api/admin/appointments?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAppointments(json.appointments || []);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: `Appointment marked as ${newStatus}` });
        fetchAppointments();
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update status" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Action failed" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans text-[#0f172a]">
      {/* 1. Hero Header Banner */}
      <div className="w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
            Live Feed
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Global Appointments Monitor
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl">
            Real-time cross-clinic appointment telemetry, status resolution, patient coordinates, and consultation queue oversight.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm self-start md:self-auto relative z-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs"
              : "bg-rose-50 text-rose-800 border-rose-200 font-bold text-xs"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, phone, service, or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-[#f8fafc] border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">Status:</span>
          {[
            { id: "ALL", label: "All Bookings" },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "COMPLETED", label: "Completed" },
            { id: "CANCELLED", label: "Cancelled" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`rounded-full px-5 py-2 text-xs transition-all whitespace-nowrap ${
                selectedStatus === tab.id
                  ? "bg-[#0f172a] text-white font-black shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Central Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8fafc] text-slate-600 font-black uppercase tracking-wider text-[11px]">
                <th className="py-5 px-6">Patient Details</th>
                <th className="py-5 px-6">Assigned Doctor & Clinic</th>
                <th className="py-5 px-6">Service & Fee</th>
                <th className="py-5 px-6">Slot Schedule</th>
                <th className="py-5 px-6">Booking Status</th>
                <th className="py-5 px-6 text-right">Quick Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#164e63] mb-2" />
                    <span className="font-bold text-slate-700">Loading appointments...</span>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <CalendarDays className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="font-black text-[#0f172a] text-sm">No appointments found</p>
                    <p className="text-xs text-slate-500 mt-1">Try switching status filters or search term.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Patient */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-black text-sm text-[#0f172a] group-hover:text-[#164e63] transition-colors">
                          {apt.patientName}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                          <span>{apt.patientPhone}</span>
                          {apt.patientAge && <span>• {apt.patientAge} yrs ({apt.patientGender || "N/A"})</span>}
                        </div>
                      </div>
                    </td>

                    {/* Clinic & Doctor */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-black text-[#0f172a]">{apt.clinic.name}</p>
                        <p className="text-[11px] text-[#164e63] font-bold">{apt.doctor.name}</p>
                      </div>
                    </td>

                    {/* Service & Fee */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700">{apt.serviceName}</p>
                        <span className="text-xs font-black text-[#0f172a]">
                          ₹{apt.price}
                        </span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-black text-[#0f172a]">
                          {new Date(apt.appointmentDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#164e63]" /> {apt.timeSlot}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase border ${
                          apt.status === "CONFIRMED"
                            ? "bg-emerald-50 text-[#059669] border-emerald-200"
                            : apt.status === "COMPLETED"
                            ? "bg-cyan-50 text-[#164e63] border-cyan-200"
                            : apt.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== "CONFIRMED" && (
                          <button
                            onClick={() => handleStatusChange(apt._id, "CONFIRMED")}
                            disabled={updatingId === apt._id}
                            className="p-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#059669] transition-colors"
                            title="Confirm Booking"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {apt.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleStatusChange(apt._id, "COMPLETED")}
                            disabled={updatingId === apt._id}
                            className="p-2.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-[#164e63] transition-colors"
                            title="Mark Completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {apt.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleStatusChange(apt._id, "CANCELLED")}
                            disabled={updatingId === apt._id}
                            className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

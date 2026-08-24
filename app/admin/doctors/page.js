"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  Building,
  Phone,
  Mail,
  Award,
  Calendar,
  AlertTriangle,
  X,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedPlan !== "ALL") query.set("plan", selectedPlan);

      const res = await fetch(`/api/admin/doctors?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDoctors(json.doctors || []);
      }
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedPlan]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleTogglePublish = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const res = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "toggle_publish",
          isPublished: !currentStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Website publication status updated." });
        fetchDoctors();
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Action failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const newStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";
      const res = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "toggle_status",
          status: newStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: `Doctor status updated to ${newStatus}` });
        fetchDoctors();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Action failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDoctor = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await fetch(`/api/admin/doctors?userId=${userId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Doctor and clinic removed from platform." });
        setDeleteConfirmDoc(null);
        fetchDoctors();
      } else {
        setMessage({ type: "error", text: json.message || "Delete failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Delete request failed" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500 font-sans text-[#0f172a]">
      {/* 1. Hero Header Banner */}
      <div className="w-full bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider">
            Directory & Tenancy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Doctors & Clinic Management
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl">
            Inspect clinic configurations, review multi-tenant domains, verify medical credentials, and manage SaaS subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
          <button
            onClick={fetchDoctors}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Directory</span>
          </button>
          <Link
            href="/register"
            target="_blank"
            className="bg-white hover:bg-slate-100 text-[#0f172a] px-6 py-3 rounded-full font-black text-xs transition-all shadow-xl hover:scale-105 flex items-center gap-1.5"
          >
            <span>+ Add Doctor</span>
          </Link>
        </div>
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
            placeholder="Search by doctor, clinic name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-[#f8fafc] border border-slate-200 text-[#0f172a] placeholder-slate-400 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all"
          />
        </form>

        {/* Plan Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">Plan:</span>
          {["ALL", "STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-full px-5 py-2 text-xs transition-all whitespace-nowrap ${
                selectedPlan === plan
                  ? "bg-[#0f172a] text-white font-black shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              }`}
            >
              {plan === "ALL" ? "All Plans" : plan}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Doctors Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8fafc] text-slate-600 font-black uppercase tracking-wider text-[11px]">
                <th className="py-5 px-6">Doctor Profile</th>
                <th className="py-5 px-6">Clinic & Live Domain</th>
                <th className="py-5 px-6">SaaS Plan</th>
                <th className="py-5 px-6">Website Status</th>
                <th className="py-5 px-6">Bookings</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#164e63] mb-2" />
                    <span className="font-bold text-slate-700">Loading doctor directory...</span>
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="font-black text-[#0f172a] text-sm">No clinics found</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting search filters or onboard a new doctor.</p>
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Doctor Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                          {doc.name.replace("Dr. ", "").charAt(0) || "D"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#0f172a] group-hover:text-[#164e63] transition-colors">
                              {doc.name}
                            </span>
                            {doc.subscription.status === "BLOCKED" && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                Blocked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {doc.specialization} • {doc.qualification}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {doc.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {doc.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Clinic & Slug */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="font-black text-[#0f172a]">{doc.clinic.name}</p>
                        <Link
                          href={`/${doc.clinic.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#164e63] hover:text-[#0e3b4d] bg-cyan-50 hover:bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200 transition-all"
                        >
                          <span>/{doc.clinic.slug}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Plan Badge */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span
                          className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                            doc.subscription.planId === "ENTERPRISE"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : doc.subscription.planId === "PROFESSIONAL"
                              ? "bg-cyan-100 text-cyan-900 border-cyan-300"
                              : "bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          {doc.subscription.planId}
                        </span>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {doc.subscription.billingCycle} • ₹{doc.subscription.price}
                        </p>
                      </div>
                    </td>

                    {/* Website Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleTogglePublish(doc._id, doc.websiteConfig.isPublished)}
                        disabled={actionLoading === doc._id}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          doc.websiteConfig.isPublished
                            ? "bg-emerald-50 text-[#059669] border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {doc.websiteConfig.isPublished ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                            <span>Live / Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Bookings */}
                    <td className="py-4 px-6 font-black text-[#0f172a]">
                      <span className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                        {doc.appointmentCount} bookings
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          className="p-2.5 rounded-full bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 transition-colors"
                          title="View Clinic Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(doc._id, doc.subscription.status)}
                          disabled={actionLoading === doc._id}
                          className={`p-2.5 rounded-full transition-colors ${
                            doc.subscription.status === "BLOCKED"
                              ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                              : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                          }`}
                          title={doc.subscription.status === "BLOCKED" ? "Unblock Doctor" : "Block Doctor"}
                        >
                          {doc.subscription.status === "BLOCKED" ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setDeleteConfirmDoc(doc)}
                          className="p-2.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Inspection */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-[#0a2635]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-xl shadow-md">
                  {selectedDoctor.name.replace("Dr. ", "").charAt(0) || "D"}
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#0f172a]">{selectedDoctor.name}</h3>
                  <p className="text-xs text-slate-500 font-bold">{selectedDoctor.specialization} • {selectedDoctor.qualification}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Clinic Name</span>
                <p className="font-black text-[#0f172a] text-sm">{selectedDoctor.clinic.name}</p>
                <p className="text-slate-500">{selectedDoctor.clinic.city || "Urban Center"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Public URL</span>
                <p className="font-black text-[#164e63] text-sm">/{selectedDoctor.clinic.slug}</p>
                <Link
                  href={`/${selectedDoctor.clinic.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[#164e63] hover:underline text-[11px] font-bold"
                >
                  <span>Open Website</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">SaaS Subscription</span>
                <p className="font-black text-[#0f172a] text-sm">{selectedDoctor.subscription.planId}</p>
                <p className="text-slate-500">Status: {selectedDoctor.subscription.status}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Contact Coordinates</span>
                <p className="font-bold text-[#0f172a]">{selectedDoctor.email}</p>
                <p className="text-slate-500">{selectedDoctor.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/${selectedDoctor.clinic.slug}`}
                target="_blank"
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-full px-6 py-3 text-xs transition-colors flex items-center gap-2 shadow-md"
              >
                <span>Preview Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 bg-[#0a2635]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-black text-lg text-[#0f172a]">Delete Doctor Account?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <span className="font-black text-[#0f172a]">{deleteConfirmDoc.name}</span> and clinic <span className="font-black text-[#0f172a]">"{deleteConfirmDoc.clinic.name}"</span>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDoctor(deleteConfirmDoc._id)}
                disabled={actionLoading === deleteConfirmDoc._id}
                className="py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {actionLoading === deleteConfirmDoc._id && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

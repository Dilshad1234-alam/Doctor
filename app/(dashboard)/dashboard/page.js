"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, CheckCircle2, CreditCard, RefreshCw, 
  ExternalLink, Copy, Check, AlertCircle, Clock3, PlusCircle, 
  Settings, X, Loader2, Save, Trash2
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Modals State
  const [activeModal, setActiveModal] = useState(null);
  const [opdSchedule, setOpdSchedule] = useState([]);
  const [opdLoading, setOpdLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', durationMins: '15' });

  // Settings State
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    clinicName: '', phone: '', address: '', city: '',
    doctorName: '', qualification: '', specialization: '', experienceYrs: ''
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.hasCompletedOnboarding === false) {
          router.push("/dashboard/onboarding");
          return;
        }
      } else {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await fetch("/api/dashboard/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyClinicLink = () => {
    if (!data?.clinic?.slug) return;
    const url = `${window.location.origin}/${data.clinic.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- MODAL HANDLERS ---
  const openOpdModal = async () => {
    setActiveModal('opd');
    setOpdLoading(true);
    try {
      const res = await fetch("/api/clinic/availability");
      const json = await res.json();
      if(json.success) setOpdSchedule(json.availability);
    } catch(err) { console.error(err); }
    setOpdLoading(false);
  }
  
  const saveOpdSchedule = async () => {
    setOpdLoading(true);
    try {
      await fetch("/api/clinic/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: opdSchedule })
      });
      setActiveModal(null);
      alert("OPD Timings updated successfully!");
    } catch(err) { console.error(err); }
    setOpdLoading(false);
  }

  const handleOpdChange = (index, field, value) => {
    const updated = [...opdSchedule];
    updated[index][field] = value;
    setOpdSchedule(updated);
  }

  const openServiceModal = async () => {
    setActiveModal('service');
    setServicesLoading(true);
    try {
      const res = await fetch("/api/clinic/services");
      const json = await res.json();
      if(json.success) setServices(json.services);
    } catch(err) { console.error(err); }
    setServicesLoading(false);
  }

  const addService = async (e) => {
    e.preventDefault();
    setServicesLoading(true);
    try {
      const res = await fetch("/api/clinic/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService)
      });
      const json = await res.json();
      if(json.success) {
        setServices([...services, json.service]);
        setNewService({ name: '', price: '', durationMins: '15' });
      }
    } catch(err) { console.error(err); }
    setServicesLoading(false);
  }

  const deleteService = async (id) => {
    if(!confirm("Delete this service?")) return;
    try {
      await fetch(`/api/clinic/services?serviceId=${id}`, { method: "DELETE" });
      setServices(services.filter(s => s._id !== id));
    } catch(err) { console.error(err); }
  }

  const openSettingsModal = async () => {
    setActiveModal('settings');
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/clinic/settings");
      const json = await res.json();
      if(json.success) {
        setSettingsData({
          clinicName: json.clinic?.name || '',
          phone: json.clinic?.phone || '',
          address: json.clinic?.address || '',
          city: json.clinic?.city || '',
          doctorName: json.doctorProfile?.fullName || '',
          qualification: json.doctorProfile?.qualification || '',
          specialization: json.doctorProfile?.specialization || '',
          experienceYrs: json.doctorProfile?.experienceYrs || ''
        });
      }
    } catch(err) { console.error(err); }
    setSettingsLoading(false);
  }

  const saveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/clinic/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData)
      });
      const json = await res.json();
      if (json.success) {
        setActiveModal(null);
        alert("Settings saved successfully!");
        fetchDashboardData();
      } else {
        alert(json.error || "Failed to save settings");
      }
    } catch(err) { console.error(err); }
    setIsSavingSettings(false);
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const { stats, clinic, doctor, recentAppointments } = data || {
    stats: { todayAppointmentsCount: 0, pendingCount: 0, completedCount: 0, totalRevenue: 0 },
    clinic: { name: "My Clinic", slug: "" },
    doctor: { name: "Doctor" },
    recentAppointments: [],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      
      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h3 className="text-lg font-bold text-slate-900">
                {activeModal === 'opd' && "Manage OPD Timings"}
                {activeModal === 'service' && "Manage Services"}
                {activeModal === 'settings' && "Clinic Settings"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              
              {/* OPD MODAL */}
              {activeModal === 'opd' && (
                <div className="space-y-4">
                  {opdLoading && opdSchedule.length === 0 ? (
                    <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                  ) : (
                    opdSchedule.map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50">
                        <div className="w-24 font-medium text-slate-700 text-sm">{days[day.dayOfWeek]}</div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" checked={day.isClosed} onChange={(e) => handleOpdChange(idx, 'isClosed', e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                            Closed
                          </label>
                          {!day.isClosed && (
                            <div className="flex items-center gap-2">
                              <input type="time" value={day.startTime} onChange={(e) => handleOpdChange(idx, 'startTime', e.target.value)} className="rounded-lg border border-slate-300 p-1.5 text-sm" />
                              <span className="text-slate-400">-</span>
                              <input type="time" value={day.endTime} onChange={(e) => handleOpdChange(idx, 'endTime', e.target.value)} className="rounded-lg border border-slate-300 p-1.5 text-sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <button onClick={saveOpdSchedule} disabled={opdLoading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 mt-4">
                    {opdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
                  </button>
                </div>
              )}

              {/* SERVICE MODAL */}
              {activeModal === 'service' && (
                <div className="space-y-6">
                  <form onSubmit={addService} className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Add New Service</h4>
                    <input required type="text" placeholder="Service Name (e.g. Root Canal)" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <div className="flex gap-3">
                      <input required type="number" placeholder="Fee (₹)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="flex-1 rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input required type="number" placeholder="Mins" value={newService.durationMins} onChange={e => setNewService({...newService, durationMins: e.target.value})} className="w-24 rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={servicesLoading} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Add Service</button>
                  </form>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Existing Services</h4>
                    {servicesLoading && services.length === 0 ? (
                      <div className="py-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
                    ) : (
                      services.map(s => (
                        <div key={s._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-white">
                          <div>
                            <div className="font-semibold text-sm text-slate-800">{s.name}</div>
                            <div className="text-xs text-slate-500">₹{s.price} • {s.durationMins} Mins</div>
                          </div>
                          <button onClick={() => deleteService(s._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SETTINGS MODAL */}
              {activeModal === 'settings' && (
                <div className="space-y-4">
                  {settingsLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                  ) : (
                    <form onSubmit={saveSettings} className="space-y-6">
                      
                      {/* Clinic Info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Clinic Information</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Clinic Name</label>
                            <input required type="text" value={settingsData.clinicName} onChange={e => setSettingsData({...settingsData, clinicName: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Contact Phone</label>
                            <input required type="text" value={settingsData.phone} onChange={e => setSettingsData({...settingsData, phone: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-slate-500">Full Address</label>
                            <input required type="text" value={settingsData.address} onChange={e => setSettingsData({...settingsData, address: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-slate-500">City</label>
                            <input required type="text" value={settingsData.city} onChange={e => setSettingsData({...settingsData, city: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Doctor Profile</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Doctor Name</label>
                            <input required type="text" value={settingsData.doctorName} onChange={e => setSettingsData({...settingsData, doctorName: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Qualification</label>
                            <input required type="text" value={settingsData.qualification} onChange={e => setSettingsData({...settingsData, qualification: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Specialization</label>
                            <input required type="text" value={settingsData.specialization} onChange={e => setSettingsData({...settingsData, specialization: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Experience (Years)</label>
                            <input required type="number" value={settingsData.experienceYrs} onChange={e => setSettingsData({...settingsData, experienceYrs: e.target.value})} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                      </div>

                      <button type="submit" disabled={isSavingSettings} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 mt-4">
                        {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Welcome, {doctor.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{clinic.name} Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={copyClinicLink}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <Link
              href={`/${clinic.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> View Live Website
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Today&apos;s Active</span>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-900">{stats.todayAppointmentsCount}</p>
            <p className="mt-1 text-xs text-slate-500">Appointments scheduled today</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Pending</span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-900">{stats.pendingCount}</p>
            <p className="mt-1 text-xs text-slate-500">Patients waiting to be seen</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Completed</span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-900">{stats.completedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Successfully consulted today</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Today&apos;s Revenue</span>
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-900">₹{stats.totalRevenue}</p>
            <p className="mt-1 text-xs text-slate-500">Total earnings today</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Appointments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <th className="pb-3 font-semibold">Patient Info</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Time Slot</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No appointments booked yet.
                      </td>
                    </tr>
                  ) : (
                    recentAppointments.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5">
                          <p className="font-semibold text-slate-900">{item.patientName}</p>
                          <p className="text-xs text-slate-500">{item.patientPhone}</p>
                        </td>
                        <td className="py-3.5 text-slate-600">{item.serviceName}</td>
                        <td className="py-3.5 font-medium text-slate-900">{item.timeSlot}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "CANCELLED"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {item.status === "COMPLETED" ? (
                            <span className="text-xs text-slate-400 italic">Done</span>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(item._id, "COMPLETED")}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              Mark Done
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={openOpdModal} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-blue-600" /> Manage OPD Hours
                  </div>
                </button>
                <button onClick={openServiceModal} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <PlusCircle className="h-5 w-5 text-blue-600" /> Add Service
                  </div>
                </button>
                <button onClick={openSettingsModal} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-slate-500" /> Clinic Settings
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-sm">
              <h3 className="font-bold text-base">Need Help?</h3>
              <p className="mt-1 text-xs text-slate-300">
                Our support team is available 24/7 to assist you with any setup or operational queries.
              </p>
              <button className="mt-4 w-full rounded-xl bg-white py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors">
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Loader2, Stethoscope, AlertCircle } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", durationMins: "15" });

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/clinic/services");
      const json = await res.json();
      if (json.success) setServices(json.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("/api/clinic/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService)
      });
      const json = await res.json();
      if (json.success) {
        setServices([...services, json.service]);
        setNewService({ name: "", price: "", durationMins: "15" });
      } else {
        alert(json.error || "Failed to add service");
      }
    } catch (err) {
      console.error(err);
    }
    setIsAdding(false);
  };

  const deleteService = async (id) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      const res = await fetch(`/api/clinic/services?serviceId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices(services.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          Manage Services
        </h1>
        <p className="mt-2 text-slate-500">Add, edit, or remove consultation services offered at your clinic. These will be visible on your website for online booking.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Add New Service</h2>
        <form onSubmit={addService} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Service Name</label>
            <input required type="text" placeholder="e.g. Initial Consultation" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-slate-500 mb-1">Fee (₹)</label>
            <input required type="number" placeholder="500" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-slate-500 mb-1">Duration (Mins)</label>
            <input required type="number" placeholder="15" value={newService.durationMins} onChange={e => setNewService({...newService, durationMins: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isAdding} className="w-full md:w-auto h-[50px] px-6 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2">
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />} Add
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Existing Services</h2>
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
            <AlertCircle className="w-8 h-8 mb-2 text-slate-400" />
            <p>No services found. Add a service above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map(s => (
              <div key={s._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{s.name}</h3>
                  <div className="flex gap-3 mt-1 text-sm font-medium text-slate-500">
                    <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-700">₹{s.price}</span>
                    <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-700">{s.durationMins} Minutes</span>
                  </div>
                </div>
                <button onClick={() => deleteService(s._id)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors shadow-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

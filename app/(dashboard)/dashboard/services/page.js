"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Loader2, Stethoscope, AlertCircle, Sparkles, Clock } from "lucide-react";

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
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
          <Stethoscope className="w-8 h-8 text-teal-300" />
          Manage Services
        </h1>
        <p className="mt-1 text-sm text-slate-300 font-medium">Add, configure, or remove consultation offerings. Changes reflect live on your public booking page.</p>
      </div>

      {/* Add New Service Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-300" /> Add New Offering
        </h2>
        <form onSubmit={addService} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-2">Service Title</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Comprehensive Consultation" 
              value={newService.name} 
              onChange={e => setNewService({...newService, name: e.target.value})} 
              className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-medium outline-none transition-all" 
            />
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-2">Fee (₹)</label>
            <input 
              required 
              type="number" 
              placeholder="500" 
              value={newService.price} 
              onChange={e => setNewService({...newService, price: e.target.value})} 
              className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-medium outline-none transition-all" 
            />
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-2">Duration (Mins)</label>
            <input 
              required 
              type="number" 
              placeholder="15" 
              value={newService.durationMins} 
              onChange={e => setNewService({...newService, durationMins: e.target.value})} 
              className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-medium outline-none transition-all" 
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={isAdding} 
              className="w-full md:w-auto h-[50px] px-7 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 font-bold text-[#081e2b] shadow-lg shadow-teal-500/20 disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />} Add Service
            </button>
          </div>
        </form>
      </div>

      {/* Existing Services List */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Active Consultation Services</h2>
          <span className="text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 px-3 py-1 rounded-full">
            {services.length} Total Services
          </span>
        </div>
        
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-2xl border border-white/10 text-slate-300">
            <AlertCircle className="w-10 h-10 mb-3 text-teal-300" />
            <p className="font-bold text-base text-white">No consultation services created yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the form above to add your first clinic service.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(s => (
              <div 
                key={s._id} 
                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-teal-400/40 hover:bg-white/[0.08] transition-all group"
              >
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-teal-200 transition-colors">{s.name}</h3>
                  <div className="flex gap-2.5 mt-2 text-xs font-bold">
                    <span className="bg-teal-500/20 border border-teal-400/30 text-teal-300 px-3 py-1 rounded-lg">₹{s.price}</span>
                    <span className="bg-white/10 border border-white/15 text-slate-300 px-3 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.durationMins} Mins
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteService(s._id)} 
                  className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-200 transition-all shadow-sm active:scale-95"
                  title="Remove Service"
                >
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

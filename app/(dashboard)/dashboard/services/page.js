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
      <div className="flex h-[80vh] items-center justify-center bg-[#071720]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2dd4bf]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto font-sans bg-[#071720] text-slate-100">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
          <Stethoscope className="w-8 h-8 text-[#2dd4bf]" />
          Manage Services
        </h1>
        <p className="mt-1 text-sm text-[#62879a] font-medium">Add, configure, or remove consultation offerings. Changes reflect live on your public booking page.</p>
      </div>

      {/* Add New Service Card */}
      <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2 tracking-tight">
          <Sparkles className="w-5 h-5 text-[#2dd4bf]" /> Add New Offering
        </h2>
        <form onSubmit={addService} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#62879a] uppercase tracking-wider mb-2">Service Title</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Comprehensive Consultation" 
              value={newService.name} 
              onChange={e => setNewService({...newService, name: e.target.value})} 
              className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2dd4bf] font-medium transition-all" 
            />
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-[#62879a] uppercase tracking-wider mb-2">Fee (₹)</label>
            <input 
              required 
              type="number" 
              placeholder="500" 
              value={newService.price} 
              onChange={e => setNewService({...newService, price: e.target.value})} 
              className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2dd4bf] font-medium transition-all" 
            />
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-[#62879a] uppercase tracking-wider mb-2">Duration (Mins)</label>
            <input 
              required 
              type="number" 
              placeholder="15" 
              value={newService.durationMins} 
              onChange={e => setNewService({...newService, durationMins: e.target.value})} 
              className="w-full bg-[#06151f] border border-[#163c4e] text-white placeholder-[#456b7e] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2dd4bf] font-medium transition-all" 
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={isAdding} 
              className="w-full md:w-auto h-[44px] bg-[#00c9a7] hover:bg-[#00b596] text-[#051a24] font-black rounded-xl px-5 py-2.5 text-xs shadow-lg shadow-[#00c9a7]/20 disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />} Add Service
            </button>
          </div>
        </form>
      </div>

      {/* Existing Services List */}
      <div className="bg-[#0a202c] border border-[#133748] rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Active Consultation Services</h2>
          <span className="text-xs font-bold text-[#2dd4bf] bg-[#0d3443] border border-[#164e63] px-3 py-1 rounded-full">
            {services.length} Total Services
          </span>
        </div>
        
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#06151f] rounded-2xl border border-[#163c4e] text-[#62879a]">
            <AlertCircle className="w-10 h-10 mb-3 text-[#2dd4bf]" />
            <p className="font-bold text-base text-white">No consultation services created yet.</p>
            <p className="text-xs text-[#62879a] mt-1">Use the form above to add your first clinic service.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(s => (
              <div 
                key={s._id} 
                className="flex items-center justify-between p-5 bg-[#06151f] rounded-2xl border border-[#163c4e] hover:border-[#2dd4bf]/40 hover:bg-[#0b3342]/20 transition-all group"
              >
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#2dd4bf] transition-colors">{s.name}</h3>
                  <div className="flex gap-2.5 mt-2 text-xs font-bold">
                    <span className="bg-[#0d3443] border border-[#164e63] text-[#2dd4bf] px-3 py-1 rounded-lg">₹{s.price}</span>
                    <span className="bg-[#081e2b] border border-[#133748] text-[#62879a] px-3 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#62879a]" /> {s.durationMins} Mins
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteService(s._id)} 
                  className="w-9 h-9 bg-[#3b1219] border border-[#591b26] rounded-xl flex items-center justify-center text-[#f43f5e] hover:bg-[#4d1822] transition-all shadow-sm active:scale-95 cursor-pointer"
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

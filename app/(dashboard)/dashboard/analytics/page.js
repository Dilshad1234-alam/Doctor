"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, TrendingUp, Calendar, Download, Crown, Sparkles, 
  ArrowUpRight, ArrowDownRight, DollarSign, Users, Activity, 
  CheckCircle2, Clock, FileSpreadsheet, FileText, Loader2, ShieldCheck, Lock
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [timeRange, setTimeRange] = useState("30"); // 7, 30, 90 days
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptsRes, subRes] = await Promise.all([
          fetch("/api/dashboard/appointments?status=ALL", { cache: "no-store" }),
          fetch("/api/subscription/upgrade", { cache: "no-store" })
        ]);
        const [aptsJson, subJson] = await Promise.all([
          aptsRes.json(),
          subRes.json()
        ]);
        if (aptsJson.success) setAppointments(aptsJson.appointments || []);
        if (subJson.success) setSubscription(subJson.subscription);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const isPremium = planId === "PREMIUM" || planId === "ENTERPRISE";

  // Aggregate Metrics based on timeRange
  const analyticsData = useMemo(() => {
    const days = parseInt(timeRange, 10) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = appointments.filter(a => new Date(a.appointmentDate) >= cutoffDate);
    
    let totalRevenue = 0;
    let completedCount = 0;
    const serviceCounts = {};
    const dailyMap = {};

    // Initialize daily buckets
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = { date: dateKey, count: 0, revenue: 0 };
    }

    filtered.forEach(a => {
      const fee = a.price || 500;
      if (a.status === "COMPLETED" || a.status === "CONFIRMED") {
        totalRevenue += fee;
      }
      if (a.status === "COMPLETED") completedCount++;

      const sName = a.serviceName || "General Consultation";
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;

      const aDate = new Date(a.appointmentDate).toISOString().split('T')[0];
      if (dailyMap[aDate]) {
        dailyMap[aDate].count += 1;
        dailyMap[aDate].revenue += fee;
      }
    });

    const dailyBars = Object.values(dailyMap);
    const maxBarValue = Math.max(...dailyBars.map(b => b.revenue), 1000);

    const sortedServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / (filtered.length || 1)) * 100) }))
      .sort((a, b) => b.count - a.count);

    return {
      totalBookings: filtered.length,
      totalRevenue,
      completedCount,
      completionRate: filtered.length > 0 ? Math.round((completedCount / filtered.length) * 100) : 100,
      dailyBars,
      maxBarValue,
      sortedServices
    };
  }, [appointments, timeRange]);

  const exportFinancialCSV = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    const headers = ["Date", "Patient Name", "Phone", "Service", "Fee (INR)", "Status"];
    const rows = appointments.map(apt => [
      new Date(apt.appointmentDate).toISOString().split('T')[0],
      `"${apt.patientName || ''}"`,
      `"${apt.patientPhone || ''}"`,
      `"${apt.serviceName || 'Consultation'}"`,
      apt.price || 500,
      `"${apt.status || 'PENDING'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Telemetry_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1600px] mx-auto font-sans bg-slate-50 text-[#0f172a] min-h-screen">
      
      {/* Top Header with Interval Switch & PDF/CSV Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-[#00A1AC]" />
              Clinic Telemetry & Advanced Analytics
            </h1>
            <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
              isPremium 
                ? 'bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1' 
                : 'bg-slate-200 text-slate-700'
            }`}>
              {isPremium ? <><Crown className="w-3 h-3 text-amber-600" /> Premium Telemetry Suite</> : "Basic Statistics"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Monitor real-time patient acquisition, revenue velocity, and treatment conversion telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Selector */}
          <div className="inline-flex bg-slate-200/70 p-1 rounded-2xl border border-slate-200">
            {[
              { id: "7", label: "7 Days" },
              { id: "30", label: "30 Days" },
              { id: "90", label: "90 Days" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === tab.id 
                    ? "bg-[#00A1AC] text-white shadow-md shadow-[#00A1AC]/20 font-black" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportFinancialCSV}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              isPremium 
                ? 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00A1AC]" />
            <span>Export Financial CSV</span>
            {!isPremium && <Lock className="w-3 h-3 text-amber-600" />}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue ({timeRange}d)</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{analyticsData.totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Calculated from confirmed OPD slots
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Appointments</span>
            <div className="w-9 h-9 rounded-2xl bg-[#00A1AC]/10 text-[#00A1AC] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analyticsData.totalBookings}</div>
          <div className="text-[11px] font-bold text-slate-500">
            {analyticsData.completedCount} consultations completed
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-[#00A1AC] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analyticsData.completionRate}%</div>
          <div className="text-[11px] font-bold text-slate-500">
            High OPD appointment fulfillment
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Services</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analyticsData.sortedServices.length}</div>
          <div className="text-[11px] font-bold text-slate-500">
            Consultation offerings live on web
          </div>
        </div>
      </div>

      {/* Main Interactive Telemetry Graph Card */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00A1AC]" /> Daily Revenue & Booking Telemetry ({timeRange} Days)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Visual telemetry showing day-by-day practice earnings and slot volume.
            </p>
          </div>
        </div>

        {/* Dynamic Responsive Bar Chart */}
        <div className="h-64 flex items-end gap-1.5 sm:gap-2 pt-6 border-b border-slate-200 pb-2">
          {analyticsData.dailyBars.map((bar, i) => {
            const heightPct = Math.max(8, Math.min(100, Math.round((bar.revenue / analyticsData.maxBarValue) * 100)));
            return (
              <div 
                key={i} 
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip */}
                <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                  <div>{bar.date}</div>
                  <div className="text-teal-300">₹{bar.revenue} ({bar.count} apts)</div>
                </div>

                {/* Bar */}
                <div 
                  className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${
                    bar.revenue > 0 ? 'bg-gradient-to-t from-[#0c2e3d] to-[#00A1AC]' : 'bg-slate-100'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Clinical Treatments Breakdown */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-4">Top-Performing Clinical Services</h3>
        <div className="space-y-4">
          {analyticsData.sortedServices.length === 0 ? (
            <p className="text-xs text-slate-400">No appointment telemetry recorded yet.</p>
          ) : (
            analyticsData.sortedServices.map((srv, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{srv.name}</span>
                  <span className="text-[#00A1AC] font-black">{srv.count} bookings ({srv.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00A1AC] rounded-full transition-all duration-500" 
                    style={{ width: `${srv.pct}%` }} 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Unlock Financial & Telemetry Suite</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              Financial CSV & Revenue Telemetry exports are exclusive to the <strong>Premium Tier (₹1,499/mo)</strong>.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <Link 
                href="/dashboard/subscription"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                Upgrade to Premium <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

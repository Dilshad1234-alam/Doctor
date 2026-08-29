"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, TrendingUp, Calendar, Crown, Sparkles, 
  ArrowUpRight, DollarSign, Users, Activity, 
  CheckCircle2, Clock, FileSpreadsheet, Loader2, ShieldCheck, Lock,
  Stethoscope, ArrowRight, X
} from "lucide-react";
import Link from "next/link";

export default function TelemetryPage() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState("BASIC");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [timeRange, setTimeRange] = useState("7"); // 7, 30, 90 days
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptsRes, subRes, servicesRes] = await Promise.all([
          fetch("/api/dashboard/appointments?status=ALL", { cache: "no-store" }),
          fetch("/api/subscription/upgrade", { cache: "no-store" }),
          fetch("/api/clinic/services", { cache: "no-store" })
        ]);
        
        const [aptsJson, subJson, servicesJson] = await Promise.all([
          aptsRes.json(),
          subRes.json(),
          servicesRes.json()
        ]);

        if (aptsJson.success) setAppointments(aptsJson.appointments || []);
        if (subJson.success) {
          if (subJson.planId) setPlanId(subJson.planId);
          setIsAdvanced(Boolean(subJson.isAdvanced));
          setIsPremium(Boolean(subJson.isPremium));
        }
        if (servicesJson.success) setServices(servicesJson.services || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Plan & Tier Detection Engine
  const activePlan = planId?.toUpperCase() || "BASIC";
  const isBasic = activePlan === "BASIC";
  const isAdvancedTier = activePlan === "ADVANCED" || activePlan === "PRO" || isAdvanced;
  const isPremiumTier = activePlan === "PREMIUM" || activePlan === "ENTERPRISE" || isPremium;
  const isAdvancedOrHigher = isAdvancedTier || isPremiumTier;

  // Handle Time Range Switch with Tier Gating
  const handleRangeChange = (days) => {
    if (days === "30" && !isAdvancedOrHigher) {
      setUpgradeMessage("30-Day Historical Telemetry is available on the Advanced and Premium Plans.");
      setShowUpgradeModal(true);
      return;
    }
    if (days === "90" && !isPremiumTier) {
      setUpgradeMessage("90-Day Enterprise Financial Telemetry is exclusive to the Premium Tier.");
      setShowUpgradeModal(true);
      return;
    }
    setTimeRange(days);
  };

  // Aggregate Metrics based on timeRange
  const analyticsData = useMemo(() => {
    const days = parseInt(timeRange, 10) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = appointments.filter(a => new Date(a.appointmentDate || a.createdAt || Date.now()) >= cutoffDate);
    
    let totalRevenue = 0;
    let completedCount = 0;
    const serviceCounts = {};
    const dailyMap = {};

    // Initialize daily buckets
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const shortLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      dailyMap[dateKey] = { date: dateKey, label: shortLabel, count: 0, revenue: 0 };
    }

    filtered.forEach(a => {
      const fee = Number(a.price) || 500;
      if (a.status === "COMPLETED" || a.status === "CONFIRMED" || !a.status) {
        totalRevenue += fee;
      }
      if (a.status === "COMPLETED") completedCount++;

      const sName = a.serviceName || "General OPD Consultation";
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;

      const rawDate = a.appointmentDate || a.createdAt || new Date().toISOString();
      const aDate = new Date(rawDate).toISOString().split("T")[0];
      if (dailyMap[aDate]) {
        dailyMap[aDate].count += 1;
        dailyMap[aDate].revenue += fee;
      }
    });

    const dailyBars = Object.values(dailyMap);
    const maxBarValue = Math.max(...dailyBars.map(b => b.revenue), 500);

    // Merge actual catalog services with booking counts
    const catalogServiceNames = new Set(services.map(s => s.name));
    Object.keys(serviceCounts).forEach(name => catalogServiceNames.add(name));

    const sortedServices = Array.from(catalogServiceNames).map(name => {
      const count = serviceCounts[name] || 0;
      const matchedService = services.find(s => s.name === name);
      const fee = matchedService ? matchedService.price : 500;
      const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
      return { name, count, fee, pct };
    }).sort((a, b) => b.count - a.count);

    return {
      totalBookings: filtered.length,
      totalRevenue,
      completedCount,
      completionRate: filtered.length > 0 ? Math.round((completedCount / filtered.length) * 100) : 100,
      dailyBars,
      maxBarValue,
      sortedServices,
      activeServicesCount: services.length || sortedServices.length || 1
    };
  }, [appointments, services, timeRange]);

  // Export Financial CSV (Gated to Premium)
  const exportFinancialCSV = () => {
    if (!isPremiumTier) {
      setUpgradeMessage("Financial CSV & Practice Revenue Telemetry exports are exclusive to the Premium Tier (₹1,499/mo).");
      setShowUpgradeModal(true);
      return;
    }

    const headers = ["Date", "Patient Name", "Phone", "Service", "Fee (INR)", "Status"];
    const rows = appointments.map(apt => [
      new Date(apt.appointmentDate || apt.createdAt || Date.now()).toISOString().split("T")[0],
      `"${apt.patientName || "Walk-in Patient"}"`,
      `"${apt.patientPhone || ""}"`,
      `"${apt.serviceName || "Consultation"}"`,
      apt.price || 500,
      `"${apt.status || "CONFIRMED"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Telemetry_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-slate-50/70">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A1AC]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden p-4 sm:p-5 lg:p-6 bg-slate-50/70 font-sans text-[#0f172a]">
      
      {/* 3. Compact Top Header Row */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-[#00A1AC] flex items-center justify-center shrink-0 border border-[#00A1AC]/20 shadow-xs">
            <BarChart3 className="w-5 h-5 text-[#00A1AC]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                Clinic Telemetry &amp; Advanced Analytics
              </h1>
              {isPremiumTier ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-teal-50 border border-amber-300 text-[10px] font-black text-amber-900 shadow-xs">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>👑 Premium Telemetry Suite</span>
                </span>
              ) : isAdvancedTier ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-black text-[#00A1AC] shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#00A1AC]" />
                  <span>✨ Advanced Telemetry</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs">
                  <span>Basic Statistics</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
              Monitor real-time patient acquisition, revenue velocity, and treatment conversion telemetry.
            </p>
          </div>
        </div>

        {/* Date Range Selector & Export Button */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          
          {/* Time Range Tabs with Tier Badges */}
          <div className="inline-flex bg-slate-200/70 p-0.5 rounded-xl border border-slate-200">
            {[
              { id: "7", label: "7 Days", gated: false },
              { id: "30", label: "30 Days", gated: !isAdvancedOrHigher, badge: "ADV" },
              { id: "90", label: "90 Days", gated: !isPremiumTier, badge: "VIP" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleRangeChange(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  timeRange === tab.id 
                    ? "bg-[#00A1AC] text-white shadow-xs font-black" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.gated && (
                  <span className={`text-[8px] px-1 py-0.2 rounded font-black ${
                    tab.badge === "VIP" ? "bg-amber-200 text-amber-900" : "bg-teal-200 text-teal-900"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Export Financial CSV Button */}
          <button
            onClick={exportFinancialCSV}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
              isPremiumTier 
                ? "bg-white hover:bg-slate-100 text-slate-900 border border-slate-300" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00A1AC]" />
            <span>Export CSV</span>
            {!isPremiumTier && <Lock className="w-3 h-3 text-amber-600" />}
          </button>
        </div>
      </div>

      {/* 4. Top Metric Cards Strip (4 Compact Cards in 1 Row) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 py-2.5">
        
        {/* Card 1: Total Revenue */}
        <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue ({timeRange}d)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{analyticsData.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 truncate">
            <ArrowUpRight className="w-3 h-3 shrink-0" /> Confirmed OPD bookings
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Flow</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#00A1AC] flex items-center justify-center border border-teal-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analyticsData.totalBookings}
          </div>
          <div className="text-[10px] font-medium text-slate-500 truncate">
            {analyticsData.completedCount} consultations completed
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analyticsData.completionRate}%
          </div>
          <div className="text-[10px] font-medium text-slate-500 truncate">
            High OPD fulfillment
          </div>
        </div>

        {/* Card 4: Active Services */}
        <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Services</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analyticsData.activeServicesCount}
          </div>
          <div className="text-[10px] font-medium text-slate-500 truncate">
            Catalog offerings live
          </div>
        </div>

      </div>

      {/* 5. Bottom Cockpit Grid (Side-by-Side Chart & Treatment Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0 py-1">
        
        {/* LEFT PANEL: Revenue & Patient Flow Interactive Bar Graph (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A1AC]" />
              <h2 className="text-xs sm:text-sm font-black text-slate-900">
                Revenue &amp; Patient Flow Telemetry ({timeRange} Days)
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#00A1AC]"></span>
                <span>Revenue Flow</span>
              </div>
            </div>
          </div>

          {/* Responsive Dynamic Bar Chart */}
          <div className="flex-1 flex items-end gap-1 sm:gap-2 pt-4 pb-2 border-b border-slate-100 min-h-0 overflow-x-auto">
            {analyticsData.dailyBars.map((bar, i) => {
              const heightPct = Math.max(10, Math.min(100, Math.round((bar.revenue / analyticsData.maxBarValue) * 100)));
              return (
                <div 
                  key={i} 
                  className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[18px]"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <div>{bar.label}</div>
                    <div className="text-teal-300">₹{bar.revenue} ({bar.count} apts)</div>
                  </div>

                  {/* Bar */}
                  <div 
                    className={`w-full rounded-t-md transition-all group-hover:opacity-85 ${
                      bar.revenue > 0 
                        ? "bg-gradient-to-t from-[#0c2e3d] to-[#00A1AC] shadow-xs" 
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />

                  {/* Date Label */}
                  <span className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-full">
                    {bar.date.split("-").slice(1).join("/")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Graph Subtext summary */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0">
            <span>Peak Day: ₹{analyticsData.maxBarValue.toLocaleString("en-IN")}</span>
            <span>Total Period Bookings: {analyticsData.totalBookings} visits</span>
          </div>
        </div>

        {/* RIGHT PANEL: Top-Performing Clinical Services (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0 mb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900">Treatment Performance</h2>
              <p className="text-[10px] text-slate-400 font-medium">Ranked by patient volume</p>
            </div>
            <span className="text-[10px] font-black text-[#00A1AC] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {analyticsData.sortedServices.length} Services
            </span>
          </div>

          {/* Scrollable Ranked Services */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
            {analyticsData.sortedServices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <Stethoscope className="w-6 h-6 text-slate-300 mb-1" />
                <p className="text-xs font-bold">No Telemetry Recorded</p>
              </div>
            ) : (
              analyticsData.sortedServices.map((srv, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 truncate pr-2" title={srv.name}>{srv.name}</span>
                    <span className="text-[#00A1AC] font-black shrink-0">₹{srv.fee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00A1AC] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(8, srv.pct)}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">
                      {srv.count} apts ({srv.pct}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 6. Fixed Bottom Bar */}
      <div className="shrink-0 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Telemetry status: Live real-time sync with clinic OPD queue ({appointments.length} lifetime appointments tracked)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/patients" 
            className="text-[#00A1AC] hover:text-[#008790] font-bold transition-colors flex items-center gap-1"
          >
            <span>View Patient Ledger</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                Premium Telemetry Feature
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2">Unlock Advanced Telemetry</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                {upgradeMessage || "Financial CSV & Historical Revenue Telemetry exports are exclusive to higher tier plans."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <Link 
                href="/dashboard/billing"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
              >
                <span>Upgrade Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

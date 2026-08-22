"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, CheckCircle2, CreditCard, ExternalLink, 
  Settings, Plus, Copy, MoreHorizontal, Loader2, AlertCircle, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch stats");
        }

        if (json.hasCompletedOnboarding === false) {
          router.push("/dashboard/onboarding");
          return;
        }

        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load dashboard</h2>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { clinic, doctor, stats, recentAppointments } = data;

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800"
    };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || styles.PENDING}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {doctor.fullName}</h1>
            <p className="text-slate-600 mt-1">{clinic.name} Dashboard</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </button>
            <Link href={`/${clinic.slug}`} target="_blank" className="flex items-center px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
              <ExternalLink className="w-4 h-4 mr-2" /> View Live Website
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Today's OPD</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.todayAppointmentsCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <span className="text-blue-600 font-medium">Appointments</span> scheduled today
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Patients waiting to be seen
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.completedCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Successfully consulted today
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Total earnings today
            </div>
          </div>
        </div>

        {/* Quick Actions & Table */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Recent Appointments</h2>
              <Link href="/dashboard/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Slot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No recent appointments found.
                      </td>
                    </tr>
                  ) : (
                    recentAppointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{apt.patientName}</div>
                          <div className="text-sm text-slate-500">{apt.patientPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {apt.serviceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                          {apt.timeSlot}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(apt.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-slate-400 hover:text-blue-600 transition-colors">
                            <MoreHorizontal className="w-5 h-5 ml-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm text-slate-700 group-hover:text-blue-700">Manage OPD Hours</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm text-slate-700 group-hover:text-blue-700">Add Service</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm text-slate-700 group-hover:text-blue-700">Clinic Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>
              </div>
            </div>
            
            {/* Help Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl shadow-lg border border-slate-800 p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500 opacity-20 blur-2xl"></div>
               <h3 className="font-semibold text-lg mb-2 relative z-10">Need Help?</h3>
               <p className="text-sm text-slate-300 mb-4 relative z-10">Our support team is available 24/7 to assist you with any setup or operational queries.</p>
               <button className="w-full py-2 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors relative z-10">
                 Contact Support
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

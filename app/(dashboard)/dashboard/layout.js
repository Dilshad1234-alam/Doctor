"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Stethoscope, Clock, Globe, 
  CreditCard, Settings, LogOut, Sparkles
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Do not show sidebar for onboarding wizard
  if (pathname === "/dashboard/onboarding") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Appointments", href: "/dashboard/appointments", icon: <Calendar className="w-5 h-5" /> },
    { name: "Services", href: "/dashboard/services", icon: <Stethoscope className="w-5 h-5" /> },
    { name: "Availability", href: "/dashboard/availability", icon: <Clock className="w-5 h-5" /> },
    { name: "Website Builder", href: "/dashboard/website", icon: <Globe className="w-5 h-5" /> },
    { name: "Billing & Plan", href: "/dashboard/billing", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071a24] via-[#0a2635] to-[#0d3b4d] text-slate-100 font-sans flex antialiased selection:bg-teal-500/30 selection:text-teal-200">
      {/* Sidebar */}
      <aside className="w-64 bg-[#081e2b]/95 backdrop-blur-xl border-r border-white/10 flex flex-col fixed inset-y-0 z-30 shadow-2xl shadow-black/40">
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                DocPulse
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400/80 block -mt-0.5">Doctor Suite</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 hide-scrollbar">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Menu</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                  ? "bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 font-bold border-l-4 border-teal-400 shadow-lg shadow-teal-500/10" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={isActive ? "text-teal-300 drop-shadow-[0_0_6px_rgba(45,212,191,0.5)]" : "text-slate-400 group-hover:text-slate-200"}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#061822]/60">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5 text-slate-400 hover:text-rose-300" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content (Offset by sidebar width) */}
      <main className="flex-1 ml-64 min-w-0 min-h-screen relative overflow-y-auto">
        {/* Background glow effects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

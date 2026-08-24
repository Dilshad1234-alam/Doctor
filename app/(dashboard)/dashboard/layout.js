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
    <div className="min-h-screen bg-[#071720] text-slate-100 font-sans flex antialiased selection:bg-[#2dd4bf]/30 selection:text-[#2dd4bf]">
      {/* Sidebar Shell */}
      <aside className="w-64 bg-[#051118] border-r border-[#0f2c3b] flex flex-col fixed inset-y-0 z-30 shadow-2xl">
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#0f2c3b] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#0b3342] border border-[#164e63] flex items-center justify-center text-[#2dd4bf] shadow-inner group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                DocPulse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3b6072] block -mt-0.5">Doctor Suite</span>
            </div>
          </Link>
          <span className="bg-[#3d3215] text-[#facc15] text-[10px] font-bold px-2 py-0.5 rounded border border-[#6b581e]">
            DOCTOR
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 hide-scrollbar">
          <div className="px-3 py-2 text-[#3b6072] text-[11px] font-bold tracking-wider uppercase">Main Menu</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                  isActive 
                  ? "bg-[#0b3342] text-[#2dd4bf] font-bold border border-[#164e63] shadow-lg shadow-[#0b3342]/40" 
                  : "text-[#62879a] hover:text-white hover:bg-white/5 font-medium"
                }`}
              >
                <span className={isActive ? "text-[#2dd4bf] drop-shadow-[0_0_6px_rgba(45,212,191,0.5)]" : "text-[#62879a] group-hover:text-slate-200"}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#0f2c3b] bg-[#040d13]">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#62879a] hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4 text-[#62879a] hover:text-rose-300" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-w-0 min-h-screen relative overflow-y-auto bg-[#071720]">
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Stethoscope, Clock, Globe, 
  CreditCard, Settings, LogOut, HeartPulse 
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-black text-slate-900 tracking-tight">DocPulse</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors">
            <LogOut className="w-5 h-5 text-slate-400" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content (Offset by sidebar width) */}
      <main className="flex-1 ml-64 min-w-0">
        {children}
      </main>
    </div>
  );
}

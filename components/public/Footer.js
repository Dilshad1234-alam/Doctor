import React from 'react';
import { Stethoscope, Sparkles, Activity, Baby, HeartPulse } from 'lucide-react';

const SpecialtyIcon = ({ iconName, color }) => {
  const props = { className: "w-8 h-8", style: { color: color || '#fff' } };
  switch (iconName) {
    case 'sparkles': return <Sparkles {...props} />;
    case 'stethoscope': return <Stethoscope {...props} />;
    case 'activity': return <Activity {...props} />;
    case 'baby': return <Baby {...props} />;
    case 'tooth':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: color || '#fff' }}>
          <path d="M9 21c-2-2-3-5.2-3-8.5V7c0-2.8 2.2-5 5-5h2c2.8 0 5 2.2 5 5v5.5c0 3.3-1 6.5-3 8.5L12 23l-3-2z"/>
          <path d="M12 23v-8"/>
          <path d="M8 12h8"/>
        </svg>
      );
    default: return <HeartPulse {...props} />;
  }
};

export default function PublicFooter({ clinic = {}, doctor = {}, websiteConfig = {}, planId = "BASIC", specialtyPreset = {}, compact = false }) {
  const isAdvancedOrHigher = planId === "ADVANCED" || planId === "PRO" || planId === "PREMIUM" || planId === "ENTERPRISE";
  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.replace(/^Dr\.?\s*/i, '');
  const clinicTitle = doctor?.clinicName || clinic?.name || 'Alam Dental Clinic';
  const address = doctor?.address || clinic?.address || 'Sultanganj, Patna';
  const city = doctor?.city || clinic?.city || 'Patna';
  const fullAddress = city && !address.includes(city) ? `${address}, ${city}` : address;
  const phone = doctor?.phone || clinic?.phone || '1234567898';
  
  const themeColor = websiteConfig?.primaryColor || '#0ea5e9';

  return (
    <footer className={`w-full bg-[#0b1120] text-slate-300 ${compact ? 'py-6 px-4 mt-6' : 'py-16 px-6 sm:px-12 lg:px-20 mt-12'} border-t-4`} style={{ borderTopColor: themeColor }}>
      <div className={`w-full grid grid-cols-1 md:grid-cols-3 ${compact ? 'gap-6 mb-6' : 'gap-12 mb-12'}`}>
        
        {/* Brand & About */}
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          <div className="flex items-center gap-3">
            <div className={`${compact ? 'p-1.5' : 'p-2.5'} rounded-xl bg-white/5 border border-white/10 shadow-sm flex items-center justify-center`}>
              <div style={{ transform: compact ? 'scale(0.7)' : 'none' }}>
                <SpecialtyIcon iconName={specialtyPreset?.icon} color={themeColor} />
              </div>
            </div>
            <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-black text-white tracking-tight`}>{clinicTitle}</h2>
          </div>
          <p className={`${compact ? 'text-[10px]' : 'text-sm'} text-slate-400 leading-relaxed max-w-sm mt-3`}>
            {specialtyPreset?.description || 'Providing exceptional clinical care with advanced medical technology and a commitment to patient comfort.'}
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10">
              Dr. {cleanDocName}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          <h3 className={`${compact ? 'text-[11px]' : 'text-sm'} font-bold text-white uppercase tracking-wider mb-2`}>Patient Resources</h3>
          <ul className={`space-y-2.5 ${compact ? 'text-[10px]' : 'text-sm'} font-medium`}>
            <li><a href="#home" className="hover:text-white transition-colors">Home &amp; About</a></li>
            <li><a href="#services" className="hover:text-white transition-colors">Services &amp; Fees</a></li>
            <li><a href="#schedule" className="hover:text-white transition-colors">OPD Timings</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Clinic Location</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          <h3 className={`${compact ? 'text-[11px]' : 'text-sm'} font-bold text-white uppercase tracking-wider mb-2`}>Contact Desk</h3>
          <ul className={`space-y-3 ${compact ? 'text-[10px]' : 'text-sm'}`}>
            <li className="flex items-start gap-3">
              <span className={`${compact ? 'w-4 h-4 text-[10px]' : 'w-5 h-5'} rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5`}>📍</span>
              <span className="leading-relaxed">{fullAddress}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className={`${compact ? 'w-4 h-4 text-[10px]' : 'w-5 h-5'} rounded-full bg-white/10 flex items-center justify-center shrink-0`}>📞</span>
              <span className="font-bold text-white">{phone}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`w-full ${compact ? 'pt-4' : 'pt-8'} border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className={`${compact ? 'text-[9px]' : 'text-xs'} font-medium text-slate-500`}>
          © {new Date().getFullYear()} {clinicTitle}. All rights reserved.
        </div>
        <div className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-bold tracking-wider uppercase`}>
          {isAdvancedOrHigher ? (
            <span className="text-slate-500 hover:text-slate-400 transition-colors">Powered by <span className="text-slate-300">DocPulse CRM</span></span>
          ) : (
            <span className="text-slate-500">DocPulse Medical CRM • Free Plan</span>
          )}
        </div>
      </div>
    </footer>
  );
}

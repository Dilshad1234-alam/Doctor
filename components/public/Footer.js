import React from 'react';

export default function PublicFooter({ clinic = {}, doctor = {}, websiteConfig = {}, planId = "BASIC" }) {
  const isPremium = planId === "PREMIUM" || planId === "ENTERPRISE" || websiteConfig?.hideBranding;
  const rawDocName = doctor?.fullName || doctor?.name || 'Alam';
  const cleanDocName = rawDocName.replace(/^Dr\.?\s*/i, '');
  const clinicTitle = doctor?.clinicName || clinic?.name || 'Alam Dental Clinic';
  const address = doctor?.address || clinic?.address || 'Sultanganj, Patna';
  const city = doctor?.city || clinic?.city || 'Patna';
  const fullAddress = city && !address.includes(city) ? `${address}, ${city}` : address;
  const phone = doctor?.phone || clinic?.phone || '1234567898';

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/80 py-6 px-4 sm:px-8 lg:px-12 mt-20">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Clinic Identity & Location */}
        <div className="text-center sm:text-left space-y-1">
          <div className="text-sm font-bold text-slate-800 tracking-tight">
            {clinicTitle} • Dr. {cleanDocName}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {fullAddress} • Tel: {phone}
          </div>
        </div>

        {/* Right Side: Basic Tier CRM Attribution / Copyright */}
        <div className="text-center sm:text-right text-[11px] text-slate-400">
          {isPremium ? (
            <span>© {new Date().getFullYear()} {clinicTitle}. All rights reserved.</span>
          ) : (
            <span>Powered by <span className="font-semibold text-slate-600">DocPulse Clinic CRM</span></span>
          )}
        </div>

      </div>
    </footer>
  );
}

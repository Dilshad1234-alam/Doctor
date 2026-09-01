import React from 'react';
import PublicNavbar from '../Navbar';
import PublicFooter from '../Footer';
import MinimalSolo from '../templates/MinimalSolo';
import CleanClinic from '../templates/CleanClinic';
import OceanicPro from '../templates/OceanicPro';
import CareGrid from '../templates/CareGrid';
import { getSpecialtyPreset } from '../../../lib/specialtyPresets';
import { getThemeConfig } from '../../../lib/themeColors';
import { MapPin, MessageCircle } from 'lucide-react';

export default function BasicWebsitePreview({
  clinic,
  doctor,
  websiteConfig,
  currentPlan,
  slug,
  isAdvancedOrHigher,
  availability = [],
  services = []
}) {
  const activeTheme = getThemeConfig(websiteConfig?.primaryColor || websiteConfig?.themeColor || '#0A8692');
  const specialtyPreset = getSpecialtyPreset(doctor?.specialty);
  
  const getButtonShapeClass = (style) => {
    switch (style) {
      case 'sharp': return 'rounded-none';
      case 'soft': return 'rounded-xl';
      case 'block': return 'rounded-md';
      case 'slight': return 'rounded-sm';
      case 'circle':
      case 'pill':
      default: return 'rounded-full';
    }
  };
  const cornerRadiusClass = getButtonShapeClass(websiteConfig?.buttonStyle || 'pill');

  const doctorName = doctor?.fullName || 'Alam';
  const doctorSpecialty = doctor?.specialty || 'Dentist & Oral Surgeon';
  const clinicTitle = clinic?.name || "Alam Dental Clinic";
  const displayDoctorPhoto = websiteConfig?.doctorPhoto || doctor?.avatarUrl || doctor?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=${(activeTheme?.primary || '#0A8692').replace('#', '')}&color=fff&size=200`;

  const templateProps = {
    clinic: clinic || { name: clinicTitle },
    doctor: doctor || { fullName: doctorName, specialty: doctorSpecialty },
    websiteConfig,
    currentTier: isAdvancedOrHigher ? 'ADVANCED' : 'BASIC',
    tier: { navbarType: 'basic' },
    slug: slug || 'preview',
    activeTheme,
    buttonShapeClass: cornerRadiusClass,
    isDarkMode: websiteConfig?.previewMode === 'dark',
    containerClass: "",
    specialtyPreset,
    compact: true
  };

  const displayServices = (services.length > 0 ? services : doctor?.services || websiteConfig?.services || specialtyPreset?.services || []).slice(0, 5);
  const dayRows = [
    { id: "monday", name: "Monday" },
    { id: "tuesday", name: "Tuesday" },
    { id: "wednesday", name: "Wednesday" },
    { id: "thursday", name: "Thursday" },
    { id: "friday", name: "Friday" },
    { id: "saturday", name: "Saturday" },
    { id: "sunday", name: "Sunday" }
  ];

  const renderTemplate = () => {
    if (websiteConfig?.templateId === 'clean-clinic' || websiteConfig?.templateId === 'clean_clinic') {
      return (
        <section id="home" className="w-full max-w-4xl mx-auto px-4 py-8 text-center transition-all duration-200 mt-16">
          <div className="flex flex-col items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-full p-1 border-2 shadow-md mb-3 bg-white" style={{ borderColor: activeTheme.primary }}>
              <img src={displayDoctorPhoto} alt={doctorName} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                {doctorSpecialty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                {doctor?.experience || '5+'} Yrs Exp
              </span>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-3 max-w-2xl mx-auto">
            {websiteConfig.headline || doctor?.headline || 'Modern, Painless Dental Care & Precision Smile Aesthetics'}
          </h1>
          <p className="text-[10px] md:text-xs text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
            {websiteConfig.bio || doctor?.bio || 'Comprehensive clinical care with verified digital appointments and zero queue wait times.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button className={`px-5 py-2.5 ${cornerRadiusClass} text-white font-bold text-[10px] shadow-md transition-all hover:opacity-95`} style={{ backgroundColor: activeTheme.primary }}>
              📅 Book Confirmed OPD Slot →
            </button>
            <button className={`px-4 py-2.5 ${cornerRadiusClass} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all`}>
              📞 Call Clinic
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 max-w-3xl mx-auto">
            {['Autoclave Sterilized', 'Painless Care', 'Digital RVG X-Ray', 'Zero Wait Token'].map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-700">
                <span className="text-emerald-500 font-black">✓</span>
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }
    
    return (
      <section id="home" className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 transition-all duration-200 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                {doctorSpecialty}
              </span>
              <span className="px-2 py-1 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-700">
                {doctor?.qualification || 'BDS, MDS'}
              </span>
              <span className="px-2 py-1 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                {doctor?.experience || '5+'} Years Experience
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {websiteConfig?.headline || doctor?.headline || 'Modern, Painless Dental Care & Precision Smile Aesthetics'}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed max-w-xl">
              {websiteConfig?.bio || doctor?.bio || 'Dental refers to anything relating to the teeth, gums, and overall oral cavity, including healthcare services, diagnostics, and treatments provided by a dentist.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              {['100% Autoclave Sterilized', 'Painless Anesthesia', 'Digital RVG X-Ray', 'Zero Wait Token'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[9px] font-bold text-slate-700">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button className={`px-4 py-2 ${cornerRadiusClass} text-white font-bold text-[10px] shadow-md transition-all hover:opacity-95`} style={{ backgroundColor: activeTheme.primary }}>
                📅 Book Confirmed OPD Slot →
              </button>
              <button className={`px-4 py-2 ${cornerRadiusClass} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all`}>
                📞 Call Clinic
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[200px] bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xl">
              <div className="relative w-full aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                <img src={displayDoctorPhoto} alt={doctorName} className="w-full h-full object-cover" />
              </div>
              <div className="text-center pb-1">
                <h3 className="text-sm font-black text-slate-900">{doctorName}</h3>
                <p className="text-[9px] font-bold mt-0.5" style={{ color: activeTheme.primary }}>{doctorSpecialty}</p>
                <p className="text-[8px] text-slate-400 mt-0.5">{clinicTitle} • {doctor?.city || 'Patna'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="w-full bg-white relative text-slate-900 border border-slate-200/60 shadow-2xl rounded-xl overflow-hidden h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative styled-scrollbar">
        {/* 1. True Public Navbar */}
        <div className="w-full relative z-20 pointer-events-none [&_button]:pointer-events-none [&_a]:pointer-events-none">
          <PublicNavbar {...templateProps} planId={currentPlan} navbarType="basic" />
        </div>

        {/* 2. Hero & Body */}
        <div className="relative z-10 pointer-events-none [&_button]:pointer-events-none [&_a]:pointer-events-none -mt-4">
          {renderTemplate()}
        </div>

        {/* 3. Clinical Consultation & Treatments Catalog Section */}
        <div className={`py-3.5 px-4 border-t transition-colors ${websiteConfig?.previewMode === "dark" ? "border-slate-800 bg-[#0a1219]" : "border-slate-100 bg-slate-50/40"}`}>
          <div className="text-center max-w-sm mx-auto">
            <span style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}15`, borderColor: `${activeTheme.primary}30` }} className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase tracking-wider">
              SERVICES &amp; RATE CATALOG
            </span>
            <h2 className={`text-sm font-black mt-1 tracking-tight ${websiteConfig?.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              Clinical Consultation &amp; Treatments
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-5xl mx-auto">
            {displayServices.map((svc, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${websiteConfig?.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-[11px] font-bold ${websiteConfig?.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{svc.name || svc}</h3>
                  <span className="text-[11px] font-black text-emerald-600">₹{svc.price || '500'}</span>
                </div>
                <button className={`w-full py-1.5 rounded-lg border text-[9px] font-bold flex items-center justify-center gap-1 transition-all ${websiteConfig?.previewMode === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  <span>Book Slot</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Timings */}
        <div className={`py-3.5 px-4 border-t transition-colors ${websiteConfig?.previewMode === "dark" ? "border-slate-800 bg-[#0a1219]" : "border-slate-100 bg-white"}`}>
          <div className="text-center max-w-sm mx-auto">
            <span style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}15`, borderColor: `${activeTheme.primary}30` }} className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase tracking-wider">
              OPD SCHEDULE
            </span>
            <h2 className={`text-sm font-black mt-1 tracking-tight ${websiteConfig?.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              Consultation Timings
            </h2>
          </div>
          <div className="mt-4 max-w-xl mx-auto border rounded-xl overflow-hidden shadow-xs">
            {(() => {
              const keyMap = { 1: "monday", 2: "tuesday", 3: "wednesday", 4: "thursday", 5: "friday", 6: "saturday", 0: "sunday" };
              const resolvedShifts = {};
              
              if (Array.isArray(availability)) {
                for (const a of availability) {
                  const key = keyMap[Number(a.dayOfWeek)];
                  if (key) {
                    const isOpen = a.isOpen !== undefined ? Boolean(a.isOpen) : (a.isClosed !== undefined ? !a.isClosed : true);
                    resolvedShifts[key] = {
                      isEnabled: isOpen,
                      morningStart: a.morningStartTime || a.startTime || "",
                      morningEnd: a.morningEndTime || a.endTime || "",
                      eveningStart: a.eveningStartTime || "",
                      eveningEnd: a.eveningEndTime || ""
                    };
                  }
                }
              }

              return dayRows.map((day, idx) => {
                const shiftInfo = resolvedShifts[day.id] || { isEnabled: true, morningStart: "10:00", morningEnd: "14:00", eveningStart: "17:00", eveningEnd: "20:00" };
                const isOpen = shiftInfo.isEnabled;
                
                // Helper to format 24h time to 12h time
                const formatTime = (timeStr) => {
                  if (!timeStr) return "";
                  const [h, m] = timeStr.split(':');
                  if (!h || !m) return timeStr;
                  const hours = parseInt(h, 10);
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  const hr12 = hours % 12 || 12;
                  return `${hr12.toString().padStart(2, '0')}:${m} ${ampm}`;
                };

                const morningSlot = shiftInfo.morningStart && shiftInfo.morningEnd ? `${formatTime(shiftInfo.morningStart)} - ${formatTime(shiftInfo.morningEnd)}` : "";
                const eveningSlot = shiftInfo.eveningStart && shiftInfo.eveningEnd ? `${formatTime(shiftInfo.eveningStart)} - ${formatTime(shiftInfo.eveningEnd)}` : "";

                return (
                  <div key={idx} className={`flex items-center justify-between p-2.5 text-[10px] ${idx !== dayRows.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <span className="font-bold text-slate-800 w-16">{day.name}</span>
                    <span className={`font-medium w-16 text-center ${isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-slate-600 font-mono text-right sm:text-left min-w-[120px] justify-end">
                      {isOpen ? (
                        <>
                          {morningSlot && <span className="whitespace-nowrap">{morningSlot}</span>}
                          {eveningSlot && <span className="whitespace-nowrap">{eveningSlot}</span>}
                          {!morningSlot && !eveningSlot && <span className="whitespace-nowrap">Available on Call</span>}
                        </>
                      ) : (
                        <span className="whitespace-nowrap opacity-50">-</span>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Contact Section */}
        <div className={`py-4 px-5 border-t transition-colors ${websiteConfig?.previewMode === "dark" ? "border-slate-800 bg-[#0a1219]" : "border-slate-100 bg-white"}`}>
          <div className="text-center max-w-sm mx-auto mb-4">
            <span style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}15`, borderColor: `${activeTheme.primary}30` }} className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase tracking-wider">
              Contact & Location
            </span>
            <h2 className={`text-sm font-black mt-1 tracking-tight ${websiteConfig?.previewMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              Visit or Connect
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${websiteConfig?.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <h3 className={`text-[10px] font-black ${websiteConfig?.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Clinic Address</h3>
                <p className={`text-[9px] mt-1 leading-snug ${websiteConfig?.previewMode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{clinic?.address || doctor?.address || "Sultanganj, Patna"}</p>
              </div>
              <span className="text-[9px] font-bold inline-flex items-center gap-1 mt-3" style={{ color: activeTheme.primary }}>
                Get Directions
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <div className={`p-2 rounded-xl border flex justify-between items-center ${websiteConfig?.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Reception Line</span>
                  <p className={`text-[10px] font-black ${websiteConfig?.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{doctor?.phone || clinic?.phone || "1234567898"}</p>
                </div>
              </div>
              <div className={`p-2 rounded-xl border flex justify-between items-center ${websiteConfig?.previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-[#25D366]/5 border-[#25D366]/20'}`}>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">WhatsApp OPD</span>
                  <p className={`text-[10px] font-black ${websiteConfig?.previewMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Direct Desk</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Fully Integrated Clinic Footer (Bottom of Viewport) */}
        <div className={`w-full mt-4 transition-colors ${websiteConfig?.previewMode === "dark" ? "bg-slate-900/90" : "bg-slate-50/70"}`}>
          <PublicFooter {...templateProps} planId={currentPlan} compact={true} />
        </div>
      </div>
    </div>
  );
}

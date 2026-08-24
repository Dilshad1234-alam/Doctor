"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Clock, Calendar, User, Phone, MapPin, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, AlertCircle, Share2, Printer,
  ChevronLeft, ChevronRight
} from 'lucide-react';

function BookingWizard({ clinic, doctor, services, availability, slug, embedded, websiteConfig }) {
  const searchParams = useSearchParams();
  const primaryColor = websiteConfig?.primaryColor || clinic?.websiteConfig?.primaryColor || '#0f766e';
  const buttonStyle = websiteConfig?.buttonStyle || clinic?.websiteConfig?.buttonStyle || 'rounded-xl';
  const cleanDoctorName = `Dr. ${doctor?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  const initialServiceId = searchParams.get("serviceId");
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(
    services.find(s => s._id === initialServiceId) || services[0] || null
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [patientDetails, setPatientDetails] = useState({
    name: '', phone: '', email: '', age: '', gender: ''
  });
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [nextDays, setNextDays] = useState([]);
  const [isClosed, setIsClosed] = useState(false);

  const slotsCacheRef = useRef({});
  const dateScrollRef = useRef(null);

  // Generate next 14 days on mount to prevent hydration mismatch
  useEffect(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
    setNextDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0]);
    }
  }, []);

  // Pre-fetch slots for upcoming days in background for instantaneous switching
  useEffect(() => {
    if (!slug || nextDays.length === 0) return;

    const preloadNextDays = async () => {
      const clinicParam = clinic?._id ? `&clinicId=${clinic._id}` : '';
      const serviceParam = selectedService?._id ? `&serviceId=${selectedService._id}` : '';

      for (let i = 0; i < Math.min(nextDays.length, 7); i++) {
        const date = nextDays[i];
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        if (!slotsCacheRef.current[dateStr]) {
          try {
            const res = await fetch(`/api/appointments/slots?clinicSlug=${slug}${clinicParam}&date=${dateStr}${serviceParam}`);
            const json = await res.json();
            if (json.success) {
              slotsCacheRef.current[dateStr] = {
                slots: json.slots || [],
                isClosed: Boolean(json.isClosed)
              };
              // If it matches current selectedDate and availableSlots is empty, sync it
              if (selectedDate) {
                const curY = selectedDate.getFullYear();
                const curM = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const curD = String(selectedDate.getDate()).padStart(2, '0');
                if (`${curY}-${curM}-${curD}` === dateStr) {
                  setAvailableSlots(json.slots || []);
                  setIsClosed(Boolean(json.isClosed));
                }
              }
            }
          } catch (e) {
            // Ignore background preload error
          }
        }
      }
    };

    preloadNextDays();
  }, [slug, nextDays, selectedService, clinic]);

  const fetchSlots = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    // Format YYYY-MM-DD in local time
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    // 1. Check instant cache first
    if (slotsCacheRef.current[dateStr]) {
      const cached = slotsCacheRef.current[dateStr];
      setAvailableSlots(cached.slots);
      setIsClosed(cached.isClosed);
      setSlotsLoading(false);
      return;
    }
    
    setSlotsLoading(true);
    setIsClosed(false);
    
    try {
      const clinicParam = clinic?._id ? `&clinicId=${clinic._id}` : '';
      const serviceParam = selectedService?._id ? `&serviceId=${selectedService._id}` : '';
      const res = await fetch(`/api/appointments/slots?clinicSlug=${slug}${clinicParam}&date=${dateStr}${serviceParam}`);
      const json = await res.json();
      if (json.success) {
        const slotsData = json.slots || [];
        const closedData = Boolean(json.isClosed);
        slotsCacheRef.current[dateStr] = { slots: slotsData, isClosed: closedData };
        setAvailableSlots(slotsData);
        setIsClosed(closedData);
      } else {
        setAvailableSlots([]);
        setIsClosed(Boolean(json.isClosed));
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setAvailableSlots([]);
      setIsClosed(false);
    }
    setSlotsLoading(false);
  };

  const scrollDates = (offset) => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const isSlotInPast = (selectedDateVal, slotTimeString) => {
    if (!selectedDateVal || !slotTimeString) return false;
    const now = new Date();
    
    // Format selectedDate to YYYY-MM-DD
    let selectedDateStr = "";
    if (selectedDateVal instanceof Date) {
      const y = selectedDateVal.getFullYear();
      const m = String(selectedDateVal.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDateVal.getDate()).padStart(2, '0');
      selectedDateStr = `${y}-${m}-${d}`;
    } else if (typeof selectedDateVal === 'string') {
      selectedDateStr = selectedDateVal.split('T')[0];
    } else {
      return false;
    }

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    // If selected date is in the future, all slots are valid
    if (selectedDateStr > todayStr) return false;
    // If selected date is in the past, all slots are disabled/hidden
    if (selectedDateStr < todayStr) return true;

    // If selected date is TODAY, compare slot time with current time
    // Example slotTimeString: "09:30 AM", "02:15 PM"
    const parts = slotTimeString.trim().split(' ');
    if (parts.length < 2) return false;
    const time = parts[0];
    const modifier = parts[1].toUpperCase();
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const slotDateTime = new Date();
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Return true if slot time is earlier than or equal to current time
    return slotDateTime <= now;
  };

  const groupSlots = (slots) => {
    const morning = [];
    const evening = [];
    slots.forEach(slot => {
      const str = slot.trim().toUpperCase();
      if (str.includes("AM") && !str.startsWith("12")) {
        morning.push(slot);
      } else if (str.includes("PM") || str.startsWith("12")) {
        evening.push(slot);
      } else {
        const hour = parseInt(str.split(':')[0], 10);
        if (hour < 12) morning.push(slot);
        else evening.push(slot);
      }
    });
    return { morning, evening };
  };

  const handleBook = async () => {
    if (!patientDetails.name || !patientDetails.phone || !patientDetails.age || !patientDetails.gender) {
      alert("Please fill all details");
      return;
    }
    setIsBooking(true);
    try {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicSlug: slug,
          serviceId: selectedService._id,
          patientName: patientDetails.name,
          patientPhone: patientDetails.phone,
          patientEmail: patientDetails.email,
          patientAge: patientDetails.age,
          patientGender: patientDetails.gender,
          date: dateStr,
          timeSlot: selectedSlot
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingResult(data.appointment);
        setStep(4);
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      alert("Something went wrong");
    }
    setIsBooking(false);
  };

  const formatDate = (d) => {
    if (!d) return "Today";
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split("-").map(Number);
      const dateObj = new Date(y, m - 1, day);
      return isNaN(dateObj.getTime()) ? d : dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    }
    const dateObj = new Date(d);
    return isNaN(dateObj.getTime()) ? String(d) : dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  // Lightweight poll every 5 seconds when in Step 4 to detect Doctor Approval
  useEffect(() => {
    if (step !== 4 || !bookingResult?._id) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/appointments/status?id=${bookingResult._id}`);
        const data = await res.json();
        if (data.success && data.appointment && isSubscribed) {
          setBookingResult(prev => ({ 
            ...prev, 
            ...data.appointment, 
            status: data.appointment.status || data.status 
          }));
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [step, bookingResult?._id]);

  const { morning, evening } = groupSlots(availableSlots);

  // Render Step 4 (Approval Workflow Screen)
  if (step === 4 && bookingResult) {
    const formattedConfirmedDate = formatDate(bookingResult.appointmentDate || bookingResult.date || selectedDate);
    const tokenNumber = bookingResult.tokenNumber || (bookingResult._id ? bookingResult._id.slice(-4).toUpperCase() : "101");
    const currentStatus = (bookingResult.status || "PENDING").toUpperCase();
    const isApproved = currentStatus === "CONFIRMED";
    const isCancelled = currentStatus === "CANCELLED";

    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header Card according to Status */}
          <div 
            className="text-white p-6 sm:p-8 text-center transition-all duration-500" 
            style={{ 
              backgroundColor: isApproved ? primaryColor : isCancelled ? "#e11d48" : "#d97706" 
            }}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              {isApproved ? (
                <CheckCircle2 className="w-8 h-8" style={{ color: primaryColor }} />
              ) : isCancelled ? (
                <AlertCircle className="w-8 h-8 text-rose-600" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
              )}
            </div>

            {isApproved ? (
              <>
                <div className="inline-block bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
                  ✓ Doctor Approved
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-1.5">Appointment Confirmed!</h2>
                <p className="text-white/95 text-sm font-medium">
                  Your token number is <span className={`text-white font-bold px-2.5 py-0.5 bg-black/20 ${buttonStyle}`}>#{tokenNumber}</span>
                </p>
              </>
            ) : isCancelled ? (
              <>
                <div className="inline-block bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
                  ✕ Request Declined
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-1.5">Appointment Cancelled</h2>
                <p className="text-white/90 text-sm font-medium">
                  {cleanDoctorName} is unable to accept this booking. Please choose another date or time slot.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>Awaiting Doctor Approval</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-1.5">Appointment Request Submitted!</h2>
                <p className="text-white/95 text-sm font-medium max-w-md mx-auto">
                  Your booking request has been sent to <strong className="underline">{cleanDoctorName}</strong>. It will be confirmed shortly.
                </p>
              </>
            )}
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 text-sm">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Patient</p>
                <p className="font-bold text-slate-900">{bookingResult.patientName}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Doctor</p>
                <p className="font-bold text-slate-900">{cleanDoctorName}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                <p className="font-bold text-slate-900">{formattedConfirmedDate}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Requested Slot</p>
                <p className="font-bold text-slate-900">{bookingResult.timeSlot}</p>
              </div>
            </div>

            {/* Real-Time Status Notification Banner */}
            {!isApproved && !isCancelled && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-800 font-medium">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                  <span>Checking for approval updates in real-time...</span>
                </div>
                <span className="font-bold bg-amber-200/60 px-2 py-0.5 rounded-full text-[10px]">Auto-refreshing</span>
              </div>
            )}

            {isCancelled && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`w-full py-3 ${buttonStyle} text-white font-bold text-sm shadow-md transition-all`}
                  style={{ backgroundColor: primaryColor }}
                >
                  Select Another Slot →
                </button>
              </div>
            )}

            {/* Back Link */}
            <div className="pt-2 text-center">
              <Link 
                href={`/${slug}`} 
                className="w-full inline-block text-center py-2 font-bold text-sm hover:underline transition-all" 
                style={{ color: primaryColor }}
              >
                ← Back to Clinic Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-slate-150">
      
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-4 relative max-w-md mx-auto px-4">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0 rounded-full"></div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 z-0 rounded-full transition-all duration-500" style={{ backgroundColor: primaryColor, width: `${(step - 1) * 45}%` }}></div>
        
        <div className="relative z-10 flex flex-col items-center bg-white px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step >= 1 ? 'text-white shadow-sm' : 'bg-slate-100 border-white text-slate-400'}`} style={step >= 1 ? { backgroundColor: primaryColor, borderColor: `${primaryColor}40` } : {}}>1</div>
          <span className="text-[11px] font-bold text-slate-600 mt-1">Service</span>
        </div>
        <div className="relative z-10 flex flex-col items-center bg-white px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step >= 2 ? 'text-white shadow-sm' : 'bg-slate-100 border-white text-slate-400'}`} style={step >= 2 ? { backgroundColor: primaryColor, borderColor: `${primaryColor}40` } : {}}>2</div>
          <span className="text-[11px] font-bold text-slate-600 mt-1">Date & Time</span>
        </div>
        <div className="relative z-10 flex flex-col items-center bg-white px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step >= 3 ? 'text-white shadow-sm' : 'bg-slate-100 border-white text-slate-400'}`} style={step >= 3 ? { backgroundColor: primaryColor, borderColor: `${primaryColor}40` } : {}}>3</div>
          <span className="text-[11px] font-bold text-slate-600 mt-1">Details</span>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        
        {/* Left Area - Step Selector */}
        <div className="flex-1 min-w-0">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">Select Service</h2>
              <div className="space-y-2.5">
                {services.map(service => (
                  <div 
                    key={service._id} 
                    onClick={() => setSelectedService(service)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${selectedService?._id === service._id ? 'shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`} 
                    style={selectedService?._id === service._id ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : {}}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedService?._id === service._id ? '' : 'border-slate-300'}`} style={selectedService?._id === service._id ? { borderColor: primaryColor } : {}}>
                          {selectedService?._id === service._id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                          <span className="text-xs font-semibold text-slate-500">{service.durationMins} Mins Consultation</span>
                        </div>
                      </div>
                      <span className="text-lg font-black" style={{ color: primaryColor }}>₹{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!selectedService} 
                  className={`flex items-center gap-2 text-white font-bold px-7 py-2.5 ${buttonStyle} disabled:opacity-50 transition-all shadow-md text-sm active:scale-95`} 
                  style={{ backgroundColor: primaryColor }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Choose Date & Time</h2>
              
              {/* Date Picker Row */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Date</h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollDates(-140)}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
                      title="Previous Days"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollDates(140)}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
                      title="Next Days"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div 
                  ref={dateScrollRef}
                  className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 scroll-smooth snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {nextDays.map((d, i) => {
                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateNum = d.getDate();
                    const month = d.toLocaleDateString('en-US', { month: 'short' });
                    return (
                      <button
                        type="button"
                        key={i} 
                        onClick={() => fetchSlots(d)}
                        className={`snap-center flex-shrink-0 cursor-pointer w-14 sm:w-16 py-2 rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                          isSelected 
                            ? 'text-white shadow-md scale-105 ring-2 ring-offset-1' 
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                        }`} 
                        style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor, ringColor: primaryColor } : {}}
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>{month}</span>
                        <span className="text-base sm:text-lg font-black my-0.5 leading-none">{dateNum}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>{dayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots Section */}
              {selectedDate && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} /> Available Slots
                    </h3>
                    {slotsLoading && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} />
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>
                  
                  {isClosed || (availableSlots.length > 0 && !availableSlots.some(s => !isSlotInPast(selectedDate, s))) || (availableSlots.length === 0 && !slotsLoading) ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center shadow-sm space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>⚠️ Today&apos;s booking slots are completely full. Please choose the next available day.</span>
                      </div>
                      <p className="text-xs text-amber-700/90 font-medium">
                        {isClosed 
                          ? "Clinic is closed on this day." 
                          : "All appointment slots for this date have either passed or are fully booked."}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const curIdx = nextDays.findIndex(d => d.toDateString() === selectedDate?.toDateString());
                          const nextDay = nextDays[curIdx + 1] || nextDays[1] || nextDays[0];
                          if (nextDay) {
                            fetchSlots(nextDay);
                            scrollDates(100);
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Book for Tomorrow (Next Available Date) →</span>
                      </button>
                    </div>
                  ) : (
                    <div className={`bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3 sm:p-4 space-y-3 transition-opacity duration-200 ${slotsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      {morning.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Morning</h4>
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 my-1.5">
                            {morning.map(s => {
                              const isPast = isSlotInPast(selectedDate, s);
                              const isSelected = selectedSlot === s;

                              return (
                                <button 
                                  key={s} 
                                  disabled={isPast}
                                  onClick={() => {
                                    if (!isPast) setSelectedSlot(s);
                                  }} 
                                  className={`py-2 px-2.5 text-xs rounded-xl border text-center transition-all ${
                                    isPast 
                                      ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through opacity-60 pointer-events-none font-medium"
                                      : isSelected 
                                      ? "text-white font-bold shadow-md scale-[1.02]"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer font-semibold"
                                  }`}
                                  style={isSelected && !isPast ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {evening.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Afternoon / Evening</h4>
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 my-1.5">
                            {evening.map(s => {
                              const isPast = isSlotInPast(selectedDate, s);
                              const isSelected = selectedSlot === s;

                              return (
                                <button 
                                  key={s} 
                                  disabled={isPast}
                                  onClick={() => {
                                    if (!isPast) setSelectedSlot(s);
                                  }} 
                                  className={`py-2 px-2.5 text-xs rounded-xl border text-center transition-all ${
                                    isPast 
                                      ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through opacity-60 pointer-events-none font-medium"
                                      : isSelected 
                                      ? "text-white font-bold shadow-md scale-[1.02]"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer font-semibold"
                                  }`}
                                  style={isSelected && !isPast ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="mt-4 flex justify-between items-center">
                <button onClick={() => setStep(1)} className="font-bold text-xs text-slate-500 hover:text-slate-900 transition-colors">
                  ← Back
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!selectedSlot} 
                  className={`flex items-center gap-2 text-white font-bold px-7 py-2.5 ${buttonStyle} disabled:opacity-50 transition-all shadow-md text-sm active:scale-95`} 
                  style={{ backgroundColor: primaryColor }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">Patient Details</h2>
              <div className="bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-all font-medium text-sm text-slate-900 bg-white" placeholder="e.g. John Doe" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">+91</span>
                      <input type="tel" value={patientDetails.phone} onChange={e => setPatientDetails({...patientDetails, phone: e.target.value})} className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-all font-medium text-sm text-slate-900 bg-white" placeholder="9876543210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                    <input type="email" value={patientDetails.email} onChange={e => setPatientDetails({...patientDetails, email: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-all font-medium text-sm text-slate-900 bg-white" placeholder="e.g. you@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input type="number" value={patientDetails.age} onChange={e => setPatientDetails({...patientDetails, age: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-all font-medium text-sm text-slate-900 bg-white" placeholder="Years" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select value={patientDetails.gender} onChange={e => setPatientDetails({...patientDetails, gender: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-all font-medium text-sm text-slate-900 bg-white">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="mt-4 flex justify-between items-center">
                <button onClick={() => setStep(2)} className="font-bold text-xs text-slate-500 hover:text-slate-900 transition-colors">
                  ← Back
                </button>
                <button 
                  onClick={handleBook} 
                  disabled={isBooking} 
                  className={`flex items-center gap-2 text-white font-extrabold px-7 py-3 ${buttonStyle} hover:opacity-95 disabled:opacity-70 transition-all shadow-md text-sm active:scale-95`} 
                  style={{ backgroundColor: primaryColor }}
                >
                  {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirm & Book • ₹{selectedService?.price}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Area - Sticky Summary */}
        <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-6 bg-slate-50/60 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4" style={{ color: primaryColor }} /> Booking Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Clinic</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                  <p className="font-bold text-slate-900">{clinic.name}</p>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Doctor</p>
                <div className="flex items-start gap-1.5">
                  <User className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                  <p className="font-bold text-slate-900">{cleanDoctorName}</p>
                </div>
              </div>

              {(selectedService || selectedDate || selectedSlot) && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  {selectedService && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Service</p>
                      <p className="font-bold text-slate-900">{selectedService.name}</p>
                    </div>
                  )}
                  {selectedDate && selectedSlot && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Schedule</p>
                      <p className={`font-bold px-2 py-1 ${buttonStyle} inline-block text-xs`} style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric'})} at {selectedSlot}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-xs text-slate-500">Total Fee</span>
              <span className="text-xl font-black" style={{ color: primaryColor }}>₹{selectedService?.price || 0}</span>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-slate-200 flex items-center gap-2.5">
              <Phone className="w-6 h-6 p-1 rounded-full bg-slate-100 text-slate-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400">Clinic Helpline</p>
                <p className="font-bold text-xs text-slate-900">{clinic.phone}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function BookingClientWrapper(props) {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>}>
      <BookingWizard {...props} />
    </Suspense>
  );
}

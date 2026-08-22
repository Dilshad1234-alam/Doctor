"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Clock, Calendar, User, Phone, MapPin, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, AlertCircle, Share2, Printer
} from 'lucide-react';

function BookingWizard({ clinic, doctor, services, availability, slug, embedded }) {
  const searchParams = useSearchParams();
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

  // Generate next 14 days
  const nextDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchSlots = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);
    
    // Format YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    try {
      const res = await fetch(`/api/appointments/slots?clinicSlug=${slug}&date=${dateStr}`);
      const json = await res.json();
      if (json.success) {
        setAvailableSlots(json.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
    }
    setSlotsLoading(false);
  };

  const groupSlots = (slots) => {
    const morning = [];
    const evening = [];
    slots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (hour < 12) morning.push(slot);
      else evening.push(slot);
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
          date: selectedDate.toISOString().split('T')[0],
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

  const { morning, evening } = groupSlots(availableSlots);

  // Render Step 4
  if (step === 4 && bookingResult) {
    return (
      <div className={`${embedded ? 'py-12 px-4' : 'min-h-screen bg-slate-50 py-12 px-4'}`}>
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 overflow-hidden">
          <div className="bg-emerald-500 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black mb-2">Appointment Confirmed!</h2>
            <p className="text-emerald-100 font-medium">Your token number is <span className="text-white font-bold bg-emerald-600 px-2 py-0.5 rounded">#{bookingResult.tokenNumber || bookingResult._id.slice(-4).toUpperCase()}</span></p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient</p>
                <p className="font-semibold text-slate-900">{bookingResult.patientName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-semibold text-slate-900">{doctor?.fullName || 'Doctor'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                <p className="font-semibold text-slate-900">{new Date(bookingResult.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric'})}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Time</p>
                <p className="font-semibold text-slate-900">{bookingResult.timeSlot}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                <Printer className="w-4 h-4" /> Print Slip
              </button>
              <button onClick={() => window.open(`https://wa.me/?text=My appointment with ${doctor?.fullName} is confirmed for ${new Date(bookingResult.date).toLocaleDateString('en-IN')} at ${bookingResult.timeSlot}.`, '_blank')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-sm">
                <Share2 className="w-4 h-4" /> WhatsApp
              </button>
            </div>
            <button onClick={() => window.location.href = `/${slug}`} className="w-full text-center py-3 text-blue-600 font-bold hover:underline">
              Back to Clinic Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? 'bg-transparent' : 'min-h-screen bg-slate-50'} flex flex-col md:flex-row`}>
      
      {/* Left Area - Wizard */}
      <div className={`flex-1 ${embedded ? 'p-6 sm:p-10' : 'px-4 py-8 md:p-12'} overflow-y-auto`}>
        <div className="max-w-2xl mx-auto">
          
          {!embedded && (
            <button onClick={() => window.location.href = `/${slug}`} className="mb-8 flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clinic
            </button>
          )}

          {/* Stepper */}
          <div className="flex items-center justify-between mb-10 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }}></div>
            
            <div className="relative z-10 flex flex-col items-center bg-slate-50 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 1 ? 'bg-blue-600 border-blue-100 text-white shadow-sm' : 'bg-slate-100 border-white text-slate-400'}`}>1</div>
              <span className="absolute -bottom-6 whitespace-nowrap text-xs font-bold text-slate-600">Service</span>
            </div>
            <div className="relative z-10 flex flex-col items-center bg-slate-50 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 2 ? 'bg-blue-600 border-blue-100 text-white shadow-sm' : 'bg-slate-100 border-white text-slate-400'}`}>2</div>
              <span className="absolute -bottom-6 whitespace-nowrap text-xs font-bold text-slate-600">Date & Time</span>
            </div>
            <div className="relative z-10 flex flex-col items-center bg-slate-50 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 3 ? 'bg-blue-600 border-blue-100 text-white shadow-sm' : 'bg-slate-100 border-white text-slate-400'}`}>3</div>
              <span className="absolute -bottom-6 whitespace-nowrap text-xs font-bold text-slate-600">Details</span>
            </div>
          </div>

          <div className="mt-16">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-black text-slate-900 mb-6">Select Service</h2>
                <div className="space-y-4">
                  {services.map(service => (
                    <div 
                      key={service._id} 
                      onClick={() => setSelectedService(service)}
                      className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${selectedService?._id === service._id ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 items-start">
                          <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedService?._id === service._id ? 'border-blue-600' : 'border-slate-300'}`}>
                            {selectedService?._id === service._id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
                            <span className="inline-block mt-2 bg-white px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 border border-slate-200">{service.durationMins} Mins</span>
                          </div>
                        </div>
                        <span className="text-xl font-black text-blue-600">₹{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(2)} disabled={!selectedService} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-black text-slate-900 mb-6">Choose Date & Time</h2>
                
                {/* Date Picker */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Select Date</h3>
                  <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {nextDays.map((d, i) => {
                      const isSelected = selectedDate?.toDateString() === d.toDateString();
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateNum = d.getDate();
                      const month = d.toLocaleDateString('en-US', { month: 'short' });
                      return (
                        <div 
                          key={i} 
                          onClick={() => fetchSlots(d)}
                          className={`snap-center flex-shrink-0 cursor-pointer w-20 py-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 shadow-sm'}`}
                        >
                          <span className={`text-xs font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{month}</span>
                          <span className="text-2xl font-black my-0.5">{dateNum}</span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{dayName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Slots */}
                {selectedDate && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> Available Slots
                    </h3>
                    
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                        <h4 className="text-amber-800 font-bold mb-1">No slots available</h4>
                        <p className="text-sm text-amber-700">The clinic is either closed or all slots are booked on this date. Please select another date.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        {morning.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Morning</h4>
                            <div className="flex flex-wrap gap-3">
                              {morning.map(s => (
                                <button key={s} onClick={() => setSelectedSlot(s)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedSlot === s ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-300'}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {evening.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Afternoon / Evening</h4>
                            <div className="flex flex-wrap gap-3">
                              {evening.map(s => (
                                <button key={s} onClick={() => setSelectedSlot(s)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedSlot === s ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-300'}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="font-bold text-slate-500 hover:text-slate-900 transition-colors">Back</button>
                  <button onClick={() => setStep(3)} disabled={!selectedSlot} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-black text-slate-900 mb-6">Patient Details</h2>
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input type="text" value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" placeholder="e.g. John Doe" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
                        <input type="tel" value={patientDetails.phone} onChange={e => setPatientDetails({...patientDetails, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" placeholder="9876543210" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email (Optional)</label>
                      <input type="email" value={patientDetails.email} onChange={e => setPatientDetails({...patientDetails, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" placeholder="e.g. you@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                      <input type="number" value={patientDetails.age} onChange={e => setPatientDetails({...patientDetails, age: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" placeholder="Years" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                      <select value={patientDetails.gender} onChange={e => setPatientDetails({...patientDetails, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900 bg-white">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                </div>

                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="font-bold text-slate-500 hover:text-slate-900 transition-colors">Back</button>
                  <button onClick={handleBook} disabled={isBooking} className="flex items-center gap-2 bg-green-600 text-white font-extrabold px-8 py-4 rounded-xl hover:bg-green-700 disabled:opacity-70 transition-all shadow-md hover:shadow-lg text-lg">
                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Confirm & Book • ₹{selectedService?.price}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Area - Sticky Summary */}
      <div className="hidden md:block w-[400px] border-l border-slate-200 bg-white p-8">
        <div className="sticky top-8 space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Calendar className="w-5 h-5 text-blue-600" /> Booking Summary
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                <p className="font-bold text-slate-900">{clinic.name}</p>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor</p>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                <p className="font-bold text-slate-900">{doctor?.fullName || 'Doctor'}</p>
              </div>
            </div>

            {(selectedService || selectedDate || selectedSlot) && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                {selectedService && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Service</p>
                    <p className="font-bold text-slate-900">{selectedService.name}</p>
                  </div>
                )}
                {selectedDate && selectedSlot && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Schedule</p>
                    <p className="font-bold text-slate-900 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                      {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric'})} at {selectedSlot}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-slate-500">Total Fee</span>
              <span className="text-2xl font-black text-slate-900">₹{selectedService?.price || 0}</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
              <Phone className="w-8 h-8 p-1.5 rounded-full bg-slate-200 text-slate-600" />
              <div>
                <p className="text-xs font-bold text-slate-500">Need help?</p>
                <p className="font-bold text-slate-900">{clinic.phone}</p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
      <BookingWizard {...props} />
    </Suspense>
  );
}

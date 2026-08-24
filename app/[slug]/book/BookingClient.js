"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, ArrowLeft, Loader2, ChevronRight, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function BookingClient({ clinic, services, slug }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Form State
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patient, setPatient] = useState({ name: "", phone: "", age: "", gender: "Male" });
  const [appointment, setAppointment] = useState(null);

  // Helper: Check if slot time is in the past for today
  const isSlotInPast = (selectedDateStr, slotTimeString) => {
    if (!selectedDateStr || !slotTimeString) return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // If selected date is in the future, all slots are valid
    if (selectedDateStr > todayStr) return false;
    // If selected date is in the past, all slots are disabled/hidden
    if (selectedDateStr < todayStr) return true;

    // If selected date is TODAY, compare slot time with current time
    const parts = slotTimeString.trim().split(' ');
    if (parts.length < 2) return false;
    const time = parts[0];
    const modifier = parts[1].toUpperCase();
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const slotDateTime = new Date();
    slotDateTime.setHours(hours, minutes, 0, 0);

    return slotDateTime <= now;
  };

  const slotsCacheRef = React.useRef({});

  // Fetch slots when date or service changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      if (slotsCacheRef.current[selectedDate]) {
        setAvailableSlots(slotsCacheRef.current[selectedDate]);
        setSlotsLoading(false);
        return;
      }

      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const res = await fetch(`/api/appointments/slots?clinicSlug=${slug}&date=${selectedDate}&serviceId=${selectedService}`);
          const data = await res.json();
          if (res.ok) {
            const slots = data.slots || [];
            slotsCacheRef.current[selectedDate] = slots;
            setAvailableSlots(slots);
          } else {
            setAvailableSlots([]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, selectedService, slug]);

  const handleBook = async () => {
    if (!patient.name || !patient.phone || !patient.age) {
      setError("Please fill all patient details.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicSlug: slug,
          serviceId: selectedService,
          patientName: patient.name,
          patientPhone: patient.phone,
          patientAge: patient.age,
          patientGender: patient.gender,
          date: selectedDate,
          timeSlot: selectedSlot
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setAppointment(data.appointment);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href={`/${slug}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clinic
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Book Appointment</h2>
          <p className="mt-2 text-slate-600">{clinic.name}</p>
        </div>

        {/* Wizard Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Progress Bar */}
          {step < 4 && (
            <div className="flex border-b border-slate-100">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${step >= s ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
                  Step {s}
                </div>
              ))}
            </div>
          )}

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Select Service</h3>
                </div>
                
                <div className="space-y-3">
                  {services.map(service => (
                    <button 
                      key={service._id} 
                      onClick={() => setSelectedService(service._id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedService === service._id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-slate-900">{service.name}</div>
                        <div className="text-blue-600 font-bold">₹{service.price}</div>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{service.durationMins} Mins Consultation</div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedService}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Choose Date & Time</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    min={today}
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>

                {selectedDate && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                      Available Slots
                      {slotsLoading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    </label>
                    
                    {!slotsLoading && availableSlots.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm text-center">
                        No slots available for this date. Please choose another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {availableSlots.map(slot => {
                          const isPast = isSlotInPast(selectedDate, slot);
                          const isSelected = selectedSlot === slot;

                          return (
                            <button
                              key={slot}
                              disabled={isPast}
                              onClick={() => {
                                if (!isPast) setSelectedSlot(slot);
                              }}
                              className={`py-2.5 px-3 text-center text-xs rounded-xl border transition-all ${
                                isPast 
                                  ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through opacity-60 pointer-events-none font-medium"
                                  : isSelected 
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md font-bold"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600 cursor-pointer font-semibold"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">Back</button>
                  <button 
                    onClick={() => setStep(3)} 
                    disabled={!selectedDate || !selectedSlot}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Patient Info */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Patient Details</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter patient's name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" value={patient.phone} onChange={e => setPatient({...patient, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10-digit mobile number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input type="number" value={patient.age} onChange={e => setPatient({...patient, age: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Years" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Selected Slot</p>
                    <p className="font-semibold text-slate-900">{new Date(selectedDate).toLocaleDateString()} at {selectedSlot}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-sm text-blue-600 font-medium hover:underline">Edit</button>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(2)} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium">Back</button>
                  <button 
                    onClick={handleBook} 
                    disabled={loading}
                    className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Confirm Booking</>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Approval Status */}
            {step === 4 && appointment && (() => {
              const isApproved = appointment.status === 'CONFIRMED';
              const isCancelled = appointment.status === 'CANCELLED';
              const tokenNumber = appointment.tokenNumber || (appointment._id ? appointment._id.slice(-4).toUpperCase() : "101");

              return (
                <div className="text-center py-8 animate-in zoom-in duration-500">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${
                    isApproved ? 'bg-emerald-100 text-emerald-600' : isCancelled ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {isApproved ? <CheckCircle2 className="w-10 h-10" /> : isCancelled ? <AlertCircle className="w-10 h-10" /> : <Clock className="w-10 h-10 animate-pulse" />}
                  </div>

                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    {isApproved ? `Appointment Confirmed! Token #${tokenNumber}` : isCancelled ? "Appointment Cancelled" : "Appointment Request Submitted!"}
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    {isApproved 
                      ? "Your consultation has been confirmed by the doctor." 
                      : isCancelled 
                      ? "The doctor was unable to accept this booking. Please select another slot." 
                      : `Your booking request has been sent to ${clinic.name}. It will be confirmed shortly.`}
                  </p>
                  
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left max-w-sm mx-auto mb-8 shadow-inner">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Name</p>
                        <p className="font-medium text-slate-900">{appointment.patientName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</p>
                          <p className="font-medium text-slate-900">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested Time</p>
                          <p className="font-medium text-slate-900 text-blue-600">{appointment.timeSlot}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                          isApproved ? 'bg-emerald-100 text-emerald-700' : isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {appointment.status || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/${slug}`} className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-md">
                    Back to Clinic Home
                  </Link>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Clock, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clinic, setClinic] = useState({
    name: "",
    slug: "",
    phone: "",
    address: "",
    city: ""
  });

  const [doctor, setDoctor] = useState({
    fullName: "",
    qualification: "",
    specialization: "",
    experienceYrs: ""
  });

  const [service, setService] = useState({
    name: "OPD Consultation",
    price: "",
    durationMins: "15"
  });

  // Default Mon-Sat 9AM-5PM, Sun Closed
  const [availability, setAvailability] = useState(
    Array.from({ length: 7 }).map((_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "17:00",
      isClosed: i === 0 // Sunday closed by default
    }))
  );

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleClinicChange = (e) => {
    const { name, value } = e.target;
    setClinic(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
    setError("");
  };

  const handleDoctorChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
    setError("");
  };

  const handleServiceChange = (e) => {
    setService({ ...service, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvail = [...availability];
    newAvail[index][field] = value;
    setAvailability(newAvail);
  };

  const validateStep1 = () => {
    if (!clinic.name || !clinic.phone || !clinic.address || !clinic.city) {
      setError("Please fill all clinic details.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!doctor.fullName || !doctor.qualification || !doctor.specialization || !doctor.experienceYrs) {
      setError("Please fill all doctor details.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!service.price) {
      setError("Please enter a consultation fee.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clinic/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, doctor, service, availability })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");

      // Success
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Set Up Your Digital Clinic</h2>
          <p className="mt-2 text-sm text-slate-600">Complete these 3 simple steps to get started</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 1 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-slate-100 border-white text-slate-400'}`}>1</div>
              <span className="mt-2 text-xs font-semibold text-slate-600">Clinic</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 2 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-slate-100 border-white text-slate-400'}`}>2</div>
              <span className="mt-2 text-xs font-semibold text-slate-600">Doctor</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 3 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-slate-100 border-white text-slate-400'}`}>3</div>
              <span className="mt-2 text-xs font-semibold text-slate-600">Timings & Fee</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-slate-800">Clinic Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                  <input type="text" name="name" value={clinic.name} onChange={handleClinicChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. City Care Hospital" />
                  {clinic.slug && <p className="text-xs text-green-600 mt-1">URL: {clinic.slug}.docpulse.com</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={clinic.phone} onChange={handleClinicChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Clinic Contact No." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" name="city" value={clinic.city} onChange={handleClinicChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="New Delhi" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                  <textarea name="address" value={clinic.address} onChange={handleClinicChange} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Street, Locality, Landmark..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-slate-800">Doctor Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (with Title)</label>
                  <input type="text" name="fullName" value={doctor.fullName} onChange={handleDoctorChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dr. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                  <input type="text" name="specialization" value={doctor.specialization} onChange={handleDoctorChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Cardiologist" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
                  <input type="text" name="qualification" value={doctor.qualification} onChange={handleDoctorChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="MBBS, MD" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
                  <input type="number" name="experienceYrs" value={doctor.experienceYrs} onChange={handleDoctorChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10" min="0" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-slate-800">Timings & OPD Fee</h3>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (₹)</label>
                      <input type="number" name="price" value={service.price} onChange={handleServiceChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="500" min="0" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Slot Duration (Mins)</label>
                      <select name="durationMins" value={service.durationMins} onChange={handleServiceChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                         <option value="10">10 Mins</option>
                         <option value="15">15 Mins</option>
                         <option value="20">20 Mins</option>
                         <option value="30">30 Mins</option>
                      </select>
                   </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Weekly Schedule</h4>
                <div className="space-y-3">
                  {availability.map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center gap-3 w-32">
                        <input type="checkbox" checked={!day.isClosed} onChange={(e) => handleAvailabilityChange(idx, "isClosed", !e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <span className={`text-sm font-medium ${day.isClosed ? 'text-slate-400' : 'text-slate-700'}`}>{days[idx]}</span>
                      </div>
                      
                      {!day.isClosed ? (
                        <div className="flex items-center gap-2">
                          <input type="time" value={day.startTime} onChange={(e) => handleAvailabilityChange(idx, "startTime", e.target.value)} className="text-sm border border-slate-300 rounded-md px-2 py-1 outline-none focus:border-blue-500" />
                          <span className="text-slate-400">-</span>
                          <input type="time" value={day.endTime} onChange={(e) => handleAvailabilityChange(idx, "endTime", e.target.value)} className="text-sm border border-slate-300 rounded-md px-2 py-1 outline-none focus:border-blue-500" />
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
            {step > 1 ? (
              <button onClick={prevStep} type="button" className="flex items-center px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button onClick={nextStep} type="button" className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} type="button" className="flex items-center px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-70">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Complete Setup</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

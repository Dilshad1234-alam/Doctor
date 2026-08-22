import React from 'react';
import connectDB from '../../backend/config/db.js';
import Clinic from '../../backend/models/Clinic.js';
import DoctorProfile from '../../backend/models/DoctorProfile.js';
import Service from '../../backend/models/Service.js';
import Availability from '../../backend/models/Availability.js';
import { MapPin, Phone, Clock, Stethoscope, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

async function getClinicData(slug) {
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  if (!clinic) return null;

  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  const services = await Service.find({ clinicId: clinic._id, isActive: true }).lean();
  const availability = await Availability.find({ clinicId: clinic._id }).lean();
  
  return { clinic, doctor, services, availability };
}

export default async function ClinicPage(props) {
  const params = await props.params;
  const slug = params?.slug;
  
  console.log(`[SLUG ROUTE] Looking up clinic slug: ${slug}`);
  
  const data = await getClinicData(slug);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">Clinic Not Found</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          We couldn't find a clinic with the URL slug "<strong>{slug}</strong>". Please check your URL or if you are a doctor, make sure you have completed the onboarding process.
        </p>
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm">
          Doctor Login
        </Link>
      </div>
    );
  }

  const { clinic, doctor, services, availability } = data;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Banner */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{clinic.name}</h1>
          <p className="text-blue-100 text-lg md:text-xl flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" /> {clinic.address}, {clinic.city}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Doctor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{doctor?.fullName || 'Dr. Name'}</h2>
                  <p className="text-blue-600 font-medium text-lg">{doctor?.specialization}</p>
                  <p className="text-slate-600 mt-2">{doctor?.qualification}</p>
                  <p className="text-slate-600 mt-1">{doctor?.experienceYrs} Years of Experience</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Services Offered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(service => (
                  <div key={service._id.toString()} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{service.name}</h4>
                      <p className="text-slate-500 text-sm mt-1">₹{service.price} • {service.durationMins} Mins</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Book Appointment</h3>
              <p className="text-slate-600 text-sm mb-6">Skip the waiting room. Book your consultation online.</p>
              <Link href={`/${clinic.slug}/book`} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg">
                Book Now <ArrowRight className="w-4 h-4" />
              </Link>
              
              <hr className="my-6 border-slate-100" />
              
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{clinic.phone}</span>
              </div>
            </div>

            {/* Timings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">OPD Timings</h3>
              </div>
              <div className="space-y-3 text-sm">
                {availability.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(day => (
                  <div key={day._id.toString()} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <span className="text-slate-600">{days[day.dayOfWeek]}</span>
                    {day.isClosed ? (
                      <span className="text-red-500 font-medium">Closed</span>
                    ) : (
                      <span className="text-slate-900 font-medium">{day.startTime} - {day.endTime}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

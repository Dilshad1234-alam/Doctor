import React from 'react';
import connectDB from '../../backend/config/db.js';
import Clinic from '../../backend/models/Clinic.js';
import DoctorProfile from '../../backend/models/DoctorProfile.js';
import Service from '../../backend/models/Service.js';
import Availability from '../../backend/models/Availability.js';
import PublicNavbar from '../../frontend/components/clinic/PublicNavbar.js';
import BookingClientWrapper from '../../frontend/components/booking/BookingClient.js';
import { 
  MapPin, Phone, Clock, Stethoscope, ArrowRight, CheckCircle2, 
  AlertTriangle, ShieldCheck, Heart, Sparkles, PhoneCall, User, Mail, Navigation, Calendar
} from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug;
  
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  if (!clinic) return { title: 'Clinic Not Found' };
  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  
  const docName = doctor?.fullName || 'Doctor';
  const spec = doctor?.specialization || 'Specialist';
  const qual = doctor?.qualification || 'Medical Professional';

  return {
    title: `${docName} | ${clinic.name} - Online OPD Booking`,
    description: `Consult ${docName} (${spec}, ${qual}) at ${clinic.name}, ${clinic.address}. Book instant confirmed OPD slot.`,
    keywords: `OPD booking, ${clinic.name}, ${clinic.city}, ${spec}, doctor appointment`
  };
}

async function getClinicData(slug) {
  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  if (!clinic) return null;

  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  const services = await Service.find({ clinicId: clinic._id, isActive: true }).lean();
  const availability = await Availability.find({ clinicId: clinic._id }).lean();
  
  return { clinic, doctor, services, availability };
}

function isClinicOpenToday(availability, currentDay) {
  const todayAvail = availability.find(a => a.dayOfWeek === currentDay);
  if (!todayAvail || todayAvail.isClosed) return false;
  return true;
}

export default async function ClinicPage(props) {
  const params = await props.params;
  const slug = params?.slug;
  
  const data = await getClinicData(slug);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">Clinic Not Found</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          We couldn't find a clinic with the URL slug "<strong>{slug}</strong>".
        </p>
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm">
          Doctor Login
        </Link>
      </div>
    );
  }

  const { clinic, doctor, services, availability } = data;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const currentDayIndex = new Date().getDay();
  const isOpenToday = isClinicOpenToday(availability, currentDayIndex);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 scroll-smooth">
      <PublicNavbar clinic={clinic} />

      {/* Section 1: Hero (#home) */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white pt-20 pb-32 px-4 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verified Medical Professional
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              {doctor?.fullName || 'Doctor'}
            </h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">{doctor?.specialization}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctor?.qualification}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctor?.experienceYrs}+ Yrs Exp</span>
            </div>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
              Providing premium healthcare and expert consultations at <strong>{clinic.name}</strong>. Book your online appointment to skip the waiting room.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a href="#book" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-black text-lg transition-all shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-105">
                Book Appointment <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#about" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/20">
                Learn More
              </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className="w-full max-w-sm shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-3xl shadow-2xl">
              <div className="bg-slate-900 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent"></div>
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-slate-800 flex items-center justify-center relative z-10 shadow-xl mb-6">
                  <User className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white relative z-10">{doctor?.fullName || 'Doctor'}</h3>
                <p className="text-blue-400 font-medium mt-1 relative z-10">{doctor?.specialization}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 relative z-10">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Experience</p>
                    <p className="text-xl font-black text-white">{doctor?.experienceYrs} Years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Reg. No</p>
                    <p className="text-xl font-black text-white">#Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
        
        {/* Section 2: About Doctor (#about) */}
        <section id="about" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-sm mb-4">
                <Heart className="w-5 h-5 fill-blue-100" /> About The Doctor
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Dedicated to providing world-class healthcare.</h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed font-medium">
                <p>
                  {doctor?.fullName || 'Our Doctor'} is a highly experienced and dedicated medical professional specializing in {doctor?.specialization}. 
                  With over {doctor?.experienceYrs} years of clinical practice, they have helped thousands of patients in {clinic.city} lead healthier lives.
                </p>
                <p>
                  Holding top qualifications including {doctor?.qualification}, they are committed to providing ethical, transparent, and compassionate care. 
                  At {clinic.name}, the focus is always on patient-first treatments and long-term well-being.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-bold text-slate-900 text-xl mb-2">10k+ Patients</h4>
                <p className="text-slate-500 text-sm">Successfully treated and managed over the years.</p>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <Sparkles className="w-10 h-10 text-blue-500 mb-4" />
                <h4 className="font-bold text-slate-900 text-xl mb-2">Top Rated</h4>
                <p className="text-slate-500 text-sm">Highly recommended by patients in {clinic.city}.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Services Offered (#services) */}
        <section id="services" className="scroll-mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-sm mb-4">
              <Stethoscope className="w-5 h-5" /> Treatments & Procedures
            </div>
            <h2 className="text-4xl font-black text-slate-900">Services Offered</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service._id.toString()} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Stethoscope className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-2xl leading-tight pr-4">{service.name}</h4>
                  </div>
                  <div className="flex gap-2 mb-8">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg">{service.durationMins} Mins</span>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg">OPD Consultation</span>
                  </div>
                  <p className="text-4xl font-black text-blue-600 mb-8">₹{service.price}</p>
                </div>
                <a href={`#book`} className="relative z-10 w-full inline-flex items-center justify-center gap-2 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-md">
                  Select & Book <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Clinic Information & OPD Hours (#clinic-info) */}
        <section id="clinic-info" className="scroll-mt-32">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 translate-x-20 z-0 hidden lg:block"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-8">{clinic.name}</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Address</p>
                      <p className="text-slate-600 font-medium mt-1 leading-relaxed max-w-md">{clinic.address}, {clinic.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Direct Phone</p>
                      <p className="text-slate-600 font-medium mt-1">{clinic.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Email Support</p>
                      <p className="text-slate-600 font-medium mt-1">support@{clinic.slug}.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" /> OPD Timings
                  </h3>
                  {isOpenToday ? (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Open
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Closed
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  {availability.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(day => {
                    const isToday = day.dayOfWeek === currentDayIndex;
                    return (
                      <div key={day._id.toString()} className={`flex justify-between items-center p-3 rounded-xl ${isToday ? 'bg-blue-50 border border-blue-100' : ''}`}>
                        <span className={`text-base font-bold ${isToday ? 'text-blue-700' : 'text-slate-600'}`}>{days[day.dayOfWeek]}</span>
                        {day.isClosed ? (
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">CLOSED</span>
                        ) : (
                          <span className={`text-base font-bold ${isToday ? 'text-blue-700' : 'text-slate-900'}`}>{day.startTime} - {day.endTime}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Booking Wizard Inline (#book) */}
        <section id="book" className="scroll-mt-32">
          <div className="bg-slate-900 rounded-[2.5rem] p-4 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Calendar className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-4xl font-black text-white mb-4">Book Your Appointment</h2>
              <p className="text-slate-400 text-lg font-medium">Skip the waiting room. Select your service, date, and time slot to instantly confirm your booking.</p>
            </div>
            
            <div className="relative z-10 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
              <BookingClientWrapper 
                clinic={JSON.parse(JSON.stringify(clinic))} 
                doctor={JSON.parse(JSON.stringify(doctor || {}))} 
                services={JSON.parse(JSON.stringify(services))} 
                availability={JSON.parse(JSON.stringify(availability))}
                slug={slug} 
                embedded={true}
              />
            </div>
          </div>
        </section>

        {/* Section 6: Contact & Location (#contact) */}
        <section id="contact" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Need Help? Get in Touch.</h2>
              <p className="text-lg text-slate-600 font-medium mb-10">Our support team is available to assist you with directions, booking modifications, or any general queries.</p>
              
              <div className="space-y-6">
                <a href={`tel:${clinic.phone}`} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <PhoneCall className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-2xl font-black text-slate-900">{clinic.phone}</p>
                  </div>
                </a>
                
                <a href={`https://maps.google.com/?q=${encodeURIComponent(clinic.address + ' ' + clinic.city)}`} target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <Navigation className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Get Directions</p>
                    <p className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Open in Google Maps</p>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Maps iframe placeholder or styled map card */}
            <div className="bg-slate-200 rounded-[2.5rem] overflow-hidden relative shadow-inner min-h-[400px]">
               <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '400px' }} 
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade" 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.address + ' ' + clinic.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
              <div className="absolute inset-0 bg-slate-800/10 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-red-500" />
                  <span className="font-bold text-slate-900">{clinic.city}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-4 border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-white font-black text-2xl border border-slate-800">
            {clinic.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-black text-white">{clinic.name}</h2>
          <p className="font-bold text-slate-500 text-lg">© {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
          <p className="text-sm max-w-2xl mx-auto font-medium leading-relaxed">
            This clinic uses DocPulse for digital appointment management. The medical information on this page is provided directly by the medical practitioner.
          </p>
          <div className="pt-10 flex items-center justify-center gap-2 text-sm font-bold">
            Powered by <span className="text-white font-black flex items-center gap-1"><Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> DocPulse SaaS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

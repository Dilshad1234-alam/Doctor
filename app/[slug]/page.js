import React from 'react';
import connectDB from '../../backend/config/db.js';
import Clinic from '../../backend/models/Clinic.js';
import DoctorProfile from '../../backend/models/DoctorProfile.js';
import Service from '../../backend/models/Service.js';
import Availability from '../../backend/models/Availability.js';
import WebsiteConfig from '../../backend/models/WebsiteConfig.js';
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
  
  const rawDocName = doctor?.fullName || 'Doctor';
  const cleanDocName = `Dr. ${rawDocName.replace(/^Dr\.?\s*/i, "").trim() || 'Doctor'}`;
  const spec = doctor?.specialization || 'Specialist';
  const qual = doctor?.qualification || 'Medical Professional';

  return {
    title: `${cleanDocName} | ${clinic.name} - Online OPD Booking`,
    description: `Consult ${cleanDocName} (${spec}, ${qual}) at ${clinic.name}, ${clinic.address}. Book instant confirmed OPD slot.`,
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
  const websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id }).lean();
  
  return { clinic, doctor, services, availability, websiteConfig };
}

function isClinicOpenToday(availability, currentDay) {
  const todayAvail = availability.find(a => a.dayOfWeek === currentDay);
  if (!todayAvail) return false;
  const isOpen = todayAvail.isOpen !== undefined ? Boolean(todayAvail.isOpen) : (todayAvail.isClosed !== undefined ? !todayAvail.isClosed : true);
  return isOpen;
}

export default async function ClinicPage(props) {
  const params = await props.params;
  const slug = params?.slug;
  
  const data = await getClinicData(slug);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <AlertTriangle className="w-16 h-16 text-amber-400 mb-6 animate-bounce" />
        <h1 className="text-3xl font-black mb-4 text-center">Clinic Not Found</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md text-sm">
          We couldn&apos;t find an active clinic with the URL slug &ldquo;<strong className="text-white">{slug}</strong>&rdquo;.
        </p>
        <Link href="/login" className="px-6 py-3 bg-teal-500 text-slate-950 rounded-xl font-bold transition-all shadow-md text-sm hover:bg-teal-400">
          Doctor Login
        </Link>
      </div>
    );
  }

  const { clinic, doctor, services, availability, websiteConfig } = data;
  const clinicData = JSON.parse(JSON.stringify(clinic));
  const doctorData = JSON.parse(JSON.stringify(doctor || {}));
  const servicesData = JSON.parse(JSON.stringify(services || []));
  const availabilityData = JSON.parse(JSON.stringify(availability || []));
  const websiteConfigData = websiteConfig ? JSON.parse(JSON.stringify(websiteConfig)) : null;

  const cleanDoctorName = `Dr. ${doctorData?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  const primaryColor = websiteConfigData?.primaryColor || clinicData.websiteConfig?.primaryColor || '#059669';
  const buttonStyle = websiteConfigData?.buttonStyle || clinicData.websiteConfig?.buttonStyle || 'rounded-xl';

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const currentDayIndex = new Date().getDay();
  const isOpenToday = isClinicOpenToday(availabilityData, currentDayIndex);

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans p-0 m-0 selection:bg-teal-200 scroll-smooth" style={{ '--primary-color': primaryColor }}>
      
      {/* Full-Width Sticky Navbar */}
      <PublicNavbar clinic={clinicData} websiteConfig={websiteConfigData} />

      {/* Section 1: Hero (#home) */}
      <section id="home" className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white pt-20 pb-28 px-6 sm:px-12 lg:px-20 border-b border-slate-800" style={clinicData.coverImageUrl ? { backgroundImage: `url(${clinicData.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        {clinicData.coverImageUrl && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }}></div>
        
        <div className="relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verified Medical Professional
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight">
              {cleanDoctorName}
            </h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: primaryColor }}>{doctorData?.specialization}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctorData?.qualification}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctorData?.experienceYrs}+ Yrs Exp</span>
            </div>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
              Providing premium healthcare and expert consultations at <strong>{clinicData.name}</strong>. Book your online appointment to skip the waiting room.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href={`/${slug}/book`} className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-4 ${buttonStyle} font-black text-lg transition-all shadow-xl shadow-black/20 hover:scale-105 active:scale-95`} style={{ backgroundColor: primaryColor }}>
                Book Appointment <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#about" className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 ${buttonStyle} font-bold text-lg transition-all hover:bg-white/20`}>
                Learn More
              </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className="w-full max-w-sm shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-3xl shadow-2xl">
              <div className="bg-slate-900 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 opacity-20" style={{ background: `linear-gradient(to bottom, ${primaryColor}, transparent)` }}></div>
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-slate-800 flex items-center justify-center relative z-10 shadow-xl mb-6 overflow-hidden" style={{ backgroundColor: `${primaryColor}30` }}>
                  {doctorData?.avatarUrl ? <img src={doctorData.avatarUrl} alt={cleanDoctorName} className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-white" />}
                </div>
                <h3 className="text-2xl font-bold text-white relative z-10">{cleanDoctorName}</h3>
                <p className="font-medium mt-1 relative z-10" style={{ color: primaryColor }}>{doctorData?.specialization}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 relative z-10">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Experience</p>
                    <p className="text-xl font-black text-white">{doctorData?.experienceYrs} Years</p>
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

      {/* Section 2: About Doctor (#about) */}
      <section id="about" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-slate-50 border-b border-slate-200/60 scroll-mt-24">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-4" style={{ color: primaryColor }}>
              <Heart className="w-5 h-5" style={{ fill: `${primaryColor}40` }} /> About The Doctor
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">Dedicated to providing world-class healthcare.</h2>
            <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                {cleanDoctorName} is a highly experienced and dedicated medical professional specializing in {doctorData?.specialization}. 
                With over {doctorData?.experienceYrs} years of clinical practice, they have helped thousands of patients in {clinicData.city} lead healthier lives.
              </p>
              <p>
                Holding top qualifications including {doctorData?.qualification}, they are committed to providing ethical, transparent, and compassionate care. 
                At {clinicData.name}, the focus is always on patient-first treatments and long-term well-being.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
              <h4 className="font-bold text-slate-900 text-xl mb-2">10k+ Patients</h4>
              <p className="text-slate-500 text-sm">Successfully treated and managed over the years.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow">
              <Sparkles className="w-10 h-10 mb-4" style={{ color: primaryColor }} />
              <h4 className="font-bold text-slate-900 text-xl mb-2">Top Rated</h4>
              <p className="text-slate-500 text-sm">Highly recommended by patients in {clinic.city}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Services Offered (#services) */}
      <section id="services" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-4" style={{ color: primaryColor }}>
            <Stethoscope className="w-5 h-5" /> Treatments & Procedures
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Services Offered</h2>
        </div>
        
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map(service => (
            <div key={service._id.toString()} className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Stethoscope className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-slate-900 text-2xl leading-tight pr-4">{service.name}</h4>
                </div>
                <div className="flex gap-2 mb-8">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg">{service.durationMins} Mins</span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>OPD Consultation</span>
                </div>
                <p className="text-4xl font-black mb-8" style={{ color: primaryColor }}>₹{service.price}</p>
              </div>
              <Link href={`/${slug}/book?serviceId=${service._id}`} className={`relative z-10 w-full inline-flex items-center justify-center gap-2 text-center text-white font-bold py-4 ${buttonStyle} transition-all shadow-md hover:shadow-lg opacity-90 hover:opacity-100 active:scale-95`} style={{ backgroundColor: primaryColor }}>
                Select & Book <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Clinic Information & OPD Hours (#clinic-info) */}
      <section id="clinic-info" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-slate-50 border-t border-slate-200/60 scroll-mt-24">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          
          {/* Left Column (Clinic Details & Contact) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8">{clinicData.name}</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Address</p>
                    <p className="text-slate-600 font-medium mt-1 leading-relaxed">{clinicData.address}, {clinicData.city}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Direct Phone</p>
                    <p className="text-slate-600 font-medium mt-1">{clinicData.phone}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Email Support</p>
                    <p className="text-slate-600 font-medium mt-1">support@{clinicData.slug}.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 mt-8">
              <Link 
                href={`/${slug}/book`}
                className={`w-full inline-flex items-center justify-center gap-2 text-white font-bold py-3.5 ${buttonStyle} shadow-md hover:shadow-lg transition-all text-sm`}
                style={{ backgroundColor: primaryColor }}
              >
                Schedule Consultation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column (OPD Timings Schedule) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-6 h-6" style={{ color: primaryColor }} /> OPD Timings
                </h3>
                {isOpenToday ? (
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Open Today
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3.5 py-1 rounded-full text-xs font-bold border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Closed Today
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {availabilityData.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(day => {
                  const isToday = day.dayOfWeek === currentDayIndex;
                  const isOpen = day.isOpen !== undefined ? Boolean(day.isOpen) : !day.isClosed;
                  return (
                    <div 
                      key={day._id ? day._id.toString() : day.dayOfWeek} 
                      className={`flex justify-between items-center px-4 py-3 rounded-xl transition-all ${
                        isToday 
                          ? 'bg-teal-50/70 border border-teal-200 shadow-sm' 
                          : 'bg-slate-50/60 border border-slate-100'
                      }`}
                    >
                      <span className={`text-sm font-bold ${isToday ? 'text-teal-900' : 'text-slate-700'}`}>
                        {days[day.dayOfWeek]} {isToday && <span className="ml-1 text-[11px] font-extrabold text-teal-600">(Today)</span>}
                      </span>
                      {!isOpen ? (
                        <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-md">CLOSED</span>
                      ) : (
                        <span className={`text-sm font-extrabold ${isToday ? 'text-teal-800' : 'text-slate-900'}`}>{day.startTime} - {day.endTime}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium text-center mt-6 pt-4 border-t border-slate-100">
              * Slots are subject to online availability and advance booking.
            </p>
          </div>

        </div>
      </section>

      {/* Section 5: Inline Booking Wizard (#book-appointment) */}
      <section id="book-appointment" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-slate-900 scroll-mt-24">
        <div id="booking-module" className="w-full max-w-[1400px] mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Calendar className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Book Your Appointment</h2>
            <p className="text-slate-400 text-base sm:text-lg font-medium">Skip the waiting room. Select your service, date, and time slot to instantly confirm your booking.</p>
          </div>
          
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <BookingClientWrapper 
              clinic={clinicData} 
              doctor={{ ...doctorData, fullName: cleanDoctorName }} 
              services={servicesData} 
              availability={availabilityData}
              websiteConfig={websiteConfigData}
              slug={slug} 
              embedded={true}
            />
          </div>
        </div>
      </section>

      {/* Section 6: Contact & Location (#contact) */}
      <section id="contact" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white border-t border-slate-200/60 scroll-mt-24">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">Need Help? Get in Touch.</h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium mb-10">Our support team is available to assist you with directions, booking modifications, or any general queries.</p>
            
            <div className="space-y-6">
              <a href={`tel:${clinicData.phone}`} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow group">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                  <PhoneCall className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Call Us</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{clinicData.phone}</p>
                </div>
              </a>
              
              <a href={`https://maps.google.com/?q=${encodeURIComponent(clinicData.address + ' ' + clinicData.city)}`} target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow group">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                  <Navigation className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Get Directions</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Open in Google Maps</p>
                </div>
              </a>
            </div>
          </div>
          
          {/* Maps Card */}
          <div className="bg-slate-100 rounded-3xl overflow-hidden relative shadow-inner min-h-[380px] border border-slate-200">
             <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '380px' }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade" 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(clinicData.address + ' ' + clinicData.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
            <div className="absolute inset-0 bg-slate-800/5 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md flex items-center gap-2 border border-slate-200">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-bold text-xs text-slate-900">{clinicData.city}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Footer */}
      <footer className="w-full bg-slate-900 text-white py-12 px-6 sm:px-12 lg:px-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white">
            {clinicData.name.charAt(0)}
          </div>
          <span className="font-bold text-white text-sm">{clinicData.name}</span>
          <span>•</span>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span>Powered by</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> DocPulse
          </span>
        </div>
      </footer>

    </div>
  );
}

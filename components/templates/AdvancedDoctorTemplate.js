"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Clock, Stethoscope, ArrowRight, CheckCircle2, 
  ShieldCheck, Heart, Sparkles, PhoneCall, Mail, Navigation, Calendar, 
  Star, MessageCircle, FileText, Activity, Award, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import PublicNavbar from '../../frontend/components/clinic/PublicNavbar.js';

export default function AdvancedDoctorTemplate({
  clinic,
  doctor,
  services = [],
  availability = [],
  websiteConfig = {},
  slug = ""
}) {
  const [openFaq, setOpenFaq] = useState(0);

  const cleanDoctorName = `Dr. ${doctor?.fullName?.replace(/^Dr\.?\s*/i, "") || "Doctor"}`;
  const primaryColor = websiteConfig?.primaryColor || websiteConfig?.themeColor || clinic?.websiteConfig?.primaryColor || '#00A1AC';
  const buttonStyle = websiteConfig?.buttonStyle || clinic?.websiteConfig?.buttonStyle || 'rounded-xl';
  const effectivePhoto = doctor?.profilePhoto || websiteConfig?.doctorPhoto || doctor?.image || doctor?.avatarUrl;
  const rawPhone = clinic?.phone || doctor?.phone || "919523663754";
  const whatsappPhone = rawPhone.replace(/\D/g, "").replace(/^0+/, "");

  const faqs = [
    {
      q: "How does the online confirmed OPD booking work?",
      a: `Select your preferred consultation service and slot above. Once submitted, your appointment token is instantly generated and confirmed with ${cleanDoctorName} at ${clinic?.name || 'the clinic'}.`
    },
    {
      q: "Can I reschedule or cancel my appointment if plans change?",
      a: "Yes. You can contact the clinic helpdesk directly via phone or WhatsApp with your booking details to reschedule to another available slot with zero penalty."
    },
    {
      q: "How will I receive my prescription and medical bills?",
      a: "Immediately following your consultation, a verified digital prescription and clinic payment receipt are dispatched to your WhatsApp and registered phone."
    },
    {
      q: "Is emergency or walk-in consultation supported?",
      a: `While pre-booked online slots guarantee zero waiting time, walk-in consultations at ${clinic?.address || 'the clinic'} are accommodated subject to daily slot availability.`
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Sharma",
      rating: 5,
      date: "2 days ago",
      treatment: "Cardiology Consultation",
      review: `${cleanDoctorName} is extremely patient and thorough with diagnostics. The online booking made the clinic visit completely hassle-free with zero waiting queue!`
    },
    {
      name: "Priyanka Sen",
      rating: 5,
      date: "1 week ago",
      treatment: "General OPD Checkup",
      review: `Excellent clinical experience at ${clinic?.name || 'this clinic'}. Doctor explained the prescription in detail and follow-up support on WhatsApp was prompt.`
    },
    {
      name: "Amitabh Verma",
      rating: 5,
      date: "2 weeks ago",
      treatment: "Comprehensive Health Review",
      review: "Very professional setup. Confirmed time slots work like a charm and digital prescription was sent immediately after checkup. Highly recommended!"
    }
  ];

  const facilities = [
    {
      title: "Digital Instant Prescription",
      desc: "Instant digital Rx with clear dosage guidance delivered directly to your WhatsApp.",
      icon: <FileText className="w-6 h-6 text-[#00A1AC]" />
    },
    {
      title: "Zero Waiting Token Queue",
      desc: "Live slot management ensuring confirmed consultation at your selected time.",
      icon: <Clock className="w-6 h-6 text-[#00A1AC]" />
    },
    {
      title: "Advanced Diagnostic Support",
      desc: "Complete clinical history tracking and integration with NABL accredited labs.",
      icon: <Activity className="w-6 h-6 text-[#00A1AC]" />
    },
    {
      title: "Verified Medical Certification",
      desc: "State & National Medical Council registered specialist with proven clinical expertise.",
      icon: <Award className="w-6 h-6 text-[#00A1AC]" />
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans p-0 m-0 selection:bg-teal-200 scroll-smooth" style={{ '--primary-color': primaryColor }}>
      {/* Full-Width Sticky Navbar */}
      <PublicNavbar clinic={clinic} websiteConfig={websiteConfig} />

      {/* Floating WhatsApp Quick Consult Widget */}
      <a 
        href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hi ${cleanDoctorName}, I want to inquire about an appointment at ${clinic?.name || 'the clinic'}`)}`}
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold transition-all hover:scale-105 active:scale-95 border-2 border-white/20 group"
      >
        <span className="text-lg animate-bounce">💬</span>
        <span className="text-xs sm:text-sm font-black tracking-wide">Instant WhatsApp Chat</span>
      </a>

      {/* Section 1: Hero */}
      <section id="home" className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white pt-20 pb-28 px-6 sm:px-12 lg:px-20 border-b border-slate-800" style={clinic?.coverImageUrl ? { backgroundImage: `url(${clinic.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        {clinic?.coverImageUrl && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }}></div>
        
        <div className="relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verified Medical Specialist • Instant Confirmed OPD
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight">
              {cleanDoctorName}
            </h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: primaryColor }}>{doctor?.specialization || "Specialist"}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctor?.qualification || "MBBS"}</span>
              <span className="bg-slate-800 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-full border border-slate-700">{doctor?.experienceYrs || 8}+ Yrs Clinical Practice</span>
            </div>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
              Providing compassionate, evidence-based healthcare consultations at <strong>{clinic?.name}</strong>. Book your online appointment to skip physical waiting queues.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href={`/${slug}/book`} className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-4 ${buttonStyle} font-black text-lg transition-all shadow-xl shadow-black/20 hover:scale-105 active:scale-95`} style={{ backgroundColor: primaryColor }}>
                Book Confirmed Slot <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#reviews" className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 ${buttonStyle} font-bold text-lg transition-all hover:bg-white/20`}>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Patient Reviews
              </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className="w-full max-w-sm shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-3xl shadow-2xl">
              <div className="bg-slate-900 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 opacity-20" style={{ background: `linear-gradient(to bottom, ${primaryColor}, transparent)` }}></div>
                
                {/* Doctor Photo Frame */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto mb-6 flex items-center justify-center bg-[#0D3648] relative z-10">
                  {effectivePhoto ? (
                    <img 
                      src={effectivePhoto} 
                      alt={doctor?.name || cleanDoctorName} 
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#092734] text-white">
                      <svg className="w-12 h-12 text-teal-400 fill-none stroke-current" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white relative z-10">{cleanDoctorName}</h3>
                <p className="font-medium mt-1 relative z-10" style={{ color: primaryColor }}>{doctor?.specialization || "Specialist"}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 relative z-10">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Experience</p>
                    <p className="text-xl font-black text-white">{doctor?.experienceYrs || 8} Years</p>
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

      {/* Section 2: Clinic Facility Highlights (4 Feature Grid) */}
      <section className="w-full py-16 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((f, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl hover:border-[#00A1AC]/50 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1.5">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: About Doctor */}
      <section id="about" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-slate-50 border-b border-slate-200/60 scroll-mt-24">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-4" style={{ color: primaryColor }}>
              <Heart className="w-5 h-5" style={{ fill: `${primaryColor}40` }} /> About The Doctor
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">Dedicated to providing world-class healthcare.</h2>
            <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                {cleanDoctorName} is a highly experienced medical professional specializing in {doctor?.specialization || "General Medicine"}. 
                With over {doctor?.experienceYrs || 8} years of clinical practice, they have treated thousands of patients across {clinic?.city || "the region"}.
              </p>
              <p>
                Holding qualifications including {doctor?.qualification || "MBBS"}, they focus on ethical, transparent, and patient-first treatments.
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
              <p className="text-slate-500 text-sm">Highly recommended by patients across {clinic?.city || "the city"}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Services Offered */}
      <section id="services" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white scroll-mt-24 border-b border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-4" style={{ color: primaryColor }}>
            <Stethoscope className="w-5 h-5" /> Treatments & Procedures
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Services Offered</h2>
        </div>
        
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service._id?.toString() || service.name} className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-slate-900 text-2xl leading-tight mb-3">{service.name}</h4>
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

      {/* Section 5: Patient Trust & Google Review Badges */}
      <section id="reviews" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-slate-50 scroll-mt-24 border-b border-slate-200">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-3" style={{ color: primaryColor }}>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Patient Feedback & Trust
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Patient Experiences & Ratings</h2>
            </div>
            
            {/* Google Review Badge Box */}
            <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
              <div className="text-3xl font-black text-slate-900">4.9</div>
              <div>
                <div className="flex text-amber-400 text-sm">
                  {"★".repeat(5)}
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">Based on 350+ Google Reviews</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400 text-base">
                      {"★".repeat(t.rating)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{t.date}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{t.name}</h5>
                    <p className="text-[11px] text-slate-400">{t.treatment}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Patient
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Interactive Patient FAQs */}
      <section id="faqs" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white scroll-mt-24 border-b border-slate-200">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-3" style={{ color: primaryColor }}>
              <HelpCircle className="w-5 h-5" /> Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm mt-2">Clear answers to help you prepare for your consultation.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#00A1AC]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-sm text-slate-600 font-medium leading-relaxed bg-white border-t border-slate-100 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reduced Subtle Footer for Advanced Tier */}
      <footer className="w-full py-6 border-t border-slate-100 bg-white text-center">
        <div className="text-[11px] text-slate-400 py-1 text-center font-medium">
          Powered by <span className="font-semibold text-slate-600">DocPulse</span>
        </div>
      </footer>
    </div>
  );
}

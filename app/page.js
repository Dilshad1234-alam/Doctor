"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Sparkles, CheckCircle2, XCircle, LayoutTemplate, 
  Calendar, UserCircle, Stethoscope, Clock, LineChart, ChevronDown, 
  ArrowRight, ShieldCheck, HeartPulse, Smartphone, Zap, Check, Star, Phone, ArrowUpRight
} from 'lucide-react';

export default function SaaSLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Templates", href: "#templates" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" }
  ];

  const features = [
    { icon: <LayoutTemplate className="w-6 h-6 text-[#164e63]" />, title: "Professional Website", desc: "No coding required. Launch a stunning, mobile-friendly clinic website." },
    { icon: <Calendar className="w-6 h-6 text-[#059669]" />, title: "24/7 Online Booking", desc: "Patients can book confirmed appointments online, any time of day." },
    { icon: <UserCircle className="w-6 h-6 text-[#0f172a]" />, title: "Doctor Profile", desc: "Showcase your qualifications, experience, and specialties elegantly." },
    { icon: <Stethoscope className="w-6 h-6 text-[#164e63]" />, title: "Services & Pricing", desc: "List all your OPD services, durations, and transparent pricing." },
    { icon: <Clock className="w-6 h-6 text-[#059669]" />, title: "OPD Availability", desc: "Set your weekly schedule and manage your working hours seamlessly." },
    { icon: <LineChart className="w-6 h-6 text-[#0f172a]" />, title: "Central Booking CRM", desc: "Manage all appointments and patient details from a secure dashboard." }
  ];

  const faqs = [
    { q: "Do I need coding knowledge?", a: "Not at all. Our platform is completely no-code. Just fill in your details and your professional website is generated instantly." },
    { q: "Can I create my own clinic website?", a: "Yes, you get a dedicated public URL for your clinic that you can share with patients, on WhatsApp, and on social media." },
    { q: "Can patients book appointments online?", a: "Absolutely. Your website comes with an integrated booking wizard where patients can select a service, date, and time slot to book an appointment." },
    { q: "Can I use my own domain?", a: "Yes, custom domain support is available on our Pro and Premium plans." },
    { q: "Can I change my website template?", a: "Yes, you can easily switch between different professional templates from your dashboard at any time." },
    { q: "What happens after my plan expires?", a: "Your website will show a graceful 'Maintenance' or 'Subscription Ended' message. Your data is safely retained for you to renew." },
    { q: "Can I upgrade my plan?", a: "Yes, you can upgrade your plan at any time and the remaining balance will be prorated." },
    { q: "Is my website mobile friendly?", a: "100%. All our templates are fully responsive and look perfect on mobile phones, tablets, and desktops." }
  ];

  const [plans, setPlans] = useState([
    { name: "Starter", monthly: 499, yearly: 399, popular: false, features: ["Doctor Website", "Online Booking", "Basic Templates", "5 Services", "Community Support"] },
    { name: "Pro", monthly: 1299, yearly: 999, popular: true, features: ["Everything in Starter", "Unlimited Services", "Custom Availability", "Premium Templates", "Priority Support", "Analytics Dashboard"] },
    { name: "Premium", monthly: 2999, yearly: 2499, popular: false, features: ["Everything in Pro", "Custom Domain", "White-label Solution", "Dedicated Account Manager", "Advanced CRM", "Multi-Doctor Support"] }
  ]);

  React.useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.plans && data.plans.length > 0) {
          const uniqueMap = new Map();
          data.plans.forEach((p) => {
            const key = (p.name || p.planId || "").toLowerCase();
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, {
                name: p.name,
                monthly: p.priceMonthly,
                yearly: p.priceYearly || Math.round(p.priceMonthly * 0.8),
                popular: Boolean(p.isPopular),
                features: p.features || []
              });
            }
          });
          const mapped = Array.from(uniqueMap.values());
          if (mapped.length > 0) {
            setPlans(mapped);
          }
        }
      })
      .catch((err) => console.error("Could not load dynamic plans:", err));
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans overflow-x-hidden p-0 m-0 text-[#0f172a] selection:bg-[#164e63] selection:text-white scroll-smooth">
      
      {/* 1. Full-Width Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 lg:px-16 py-3.5 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-[#164e63]" />
          <h1 className="text-xl font-black text-[#0f172a] tracking-tight">DocPulse</h1>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} className="text-sm font-bold text-slate-600 hover:text-[#164e63] transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-[#164e63]">Login</Link>
          <Link href="/register" className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Get Started
          </Link>
        </div>

        <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl py-6 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-slate-800 p-2 hover:bg-slate-50 rounded-xl">
                {link.name}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Link href="/login" className="text-center bg-slate-100 text-slate-900 p-3 rounded-xl font-bold">Login</Link>
              <Link href="/register" className="bg-[#0f172a] text-center text-white p-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Full-Width Hero Section */}
      <section className="w-full min-h-[92vh] bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] text-white pt-28 pb-16 px-6 sm:px-16 lg:px-24 flex flex-col items-center justify-between text-center relative overflow-hidden">
        {/* Subtle glow effects */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-[#164e63]/40 blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] mb-8">
            CREATE YOUR DESTINATION FOR
            <span className="inline-flex mx-3 align-middle w-16 h-12 md:w-24 md:h-16 rounded-full overflow-hidden border-4 border-white/20 shadow-lg relative -top-1">
               <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=150&fit=crop" alt="Doctor" className="w-full h-full object-cover" />
            </span>
            PROFESSIONAL
            <span className="inline-flex mx-3 align-middle w-16 h-12 md:w-24 md:h-16 rounded-full overflow-hidden border-4 border-white/20 shadow-lg relative -top-1">
               <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=150&fit=crop" alt="Clinic" className="w-full h-full object-cover" />
            </span>
            CLINIC WEBSITE
          </h1>
          
          <p className="text-lg md:text-xl text-[#94a3b8] font-medium leading-relaxed max-w-3xl mb-12">
            Build your clinic website, showcase your services, manage availability and let patients book appointments online — all from one platform.
          </p>
          
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-[#0f172a] px-10 py-5 rounded-full font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 mb-16">
            Create Your Website Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Bottom Hero Graphic */}
        <div className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[400px] mt-8">
          <div className="absolute inset-0 bg-gradient-to-t from-[#124e5e] via-transparent to-transparent z-10 bottom-0 h-full w-full"></div>
          <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200" alt="Medical Team" className="w-full h-full object-cover rounded-t-[3rem] object-top opacity-90 border-t-4 border-x-4 border-white/10" />
          
          {/* Sparkles */}
          <Sparkles className="absolute top-10 left-10 w-8 h-8 text-amber-300 animate-pulse z-20" />
          <Sparkles className="absolute top-20 right-20 w-6 h-6 text-white animate-pulse z-20" />
        </div>
      </section>

      {/* 3. Why Choose Us? */}
      <section className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#f8fafc]">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white text-[#164e63] px-4 py-2 rounded-full text-sm font-bold border border-slate-200 shadow-sm uppercase tracking-wider">
              About Platform
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight">
              Why Choose DocPulse?
            </h2>
            <p className="text-lg text-slate-600 font-medium max-w-2xl">
              We've built the most intuitive platform specifically for doctors to establish their online presence without any technical headaches.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-2xl">
              {/* Active Card */}
              <div className="bg-[#0f172a] p-6 rounded-3xl shadow-lg border border-[#1e293b] text-white">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-black">500+ Clinics Live</h4>
              </div>
              {/* White Cards */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                  <Stethoscope className="w-6 h-6 text-[#164e63]" />
                </div>
                <h4 className="text-xl font-black text-[#0f172a]">20+ Medical Specializations</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                  <CheckCircle2 className="w-6 h-6 text-[#059669]" />
                </div>
                <h4 className="text-xl font-black text-[#0f172a]">100k+ Confirmed Appointments</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                  <Clock className="w-6 h-6 text-[#0f172a]" />
                </div>
                <h4 className="text-xl font-black text-[#0f172a]">24/7 Automated OPD Booking</h4>
              </div>
            </div>

            <div className="pt-4">
              <Link href="#features" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0f172a] px-8 py-4 rounded-full font-bold border border-slate-200 shadow-sm transition-colors">
                Learn more <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative w-full h-[600px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000" alt="Smiling Doctor" className="w-full h-full object-cover" />
          </div>

        </div>
      </section>

      {/* 4. Core Features */}
      <section id="features" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[#0f172a] mb-4">Everything you need to grow your practice.</h2>
            <p className="text-lg text-slate-600 font-medium">A complete suite of tools designed specifically for medical professionals and clinics.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-3xl p-8 border border-slate-200 hover:border-[#164e63] hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-black text-[#0f172a] mb-3">{feat.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#0f172a] text-white">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black mb-4">Go Online in Minutes, Not Weeks.</h2>
            <p className="text-lg text-slate-400 font-medium">Follow our simple 8-step wizard to launch your professional clinic website instantly.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative">
            {['Sign Up', 'Choose Plan', 'Doctor Details', 'Add Services', 'Availability', 'Template', 'Customize', 'Publish'].map((step, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 relative z-10 text-center">
                <div className="w-12 h-12 bg-white text-[#0f172a] font-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  0{i + 1}
                </div>
                <h4 className="font-bold">{step}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Templates Showcase */}
      <section id="templates" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#f8fafc]">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">Stunning Website Templates</h2>
              <p className="text-lg text-slate-600 font-medium">Choose from our collection of professionally designed templates tailored for healthcare.</p>
            </div>
            <Link href="/register" className="bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold transition-colors whitespace-nowrap shadow-md flex items-center gap-2">
              View All Templates <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Cardiology Premium', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800', popular: false },
              { name: 'Modern Minimalist', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800', popular: true },
              { name: 'Pediatric Care', img: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?q=80&w=800', popular: false }
            ].map((template, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="bg-slate-200 rounded-[2.5rem] h-[400px] mb-6 overflow-hidden border border-slate-200 relative shadow-sm group-hover:shadow-2xl transition-all">
                   <div className="absolute inset-0 bg-[#0f172a]">
                     <img src={template.img} alt={template.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                   </div>
                   <div className="absolute top-4 left-4 flex gap-2 z-10">
                     <span className="bg-white/90 backdrop-blur text-[#0f172a] text-xs font-bold px-4 py-2 rounded-full shadow-sm">Live Preview</span>
                     {template.popular && <span className="bg-[#164e63]/90 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">Popular</span>}
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xl font-black text-[#0f172a]">{template.name}</h4>
                  <span className="text-sm font-bold text-[#164e63] opacity-0 group-hover:opacity-100 transition-opacity">Use Template &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Patient Booking Flow */}
      <section className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-[1400px] mx-auto text-center">
          <h2 className="text-4xl font-black text-[#0f172a] mb-4">Frictionless Patient Experience</h2>
          <p className="text-lg text-slate-600 font-medium mb-16 max-w-2xl mx-auto">See how easy it is for your patients to book an appointment with you.</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
             {['Doctor Website', 'Select Service', 'Pick Date & Time', 'Enter Details', 'Confirmed Slip'].map((step, i) => (
               <React.Fragment key={i}>
                 <div className="bg-[#f8fafc] border border-slate-200 text-[#0f172a] font-black px-6 py-5 rounded-3xl shadow-sm text-center w-full md:w-48">
                   {step}
                 </div>
                 {i < 4 && <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block rotate-90 md:rotate-0 my-2 md:my-0 shrink-0" />}
                 {i < 4 && <div className="h-6 w-px bg-slate-300 md:hidden my-1"></div>}
               </React.Fragment>
             ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing Matrix */}
      <section id="pricing" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#f8fafc]">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-[#164e63] px-4 py-2 rounded-full text-sm font-bold border border-slate-200 shadow-sm uppercase tracking-wider mb-4">
              Pricing
            </div>
            <h2 className="text-4xl font-black text-[#0f172a] mb-6">Simple, Transparent Pricing.</h2>
            <div className="inline-flex bg-white rounded-full p-1 border border-slate-200 shadow-sm relative">
              <div className={`absolute top-1 bottom-1 w-1/2 bg-[#0f172a] rounded-full shadow-sm transition-all duration-300 ${isYearly ? 'left-1/2 -ml-1' : 'left-1'}`}></div>
              <button onClick={() => setIsYearly(false)} className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</button>
              <button onClick={() => setIsYearly(true)} className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${isYearly ? 'text-white' : 'text-slate-500'}`}>
                Yearly <span className={`px-2 py-0.5 rounded text-xs ${isYearly ? 'bg-white/20 text-white' : 'bg-[#059669]/10 text-[#059669]'}`}>Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className={`bg-white rounded-[3rem] p-10 relative transition-transform hover:-translate-y-2 ${plan.popular ? 'border-[4px] border-[#0f172a] shadow-2xl' : 'border border-slate-200 shadow-sm mt-0 md:mt-4'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white font-bold px-6 py-2 rounded-full text-sm shadow-lg">Most Popular</div>}
                
                <h3 className="text-2xl font-black text-[#0f172a] mb-2">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-5xl font-black text-[#0f172a]">₹{isYearly ? plan.yearly : plan.monthly}</span>
                  <span className="text-slate-500 font-bold">/mo</span>
                </div>
                <Link href="/register" className={`block w-full py-4 text-center rounded-full font-bold mb-8 transition-colors shadow-md ${plan.popular ? 'bg-[#164e63] hover:bg-[#0f172a] text-white' : 'bg-[#f8fafc] hover:bg-slate-200 text-[#0f172a] border border-slate-200'}`}>
                  Get Started
                </Link>

                <ul className="space-y-5">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                      <span className="text-slate-700 font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#164e63] px-4 py-2 rounded-full text-sm font-bold border border-slate-200 shadow-sm uppercase tracking-wider mb-4">
              Support
            </div>
            <h2 className="text-4xl font-black text-[#0f172a] mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-3xl border border-slate-200 overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-[#0f172a] text-lg pr-4">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA Banner */}
      <section className="w-full py-20 px-6 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-[1400px] mx-auto bg-[#0f172a] rounded-[3rem] px-4 py-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white relative z-10">Your Clinic Deserves a<br/>Professional Online Presence.</h2>
          <p className="text-xl text-slate-300 font-medium mb-10 max-w-2xl mx-auto relative z-10">Create your doctor website and start accepting appointments online today. Zero coding required.</p>
          <Link href="/register" className="inline-flex relative z-10 items-center gap-2 bg-white text-[#0f172a] px-10 py-5 rounded-full font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
      {/* 11. Full-Width Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-16 px-6 sm:px-12 lg:px-20">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <HeartPulse className="w-8 h-8 text-[#164e63]" />
              <h1 className="text-2xl font-black text-white">DocPulse</h1>
            </div>
            <p className="font-medium mb-6">The ultimate website builder and booking platform for medical professionals.</p>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4 font-bold">
              <li><a href="#features" className="hover:text-[#164e63] transition-colors">Features</a></li>
              <li><a href="#templates" className="hover:text-[#164e63] transition-colors">Templates</a></li>
              <li><a href="#pricing" className="hover:text-[#164e63] transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-4 font-bold">
              <li><a href="#faq" className="hover:text-[#164e63] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[#164e63] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#164e63] transition-colors">Guides</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 font-bold">
              <li><a href="#" className="hover:text-[#164e63] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#164e63] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#164e63] transition-colors">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="w-full max-w-[1400px] mx-auto pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between gap-4 font-bold text-sm">
          <p suppressHydrationWarning>Copyright © {new Date().getFullYear()} DocPulse SaaS. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#164e63] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#164e63] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[#164e63] transition-colors">Facebook</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Sparkles, CheckCircle2, XCircle, LayoutTemplate, 
  Calendar, UserCircle, Stethoscope, Clock, LineChart, ChevronDown, 
  ArrowRight, ShieldCheck, HeartPulse, Smartphone, Zap, Check, Star
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
    { icon: <LayoutTemplate className="w-6 h-6 text-blue-600" />, title: "Professional Website", desc: "No coding required. Launch a stunning, mobile-friendly clinic website." },
    { icon: <Calendar className="w-6 h-6 text-emerald-600" />, title: "24/7 Online Booking", desc: "Patients can book confirmed appointments online, any time of day." },
    { icon: <UserCircle className="w-6 h-6 text-purple-600" />, title: "Doctor Profile", desc: "Showcase your qualifications, experience, and specialties elegantly." },
    { icon: <Stethoscope className="w-6 h-6 text-rose-600" />, title: "Services & Pricing", desc: "List all your OPD services, durations, and transparent pricing." },
    { icon: <Clock className="w-6 h-6 text-amber-600" />, title: "OPD Availability", desc: "Set your weekly schedule and manage your working hours seamlessly." },
    { icon: <LineChart className="w-6 h-6 text-indigo-600" />, title: "Central Booking CRM", desc: "Manage all appointments and patient details from a secure dashboard." }
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

  const pricingPlans = [
    { name: "Starter", monthly: 499, yearly: 399, features: ["Doctor Website", "Online Booking", "Basic Templates", "5 Services", "Community Support"] },
    { name: "Pro", monthly: 1299, yearly: 999, popular: true, features: ["Everything in Starter", "Unlimited Services", "Custom Availability", "Premium Templates", "Priority Support", "Analytics Dashboard"] },
    { name: "Premium", monthly: 2999, yearly: 2499, features: ["Everything in Pro", "Custom Domain", "White-label Solution", "Dedicated Account Manager", "Advanced CRM", "Multi-Doctor Support"] }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 scroll-smooth">
      
      {/* 1. Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">DocPulse</h1>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600">Login</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md hover:shadow-lg">
              Get Started
            </Link>
          </div>

          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-slate-800 p-2 hover:bg-slate-50 rounded-lg">
                {link.name}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Link href="/login" className="text-center bg-slate-100 text-slate-900 p-3 rounded-xl font-bold">Login</Link>
              <Link href="/register" className="bg-blue-600 text-center text-white p-3 rounded-xl font-bold shadow-sm">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-32">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" /> The #1 Website Builder for Doctors & Clinics
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Create Your Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Doctor Website</span> & Start Accepting Appointments.
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Build your clinic website, showcase your services, manage availability and let patients book appointments online — all from one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Create Your Website <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#templates" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm">
                View Templates
              </a>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-slate-800 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-slate-50 rounded-3xl overflow-hidden h-[600px] relative">
                {/* Fake Browser/Phone header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">C</div> City Clinic</div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Menu className="w-4 h-4 text-slate-600" /></div>
                </div>
                {/* Fake Content */}
                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3"></div>
                    <h3 className="font-bold text-xl">Dr. Sarah Smith</h3>
                    <p className="text-sm text-blue-100">Senior Cardiologist</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <p className="font-bold text-slate-900 mb-2">Book Appointment</p>
                    <div className="h-10 bg-slate-50 rounded-lg mb-2 border border-slate-100"></div>
                    <div className="h-10 bg-blue-600 rounded-lg mb-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem vs Solution */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2"><XCircle className="w-8 h-8 text-red-500" /> The Old Way</h3>
              <ul className="space-y-4">
                {['No professional website for your clinic', 'Patients constantly call to book appointments', 'Manual appointment management is messy', 'No online presence to build trust', 'Expensive & slow custom website development'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 md:p-12 shadow-xl text-white">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><CheckCircle2 className="w-8 h-8" /> The DocPulse Way</h3>
              <div className="h-full flex flex-col justify-center pb-8">
                 <p className="text-2xl font-bold leading-relaxed">
                   "Everything you need to take your clinic online in 5 minutes with zero technical hassle."
                 </p>
                 <ul className="mt-8 space-y-4">
                    {['Instant professional website', 'Automated 24/7 online booking', 'Centralized patient dashboard', 'Affordable monthly subscription'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 font-bold text-emerald-50">
                        <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" /> {item}
                      </li>
                    ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section id="features" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need to grow your practice.</h2>
            <p className="text-lg text-slate-600 font-medium">A complete suite of tools designed specifically for medical professionals and clinics.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black mb-4">Go Online in Minutes, Not Weeks.</h2>
            <p className="text-lg text-slate-400 font-medium">Follow our simple 8-step wizard to launch your professional clinic website instantly.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative">
            {['Sign Up', 'Choose Plan', 'Doctor Details', 'Add Services', 'Availability', 'Template', 'Customize', 'Publish'].map((step, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative z-10 text-center">
                <div className="w-10 h-10 bg-blue-600 text-white font-black rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-900">
                  0{i + 1}
                </div>
                <h4 className="font-bold">{step}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Templates Showcase */}
      <section id="templates" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Stunning Website Templates</h2>
              <p className="text-lg text-slate-600 font-medium">Choose from our collection of professionally designed templates tailored for healthcare.</p>
            </div>
            <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap">
              View All Templates
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Cardiology Premium', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800', popular: false },
              { name: 'Modern Minimalist', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800', popular: true },
              { name: 'Pediatric Care', img: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?q=80&w=800', popular: false }
            ].map((template, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="bg-slate-200 rounded-3xl h-[400px] mb-6 overflow-hidden border border-slate-300 relative shadow-sm group-hover:shadow-xl transition-all">
                   <div className="absolute inset-0 bg-slate-900">
                     <img src={template.img} alt={template.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                   </div>
                   <div className="absolute top-4 left-4 flex gap-2 z-10">
                     <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Live Preview</span>
                     {template.popular && <span className="bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Popular</span>}
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-slate-900">{template.name}</h4>
                  <span className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Use Template &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Patient Booking Flow */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Frictionless Patient Experience</h2>
          <p className="text-lg text-slate-600 font-medium mb-16 max-w-2xl mx-auto">See how easy it is for your patients to book an appointment with you.</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
             {['Doctor Website', 'Select Service', 'Pick Date & Time', 'Enter Details', 'Confirmed Slip'].map((step, i) => (
               <React.Fragment key={i}>
                 <div className="bg-blue-50 border border-blue-100 text-blue-800 font-bold px-6 py-4 rounded-2xl shadow-sm text-center w-full md:w-48">
                   {step}
                 </div>
                 {i < 4 && <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block rotate-90 md:rotate-0 my-2 md:my-0" />}
                 {i < 4 && <div className="h-6 w-px bg-slate-300 md:hidden my-1"></div>}
               </React.Fragment>
             ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing & Feature Comparison */}
      <section id="pricing" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Simple, Transparent Pricing.</h2>
            <div className="inline-flex bg-slate-200 rounded-full p-1 relative">
              <div className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm transition-all duration-300 ${isYearly ? 'left-1/2 -ml-1' : 'left-1'}`}></div>
              <button onClick={() => setIsYearly(false)} className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</button>
              <button onClick={() => setIsYearly(true)} className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`bg-white rounded-[2.5rem] p-8 relative transition-transform hover:-translate-y-2 ${plan.popular ? 'border-4 border-blue-600 shadow-2xl' : 'border border-slate-200 shadow-sm mt-0 md:mt-4'}`}>
                {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white font-bold px-4 py-1.5 rounded-full text-sm">Most Popular</div>}
                
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-900">₹{isYearly ? plan.yearly : plan.monthly}</span>
                  <span className="text-slate-500 font-bold">/mo</span>
                </div>
                <Link href="/register" className={`block w-full py-4 text-center rounded-2xl font-bold mb-8 transition-colors ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                  Get Started
                </Link>

                <ul className="space-y-4">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-600 font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Why Choose Us? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Why Choose DocPulse?</h2>
              <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
                We've built the most intuitive platform specifically for doctors to establish their online presence without any technical headaches.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: "Setup in Minutes" },
                  { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, title: "Highly Secure" },
                  { icon: <Smartphone className="w-5 h-5 text-blue-500" />, title: "Mobile Friendly" },
                  { icon: <CheckCircle2 className="w-5 h-5 text-purple-500" />, title: "No Coding Required" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">{item.icon}</div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full border-8 border-white shadow-2xl relative overflow-hidden group">
                 <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800" alt="Doctor using DocPulse" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-700"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 font-black text-xl">10k+</p>
                  <p className="text-slate-500 font-bold text-sm">Active Doctors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Testimonials */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Trusted by Doctors Everywhere.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
                <div className="flex items-center gap-1 mb-6 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" /><Star className="w-5 h-5 fill-amber-400" /><Star className="w-5 h-5 fill-amber-400" /><Star className="w-5 h-5 fill-amber-400" /><Star className="w-5 h-5 fill-amber-400" />
                </div>
                <p className="text-slate-300 font-medium leading-relaxed mb-8">"This platform changed how I manage my clinic. Creating my website took less than 10 minutes and patients love the online booking experience."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Dr. Example Name</h4>
                    <p className="text-sm text-slate-400">Cardiologist</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section id="faq" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
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

      {/* 12. Final CTA Banner & Footer */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Your Clinic Deserves a Professional Online Presence.</h2>
          <p className="text-xl text-blue-100 font-medium mb-10 max-w-2xl mx-auto">Create your doctor website and start accepting appointments online today. Zero coding required.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        
        <footer className="bg-slate-950 text-slate-400 py-16 px-4 border-t border-slate-900">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <HeartPulse className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-black text-white">DocPulse</h1>
              </div>
              <p className="font-medium mb-6">The ultimate website builder and booking platform for medical professionals.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-blue-400 transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Resources</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Guides</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between gap-4 font-medium text-sm">
            <p>Copyright © {new Date().getFullYear()} DocPulse SaaS. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </footer>
      </section>

    </div>
  );
}

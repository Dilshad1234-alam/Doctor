"use client";

import React, { useState } from 'react';
import { 
  Stethoscope, 
  Menu, 
  X, 
  CheckCircle2, 
  ChevronDown,
  Globe,
  CalendarDays,
  MessageSquare,
  Smartphone,
  CreditCard,
  LineChart,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isAnnualPlan, setIsAnnualPlan] = useState(false);

  const features = [
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Instant Website Builder",
      description: "Get your clinic online instantly. Use our subdomains or connect your own custom domain with zero technical knowledge."
    },
    {
      icon: <CalendarDays className="w-6 h-6 text-blue-600" />,
      title: "Smart Slot Management",
      description: "Manage OPD schedules effortlessly. Define your working hours, break times, and let patients book available slots 24/7."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "Automated Reminders",
      description: "Reduce no-shows with automated WhatsApp and SMS alerts for appointment confirmations and reminders."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-600" />,
      title: "No Patient App Needed",
      description: "Patients can easily book appointments directly from their mobile browser without downloading any additional apps."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      title: "Integrated Payments",
      description: "Collect consultation fees online securely or manage cash payments at the clinic with integrated billing."
    },
    {
      icon: <LineChart className="w-6 h-6 text-blue-600" />,
      title: "Revenue & CRM Analytics",
      description: "Track your daily appointments, patient growth, and revenue through an intuitive and comprehensive dashboard."
    }
  ];

  const templates = [
    { name: "Cardiology Pro", color: "bg-red-50", text: "text-red-600" },
    { name: "Dental Care", color: "bg-cyan-50", text: "text-cyan-600" },
    { name: "General Physician", color: "bg-blue-50", text: "text-blue-600" },
    { name: "Pediatric Smile", color: "bg-purple-50", text: "text-purple-600" }
  ];

  const faqs = [
    {
      question: "Can I use my own domain name (e.g., drsmith.com)?",
      answer: "Yes, our Professional and Hospital plans support custom domains. You can easily connect your existing domain or purchase a new one directly through our platform."
    },
    {
      question: "Is patient data secure and private?",
      answer: "Absolutely. We use industry-standard encryption to protect all patient data. We are fully compliant with relevant healthcare data privacy regulations to ensure complete confidentiality."
    },
    {
      question: "How do patients pay for appointments?",
      answer: "You can integrate popular payment gateways like Razorpay or Stripe to accept online payments. You can also allow patients to 'Pay at Clinic' and record it manually."
    },
    {
      question: "Do I need technical skills to build the website?",
      answer: "None at all! Our system is designed for doctors. Just fill in a simple form with your clinic details, upload your logo, and your professional website is generated instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">DocPulse</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#templates" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Templates</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">FAQs</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 border border-slate-300 rounded-lg hover:border-blue-600 transition-all">
                Doctor Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all">
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3 shadow-lg absolute w-full">
            <a href="#features" className="block text-base font-medium text-slate-600 py-2">Features</a>
            <a href="#how-it-works" className="block text-base font-medium text-slate-600 py-2">How It Works</a>
            <a href="#templates" className="block text-base font-medium text-slate-600 py-2">Templates</a>
            <a href="#pricing" className="block text-base font-medium text-slate-600 py-2">Pricing</a>
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/login" className="block w-full px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg text-center">
                Doctor Login
              </Link>
              <Link href="/register" className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg text-center">
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 lg:pt-32 lg:pb-32 border-b border-slate-100">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-8 border border-blue-100">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            The #1 Clinic Growth Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Launch Your Clinic Website & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Smart OPD in 5 Minutes
            </span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All-in-one SaaS for doctors. Get a custom branded website, automated appointment booking, digital prescriptions, and WhatsApp reminders with zero coding.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              Create Clinic Website (Free Trial)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center">
              View Live Demo
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="flex -space-x-2 mr-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Doctor" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="font-medium text-slate-700 ml-1">Trusted by 1,200+ doctors across India</span>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 shadow-2xl">
              <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[16/9] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-blue-50/50"></div>
                {/* Simplified mockup representation */}
                <div className="relative z-10 w-full h-full flex p-4 gap-4">
                  <div className="w-64 bg-white rounded-lg shadow-sm border border-slate-100 p-4 hidden md:block">
                    <div className="h-8 w-32 bg-slate-100 rounded-md mb-6"></div>
                    <div className="space-y-3">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-slate-100 rounded w-full"></div>)}
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col">
                     <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-48 bg-slate-100 rounded-md"></div>
                        <div className="h-8 w-24 bg-blue-100 rounded-md"></div>
                     </div>
                     <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-lg border border-slate-100"></div>)}
                     </div>
                     <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to run a modern clinic</h2>
            <p className="mt-4 text-lg text-slate-600">Powerful features designed specifically for medical professionals to save time and increase patient satisfaction.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Go live in 3 simple steps</h2>
            <p className="mt-4 text-lg text-slate-600">No coding or technical skills required. We've made it incredibly easy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 z-0"></div>
            
            {[
              { title: "Sign Up", desc: "Enter your basic clinic details and credentials." },
              { title: "Customize", desc: "Choose a template and set your consultation hours." },
              { title: "Publish", desc: "Your website is live. Start receiving online bookings instantly." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-blue-50 flex items-center justify-center mb-6 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="py-20 lg:py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px]"></div>
           <div className="absolute bottom-[0%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-500 blur-[120px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold">Beautiful Templates for Every Specialty</h2>
            <p className="mt-4 text-lg text-slate-300">Choose from our professionally designed, mobile-responsive themes.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tpl, idx) => (
              <div key={idx} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors group cursor-pointer">
                <div className="aspect-[4/3] bg-slate-700 relative overflow-hidden">
                  <div className={`absolute inset-2 rounded-lg ${tpl.color} shadow-inner flex flex-col p-4`}>
                     <div className="w-full flex justify-between items-center mb-4">
                        <div className={`w-8 h-8 rounded-full ${tpl.color} brightness-95 flex items-center justify-center`}>
                           <Stethoscope className={`w-4 h-4 ${tpl.text}`} />
                        </div>
                        <div className="flex gap-1">
                           <div className="w-4 h-1 rounded-full bg-slate-200"></div>
                           <div className="w-4 h-1 rounded-full bg-slate-200"></div>
                        </div>
                     </div>
                     <div className="w-3/4 h-3 rounded-full bg-slate-200 mb-2"></div>
                     <div className="w-1/2 h-3 rounded-full bg-slate-200 mb-6"></div>
                     <div className="w-full mt-auto h-8 rounded-md bg-white shadow-sm flex items-center justify-center border border-slate-100">
                        <span className={`text-[10px] font-bold ${tpl.text}`}>Book Appointment</span>
                     </div>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full">Preview</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{tpl.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-slate-600">Start for free, upgrade when you need more power.</p>
            
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm ${!isAnnualPlan ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>Monthly</span>
              <button 
                onClick={() => setIsAnnualPlan(!isAnnualPlan)}
                className="w-14 h-7 rounded-full bg-blue-600 relative transition-colors focus:outline-none"
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${isAnnualPlan ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
              <span className={`text-sm ${isAnnualPlan ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                Annually <span className="text-green-600 text-xs font-bold ml-1 bg-green-100 px-2 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Starter</h3>
              <p className="text-slate-500 text-sm mt-2">Perfect for new clinics starting out.</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-slate-900">₹0</span>
                <span className="text-slate-500">/ 14 days</span>
              </div>
              <button className="w-full py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors mb-8">
                Start Free Trial
              </button>
              <ul className="space-y-4">
                {['Subdomain (clinic.docpulse.com)', 'Up to 50 appointments/mo', 'Basic website templates', 'Email notifications'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white">Professional</h3>
              <p className="text-slate-400 text-sm mt-2">For growing independent practices.</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-white">₹{isAnnualPlan ? '799' : '999'}</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors mb-8">
                Get Professional
              </button>
              <ul className="space-y-4">
                {['Custom domain connection', 'Unlimited appointments', 'WhatsApp & SMS alerts', 'Online payments integration', 'Premium templates'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hospital Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Hospital</h3>
              <p className="text-slate-500 text-sm mt-2">For multi-doctor clinics & hospitals.</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-slate-900">₹{isAnnualPlan ? '1,999' : '2,499'}</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <button className="w-full py-2.5 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors mb-8">
                Contact Sales
              </button>
              <ul className="space-y-4">
                {['Everything in Professional', 'Multiple doctor profiles', 'Staff & Receptionist logins', 'Advanced Revenue Analytics', 'Priority 24/7 Support'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="py-20 lg:py-32 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button 
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-4 text-slate-600 border-t border-slate-200 bg-slate-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">DocPulse</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">Empowering doctors to build their digital presence and manage clinics efficiently.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} DocPulse Technologies. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

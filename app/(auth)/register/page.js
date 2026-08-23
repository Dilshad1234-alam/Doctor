"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, CheckCircle2, Star, User, Mail, Lock, Phone, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push('/login');
        router.refresh();
      } else {
        setError(data.message || data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] text-[#0f172a] selection:bg-[#164e63] selection:text-white font-sans antialiased">
      
      {/* Left Column: Brand Showcase (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-[#0a2635] via-[#0d3b4d] to-[#124e5e] p-12 flex-col justify-between fixed left-0 top-0 bottom-0 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-[#164e63]/40 blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-2 text-white">
          <HeartPulse className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-extrabold tracking-tight">DocPulse</h1>
        </div>

        <div className="relative z-10 max-w-lg mt-12">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-8">
            Empowering Doctors to Build Their Digital Clinic in Minutes.
          </h2>
          
          <ul className="space-y-5 mb-12">
            {[
              "Zero-code website setup",
              "24/7 automated OPD slots",
              "Direct patient queue management"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-slate-200 font-medium">
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl max-w-lg">
          <div className="flex gap-1 mb-4">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-white text-lg font-medium leading-relaxed mb-6">
            "Since joining DocPulse, my clinic's operational efficiency has doubled. Patients love booking online, and I don't need a receptionist to manage my schedule."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600">
              <User className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-white font-bold">Dr. Rajesh Kumar</p>
              <p className="text-slate-300 text-sm">Senior Neurologist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-6 sm:p-12 min-h-screen py-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative my-auto">
          
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 hover:text-[#164e63] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to main site
          </Link>
          
          <div className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-3 shadow-inner border border-slate-100">
            <HeartPulse className="w-6 h-6 text-[#164e63]" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a] mb-1">Create Your Doctor Account</h2>
          <p className="text-xs font-semibold text-slate-600 mb-4">Start your 14-day free trial. No credit card required.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="doctor@clinic.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#164e63] focus:border-transparent outline-none transition-all font-normal text-xs text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#0f172a] hover:bg-[#1e293b] disabled:bg-slate-800 text-white font-bold tracking-wide py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
              ) : (
                <>Create Doctor Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-bold tracking-wide text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="text-[#164e63] hover:underline">Sign In</Link>
          </p>

        </div>
      </div>
      
    </div>
  );
}

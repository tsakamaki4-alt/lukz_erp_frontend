'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, UserCircle, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side Validation: Match Passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://elmeralexis1998.pythonanywhere.com/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            username: formData.username,
            password: formData.password
        }),
      });

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        const data = await response.json();
        setError(data.detail || 'Registration failed. Check if username exists.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection failed. Ensure your Django server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* 1. FULL PAGE LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-md transition-all duration-500">
           <div className="relative">
              {/* Outer Spin Ring */}
              <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              {/* Inner Pulse Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="text-blue-400 animate-pulse" size={28} />
              </div>
           </div>
           <h3 className="mt-6 text-white font-bold tracking-widest uppercase text-sm animate-pulse">
             Registering...
           </h3>
           <p className="mt-2 text-slate-500 text-[10px] font-mono tracking-widest uppercase">
             Establishing Secure ISO-27001 Protocol...
           </p>
        </div>
      )}

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-[#111827] rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative z-10">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 to-indigo-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-40" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white p-2 rounded-xl text-blue-600 font-bold text-sm shadow-lg">Lukz</div>
              <span className="text-2xl font-bold tracking-tight text-white uppercase">ERP</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-6">
              Precision from <br /> the First Step.
            </h2>
            <p className="text-blue-100/80 text-lg leading-relaxed">
              Create your account to join the LUKZ ERP manufacturing ecosystem.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-blue-100/60 text-xs font-mono tracking-widest uppercase">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>ISO 27001 Data Standards</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Request Access</h1>
            <p className="text-slate-400">Join the system to start managing batches.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSignUp}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-bounce">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required placeholder="John" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System Username</label>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input name="username" type="text" value={formData.username} onChange={handleChange} required placeholder="jdoe_admin" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="j.doe@email.com" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm" />
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] text-slate-500 hover:text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 ml-1 transition-colors">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? 'Hide Passwords' : 'Show Passwords'}
            </button>

            {/* 2. DYNAMIC SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/10 mt-2 group relative overflow-hidden"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse tracking-widest text-xs">PROCESSING REGISTRATION...</span>
                </>
              ) : (
                <>
                  Complete Registration 
                  <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account? <Link href="/login" className="text-blue-400 font-bold hover:underline underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
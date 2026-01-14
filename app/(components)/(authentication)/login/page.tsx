'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, X, Clock } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('from') || '/dashboard';
  const reason = searchParams.get('reason');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const setAuthCookie = (token: string) => {
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax; ${
      window.location.protocol === 'https:' ? 'Secure' : ''
    }`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsPending(false);

    try {
      // 1. Authenticate with your Django Backend
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // --- 2. START N8N MONITORING LOGIC ---
      // We trigger this immediately after the response
      fetch('http://localhost:5678/webhook/auth-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          status: response.ok ? 'SUCCESS' : (response.status === 403 ? 'PENDING' : 'FAILED'),
          errorCode: response.status,
          attemptTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }),
      }).catch(() => console.warn('n8n Logging Node unreachable. Check if Docker is running.'));
      // --- END N8N MONITORING LOGIC ---

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
        localStorage.setItem('email', data.email); 
        localStorage.setItem('is_staff', data.is_staff ? 'true' : 'false');
        localStorage.setItem('is_superuser', data.is_superuser ? 'true' : 'false');
        
        setAuthCookie(data.token);
        
        router.push(redirectTo);
        router.refresh();
      } else {
        setLoading(false);
        if (response.status === 403) {
          setIsPending(true);
          setError("Account Pending: A supervisor must approve your access.");
        } else {
          const msg = data.non_field_errors?.[0] || data.detail || 'Access Denied: Invalid credentials.';
          setError(msg);
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Ensure your Django server is running.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative selection:bg-blue-500/30 overflow-hidden">
      
      {/* FULL PAGE LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-md transition-all duration-500">
            <div className="relative">
               <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldCheck className="text-blue-400 animate-pulse" size={28} />
               </div>
            </div>
            <h3 className="mt-6 text-white font-bold tracking-widest uppercase text-sm animate-pulse">
               Verifying Credentials
            </h3>
            <p className="mt-2 text-slate-500 text-[10px] font-mono tracking-widest uppercase">
               Initializing Secure Protocol...
            </p>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#111827] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Recover Access</h2>
              <p className="text-slate-400 text-sm">Contact your supervisor or enter your username to request a credential reset.</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                placeholder="Enter Username" 
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN LOGIN CARD */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-[#111827] rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative z-10">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-40" />
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 group w-fit">
              <div className="bg-white p-2 rounded-xl text-blue-600 font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">Lukz</div>
              <span className="text-2xl font-bold tracking-tight text-white uppercase">ERP</span>
            </Link>

            <h2 className="text-4xl font-black text-white leading-tight mb-6">
              Precision Control <br /> in Every Batch.
            </h2>
            <p className="text-blue-100/80 text-lg leading-relaxed">
              Login to access formulation records, R&D logs, and manufacturing analytics.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-blue-100/40 text-xs font-mono tracking-widest uppercase">
            <ShieldCheck size={16} className="text-blue-300" />
            <span>Secure Enterprise Login</span>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#111827]">
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 transition-colors group w-fit"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-400">Enter your system credentials below.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            
            {reason === 'inactivity' && !error && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <Clock size={16} />
                Session expired due to inactivity. Please log in again.
              </div>
            )}

            {error && (
              <div className={`border text-xs p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 ${
                isPending ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {isPending ? <Clock size={16} className="animate-pulse" /> : <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${username ? 'text-blue-500' : 'text-slate-500'}`} size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="System username" 
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${password ? 'text-blue-500' : 'text-slate-500'}`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="flex justify-end px-1">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/10 mt-6 group relative overflow-hidden"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse tracking-widest text-xs">SYNCHRONIZING...</span>
                </>
              ) : (
                <>
                  Sign In to System 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-sm">
            Need system access? {' '}
            <Link href="/signup" className="text-blue-400 font-bold hover:underline underline-offset-4">
              Request Credentials
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
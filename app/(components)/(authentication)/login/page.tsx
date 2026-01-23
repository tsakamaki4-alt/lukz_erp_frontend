'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, X, Clock, Copy, Search, AlertCircle, Fingerprint } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

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

  // Visitor Validation Logic
  const [visitorInput, setVisitorInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState(false);
  
  // Developer Identity Secret
  const DEVELOPER_SECRET = "alicaway-08/17/1998"; 

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (visitorInput.toLowerCase() === DEVELOPER_SECRET.toLowerCase()) {
      setIsValidated(true);
      setValidationError(false);
    } else {
      setValidationError(true);
      // Reset error after 2 seconds
      setTimeout(() => setValidationError(false), 2000);
    }
  };

  const handleQuickFill = () => {
    if (isValidated) {
      setUsername('admin_test');
      setPassword('12345678!');
    }
  };

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
        // 1. Authenticate with Django
        const data = await apiRequest<any>('/api/auth/login/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });

        // 2. Extract Location/Device from the Backend Response
        const place = data.location_context?.place || 'Location Unknown';
        const device = data.location_context?.device || navigator.platform;

        // 3. n8n Webhook logging (Now including the PLACE from Backend)
        fetch('https://habilimental-aliana-fluorometric.ngrok-free.dev/webhook/auth-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            status: 'SUCCESS',
            errorCode: 200,
            attemptTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: device, // Using the cleaner device name from Django
            place: place      // This is the "Place" you were looking for!
          }),
        }).catch(() => console.warn('n8n Logging Node unreachable.'));

        // 4. Save to LocalStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
        localStorage.setItem('email', data.email); 
        localStorage.setItem('is_staff', data.is_staff ? 'true' : 'false');
        localStorage.setItem('is_superuser', data.is_superuser ? 'true' : 'false');
        localStorage.setItem('user', JSON.stringify(data.user || data));

        setAuthCookie(data.token);
        router.push(redirectTo);
        router.refresh();

      } catch (err: any) {
        setLoading(false);

        // Log Failures to n8n
        fetch('https://habilimental-aliana-fluorometric.ngrok-free.dev/webhook/auth-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            status: err.status === 403 ? 'Inactive Account - Approval Needed' : 'Invalid Credentials',
            errorCode: err.status || 500,
            attemptTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            place: "Authentication Blocked" 
          }),
        }).catch(() => console.warn('n8n Logging Node unreachable.'));

        if (err.status === 403) {
          setIsPending(true);
          setError("Account Pending: A supervisor must approve your access.");
        } else if (err.status === 401 || err.status === 400) {
          const msg = err.non_field_errors?.[0] || err.detail || 'Access Denied: Invalid credentials.';
          setError(msg);
        } else {
          setError('Connection failed. Ensure your Django server is running.');
        }
      }
    };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative selection:bg-blue-500/30 overflow-hidden text-slate-200">
      
      {loading && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-md transition-all duration-500">
            <div className="relative">
               <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldCheck className="text-blue-400 animate-pulse" size={28} />
               </div>
            </div>
            <h3 className="mt-6 text-white font-bold tracking-widest uppercase text-sm animate-pulse">Verifying Credentials</h3>
            <p className="mt-2 text-slate-500 text-[10px] font-mono tracking-widest uppercase">Initializing Secure Protocol...</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#111827] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldCheck size={24} /></div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Recover Access</h2>
              <p className="text-slate-400 text-sm">Contact your supervisor or enter your username to request a credential reset.</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Enter Username" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20">Submit Request</button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-[#111827] rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative z-10">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-40" />
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 group w-fit">
              <div className="bg-white p-2 rounded-xl text-blue-600 font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">Lukz</div>
              <span className="text-2xl font-bold tracking-tight text-white uppercase">ERP</span>
            </Link>

            <h2 className="text-4xl font-black text-white leading-tight mb-6">Precision Control <br /> in Every Batch.</h2>
            <p className="text-blue-100/80 text-lg leading-relaxed mb-10">Login to access formulation records, R&D logs, and manufacturing analytics.</p>

            {/* Restricted Visitor Access Area */}
            <div className="relative min-h-[160px]">
              {!isValidated ? (
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <Fingerprint className="w-3 h-3 text-blue-400" /> Identity Verification
                    </div>
                    {validationError && (
                      <div className="flex items-center gap-1 text-red-400 text-[9px] font-black uppercase animate-bounce">
                        <AlertCircle className="w-3 h-3" /> Access Denied
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleVerifyIdentity} className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input 
                        type="text"
                        value={visitorInput}
                        onChange={(e) => setVisitorInput(e.target.value)}
                        placeholder="Format: lastname-mm/dd/yyyy"
                        className={`w-full bg-white/5 border ${validationError ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-white/10'} rounded-xl py-3 pl-9 pr-4 text-white text-xs font-mono outline-none focus:ring-1 focus:ring-blue-400/50 transition-all placeholder:text-white`}
                      />
                    </div>
                    <button type="submit" className="hidden">Verify</button>
                    <p className="text-[9px] text-blue-200/40 uppercase font-black tracking-tighter">Enter developer surname & birthdate to unlock system keys</p>
                    <p className="text-[9px] text-blue-200/40 uppercase font-black tracking-tighter text-center">AND HIT Enter</p>

                  </form>
                </div>
              ) : (
                <div 
                  onClick={handleQuickFill}
                  className="cursor-pointer bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 w-full transition-all hover:bg-emerald-500/20 group/card animate-in flip-in-x duration-700 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <ShieldCheck className="w-3 h-3" /> Admin Keys Unlocked
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center justify-between gap-12 border-b border-emerald-500/10 pb-2">
                      <span className="text-emerald-500/60 text-[10px] uppercase tracking-tighter font-bold">System ID</span>
                      <span className="text-white font-black tracking-wider uppercase">admin_test</span>
                    </div>
                    <div className="flex items-center justify-between gap-12">
                      <span className="text-emerald-500/60 text-[10px] uppercase tracking-tighter font-bold">Secret</span>
                      <span className="text-white font-black tracking-wider uppercase">*********</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center gap-2 text-emerald-400/50 text-[10px] uppercase font-black group-hover/card:text-emerald-300 transition-colors">
                    <Copy size={12} /> Click to Inject Credentials
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-blue-100/40 text-xs font-mono tracking-widest uppercase mt-20">
            <ShieldCheck size={16} className="text-blue-300" />
            <span>Secure Enterprise Login</span>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#111827]">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 transition-colors group w-fit">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Access</h1>
            <p className="text-slate-400">Authorized personnel only. Logs are recorded.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {reason === 'inactivity' && !error && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Session expired due to inactivity.
              </div>
            )}

            {error && (
              <div className={`border text-xs p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 ${isPending ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {isPending ? <Clock size={16} className="animate-pulse" /> : <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${username ? 'text-blue-500' : 'text-slate-500'}`} size={18} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${password ? 'text-blue-500' : 'text-slate-500'}`} size={18} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <div className="flex justify-end px-1"><button type="button" onClick={() => setIsModalOpen(true)} className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">Request Access Reset</button></div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/10 mt-6 group relative overflow-hidden">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="animate-pulse tracking-widest text-xs">ESTABLISHING CONNECTION...</span></> : <>Authenticate <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-sm">Need a system profile? <Link href="/signup" className="text-blue-400 font-bold hover:underline underline-offset-4">Register Account</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
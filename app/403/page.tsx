'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, ShieldAlert, Lock, Zap } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 selection:bg-rose-500/30 overflow-hidden relative">
      
      {/* Background Decorative Element - Red tint for warning */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Error Illustration */}
        <div className="relative inline-block">
          <div className="text-[150px] font-black leading-none tracking-tighter text-white/5 select-none">
            403
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-rose-600/20 p-5 rounded-3xl border border-rose-500/30 shadow-2xl animate-pulse shadow-rose-500/20">
              <Lock size={48} className="text-rose-400" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest">
            <ShieldAlert size={14} /> Access Forbidden
          </div>
          <h1 className="text-4xl font-black tracking-tight">Security Clearance Required</h1>
          <p className="text-slate-400 leading-relaxed">
            Your current account does not have the necessary permissions to access this administrative module. This attempt has been logged.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button 
            onClick={() => router.back()}
            className="w-full sm:flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          
          <Link 
            href="/dashboard" 
            className="w-full sm:flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 active:scale-95 group"
          >
            <Home size={18} /> Exit to Safety
          </Link>
        </div>

        {/* Technical Footer */}
        <div className="pt-12 flex items-center justify-center gap-3 text-slate-600 text-[10px] font-mono tracking-widest uppercase">
          <Zap size={12} />
          <span>Security Protocol Active | Lukz ERP Core</span>
        </div>
      </div>
    </div>
  );
}
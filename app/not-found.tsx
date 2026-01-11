'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, AlertCircle, Zap } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Error Illustration */}
        <div className="relative inline-block">
          <div className="text-[150px] font-black leading-none tracking-tighter text-white/5 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30 shadow-2xl animate-bounce shadow-blue-500/20">
              <Search size={48} className="text-blue-400" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={14} /> Resource Not Found
          </div>
          <h1 className="text-4xl font-black tracking-tight">System Path Invalid</h1>
          <p className="text-slate-400 leading-relaxed">
            The module or record you are looking for does not exist or has been moved to a different department.
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
            href="/" 
            className="w-full sm:flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
          >
            <Home size={18} /> Return Home
          </Link>
        </div>

        {/* Technical Footer */}
        <div className="pt-12 flex items-center justify-center gap-3 text-slate-600 text-[10px] font-mono tracking-widest uppercase">
          <Zap size={12} />
          <span>Lukz ERP Core v1.0.4</span>
        </div>
      </div>
    </div>
  );
}
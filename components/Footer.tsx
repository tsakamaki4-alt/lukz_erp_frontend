'use client';

import React, { useState, useEffect } from 'react';
import { Code2, RefreshCw, Terminal } from 'lucide-react';

export default function Footer() {
  const [lastSync, setLastSync] = useState<string>('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/90 backdrop-blur-md w-full">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Status Capsule - Now HIDDEN on mobile, visible on LG screens */}
          <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-white/5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
            <div className="flex items-center px-4">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap">
                System Nominal
              </span>
            </div>
          </div>

          {/* Branding Section - Centered signature for mobile */}
          <div className="flex flex-col items-center lg:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                <Code2 size={14} className="text-white" />
              </div>
              <p className="text-sm font-black text-slate-900 tracking-tight">
                LUKZ <span className="text-blue-600 uppercase">ERP</span>
              </p>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Architect & Lead Engineer
            </p>
          </div>

          {/* Technical Metadata - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                <RefreshCw size={10} className="text-blue-500" />
                Sync
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{lastSync}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                <Terminal size={10} className="text-emerald-500" />
                Env
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase">Production</span>
            </div>
          </div>

          {/* Minimal Baseline - Only visible element besides branding on mobile */}
          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest border-t border-slate-50 lg:border-0 w-full lg:w-auto text-center pt-4 lg:pt-0">
            © {currentYear} LUKZ INDUSTRIAL
          </div>

        </div>
      </div>
    </footer>
  );
}
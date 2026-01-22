'use client';

import React, { useState, useEffect } from 'react';
import { Code2, RefreshCw, Terminal, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  const [lastSync, setLastSync] = useState<string>('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  return (
    <footer className="mt-auto border-t-2 border-slate-300 bg-[#F3F4F6] w-full select-none">
      <div className="max-w-[1600px] mx-auto p-3 md:p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
          
          {/* Status & Security Capsule */}
          <div className="hidden lg:flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 shadow-inner">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded border border-white/5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">System Live</span>
            </div>
            <div className="flex items-center gap-4 px-4 border-l border-slate-700 ml-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={10} className="text-blue-400" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                <Cpu size={10} className="text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider italic">V.2.0.4-PROD</span>
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="flex flex-col items-center lg:items-start gap-0.5">
            <div className="flex items-center gap-2">
              <div className="bg-slate-800 p-1 rounded">
                <Code2 size={12} className="text-white" />
              </div>
              <p className="text-base font-black text-slate-900 tracking-tighter">
                LUKZ <span className="text-blue-700 uppercase">ERP</span>
                <span className="ml-2 text-[10px] text-slate-400 font-normal">INDUSTRIAL ENGINE</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-px w-4 bg-blue-600 hidden lg:block" />
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">
                 Chemical Formulation & Inventory Control
               </p>
            </div>
          </div>

          {/* Technical Metadata */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex flex-col items-end border-r border-slate-300 pr-10">
              <div className="flex items-center gap-1.5 text-slate-500 text-[8px] font-black uppercase tracking-widest mb-0.5">
                <RefreshCw size={9} className="text-blue-600" />
                Last Global Sync
              </div>
              <span className="text-[11px] font-mono font-black text-slate-800">{lastSync}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-slate-500 text-[8px] font-black uppercase tracking-widest mb-0.5">
                <Terminal size={9} className="text-emerald-600" />
                Environment
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="text-[11px] font-mono font-black text-emerald-700 uppercase">Production</span>
              </div>
            </div>
          </div>

          {/* Copyright Baseline */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-slate-200 lg:border-0 w-full lg:w-auto text-center pt-3 lg:pt-0">
              © {currentYear} LUKZ INDUSTRIAL CO.
            </div>
            <span className="text-[7px] text-slate-300 uppercase font-bold tracking-widest mt-1">
              All Rights Reserved. Unauthorized Access Prohibited.
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
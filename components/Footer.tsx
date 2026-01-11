'use client';

import React, { useState, useEffect } from 'react';
import { Code2, ExternalLink, RefreshCw, Terminal, Cpu } from 'lucide-react';

export default function Footer() {
  const [lastSync, setLastSync] = useState<string>('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-md p-4 md:p-6 w-full">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-y-8 lg:gap-6">
        
        {/* Left Side: Dev Signature - Stacks better on mobile */}
        <div className="flex items-center gap-4 group self-start lg:self-center">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
            <Code2 size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              Developed by <span className="font-bold text-slate-900 tracking-tight text-base">Lukz</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Lead Engineer</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
              <span className="text-[10px] text-slate-400 italic hidden sm:block">Precision & Design</span>
            </div>
          </div>
        </div>

        {/* Center: Live Status Capsule - Becomes a compact grid on mobile */}
        <div className="w-full lg:w-auto flex items-center bg-slate-900 p-1 rounded-2xl lg:rounded-full border border-slate-800 shadow-inner overflow-hidden">
          <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 bg-slate-800 rounded-xl lg:rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[9px] lg:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live</span>
          </div>
          <div className="flex flex-1 items-center justify-around lg:justify-start gap-3 px-3 lg:px-4 py-1.5">
            <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">System Nominal</span>
            <div className="h-3 w-[1px] bg-slate-700" />
            <span className="text-[9px] lg:text-[10px] font-mono text-blue-400 uppercase font-bold">v1.2.0</span>
          </div>
        </div>

        {/* Right Side: Metadata - 2x2 Grid on Mobile, Row on Desktop */}
        <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-6 lg:gap-8">
          <div className="grid grid-cols-2 md:flex md:items-center gap-6 w-full md:w-auto">
            <div className="flex flex-col items-start md:items-end border-l-2 md:border-l-0 md:pr-0 pl-3 md:pl-0 border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <RefreshCw size={10} className="animate-[spin_4s_linear_infinite]" />
                Last Sync
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{lastSync}</span>
            </div>
            
            <div className="flex flex-col items-start md:items-end border-l-2 md:border-l-0 md:pr-0 pl-3 md:pl-0 border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Terminal size={10} />
                Env
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase">Production</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 hidden lg:block" />

          <div className="flex flex-row md:flex-col items-center justify-between md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
             <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-xs font-bold tracking-tight">
               <span className="text-slate-300 font-normal">Lukz ERP © {currentYear}</span>
             </div>
             <a 
               href="#" 
               className="group text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-all font-bold uppercase tracking-widest"
             >
               Docs 
               <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
             </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
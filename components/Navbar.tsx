'use client';

import { useState, useEffect } from 'react';
import { Menu, Calendar, Clock, LucideIcon } from 'lucide-react';

interface NavbarProps {
  title: string;
  Icon: LucideIcon;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Navbar({ title, Icon, isSidebarOpen, setIsSidebarOpen }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 w-full flex-shrink-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 bg-[#111827] text-white rounded-lg shadow-md hover:bg-slate-800 transition-all flex-shrink-0"
          >
            <Menu size={20} />
          </button>
        )}
        
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 min-w-0 overflow-hidden">
          <Icon size={18} className="text-blue-600 flex-shrink-0" /> 
          <span className="truncate">{title}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {mounted && (
          <>
            <div className="hidden lg:flex items-center gap-2 text-slate-500 text-xs font-semibold whitespace-nowrap">
              <Calendar size={14} className="text-slate-400" />
              <span>{currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
              })}</span>
            </div>
            
            <div className="hidden lg:block h-4 w-[1px] bg-slate-200 mx-2" />

            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm flex-shrink-0">
              <Clock size={14} className="text-blue-500" />
              <span className="text-xs font-mono font-bold tabular-nums">
                {formatTime(currentTime)}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
'use client';

import { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Import the new Footer
import { Layout, Briefcase } from 'lucide-react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* h-screen and overflow-y-auto ensures the navbar stays at the top 
          and the footer stays at the bottom of the scrollable area.
      */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Dynamic Navbar */}
        <Navbar 
          title="Enterprise Resource Planning" 
          Icon={Briefcase} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        {/* Dashboard Body - flex-1 pushes the footer down */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operational Overview</h1>
            <p className="text-slate-500 text-sm">Welcome to the system. No active processes to display.</p>
          </div>

          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/50">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
              <Layout size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Ready for configuration</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
              The manufacturing dashboard is currently blank. Start by selecting a module from the sidebar.
            </p>
          </div>
        </div>

        {/* Global Footer */}
        <Footer />
      </main>
    </div>
  );
}
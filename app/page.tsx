'use client';

import Link from 'next/link';
import { ShieldCheck, BarChart3, ArrowRight, Zap, Database, Lock, UserPlus } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 h-20 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-600/20">Lukz</div>
          <span className="text-xl font-bold tracking-tight">ERP</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
          
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          
          {/* Auth Links */}
          <Link href="/login" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <Lock size={14} /> Login
          </Link>
          <Link href="/signup" className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
            <UserPlus size={14} /> Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8">
            <Zap size={14} /> NEXT-GEN MANUFACTURING ERP
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-[1.1]">
            Precision Control for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Modern Factories
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete OS for manufacturing. Manage formulations, track live batches, and ensure QA compliance from a single dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Action - Leads to Sign Up */}
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all group shadow-xl shadow-blue-600/20">
              Create Free Account <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {/* Secondary Action - Leads to Login */}
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              Sign In to System
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-white">Enterprise-Grade Features</h2>
          <p className="text-slate-400">Everything you need to scale your manufacturing operations.</p>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Database className="text-cyan-400" />}
              title="Formulation Management"
              desc="Deep-nested formula records with real-time R&D scheduling and version control."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-blue-400" />}
              title="Operational Insights"
              desc="Real-time batch tracking and inventory health metrics on a high-performance dashboard."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-400" />}
              title="QA Compliance"
              desc="Automated quality assurance logs and personnel activity tracking for total accountability."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Lukz Enterprise Resource Planning. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group text-left">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
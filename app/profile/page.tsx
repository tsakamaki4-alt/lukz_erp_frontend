'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  UserCircle, Mail, Shield, Save, CheckCircle2, 
  Camera, User, BadgeCheck 
} from 'lucide-react';

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    joined: 'January 2026'
  });

  useEffect(() => {
    // Sync with localStorage on mount
    setUserData({
      name: localStorage.getItem('username') || 'Authorized User',
      email: localStorage.getItem('email') || 'user@alfamfg.com',
      role: localStorage.getItem('is_staff') === 'true' ? 'Administrator' : 'Staff Member',
      joined: 'January 2026'
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate database update
    setTimeout(() => {
      localStorage.setItem('username', userData.name);
      localStorage.setItem('email', userData.email);
      
      setIsSaving(false);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar 
          title="Account Identity" 
          Icon={User} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        {/* Profile Body */}
        <div className="p-6 flex-1 flex flex-col max-w-6xl w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
            <p className="text-slate-500 text-sm">Manage your ERP identity and security credentials.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* LEFT: IDENTITY CARD */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-24 bg-slate-900" />
                
                <div className="relative mt-4 inline-block">
                  <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                       <UserCircle className="text-slate-300 w-16 h-16" />
                    </div>
                  </div>
                  <button className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-xl text-white shadow-lg hover:scale-110 transition-transform border-2 border-white">
                    <Camera size={14} />
                  </button>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-bold text-slate-900">{userData.name}</h2>
                  <p className="text-slate-500 text-sm font-mono">{userData.email}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 py-1.5 px-4 bg-slate-50 rounded-2xl w-fit mx-auto border border-slate-100">
                  <BadgeCheck size={16} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{userData.role}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Security Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Account Created</span>
                    <span className="text-slate-700 font-bold">{userData.joined}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Auth Level</span>
                    <span className="text-emerald-600 font-black uppercase">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: EDIT FORM */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col h-full">
                {showSuccess && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Identity Updated</h3>
                      <p className="text-slate-500 text-sm">Your profile changes are now live across the system.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Connection</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Shield size={16} />
                    <span className="text-[10px] font-medium leading-tight max-w-[200px]">Profile modifications are recorded in the security audit log.</span>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all flex items-center gap-2 group"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
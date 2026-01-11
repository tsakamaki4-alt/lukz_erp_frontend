'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar"; // Import our new shared Navbar
import { 
  Users, UserMinus, UserCheck, Trash2, 
  Search, Filter, Check, Loader2, ChevronDown
} from 'lucide-react';
import Footer from '@/components/Footer';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export default function UserManagementPage() {
  // --- UI & Sidebar State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // --- Data & Logic State ---
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'operator'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Custom Modal State
  const [userToDelete, setUserToDelete] = useState<{id: number, username: string} | null>(null);

  // --- Column Visibility State ---
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    role: true,
    status: true,
    joined: false,
  });

  const activeColCount = 2 + Object.values(visibleColumns).filter(Boolean).length;

  // --- Effects ---
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- API Actions ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://elmeralexis1998.pythonanywhere.com/api/users/', {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const response = await fetch(`https://elmeralexis1998.pythonanywhere.com/api/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      }
    } catch (err) {
      alert("Error updating user status");
    } finally {
      setProcessingId(null);
    }
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id;
    setProcessingId(userId);
    setUserToDelete(null);

    try {
      const response = await fetch(`https://elmeralexis1998.pythonanywhere.com/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Filter Logic ---
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'all' ? true :
      roleFilter === 'staff' ? u.is_staff : !u.is_staff;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* REUSABLE NAVBAR */}
        <Navbar 
          title="User Management" 
          Icon={Users} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="p-6 w-full">
          {/* Action Bar */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-3 mb-6 w-full">
             <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowColumnMenu(!showColumnMenu)} 
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  <Filter size={14} /> Columns <ChevronDown size={14} className={`transition-transform ${showColumnMenu ? 'rotate-180' : ''}`} />
                </button>
                {showColumnMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 border-t-4 border-t-blue-600">
                    <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-widest">Display Settings</p>
                    {Object.entries(visibleColumns).map(([key, val]) => (
                      <div 
                        key={key} 
                        onClick={() => setVisibleColumns(prev => ({...prev, [key as keyof typeof visibleColumns]: !val}))} 
                        className="flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded text-xs cursor-pointer capitalize font-medium text-slate-700"
                      >
                        {key} {val && <Check size={14} className="text-blue-600 font-bold"/>}
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="relative min-w-[160px] w-full md:w-auto">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full pl-3 pr-10 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 appearance-none bg-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer shadow-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="staff">Staff Only</option>
                  <option value="operator">Operators Only</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                   <ChevronDown size={14} />
                </div>
             </div>

             <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or username..." 
                  className="w-full pl-10 pr-4 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" 
                />
             </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
                  <tr className="text-[11px] uppercase font-bold text-slate-500">
                    <th className="px-6 py-4">Employee</th>
                    {visibleColumns.email && <th className="px-6 py-4">Email</th>}
                    {visibleColumns.role && <th className="px-6 py-4 text-center">Role</th>}
                    {visibleColumns.status && <th className="px-6 py-4 text-center">Status</th>}
                    {visibleColumns.joined && <th className="px-6 py-4 text-center">Joined Date</th>}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={activeColCount + 1} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={activeColCount + 1} className="p-10 text-center text-slate-400 font-medium">No users found matching current filters.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-xs shadow-inner flex-shrink-0">
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-700 leading-none mb-1 truncate">{user.first_name} {user.last_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        {visibleColumns.email && <td className="px-6 py-4 text-sm text-slate-600 font-medium truncate max-w-[200px]">{user.email || '—'}</td>}
                        {visibleColumns.role && (
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${user.is_staff ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {user.is_staff ? 'Staff' : 'Operator'}
                            </span>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-sm border ${user.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        )}
                        {visibleColumns.joined && (
                          <td className="px-6 py-4 text-center text-xs text-slate-500 font-mono">
                            {new Date(user.date_joined).toLocaleDateString()}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {processingId === user.id ? (
                              <Loader2 className="animate-spin text-blue-600" size={18} />
                            ) : (
                              <>
                                <button 
                                  onClick={() => toggleUserStatus(user.id, user.is_active)}
                                  className={`p-1.5 rounded-lg border transition-all shadow-sm ${user.is_active ? 'border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                  title={user.is_active ? "Deactivate User" : "Activate User"}
                                >
                                  {user.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                                </button>
                                <button 
                                  onClick={() => setUserToDelete({ id: user.id, username: user.username })}
                                  className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                  title="Permanently Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <Footer />
        
      </main>

      {/* --- CUSTOM DARK DELETE MODAL --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Confirm Deletion</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to permanently delete user <span className="text-rose-400 font-bold underline decoration-rose-400/30 underline-offset-4 px-1 italic">"{userToDelete.username}"</span>? 
                This action will revoke all system access immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-800/80 border-t border-slate-700">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-900/40 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
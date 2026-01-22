'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar"; 
import Footer from '@/components/Footer';
import { 
  Users, Trash2, Search, Filter, Check, 
  Loader2, ChevronDown, UserCog
} from 'lucide-react';

import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';
import { apiRequest } from '@/app/lib/api'; // Integrated the fixed wrapper

// --- Types ---
interface Permission { id: number; name: string; codename: string; }
interface Group { id: number; name: string; permissions?: Permission[]; }
interface UserData {
  id: number; username: string; email: string;
  first_name: string; last_name: string;
  is_active: boolean; is_staff: boolean;
  date_joined: string; groups: Group[];
}

export default function UserManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<UserData[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const [userToDelete, setUserToDelete] = useState<{id: number, username: string} | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    email: true, roles: true, status: true, joined: true,
  });

  // --- API Handlers ---
  const hasAccess = (permissionCodename: string): boolean => {
    if (typeof window === 'undefined') return false;
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;
    try {
      const loggedInUser = JSON.parse(userJson);
      if (loggedInUser.is_superuser) return true;
      return loggedInUser.groups?.some((g: any) => 
        g.permissions?.some((p: any) => p.codename === permissionCodename)
      );
    } catch { return false; }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchGroups()]);
      setLoading(false);
    };
    initData();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest<UserData[]>('/api/core/users/');
      setUsers(data);
    } catch (err) { 
      console.error("Failed to fetch users:", err); 
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await apiRequest<Group[]>('/api/core/groups/');
      setAvailableGroups(data);
    } catch (err) { 
      console.error("Failed to fetch groups:", err); 
    }
  };

  const handleUpdateUser = async (userId: number, updateData: any) => {
    setProcessingId(userId);
    try {
      const updatedUser = await apiRequest<UserData>(`/api/core/users/${userId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setUserToEdit(null);
    } catch (err) { 
      alert("Update failed"); 
    } finally { 
      setProcessingId(null); 
    }
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setProcessingId(userToDelete.id);
    try {
      await apiRequest(`/api/core/users/${userToDelete.id}/`, {
        method: 'DELETE',
      });
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) { 
      alert("Delete failed"); 
    } finally { 
      setProcessingId(null); 
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username + u.first_name + u.last_name + u.email).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.groups.some(g => g.id === Number(roleFilter));
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 w-full flex flex-col h-screen overflow-y-auto transition-all duration-300">
        <Navbar 
          title="User Identity Management" 
          Icon={Users} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="p-8 w-full flex-1 flex flex-col space-y-6">
          
          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center gap-4">
             <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setShowColumnMenu(!showColumnMenu)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-400 transition-all">
                    <Filter size={16} /> <span>Columns</span> <ChevronDown size={14} className={showColumnMenu ? 'rotate-180 transition-transform' : ''} />
                  </button>
                  {showColumnMenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2">
                      {Object.entries(visibleColumns).map(([key, val]) => (
                        <div key={key} onClick={() => setVisibleColumns(prev => ({...prev, [key as keyof typeof visibleColumns]: !val}))} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl text-sm cursor-pointer capitalize font-medium text-slate-600">
                          <span>{key}</span> {val && <Check size={14} className="text-slate-900" strokeWidth={2.5} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-white font-medium appearance-none outline-none focus:ring-2 focus:ring-slate-900/5 transition-all cursor-pointer min-w-[180px]">
                    <option value="all">Security Groups</option>
                    {availableGroups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
             </div>

             <div className="flex-1 relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter directory by identity, email or role..." className="w-full pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-slate-300 transition-all" />
             </div>
          </div>

          {/* Directory Table Wrapper */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full flex-1">
            <div className="overflow-x-auto w-full h-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    <th className="px-8 py-5">System Identity</th>
                    {visibleColumns.email && <th className="px-6 py-5">Communication</th>}
                    {visibleColumns.roles && <th className="px-6 py-5">Access Groups</th>}
                    {visibleColumns.status && <th className="px-6 py-5 text-center">Status</th>}
                    {visibleColumns.joined && <th className="px-6 py-5 text-center">Onboarded</th>}
                    <th className="px-8 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={48} /></td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="p-32 text-center text-slate-400 font-medium">No results found in identity directory.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-medium text-base shadow-sm group-hover:scale-105 transition-transform">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-800 tracking-tight">{user.first_name} {user.last_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">UID: {user.username}</div>
                            </div>
                          </div>
                        </td>
                        {visibleColumns.email && (
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-slate-600">{user.email || '—'}</div>
                            <div className="text-[9px] font-medium text-slate-300 uppercase">Primary Contact</div>
                          </td>
                        )}
                        {visibleColumns.roles && (
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1.5">
                              {user.groups.length > 0 ? user.groups.map(g => (
                                <div key={g.id} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-medium text-slate-500 uppercase">
                                  {g.name}
                                </div>
                              )) : <span className="text-[9px] text-slate-300 italic">None</span>}
                            </div>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                              {user.is_active ? 'Authorized' : 'Locked'}
                            </span>
                          </td>
                        )}
                        {visibleColumns.joined && (
                          <td className="px-6 py-5 text-center">
                            <div className="text-[11px] font-medium text-slate-500">{new Date(user.date_joined).toLocaleDateString()}</div>
                          </td>
                        )}
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            {processingId === user.id ? (
                              <div className="w-9 h-9 flex items-center justify-center">
                                <Loader2 className="animate-spin text-slate-400" size={18} />
                              </div>
                            ) : (
                              <>
                                {hasAccess('change_user') && (
                                  <button 
                                    onClick={() => setUserToEdit(user)} 
                                    className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                                    title="Edit User"
                                  >
                                    <UserCog size={18} />
                                  </button>
                                )}
                                {hasAccess('delete_user') && (
                                  <button 
                                    onClick={() => setUserToDelete({ id: user.id, username: user.username })} 
                                    className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                    title="Delete User"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
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

      {/* Modals */}
      <EditUserModal 
        user={userToEdit}
        availableGroups={availableGroups}
        onClose={() => setUserToEdit(null)}
        onSave={handleUpdateUser}
        isProcessing={processingId === userToEdit?.id}
      />

      <DeleteUserModal 
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={executeDelete}
        isProcessing={processingId === userToDelete?.id}
      />
    </div>
  );
}
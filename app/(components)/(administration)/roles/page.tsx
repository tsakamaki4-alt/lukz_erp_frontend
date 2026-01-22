'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar"; 
import Footer from '@/components/Footer';
import { 
  ShieldCheck, ShieldAlert, Trash2, Search, 
  Loader2, Plus
} from 'lucide-react';
import GroupActionModal from './GroupActionModal';
import DeleteGroupModal from './DeleteGroupModal';

// --- Centralized API Client Import ---
import { apiRequest } from '@/app/lib/api';

// --- Types ---
interface Permission {
  id: number;
  name: string;
  codename: string;
}

interface Group {
  id: number;
  name: string;
  permissions: Permission[];
}

interface UserAuthResponse {
  permissions: string[];
  is_superuser: boolean;
}

export default function GroupManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isSuperuser, setIsSuperuser] = useState(false);

  /**
   * Fetch User Auth and Permissions using centralized API
   */
  const fetchUserAuth = useCallback(async () => {
    try {
      const data = await apiRequest<UserAuthResponse>('/api/auth/user-info/');
      setUserPermissions(data.permissions || []);
      setIsSuperuser(data.is_superuser || false);
    } catch (err) { 
      console.error("Auth sync failed", err); 
    }
  }, []);

  /**
   * Fetch Security Groups
   */
  const fetchGroups = async () => {
    try {
      const data = await apiRequest<Group[]>('/api/core/groups/');
      setGroups(data);
    } catch (err) { 
      console.error("Failed to fetch groups", err); 
    }
  };

  /**
   * Fetch Global Permissions Matrix
   */
  const fetchPermissions = async () => {
    try {
      const data = await apiRequest<Permission[]>('/api/core/permissions/');
      setAllPermissions(data);
    } catch (err) { 
      console.error("Failed to fetch permissions", err); 
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchGroups(), fetchPermissions(), fetchUserAuth()]);
      setLoading(false);
    };
    initData();
  }, [fetchUserAuth]);

  const can = (perm: string) => isSuperuser || userPermissions.includes(perm);

  /**
   * Create or Update Security Role
   */
  const handleSaveGroup = async (name: string, permissionIds: number[]) => {
    setProcessingId(editingGroup?.id || 0);
    const method = editingGroup ? 'PATCH' : 'POST';
    const url = editingGroup 
      ? `/api/core/groups/${editingGroup.id}/`
      : `/api/core/groups/`;

    try {
      await apiRequest(url, {
        method,
        body: JSON.stringify({ name, permission_ids: permissionIds })
      });
      await fetchGroups();
      setIsModalOpen(false);
      setEditingGroup(null);
    } catch (err) { 
      alert("Failed to save role specifications."); 
    } finally { 
      setProcessingId(null); 
    }
  };

  /**
   * Delete Security Role
   */
  const executeDeleteGroup = async () => {
    if (!groupToDelete) return;
    setProcessingId(groupToDelete.id);
    try {
      await apiRequest(`/api/core/groups/${groupToDelete.id}/`, {
        method: 'DELETE'
      });
      setGroups(groups.filter(g => g.id !== groupToDelete.id));
      setGroupToDelete(null);
    } catch (err) { 
      alert("Delete protocol failed."); 
    } finally { 
      setProcessingId(null); 
    }
  };

  const parsePermission = (codename: string) => {
    const parts = codename.split('_');
    const action = parts[0].toUpperCase(); 
    const module = parts.slice(1).join(' ').replace('master', '').trim();
    return { action, module };
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex w-full min-h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out">
        <Navbar 
          title="Security Roles" 
          Icon={ShieldCheck} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
          {/* Top Search Bar */}
          <div className="w-full bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 mb-6 shadow-sm">
            {can('add_group') && (
              <button 
                onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-md active:scale-95"
              >
                <Plus size={18} />
                <span>Create Role</span>
              </button>
            )}
            
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search security roles..." 
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-100 outline-none transition-all bg-slate-50/50 focus:bg-white" 
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-auto">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                    <th className="px-6 py-4 w-1/4">Role Name</th>
                    <th className="px-6 py-4">Access Privileges</th>
                    <th className="px-6 py-4 text-center w-24">Total</th>
                    <th className="px-6 py-4 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-32 text-center">
                        <Loader2 className="animate-spin mx-auto text-slate-400" size={40} />
                      </td>
                    </tr>
                  ) : filteredGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-semibold text-slate-800">{group.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono italic">Access Role</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          {group.permissions.length > 0 ? (
                            <>
                              {group.permissions.slice(0, 5).map((p) => {
                                const { action, module } = parsePermission(p.codename);
                                return (
                                  <div key={p.id} className="flex h-8 border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm hover:border-slate-300 transition-colors">
                                    <span className="px-2.5 flex items-center justify-center text-[9px] font-bold border-r border-slate-200 text-slate-700 bg-slate-50 uppercase tracking-tight">
                                      {action}
                                    </span>
                                    <span className="px-3 flex items-center text-[11px] font-medium text-slate-600 capitalize whitespace-nowrap">
                                      {module}
                                    </span>
                                  </div>
                                );
                              })}
                              
                              {group.permissions.length > 5 && (
                                <div className="flex items-center justify-center px-2.5 h-7 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                                  +{group.permissions.length - 5}
                                </div>
                              )}
                            </>
                          ) : <span className="text-[10px] text-slate-300 italic">None</span>}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center align-top">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          {group.permissions.length}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right align-top">
                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          {can('change_group') && (
                            <button 
                              onClick={() => { setEditingGroup(group); setIsModalOpen(true); }} 
                              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            >
                              <ShieldAlert size={16} />
                            </button>
                          )}
                          {can('delete_group') && (
                            <button 
                              onClick={() => setGroupToDelete(group)} 
                              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </main>

      <GroupActionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingGroup(null); }} 
        onSave={handleSaveGroup} 
        allPermissions={allPermissions} 
        editingGroup={editingGroup} 
        isProcessing={!!processingId && !groupToDelete} 
      />

      <DeleteGroupModal 
        group={groupToDelete} 
        onClose={() => setGroupToDelete(null)}
        onConfirm={executeDeleteGroup} 
        isProcessing={!!processingId && !!groupToDelete}
      />
    </div>
  );
}
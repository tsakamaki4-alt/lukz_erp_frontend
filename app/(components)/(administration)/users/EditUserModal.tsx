'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Save, Loader2, Power, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';

interface Group { id: number; name: string; }
interface UserData {
  id: number; username: string; email: string;
  first_name: string; last_name: string; is_active: boolean; groups: Group[];
}

interface EditUserModalProps {
  user: UserData | null;
  availableGroups: Group[];
  onClose: () => void;
  onSave: (userId: number, data: any) => Promise<void>;
  isProcessing: boolean;
}

export default function EditUserModal({ user, availableGroups, onClose, onSave, isProcessing }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', is_active: true, 
    group_id: null as number | null 
  });

  const hadMultipleRoles = user ? user.groups.length > 1 : false;

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        is_active: user.is_active,
        group_id: user.groups.length > 0 ? user.groups[0].id : null
      });
    }
  }, [user]);

  if (!user) return null;

  const selectGroup = (groupId: number) => {
    setFormData(prev => ({ ...prev, group_id: groupId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      group_ids: formData.group_id ? [formData.group_id] : []
    };
    onSave(user.id, submissionData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
               <Fingerprint size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Identity Configuration</h3>
              <p className="text-xs text-slate-500 font-medium">Profile: <span className="text-slate-900 font-semibold">{user.username}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Column 1: Identity & Status */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <User size={14} /> Profile Information
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">First Name</label>
                        <input 
                          type="text" 
                          value={formData.first_name} 
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Last Name</label>
                        <input 
                          type="text" 
                          value={formData.last_name} 
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Primary Email</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Account Status moved here under Email */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Power size={14} /> Authorization Status
                  </div>
                  <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${formData.is_active ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-tight ${formData.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formData.is_active ? 'Active Connection' : 'Account Locked'}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                        {formData.is_active ? 'User has full system access.' : 'Access to all modules is restricted.'}
                      </p>
                    </div>
                    <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${formData.is_active ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: Security Groups */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Shield size={14} /> Assigned Security Group
                </div>
                
                {hadMultipleRoles && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 leading-tight">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Warning: This user currently has multiple roles. Saving will overwrite them with a single selection.</span>
                  </div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {availableGroups.map(group => {
                    const isSelected = formData.group_id === group.id;
                    const wasOriginallyAssigned = user.groups.some(g => g.id === group.id);
                    
                    return (
                      <button 
                        key={group.id} 
                        type="button" 
                        onClick={() => selectGroup(group.id)} 
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full transition-colors ${isSelected ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                          {group.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {wasOriginallyAssigned && !isSelected && (
                            <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Existing</span>
                          )}
                          {isSelected && <CheckCircle2 size={14} className="text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="flex items-center gap-3 px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
              Commit Identity Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
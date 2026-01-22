'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, ShieldCheck, Loader2, Layers, CheckSquare, Square } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  codename: string;
  display_name?: string;
}

interface Group {
  id: number;
  name: string;
  permissions: Permission[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, permissionIds: number[]) => void;
  allPermissions: Permission[];
  editingGroup: Group | null;
  isProcessing: boolean;
}

export default function GroupActionModal({ 
  isOpen, onClose, onSave, allPermissions = [], editingGroup, isProcessing 
}: ModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGroupName(editingGroup?.name || '');
      setSelectedIds(editingGroup?.permissions?.map(p => p.id) || []);
      setSearchTerm('');
    }
  }, [editingGroup, isOpen]);

  const getModuleName = (perm: Permission) => {
    let name = perm.codename
      .replace(/^(add_|change_|delete_|view_)/, '')
      .replace(/_master$/, '')
      .replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formatDisplayName = (perm: Permission) => {
    if (perm.display_name) return perm.display_name;
    return getModuleName(perm);
  };

  const groupedPermissions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const groups: Record<string, Permission[]> = {};

    const filtered = (allPermissions || []).filter(p => 
      p.name?.toLowerCase().includes(searchLower) || 
      p.codename?.toLowerCase().includes(searchLower) ||
      getModuleName(p).toLowerCase().includes(searchLower)
    );

    filtered.forEach(p => {
      const module = getModuleName(p);
      if (!groups[module]) groups[module] = [];
      groups[module].push(p);
    });

    return groups;
  }, [allPermissions, searchTerm]);

  const togglePermission = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleModuleSelection = (modulePerms: Permission[]) => {
    const moduleIds = modulePerms.map(p => p.id);
    const isAllSelected = moduleIds.every(id => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
      {/* Reduced width to max-w-4xl */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={22} />
            <h2 className="text-lg font-bold text-slate-800">
              {editingGroup ? 'Edit Role' : 'New Security Role'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Top Controls */}
          <div className="p-5 border-b bg-slate-50/50 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Role Name</label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Administrator"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold text-slate-700 transition-all"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search capabilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
              const isAllModuleSelected = perms.every(p => selectedIds.includes(p.id));
              
              return (
                <div key={moduleName} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-20 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">{moduleName}</h3>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => toggleModuleSelection(perms)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        isAllModuleSelected 
                        ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' 
                        : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {isAllModuleSelected ? <Square size={12} /> : <CheckSquare size={12} />}
                      {isAllModuleSelected ? 'DESELECT' : 'SELECT ALL'}
                    </button>
                  </div>

                  {/* 2-Column Grid for narrower container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perms.map(p => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-500' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                          }`}>
                            {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{formatDisplayName(p)}</p>
                            <p className="text-[9px] font-mono text-slate-400 uppercase truncate">{p.codename}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
          <span className="text-xs font-medium text-slate-500">
            Selected: <span className="text-blue-600 font-bold">{selectedIds.length}</span>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Cancel
            </button>
            <button 
              onClick={() => onSave(groupName, selectedIds)}
              disabled={!groupName || isProcessing}
              className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                !groupName || isProcessing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg active:scale-95'
              }`}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : (editingGroup ? 'Save' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
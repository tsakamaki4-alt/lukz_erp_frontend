'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar"; 
import Footer from '@/components/Footer';
import AddFolderModal from './AddFolderModal'; 
import RenameFolderModal from './RenameFolderModal';
import DeleteFolderModal from './DeleteFolderModal';
import { apiRequest } from '@/app/lib/api';
import { 
  Search, Plus, FolderPlus, 
  Filter, Check, ChevronDown, ChevronRight,
  Beaker, FileText, X, Loader2,
  Pencil, Trash2, Eye 
} from 'lucide-react';

import Link from 'next/link';

// Types for Type-Safety
interface FormulationFolder {
  id: number;
  name: string;
  user_id: number | string;
}

interface FormulaRecord {
  id: number;
  formula_code: string;
  description?: string;
  trade_name?: string;
  formula_class?: string;
  user_id: number | string;
}

interface UserInfo {
  id: number | string;
  pk?: number | string;
  permissions: string[];
  is_superuser: boolean;
}

export default function FormulasPage() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auth & User State
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | string | null>(null); 
  const [isAuthLoading, setIsAuthLoading] = useState(true); 

  // Data State
  const [folders, setFolders] = useState<FormulationFolder[]>([]);
  const [subFormulas, setSubFormulas] = useState<FormulaRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Modal States
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [selectedFolder, setSelectedFolder] = useState<FormulationFolder | null>(null); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    description: true,
    tradeName: true,
    formulaClass: true,
  });

  const fetchUserData = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      // Typing the apiRequest as <UserInfo>
      const data = await apiRequest<UserInfo>('/api/auth/user-info/');
      setPermissions(data.permissions || []);
      setIsSuperuser(data.is_superuser || false);
      setCurrentUserId(data.id || data.pk || null); 
    } catch (error) {
      console.error("Failed to sync fresh permissions:", error);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const canModifyFolder = (folder: FormulationFolder) => 
    isSuperuser || folder.user_id == currentUserId || permissions.includes('change_folder');

  const canDeleteFolder = (folder: FormulationFolder) => 
    isSuperuser || folder.user_id == currentUserId || permissions.includes('delete_folder');

  const canViewFormula = (formula: FormulaRecord) => 
    isSuperuser || formula.user_id == currentUserId || permissions.includes('view_formula_master');

  const canAddFolder = isSuperuser || permissions.includes('add_folder');
  const canAddFormula = isSuperuser || permissions.includes('add_formula_master');

  const activeColCount = 5; 

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      // Typing the apiRequest as <FormulationFolder[]>
      const data = await apiRequest<FormulationFolder[]>('/api/formulation/folders/');
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchFolders();
  }, [fetchUserData, fetchFolders]);

  const handleFolderClick = async (folderId: number) => {
    if (expandedFolderId === folderId) { 
      setExpandedFolderId(null); 
      return; 
    }
    setSubLoading(true); 
    setExpandedFolderId(folderId);
    try {
      // Typing the apiRequest as <FormulaRecord[]>
      const data = await apiRequest<FormulaRecord[]>(`/api/formulation/formulas/?folder_id=${folderId}`);
      setSubFormulas(data);
    } catch (error) {
      console.error("Error fetching formulas:", error);
    } finally { 
      setSubLoading(false); 
    }
  };

  const filteredSubFormulas = useMemo(() => {
    if (!searchQuery.trim()) return subFormulas;
    const lowQuery = searchQuery.toLowerCase();
    return subFormulas.filter(f => 
      f.formula_code?.toLowerCase().includes(lowQuery) || 
      f.description?.toLowerCase().includes(lowQuery) ||
      f.trade_name?.toLowerCase().includes(lowQuery)
    );
  }, [subFormulas, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isAuthLoading && folders.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar title="Formula Records" Icon={Beaker} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={`p-4 md:p-6 w-full mx-auto transition-all duration-300 ${isSidebarOpen ? 'max-w-[1600px]' : 'max-w-full px-8'}`}>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-3 mb-6">
            <div className="relative w-full md:w-auto" ref={menuRef}>
              <button 
                onClick={() => setShowColumnMenu(!showColumnMenu)} 
                className={`flex items-center justify-between md:justify-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  showColumnMenu ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className={showColumnMenu ? 'text-white' : 'text-blue-600'} />
                  <span>Views</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${showColumnMenu ? 'rotate-180' : ''}`} />
              </button>
              {showColumnMenu && (
                <div className="absolute top-full left-0 mt-2 w-full md:w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 border-t-4 border-t-blue-600">
                  <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Columns</p>
                  {Object.entries(visibleColumns).map(([key, val]) => (
                    <div 
                      key={key} 
                      onClick={() => setVisibleColumns(prev => ({...prev, [key as keyof typeof visibleColumns]: !val}))} 
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 rounded-lg text-sm cursor-pointer capitalize transition-colors group"
                    >
                      <span className={val ? "text-blue-700 font-semibold" : "text-slate-600"}>{key.replace(/([A-Z])/g, ' $1')}</span>
                      {val ? <div className="bg-blue-600 p-0.5 rounded-md"><Check size={14} className="text-white" strokeWidth={3}/></div> : <div className="w-4 h-4 border-2 border-slate-200 rounded-md" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas..." 
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-900" 
              />
              {searchQuery && <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" onClick={() => setSearchQuery('')} />}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {!isAuthLoading && canAddFolder && (
                <button onClick={() => setIsAddFolderModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  <FolderPlus size={18}/> Add Folder
                </button>
              )}
                {!isAuthLoading && canAddFormula && (
                  <Link href="/formula/new">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm">
                      <Plus size={18}/> New Formula
                    </button>
                  </Link>
                )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] uppercase font-bold text-slate-500">
                    <th className="px-6 py-4 w-[250px]">Folder / Code</th>
                    {visibleColumns.description && <th className="px-6 py-4">Description</th>}
                    {visibleColumns.tradeName && <th className="px-6 py-4 w-[200px]">Trade Name</th>}
                    {visibleColumns.formulaClass && <th className="px-6 py-4 w-[150px]">Class</th>}
                    <th className="px-6 py-4 w-[120px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={activeColCount} className="p-20 text-center"><Loader2 className="animate-spin inline text-blue-600 mb-2" /></td></tr>
                  ) : (
                    folders.map((folder) => (
                      <React.Fragment key={folder.id}>
                        <tr 
                          onClick={() => handleFolderClick(folder.id)} 
                          className={`cursor-pointer hover:bg-slate-50 transition-colors group border-l-4 ${expandedFolderId === folder.id ? 'border-l-blue-600 bg-blue-50/30' : 'border-l-transparent bg-white'}`}
                        >
                          <td className="px-6 py-4 text-sm font-bold text-slate-700 flex items-center gap-3">
                            {expandedFolderId === folder.id ? <ChevronDown size={18} className="text-blue-600"/> : <ChevronRight size={18} className="text-slate-400"/>}
                            <span className="truncate">{folder.name}</span>
                          </td>
                          {visibleColumns.description && <td className="px-6 py-4"></td>}
                          {visibleColumns.tradeName && <td className="px-6 py-4"></td>}
                          {visibleColumns.formulaClass && <td className="px-6 py-4"></td>}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canModifyFolder(folder) && (
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation();
                                    setSelectedFolder(folder);
                                    setIsRenameModalOpen(true);
                                  }} 
                                  className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition-colors" 
                                  title="Rename Folder"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}
                              {canDeleteFolder(folder) && (
                                <button onClick={(e) => { e.stopPropagation(); setSelectedFolder(folder); setIsDeleteModalOpen(true); }} className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition-colors" title="Delete Folder">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {expandedFolderId === folder.id && (
                          <tr>
                            <td colSpan={activeColCount} className="p-0 border-none">
                              <div className="bg-slate-50/50 shadow-inner max-h-[480px] overflow-y-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                  <tbody className="divide-y divide-slate-100/50">
                                    {subLoading ? (
                                      <tr><td className="py-8 text-center text-xs text-slate-400 italic">Syncing records...</td></tr>
                                    ) : filteredSubFormulas.length > 0 ? (
                                      filteredSubFormulas.map(f => (
                                        <tr key={f.id} className="hover:bg-blue-50/60 transition-colors group border-l-4 border-l-blue-600">
                                          <td className="pl-14 pr-6 py-3 text-left w-[250px]">
                                            <div className="flex items-center gap-2">
                                              <FileText size={14} className="text-blue-400" />
                                              <span className="font-mono font-bold text-[12px] text-slate-600 uppercase">{f.formula_code}</span>
                                            </div>
                                          </td>
                                          {visibleColumns.description && <td className="px-6 py-3 text-[12px] text-slate-500 truncate">{f.description || '—'}</td>}
                                          {visibleColumns.tradeName && <td className="px-6 py-3 text-[12px] font-medium text-slate-700 truncate w-[200px]">{f.trade_name || '—'}</td>}
                                          {visibleColumns.formulaClass && <td className="px-6 py-3 text-[12px] text-slate-500 truncate w-[150px]">{f.formula_class || '—'}</td>}
                                          <td className="px-6 py-3 text-right w-[120px]">
                                            {canViewFormula(f) && (
                                              <Link href={`/formula/${f.id}`} prefetch={false}>
                                                <button className="p-1.5 hover:bg-blue-600 hover:text-white text-blue-600 rounded-md transition-all border border-transparent shadow-sm hover:shadow-md" title="View Formula">
                                                  <Eye size={16} />
                                                </button>
                                              </Link>
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr><td className="py-10 text-center text-sm text-slate-400">No records found.</td></tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODALS SECTION */}
        {canAddFolder && (
          <AddFolderModal 
            isOpen={isAddFolderModalOpen} 
            onClose={() => setIsAddFolderModalOpen(false)} 
            onSuccess={fetchFolders} 
          />
        )}

        <RenameFolderModal 
          isOpen={isRenameModalOpen}
          folder={selectedFolder}
          onClose={() => {
            setIsRenameModalOpen(false);
            setSelectedFolder(null);
          }}
          onSuccess={fetchFolders}
        />

        <DeleteFolderModal 
          isOpen={isDeleteModalOpen} 
          folder={selectedFolder} 
          onClose={() => { setIsDeleteModalOpen(false); setSelectedFolder(null); }} 
          onSuccess={fetchFolders} 
        />

        <Footer />
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
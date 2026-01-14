'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar"; 
import { 
  Search, Plus, FolderPlus, MoreVertical, 
  Filter, Check, ChevronDown, ChevronRight,
  Beaker, FileText, X 
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function FormulasPage() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [subFormulas, setSubFormulas] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    description: true,
    tradeName: true,
    formulaClass: true,
  });

  const activeColCount = 2 + Object.values(visibleColumns).filter(Boolean).length;

  // Filtered Formulas Logic
  // Using useMemo for performance so filtering only happens when query or data changes
  const filteredSubFormulas = useMemo(() => {
    if (!searchQuery.trim()) return subFormulas;
    
    const lowQuery = searchQuery.toLowerCase();
    return subFormulas.filter(f => 
      f.formula_code?.toLowerCase().includes(lowQuery) || 
      f.description?.toLowerCase().includes(lowQuery) ||
      f.trade_name?.toLowerCase().includes(lowQuery)
    );
  }, [subFormulas, searchQuery]);

  // Handle outside clicks for the "Views" menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch folders on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/folders/')
      .then(res => res.json())
      .then(data => { 
        setFolders(data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFolderClick = async (folderId: number) => {
    if (expandedFolderId === folderId) { 
      setExpandedFolderId(null); 
      return; 
    }
    setSubLoading(true); 
    setExpandedFolderId(folderId);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/folders/${folderId}/formulas/`);
      const data = await res.json();
      setSubFormulas(data);
    } catch (error) {
        console.error("Error fetching formulas:", error);
    } finally { 
      setSubLoading(false); 
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar 
          title="Formula Records" 
          Icon={Beaker} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="p-6 w-full">
          {/* Action Bar */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-3 mb-6 w-full">
             <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowColumnMenu(!showColumnMenu)} 
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Views <Filter size={14} />
                </button>
                {showColumnMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 border-t-4 border-t-blue-600">
                    {Object.entries(visibleColumns).map(([key, val]) => (
                      <div 
                        key={key} 
                        onClick={() => setVisibleColumns(prev => ({...prev, [key]: !val}))} 
                        className="flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded text-xs cursor-pointer capitalize"
                      >
                        {key.replace(/([A-Z])/g, ' $1')} {val && <Check size={14} className="text-blue-600"/>}
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Search Input Implementation */}
             <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code or description..." 
                  className="w-full pl-10 pr-10 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
             </div>

             <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold whitespace-nowrap hover:bg-blue-700 transition-colors">
                  <FolderPlus size={16}/> Add Folder
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-semibold whitespace-nowrap hover:bg-emerald-600 transition-colors">
                  <Plus size={16}/> New Formula
                </button>
             </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left md:table-fixed border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
                  <tr className="text-[11px] uppercase font-bold text-slate-500">
                    <th className="px-6 py-4 w-[250px]">Folder / Code</th>
                    {visibleColumns.description && <th className="px-6 py-4 min-w-[300px]">Description</th>}
                    {visibleColumns.tradeName && <th className="px-6 py-4 w-[200px]">Trade Name</th>}
                    {visibleColumns.formulaClass && <th className="px-6 py-4 w-[150px]">Class</th>}
                    <th className="px-6 py-4 w-[80px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={activeColCount} className="p-10 text-center text-slate-400">Loading folders...</td></tr>
                  ) : (
                    folders.map((folder) => (
                      <React.Fragment key={folder.id}>
                        <tr 
                          onClick={() => handleFolderClick(folder.id)} 
                          className={`cursor-pointer hover:bg-slate-50 transition-colors group border-l-4 ${expandedFolderId === folder.id ? 'border-l-blue-600 bg-blue-50/30' : 'border-l-transparent bg-white'}`}
                        >
                          <td className="px-6 py-4 text-sm font-bold text-slate-700 flex items-center gap-3">
                            {expandedFolderId === folder.id ? 
                              <ChevronDown size={18} className="text-blue-600"/> : 
                              <ChevronRight size={18} className="text-slate-400"/>
                            }
                            <span className="truncate">{folder.folder_name}</span>
                          </td>
                          {visibleColumns.description && <td className="px-6 py-4"></td>}
                          {visibleColumns.tradeName && <td className="px-6 py-4"></td>}
                          {visibleColumns.formulaClass && <td className="px-6 py-4"></td>}
                          <td className="px-6 py-4 text-right">
                            <MoreVertical size={18} className="inline text-slate-300 group-hover:text-slate-500"/>
                          </td>
                        </tr>

                        {expandedFolderId === folder.id && (
                          <tr>
                            <td colSpan={activeColCount} className="p-0 border-none">
                              <div className="max-h-[460px] overflow-y-auto bg-slate-50/50 shadow-inner">
                                <table className="w-full md:table-fixed border-collapse min-w-[800px]">
                                  <tbody>
                                    {subLoading ? (
                                      <tr><td colSpan={activeColCount} className="py-8 text-center text-xs text-slate-400 italic">Fetching formulas...</td></tr>
                                    ) : filteredSubFormulas.length > 0 ? (
                                      filteredSubFormulas.map(f => (
                                        <tr key={f.id} className="hover:bg-blue-50/60 transition-colors group border-l-4 border-l-blue-600 border-b border-slate-100">
                                          <td className="pl-14 pr-6 py-3 text-left w-[250px]">
                                            <div className="flex items-center gap-2">
                                              <FileText size={14} className="text-blue-400" />
                                              <span className="font-mono font-bold text-[12px] text-slate-600 uppercase">
                                                {f.formula_code}
                                              </span>
                                            </div>
                                          </td>
                                          {visibleColumns.description && (
                                            <td className="px-6 py-3 text-[12px] text-slate-500 truncate min-w-[300px]">
                                              {f.description || '—'}
                                            </td>
                                          )}
                                          {visibleColumns.tradeName && (
                                            <td className="px-6 py-3 text-[12px] font-medium text-slate-700 truncate w-[200px]">
                                              {f.trade_name || '—'}
                                            </td>
                                          )}
                                          {visibleColumns.formulaClass && (
                                            <td className="px-6 py-3 text-[12px] text-slate-500 truncate w-[150px]">
                                              {f.formula_class || f.class_name || '—'}
                                            </td>
                                          )}
                                          <td className="px-6 py-3 text-right w-[80px]">
                                            <MoreVertical size={14} className="inline text-slate-300 group-hover:text-slate-500 cursor-pointer"/>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={activeColCount} className="py-10 text-center text-sm text-slate-400">
                                          No formulas found matching "{searchQuery}"
                                        </td>
                                      </tr>
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

        <Footer />
        
      </main>
    </div>
  );
}
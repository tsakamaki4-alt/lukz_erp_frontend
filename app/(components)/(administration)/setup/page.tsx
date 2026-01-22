'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Settings2, Plus, Trash2, Edit2, Save, X, Search, 
  Tag, Layers, Beaker, FileCode, CheckCircle2, Loader2,
  FlaskConical, ClipboardList, Globe, MapPin, Scale, Package, 
  Variable, BookOpen, ListTree, AlertCircle, Download, Upload,
  Info, FileSpreadsheet
} from 'lucide-react';

// --- Centralized API Client Import ---
import { apiRequest } from '@/app/lib/api';

interface SetupItem {
  id: number;
  category_name?: string;
  subcategory_name?: string;
  product_type?: string;
  product_quality?: string;
  product_format?: string;
  functions?: string;
  chemical_class?: string;
  name?: string;
  code?: string;
  app_label?: string;
  abbreviation?: string;
  category?: number;
  subcategory?: number;
  description?: string;
  is_relative?: boolean;
  row_number?: number;
  eqtext?: string;
  class_name?: string;
  subclass?: string;
  color_code?: string;
}

interface AppLabel {
  id: string;
  name: string;
}

const SETUP_TABS = [
  { id: 'categories', name: 'Categories', icon: Tag, api: 'categories', labelField: 'category_name' },
  { id: 'subcategories', name: 'Sub-Categories', icon: Layers, api: 'subcategories', parentApi: 'categories', parentField: 'category', labelField: 'subcategory_name' },
  { id: 'product-types', name: 'Product Types', icon: Beaker, api: 'product-types', parentApi: 'subcategories', parentField: 'subcategory', labelField: 'product_type' },
  { id: 'functions', name: 'Functions', icon: ClipboardList, api: 'functions', labelField: 'functions' },
  { id: 'chemical-classes', name: 'Chemical Class', icon: FlaskConical, api: 'chemical-class', labelField: 'chemical_class' },
  { id: 'countries', name: 'Countries', icon: Globe, api: 'countries', labelField: 'name' },
  { id: 'states', name: 'States', icon: MapPin, api: 'states', parentApi: 'countries', parentField: 'country', labelField: 'name' },
  { id: 'uom', name: 'Units of Measure', icon: Scale, api: 'uom', labelField: 'code' },
  { id: 'packaging', name: 'Packaging Types', icon: Package, api: 'packaging-types', labelField: 'name' },
  { id: 'equations', name: 'Equations', icon: Variable, api: 'equations', labelField: 'description' },
  { id: 'product-classes', name: 'Product Classes', icon: BookOpen, api: 'product-classes', labelField: 'class_name' },
  { id: 'sub-classes', name: 'Sub-Classes', icon: ListTree, api: 'sub-classes', labelField: 'subclass' },
  { id: 'quality-specs', name: 'Product Quality', icon: Settings2, api: 'quality-specs', labelField: 'product_quality' },
  { id: 'product-formats', name: 'Product Formats', icon: FileCode, api: 'product-formats', labelField: 'product_format' },
  { id: 'statuses', name: 'Statuses', icon: CheckCircle2, api: 'statuses', labelField: 'name' },
];

export default function SetupPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(SETUP_TABS[0]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<SetupItem[]>([]);
  const [parentData, setParentData] = useState<SetupItem[]>([]);
  const [appLabels, setAppLabels] = useState<AppLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SetupItem | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    code: '', 
    parentId: '', 
    extra: '',
    app_label: '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  // Import States
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState({ current: 0, total: 0 });

  /**
   * Fetch Application Labels for Status filtering/assignment
   */
  const fetchAppLabels = useCallback(async () => {
    try {
      const result = await apiRequest<AppLabel[]>('/api/setup/app-labels/');
      setAppLabels(result);
      if (result.length > 0 && !formData.app_label) {
        setFormData(prev => ({ ...prev, app_label: result[0].id }));
      }
    } catch (error) {
      console.error("Fetch App Labels error:", error);
    }
  }, [formData.app_label]);

  /**
   * Fetch Master Data based on active tab
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParam = activeTab.id === 'statuses' ? '?app_label=all' : ''; 
      const result = await apiRequest<SetupItem[]>(`/api/setup/${activeTab.api}/${queryParam}`);
      setData(result);

      if (activeTab.parentApi) {
        const pResult = await apiRequest<SetupItem[]>(`/api/setup/${activeTab.parentApi}/`);
        setParentData(pResult);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    if (activeTab.id === 'statuses') {
      fetchAppLabels();
    }
  }, [fetchData, fetchAppLabels, activeTab.id]);

  const filteredData = data.filter((item: SetupItem) => {
    const labelKey = activeTab.labelField;
    const searchField = (item as any)[labelKey] || (item as any)['name'] || '';
    return searchField.toString().toLowerCase().includes(searchQuery.toLowerCase());
  });

  /**
   * Delete Master Record
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiRequest(`/api/setup/${activeTab.api}/${id}/`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  /**
   * Create or Update Master Record
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const labelKey = activeTab.labelField;
    const body: any = { [labelKey]: formData.name };

    if (activeTab.id === 'countries' || activeTab.id === 'states') body.abbreviation = formData.extra;
    
    if (activeTab.id === 'statuses') {
      body.code = formData.code;
      body.app_label = formData.app_label;
      body.name = formData.name; 
    }
    
    if (activeTab.id === 'uom') body.code = formData.name; 
    if (activeTab.parentField) body[activeTab.parentField] = formData.parentId;
    
    if (formData.description && activeTab.id !== 'countries') {
      body.description = formData.description;
    }

    const url = editingItem 
      ? `/api/setup/${activeTab.api}/${editingItem.id}/` 
      : `/api/setup/${activeTab.api}/`;
    
    try {
      await apiRequest(url, {
        method: editingItem ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = (row as any)[header];
        return `"${val !== null && val !== undefined ? val : ''}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${activeTab.id}_setup.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * CSV Batch Import using centralized API per row
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const [headerLine, ...rows] = text.split('\n').filter(line => line.trim() !== '');
      const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
      
      setIsImporting(true);
      const totalRows = rows.length;
      setImportStats({ current: 0, total: totalRows });

      for (let i = 0; i < totalRows; i++) {
        const row = rows[i];
        const values = row.split(',').map(v => v.trim().replace(/["']/g, ''));
        const payload: any = {};
        
        headers.forEach((header, index) => {
          const val = values[index];
          if (!val) return;

          if (
            header === activeTab.labelField.toLowerCase() || 
            header === 'name' || 
            header === 'display value' || 
            header.includes('name')
          ) {
            payload[activeTab.labelField] = val;
          } else if (header === 'code' || header === 'abbreviation' || header === 'abbr') {
            if (activeTab.id === 'countries' || activeTab.id === 'states') {
                payload.abbreviation = val;
            }
            payload.code = val;
          } else if (header === 'description' || header === 'desc') {
            if (activeTab.id !== 'countries') {
              payload.description = val;
            }
          } else if (header === 'parent' || header === 'parent_id' || header === activeTab.parentField?.toLowerCase()) {
            if (activeTab.parentField) payload[activeTab.parentField] = val;
          }
        });

        if (!payload[activeTab.labelField] && activeTab.id === 'countries') {
            const countryIdx = headers.findIndex(h => h.includes('country'));
            if (countryIdx !== -1) payload[activeTab.labelField] = values[countryIdx];
        }

        try {
          await apiRequest(`/api/setup/${activeTab.api}/`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.error("Import row error:", err);
        }
        setImportStats(prev => ({ ...prev, current: i + 1 }));
      }
      
      setTimeout(() => setIsImporting(false), 2000); 
      fetchData();
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const progressPercentage = importStats.total > 0 ? (importStats.current / importStats.total) * 100 : 0;

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden relative font-sans antialiased text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar title="System Configuration" Icon={Settings2} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="p-6 flex-1 flex flex-col relative">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Setup Manager</h1>
              <p className="text-slate-500 text-sm">Configure system-wide master data for {activeTab.name}.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowGuidelines(true)} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-bold">
                <Info size={16} /> Guidelines
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <Download size={18} /> Export
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50">
                <Upload size={18} /> Import
              </button>
              <button 
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', description: '', code: '', parentId: parentData[0]?.id.toString() || '', extra: '', app_label: appLabels[0]?.id || '' });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={18} /> Add New
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-full overflow-x-auto no-scrollbar">
            {SETUP_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab.id === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <tab.icon size={14} /> {tab.name}
              </button>
            ))}
          </div>

          {/* Integration Progress Bar */}
          <div className={`mb-4 transition-all duration-500 ${isImporting ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Importing {importStats.current}/{importStats.total} rows...</span>
              <span className="text-[10px] font-bold text-slate-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Data Grid Container */}
          <div className="bg-white rounded-3xl border border-slate-200 flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder={`Filter ${activeTab.name}...`}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{filteredData.length} Total</div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                      <AlertCircle size={48} className="mb-4 opacity-20" />
                      <p className="font-medium">No items found for {activeTab.name}</p>
                    </div>
                  ) : filteredData.map((item: SetupItem) => {
                    const labelKey = activeTab.labelField;
                    const displayValue = (item as any)[labelKey] || (item as any)['name'] || 'Unnamed Item';
                    return (
                      <div key={item.id} className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 transition-all relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">ID: #{item.id}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              setEditingItem(item);
                              setFormData({ 
                                name: displayValue, 
                                description: item.description || '', 
                                code: item.code || '', 
                                parentId: (item.category || item.subcategory || (item as any).country || (item as any).state || '').toString(), 
                                extra: item.abbreviation || '', 
                                app_label: item.app_label || appLabels[0]?.id || '' 
                              });
                              setIsModalOpen(true);
                            }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <h3 className="font-bold text-slate-800">{displayValue}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(item.abbreviation || item.code) && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase inline-block">Code: {item.abbreviation || item.code}</span>}
                            {activeTab.id === 'statuses' && item.app_label && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold uppercase inline-block">App: {item.app_label}</span>}
                        </div>
                        {item.description && activeTab.id !== 'countries' && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>

      {/* Guidelines Slide-over */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileSpreadsheet size={24} /></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Importing Guidelines</h2>
              </div>
              <button onClick={() => setShowGuidelines(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">1. Required Format</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">Files must be in <strong>.CSV</strong> format.</p>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-300 shadow-inner">
                  {activeTab.labelField}, abbreviation {activeTab.id !== 'countries' ? ', description' : ''}<br/>
                  "Philippines", "PH"
                </div>
              </section>
              <button onClick={() => setShowGuidelines(false)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]">Close guidelines</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit' : 'New'} {activeTab.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto max-h-[70vh] no-scrollbar">
              {activeTab.parentApi && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Parent {activeTab.parentField}</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})}>
                    <option value="">Choose parent...</option>
                    {parentData.map((p: any) => (<option key={p.id} value={p.id}>{p.category_name || p.subcategory_name || p.name || p.abbreviation}</option>))}
                  </select>
                </div>
              )}
              {activeTab.id === 'statuses' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assign to Application</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" value={formData.app_label} onChange={(e) => setFormData({...formData, app_label: e.target.value})}>
                    {appLabels.map((app) => (<option key={app.id} value={app.id}>{app.name}</option>))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Display Value / Name</label>
                <input required placeholder={`Enter ${activeTab.name.toLowerCase()}...`} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              {(activeTab.id === 'countries' || activeTab.id === 'states') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Abbreviation</label>
                  <input maxLength={5} placeholder="e.g. US, NY, PH" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" value={formData.extra} onChange={(e) => setFormData({...formData, extra: e.target.value.toUpperCase()})} />
                </div>
              )}
              {activeTab.id === 'statuses' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Code</label>
                  <input required placeholder="e.g. ACT, OBS" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                </div>
              )}
              {activeTab.id !== 'countries' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-all active:scale-95">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
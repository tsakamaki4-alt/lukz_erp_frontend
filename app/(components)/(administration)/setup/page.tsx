'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SetupModals from "./SetupModals"; 
import { 
  Settings2, Plus, Trash2, Edit2, Search, 
  Tag, Layers, Beaker, FileCode, CheckCircle2, Loader2,
  FlaskConical, ClipboardList, Globe, MapPin, Scale, Package, 
  Variable, BookOpen, ListTree, AlertCircle, Download, Upload,
  Info
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
  is_relative?: boolean;
  row_number?: number;
  eqtext?: string;
  class_name?: string;
  subclass?: string;
  color_code?: string;
  description?: string;
  class_type?: string;
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
  { id: 'uom', name: 'Units of Measure', icon: Scale, api: 'uom', labelField: 'code', secondaryFields: ['name', 'description'] },
  { id: 'packaging', name: 'Packaging Types', icon: Package, api: 'packaging-types', labelField: 'name', secondaryFields: ['description'] },
  { id: 'equations', name: 'Equations', icon: Variable, api: 'equations', labelField: 'eqtext', secondaryFields: ['description', 'row_number'] },
  { id: 'product-classes', name: 'Product Classes', icon: BookOpen, api: 'product-classes', labelField: 'class_name', secondaryFields: ['description', 'class_type'] },
  { id: 'sub-classes', name: 'Sub-Classes', icon: ListTree, api: 'sub-classes', labelField: 'subclass', secondaryFields: ['class_name', 'description'] },
  { id: 'quality-specs', name: 'Product Quality', icon: Settings2, api: 'quality-specs', labelField: 'product_quality' },
  { id: 'product-formats', name: 'Product Formats', icon: FileCode, api: 'product-formats', labelField: 'product_format' },
  { id: 'statuses', name: 'Statuses', icon: CheckCircle2, api: 'statuses', labelField: 'name', secondaryFields: ['code'] },
];

export default function SetupPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(SETUP_TABS[0]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<SetupItem[]>([]);
  const [parentData, setParentData] = useState<SetupItem[]>([]);
  const [productClasses, setProductClasses] = useState<SetupItem[]>([]);
  const [appLabels, setAppLabels] = useState<AppLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SetupItem | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', code: '', parentId: '', extra: '', app_label: '',
    description: '', class_type: '', subclass: '', class_name: '', row_number: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState({ current: 0, total: 0 });
  const [importError, setImportError] = useState<{title: string, message: string} | null>(null);

  const fetchAppLabels = useCallback(async () => {
    try {
      const result = await apiRequest<AppLabel[]>('/api/setup/app-labels/');
      setAppLabels(result);
    } catch (error) { console.error(error); }
  }, []);

  const fetchProductClasses = useCallback(async () => {
    try {
      const result = await apiRequest<SetupItem[]>('/api/setup/product-classes/');
      setProductClasses(result);
    } catch (error) { console.error(error); }
  }, []);

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

      if (activeTab.id === 'sub-classes') {
        fetchProductClasses();
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchProductClasses]);

  useEffect(() => {
    fetchData();
    if (activeTab.id === 'statuses') fetchAppLabels();
  }, [fetchData, fetchAppLabels, activeTab.id]);

  const filteredData = data.filter((item: SetupItem) => {
    const labelKey = activeTab.labelField;
    const searchField = (item as any)[labelKey] || (item as any)['name'] || '';
    return searchField.toString().toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiRequest(`/api/setup/${activeTab.api}/${id}/`, { method: 'DELETE' });
      fetchData();
    } catch (error) { console.error(error); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const labelKey = activeTab.labelField;
    const body: any = { [labelKey]: formData.name };

    if (activeTab.parentField) {
        body[activeTab.parentField] = parseInt(formData.parentId);
    }

    if (formData.description) body.description = formData.description;
    if (activeTab.id === 'countries' || activeTab.id === 'states') body.abbreviation = formData.extra;
    if (activeTab.id === 'statuses') { body.code = formData.code; body.app_label = formData.app_label; body.name = formData.name; }
    if (activeTab.id === 'uom') { body.code = formData.name; body.name = formData.extra; }
    if (activeTab.id === 'product-classes') body.class_type = formData.class_type;
    if (activeTab.id === 'sub-classes') body.class_name = formData.class_name;
    if (activeTab.id === 'equations') body.row_number = parseInt(formData.row_number) || 0;

    const url = editingItem ? `/api/setup/${activeTab.api}/${editingItem.id}/` : `/api/setup/${activeTab.api}/`;
    
    try {
      await apiRequest(url, { method: editingItem ? 'PUT' : 'POST', body: JSON.stringify(body) });
      setIsModalOpen(false);
      fetchData();
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const allowedHeaders = [activeTab.labelField, 'code', 'abbreviation', activeTab.parentField, 'app_label', 'description', 'class_type', 'class_name', 'name', 'row_number'].filter(Boolean);
    const headers = Object.keys(data[0]).filter(h => allowedHeaders.includes(h));
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => `"${(row as any)[header] ?? ''}"`);
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${activeTab.id}_setup.csv`);
    a.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) return;
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
      const requiredLabel = activeTab.labelField.toLowerCase();
      
      if (!headers.includes(requiredLabel)) {
        setImportError({ title: "Mandatory Header Missing", message: `Required: "${activeTab.labelField}"` });
        return;
      }

      setIsImporting(true);
      const rows = lines.slice(1);
      setImportStats({ current: 0, total: rows.length });

      for (let i = 0; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim().replace(/["']/g, ''));
        const payload: any = {};
        
        headers.forEach((header, idx) => {
          // Explicitly map the CSV value to the labelField required by the Django Serializer
          if (header === requiredLabel) {
              payload[activeTab.labelField] = values[idx];
          } 
          else if (header === activeTab.parentField?.toLowerCase()) {
              payload[activeTab.parentField!] = parseInt(values[idx]) || values[idx];
          }
          else if (['description', 'class_type', 'class_name', 'name', 'row_number', 'code', 'abbreviation'].includes(header)) {
              payload[header] = values[idx];
          }
        });

        if (payload[activeTab.labelField]) {
            try { 
                await apiRequest(`/api/setup/${activeTab.api}/`, { method: 'POST', body: JSON.stringify(payload) }); 
            } catch (err) {
                console.error("Row import failed:", err);
            }
        }
        setImportStats(prev => ({ ...prev, current: i + 1 }));
      }
      setTimeout(() => setIsImporting(false), 2000);
      fetchData();
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar title="System Configuration" Icon={Settings2} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="p-6 flex-1 flex flex-col relative">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Setup Manager</h1>
              <p className="text-slate-500 text-sm">Configure master data for {activeTab.name}.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowGuidelines(true)} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-bold"><Info size={16} /> Guidelines</button>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm"><Download size={18} /> Export</button>
              <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"><Upload size={18} /> Import</button>
              <button onClick={() => { setEditingItem(null); setFormData({ name: '', code: '', parentId: parentData[0]?.id.toString() || '', extra: '', app_label: appLabels[0]?.id || '', description: '', class_type: '', subclass: '', class_name: '', row_number: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 active:scale-95"><Plus size={18} /> Add New</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-full overflow-x-auto no-scrollbar">
            {SETUP_TABS.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab); setSearchQuery(''); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab.id === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}><tab.icon size={14} /> {tab.name}</button>
            ))}
          </div>

          <div className={`mb-4 transition-all duration-500 ${isImporting ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-black text-blue-600 uppercase">Importing {importStats.current}/{importStats.total}...</span>
              <span className="text-[10px] font-bold text-slate-400">{Math.round((importStats.current / importStats.total) * 100 || 0)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden"><div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${(importStats.current / importStats.total) * 100 || 0}%` }} /></div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder={`Filter ${activeTab.name}...`} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">{filteredData.length} Total</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.map((item: SetupItem) => (
                    <div key={item.id} className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 transition-all relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">#{item.id}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { 
                              setEditingItem(item); 
                              setFormData({ 
                                  name: (item as any)[activeTab.labelField] || '', 
                                  code: item.code || '', 
                                  parentId: (item.category || item.subcategory || (item as any).country || '').toString(), 
                                  extra: item.abbreviation || '', 
                                  app_label: item.app_label || '', 
                                  description: item.description || '', 
                                  class_type: item.class_type || '', 
                                  subclass: item.subclass || '', 
                                  class_name: item.class_name || '', 
                                  row_number: (item.row_number || '').toString() 
                              }); 
                              setIsModalOpen(true); 
                          }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800">{(item as any)[activeTab.labelField] || 'Unnamed'}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                          {(item.category_name || item.subcategory_name) && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                                Parent: {item.category_name || item.subcategory_name}
                              </span>
                          )}
                          {item.row_number !== undefined && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Row: {item.row_number}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>

      <SetupModals 
        activeTab={activeTab} showGuidelines={showGuidelines} setShowGuidelines={setShowGuidelines}
        importError={importError} setImportError={setImportError}
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
        editingItem={editingItem} formData={formData} setFormData={setFormData}
        isSaving={isSaving} handleSave={handleSave}
        parentData={parentData} appLabels={appLabels}
        productClasses={productClasses} 
      />
    </div>
  );
}
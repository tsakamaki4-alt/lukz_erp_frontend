'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- Tab Component Imports ---
import GeneralTab from "./GeneralTab";
import CostingTab from "./CostingTab";
import PropertiesTab from "./PropertiesTab";
import TechnicalSpecsTab from "./TechnicalSpecsTab";
import VendorTab from "./VendorTab";

import { 
  Briefcase, Save, RotateCcw, Search, 
  Database, Loader2, Plus, X, CheckCircle2, AlertCircle, Circle
} from 'lucide-react';

// --- Centralized API Client Import ---
import { apiRequest } from '@/app/lib/api';

// --- Types & Configuration ---

export interface Part {
  id?: number;
  part_num: string;
  description: string;
  trade_name: string;
  chemical_name: string;
  product_class: string;
  subclass: string;
  chemical_class: string;
  status: string;
  notes: string;
  functions: string[];
  last_audit?: string;
  decimals?: number | string;
  unit_cost?: number | string;
  freight_cost?: number | string;
  cost_date?: string;
  lead_time?: number;
  country_of_origin?: string;
  manufacturer?: string;
  primary_supplier?: string;
  handling_type?: string;
  handling_weight?: number | string;
  handling_unit?: string;
  handling_container?: string;
  specific_gravity?: number | string;
  display_density?: number | string;
}

interface StatusRecord {
  id: number;
  name: string;
  app_label: string;
}

const EMPTY_PART: Part = {
  part_num: '',
  description: '',
  trade_name: '',
  chemical_name: '',
  product_class: '',
  subclass: '',
  chemical_class: '',
  status: 'Draft',
  notes: '',
  functions: [],
  decimals: 4, 
  unit_cost: 0,
  freight_cost: 0,
  cost_date: '',
  lead_time: 0,
  country_of_origin: '',
  manufacturer: '',
  primary_supplier: '',
  handling_type: 'Tank',
  handling_weight: 0,
  handling_unit: 'Lb',
  handling_container: 'Tank',
  specific_gravity: 1.0,
  display_density: 8.345404
};

export default function RawMaterialsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<Part | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('General');
  const [dbStatuses, setDbStatuses] = useState<StatusRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allTabs = ['General', 'Costing', 'Properties', 'Technical Specs', 'Vendor'];

  // Requirement: Only show General tab during creation
  const visibleTabs = useMemo(() => {
    if (selectedPart && !selectedPart.id) {
      return ['General'];
    }
    return allTabs;
  }, [selectedPart, allTabs]);

  const isDirty = useMemo(() => {
    if (!selectedPart || !originalSnapshot) return false;
    return JSON.stringify(selectedPart) !== JSON.stringify(originalSnapshot);
  }, [selectedPart, originalSnapshot]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statusData, partsData] = await Promise.all([
        apiRequest<StatusRecord[]>('/api/setup/statuses/'),
        apiRequest<Part[]>('/api/inventory/parts/')
      ]);

      setDbStatuses(statusData.filter((s: StatusRecord) => s.app_label === 'inventory'));
      const sortedData = [...partsData].sort((a, b) => (b.id || 0) - (a.id || 0));
      setParts(sortedData);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setErrorMessage("Network error: Connection to backend refused.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return parts;
    const query = searchQuery.toLowerCase();
    return parts.filter(m => 
      (m.part_num?.toLowerCase().includes(query)) ||
      (m.description?.toLowerCase().includes(query))
    );
  }, [searchQuery, parts]);

  const handleSelectPart = (part: Part) => {
    setSelectedPart(part);
    setOriginalSnapshot(part);
    setActiveTab('General');
    setSubmissionStatus('idle');
  };

  const handleAddNew = () => {
    setSelectedPart(EMPTY_PART);
    setOriginalSnapshot(EMPTY_PART);
    setActiveTab('General');
  };

  const handleRevert = () => {
    if (originalSnapshot) {
      setSelectedPart({ ...originalSnapshot });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedPart) return;
    const { name, value } = e.target;
    
    let finalValue: any = value;
    const numericFields = ['decimals', 'lead_time'];
    const highPrecisionFields = ['unit_cost', 'freight_cost', 'specific_gravity', 'display_density', 'handling_weight'];

    if (numericFields.includes(name)) {
      finalValue = value === '' ? '' : parseInt(value, 10);
    } else if (highPrecisionFields.includes(name)) {
      finalValue = value === '' ? '' : value;
    }
    
    setSelectedPart({ ...selectedPart, [name]: finalValue });
  };

  const handleSave = async () => {
    if (!selectedPart) return;
    setIsSaving(true);
    setErrorMessage(null);
    
    // DATA SANITIZATION LAYER
    const payload = {
      ...selectedPart,
      // Fix for Decimals
      decimals: (selectedPart.decimals === '' || selectedPart.decimals === null || selectedPart.decimals === undefined) 
                ? 4 
                : Number(selectedPart.decimals),
      // Fix for cost_date: If empty string, send null to prevent Django DateField format error
      cost_date: (selectedPart.cost_date === '' || !selectedPart.cost_date) 
                 ? null 
                 : selectedPart.cost_date
    };

    const isNew = !selectedPart.id;
    const endpoint = isNew ? `/api/inventory/parts/` : `/api/inventory/parts/${selectedPart.id}/`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const savedData = await apiRequest<Part>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setSubmissionStatus('success');
      await fetchData();
      setSelectedPart(savedData);
      setOriginalSnapshot(savedData);
    } catch (error: any) {
      setErrorMessage(JSON.stringify(error, null, 2));
      setSubmissionStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderActiveTab = () => {
    if (!selectedPart) return null;
    switch (activeTab) {
      case 'General': return <GeneralTab selectedPart={selectedPart} setSelectedPart={setSelectedPart} handleInputChange={handleInputChange} dbStatuses={dbStatuses} />;
      case 'Costing': return <CostingTab selectedPart={selectedPart} handleInputChange={handleInputChange} />;
      case 'Properties': return <PropertiesTab selectedPart={selectedPart} setSelectedPart={setSelectedPart} handleInputChange={handleInputChange} />;
      case 'Technical Specs': return <TechnicalSpecsTab selectedPart={selectedPart} handleInputChange={handleInputChange} />;
      case 'Vendor': return <VendorTab selectedPart={selectedPart} handleInputChange={handleInputChange} />;
      default: return null;
    }
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Initializing Data Sync...</p>
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Navbar title="Enterprise Asset Management" Icon={Briefcase} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="p-4 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
            <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col min-h-0">
              <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex flex-col gap-2">
                  <button 
                    onClick={handleAddNew}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Create New Part
                  </button>
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 text-slate-400" size={14} />
                    <input type="text" placeholder="Query Part Master..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredMaterials.map((material) => (
                    <button key={material.id} onClick={() => handleSelectPart(material)} className={`w-full text-left px-4 py-4 border-b border-slate-50 transition-all ${selectedPart?.id === material.id ? "bg-blue-50/50 border-r-4 border-blue-600" : "hover:bg-slate-50 border-r-4 border-transparent"}`}>
                      <div className="text-[10px] font-black text-blue-600 uppercase mb-1">{material.part_num}</div>
                      <div className="text-xs font-bold text-slate-700 truncate">{material.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                {selectedPart ? (
                  <>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                          <Database size={20} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Material Master</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {selectedPart.id ? `ID: ${selectedPart.part_num}` : "NEW RECORD ENTRY MODE"}
                          </p>
                        </div>
                      </div>
                      <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors shadow-sm">
                        <Plus size={14} /> Add New
                      </button>
                    </div>

                    <div className="flex px-6 border-b border-slate-100 overflow-x-auto bg-white">
                      {visibleTabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}>
                          {tab}
                          {isDirty && <Circle size={6} className="fill-amber-400 text-amber-400 animate-pulse" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                      {renderActiveTab()}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-tight ${isDirty ? 'text-amber-600' : 'text-slate-400 italic'}`}>
                          {isDirty ? '● Unsaved Changes Detected' : '* State Synchronized'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <button onClick={handleRevert} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isDirty ? 'text-rose-600 hover:scale-105' : 'text-slate-300 cursor-not-allowed'}`} disabled={!isDirty}>
                          <RotateCcw size={14} /> Revert Changes
                        </button>
                        <button onClick={handleSave} disabled={isSaving || !isDirty} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 shadow-md transition-all disabled:opacity-40">
                          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          {selectedPart.id ? 'Commit Update' : 'Create Record'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Database size={48} className="mb-4 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Select Record to Modify</p>
                    <button 
                      onClick={handleAddNew}
                      className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Plus size={16} /> Create First Record
                    </button>
                  </div>
                )}

                {submissionStatus !== 'idle' && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm p-6">
                    <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
                        {submissionStatus === 'success' ? (
                          <>
                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto"><CheckCircle2 size={32} /></div>
                            <h3 className="text-lg font-black text-slate-800 uppercase">Record Committed</h3>
                          </>
                        ) : (
                          <>
                            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 mx-auto"><AlertCircle size={32} /></div>
                            <h3 className="text-lg font-black text-slate-800 uppercase">Sync Failed</h3>
                            <pre className="mt-2 text-[10px] text-rose-500 bg-slate-50 p-3 rounded">{errorMessage}</pre>
                          </>
                        )}
                        <button onClick={() => setSubmissionStatus('idle')} className="mt-8 w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg">Dismiss Notification</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
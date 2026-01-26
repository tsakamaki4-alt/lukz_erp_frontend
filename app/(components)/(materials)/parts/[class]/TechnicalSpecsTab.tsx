'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Maximize2, 
  X, 
  Loader2, 
  Save, 
  CheckCircle2, 
  Info,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Part } from './page';

// --- Centralized API Client Import ---
import { apiRequest } from '@/app/lib/api';

interface CasMaster {
  cas_num: string;
  description?: string; 
}

interface FunctionMaster {
  id: number;
  functions: string; 
}

interface PartCas {
  id?: number | string; 
  part_num: string;
  cas_description: string;
  cas_num: string;
  cas_weight: number | string;
  min_range: number | string;
  max_range: number | string;
  associated_inci: string; 
  functions: string | string[]; // Updated to support JSONField (Array)
  uom: string;
  is_allergen: boolean;
  is_impurities: boolean;
}

interface TechnicalSpecsTabProps {
  selectedPart: Part;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  hideDragHandle?: boolean;
}

/**
 * Enhanced Searchable Dropdown with Multi-Select capability
 */
function SearchableDropdown({ 
  value, 
  options, 
  onSelect,
  placeholder = '—',
  searchPlaceholder = 'Filter...',
  multiSelect = false
}: { 
  value: string | string[]; 
  options: { label: string; subLabel?: string; value: string }[]; 
  onSelect: (val: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiSelect?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    return safeOptions.filter(opt => {
      const label = opt?.label?.toString().toLowerCase() || '';
      const subLabel = opt?.subLabel?.toString().toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return label.includes(term) || subLabel.includes(term);
    });
  }, [searchTerm, options]);

  const isSelected = (val: string) => {
    if (Array.isArray(value)) return value.includes(val);
    return value === val;
  };

  const renderDisplay = () => {
    if (multiSelect && Array.isArray(value) && value.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
              {v}
            </span>
          ))}
        </div>
      );
    }
    return <span className="font-black text-[13px] truncate uppercase">{(!Array.isArray(value) && value) || placeholder}</span>;
  };

  return (
    <div className="relative w-full h-full" ref={wrapperRef} style={{ isolation: 'isolate' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full min-h-[45px] flex items-center justify-between font-mono text-slate-600 px-4 py-3 cursor-pointer group bg-transparent"
      >
        {renderDisplay()}
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 w-[320px] mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-150" 
          style={{ zIndex: 99999, overflow: 'hidden' }}
        >
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <input 
              autoFocus
              className="w-full bg-transparent outline-none text-[12px] font-bold text-slate-700 p-1"
              placeholder={searchPlaceholder}
              value={searchTerm ?? ''} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div 
            className="block overflow-y-auto custom-scrollbar bg-white"
            style={{ maxHeight: '240px', height: 'auto', display: 'block' }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div 
                  key={`${opt.value}-${idx}`}
                  onClick={() => {
                    onSelect(opt.value);
                    if (!multiSelect) setIsOpen(false);
                    if (!multiSelect) setSearchTerm('');
                  }}
                  className={`px-4 py-3 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between w-full text-left ${isSelected(opt.value) ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <div>
                    <div className="text-[12px] font-black uppercase">{opt.label}</div>
                    {opt.subLabel && (
                      <div className="text-[10px] opacity-70 truncate uppercase font-bold">{opt.subLabel}</div>
                    )}
                  </div>
                  {isSelected(opt.value) && <Check size={14} strokeWidth={3} />}
                </div>
              ))
            ) : (
              <div className="px-3 py-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                No Results Found
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; display: block !important; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
      `}</style>
    </div>
  );
}

function SortableSection({ id, title, children, hideDragHandle }: SectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !!hideDragHandle });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: 1 };

  return (
    <div ref={setNodeRef} style={style} className={`w-full border border-slate-300 rounded-lg bg-white mb-6 shadow-md ${isDragging ? 'shadow-2xl ring-2 ring-blue-500 scale-[1.005]' : ''}`}>
      <div className="bg-[#1a3a6c] px-6 py-4 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-5">
          {!hideDragHandle && (
            <button {...attributes} {...listeners} className="cursor-grab text-blue-200 p-2 bg-slate-100/10 rounded-md">
              <GripVertical size={20} />
            </button>
          )}
          <span className="text-[13px] font-black text-slate-100 uppercase tracking-[0.3em]">{title}</span>
        </div>
      </div>
      <div className="p-8 bg-white rounded-b-lg" style={{ overflow: 'visible' }}>{children}</div>
    </div>
  );
}

export default function TechnicalSpecsTab({ selectedPart }: TechnicalSpecsTabProps) {
  const [items, setItems] = useState(['inci', 'impurities', 'allergens']);
  const [casRecords, setCasRecords] = useState<PartCas[]>([]);
  const [casMasterList, setCasMasterList] = useState<CasMaster[]>([]); 
  const [functionMasterList, setFunctionMasterList] = useState<FunctionMaster[]>([]);
  const [isAssumedActive, setIsAssumedActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const inciOptions = useMemo(() => {
    return casRecords
      .filter(r => !r.is_allergen && !r.is_impurities && r.cas_description)
      .map(r => ({ label: r.cas_description, value: r.cas_description }));
  }, [casRecords]);

  const fetchData = async () => {
    if (!selectedPart?.part_num) return;
    setIsLoading(true);
    try {
      const [casResp, masterCasResp, masterFuncResp] = await Promise.all([
        apiRequest<any>(`/api/inventory/part-cas?part_num=${selectedPart.part_num}`),
        apiRequest<any>('/api/setup/cas/'),
        apiRequest<any>('/api/setup/functions/')
      ]);
      setCasRecords(Array.isArray(casResp) ? casResp : casResp?.results || []);
      setCasMasterList(Array.isArray(masterCasResp) ? masterCasResp : masterCasResp?.results || []);
      setFunctionMasterList(Array.isArray(masterFuncResp) ? masterFuncResp : masterFuncResp?.results || []);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedPart.part_num]);

  const handleAddRecord = (type: 'inci' | 'allergens' | 'impurities') => {
    const newRecord: PartCas = {
      id: `temp-${Date.now()}`,
      part_num: selectedPart.part_num,
      cas_description: '',
      cas_num: '', 
      cas_weight: 0,
      min_range: 0,
      max_range: 0,
      associated_inci: '',
      functions: [], 
      uom: '%',
      is_allergen: type === 'allergens',
      is_impurities: type === 'impurities',
    };
    setCasRecords(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  };

  const handleUpdateRecord = (id: number | string, field: keyof PartCas, value: any) => {
    setCasRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;

      if (field === 'functions') {
        const currentFunctions = Array.isArray(rec.functions) ? rec.functions : [];
        const newFunctions = currentFunctions.includes(value)
          ? currentFunctions.filter(f => f !== value)
          : [...currentFunctions, value];
        return { ...rec, [field]: newFunctions };
      }

      return { ...rec, [field]: value };
    }));
    setHasUnsavedChanges(true);
  };

  const handleCasSelect = (id: number | string, selectedCasNum: string) => {
    const masterEntry = casMasterList.find(c => c.cas_num === selectedCasNum);
    setCasRecords(prev => prev.map(rec => rec.id === id ? { 
      ...rec, 
      cas_num: selectedCasNum, 
      cas_description: masterEntry?.description || '' 
    } : rec));
    setHasUnsavedChanges(true);
  };

  const handleRemoveRecord = async (id: number | string) => {
    if (typeof id === 'string' && id.startsWith('temp-')) {
      setCasRecords(prev => prev.filter(rec => rec.id !== id));
      return;
    }
    if (!confirm("Delete record?")) return;
    try {
      await apiRequest(`/api/inventory/part-cas/${id}/`, { method: 'DELETE' });
      setCasRecords(prev => prev.filter(rec => rec.id !== id));
    } catch (error) { alert("Delete failed"); }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const promises = casRecords.map(record => {
        const isNew = typeof record.id === 'string' && record.id.startsWith('temp-');
        const payload = { ...record };
        if (isNew) delete payload.id;
        return apiRequest(isNew ? `/api/inventory/part-cas/` : `/api/inventory/part-cas/${record.id}/`, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(payload)
        });
      });
      await Promise.all(promises);
      setSaveStatus('success');
      setHasUnsavedChanges(false);
      fetchData();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) { setSaveStatus('error'); } finally { setIsSaving(false); }
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const renderSectionContent = (id: string) => {
    if (isLoading) return <div className="text-center py-10 font-bold text-slate-400">LOADING...</div>;

    const targetList = casRecords.filter(r => {
      if (id === 'inci') return !r.is_allergen && !r.is_impurities;
      if (id === 'allergens') return !!r.is_allergen && !r.is_impurities;
      return !!r.is_impurities;
    });

    const isAddDisabled = targetList.some(r => typeof r.id === 'string' && r.id.startsWith('temp-'));

    return (
      <div className="space-y-6" style={{ overflow: 'visible' }}>
        {id === 'inci' && (
          <div className="flex justify-end items-center gap-4 px-2 mb-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Assumed concentration</span>
            <button onClick={() => setIsAssumedActive(!isAssumedActive)} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all ${isAssumedActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`h-5 w-5 transform rounded-full bg-white transition-all ${isAssumedActive ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        )}

        <div className="border border-slate-300 rounded-xl shadow-xl bg-white" style={{ overflow: 'visible' }}>
          {/* CRITICAL FIX: Removed overflow-x-auto and used a min-height to allow dropdown to show */}
          <div className="no-scrollbar" style={{ overflow: 'visible', minHeight: targetList.length > 0 ? 'auto' : '100px' }}>
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]" style={{ overflow: 'visible' }}>
              <thead className="bg-[#e2e8f0] border-b-2 border-slate-300">
                <tr>
                  <th className="px-6 py-5 border-r border-white text-[11px] font-black uppercase">Ingredient</th>
                  <th className="px-6 py-5 border-r border-white text-[11px] font-black uppercase">CAS Num</th>
                  <th className="px-6 py-5 border-r border-white text-[11px] font-black uppercase text-center">
                    {id === 'inci' ? 'Functions' : 'Associated INCI'}
                  </th>
                  {id === 'inci' && isAssumedActive && <th className="px-6 py-5 border-r border-white text-[11px] font-black uppercase text-center bg-blue-100/50">Range (%)</th>}
                  <th className="px-6 py-5 border-r border-white text-[11px] font-black uppercase text-center">Concentration</th>
                  <th className="w-20 px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold divide-y divide-slate-100" style={{ overflow: 'visible' }}>
                {targetList.map((record, idx) => (
                  <tr key={record.id || idx} className="border-l-[6px] border-l-blue-600 hover:bg-slate-50 transition-colors" style={{ overflow: 'visible' }}>
                    <td className="px-6 py-3 border-r border-slate-100 bg-slate-50/10 truncate">
                      {record.cas_description || <span className="text-slate-300 italic">Select CAS...</span>}
                    </td>
                    <td className="p-0 border-r border-slate-100" style={{ overflow: 'visible' }}>
                      <SearchableDropdown 
                        value={record.cas_num ?? ''}
                        options={casMasterList.map(c => ({ label: c.cas_num ?? '', subLabel: c.description ?? '', value: c.cas_num ?? '' }))}
                        onSelect={(val) => handleCasSelect(record.id!, val)}
                      />
                    </td>
                    <td className="p-0 border-r border-slate-100 text-center" style={{ overflow: 'visible' }}>
                      {id === 'inci' ? (
                        <SearchableDropdown 
                          multiSelect
                          value={record.functions ?? []}
                          options={functionMasterList.map(f => ({ label: f.functions ?? '', value: f.functions ?? '' }))}
                          onSelect={(val) => handleUpdateRecord(record.id!, 'functions', val)}
                          placeholder="Select Functions..."
                        />
                      ) : (
                        <SearchableDropdown 
                          value={record.associated_inci ?? ''}
                          options={inciOptions}
                          onSelect={(val) => handleUpdateRecord(record.id!, 'associated_inci', val)}
                          placeholder="Select INCI..."
                        />
                      )}
                    </td>
                    {id === 'inci' && isAssumedActive && (
                      <td className="px-4 py-3 border-r border-slate-100 text-center bg-blue-50/30">
                        <div className="flex items-center gap-1">
                          <input className="w-1/2 bg-transparent text-center font-mono text-blue-700 outline-none" value={record.min_range ?? ''} onChange={(e) => handleUpdateRecord(record.id!, 'min_range', e.target.value)} />
                          <span className="text-blue-300">-</span>
                          <input className="w-1/2 bg-transparent text-center font-mono text-blue-700 outline-none" value={record.max_range ?? ''} onChange={(e) => handleUpdateRecord(record.id!, 'max_range', e.target.value)} />
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 border-r border-slate-100 text-center">
                      <input type="number" step="0.0001" className="w-full bg-transparent text-center font-black text-blue-800 outline-none" value={record.cas_weight ?? ''} onChange={(e) => handleUpdateRecord(record.id!, 'cas_weight', e.target.value)} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleRemoveRecord(record.id!)} className="p-2 rounded bg-red-500 text-white shadow-sm active:scale-95 transition-transform"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Fallback for empty states to ensure enough height for dropdowns if needed */}
          {targetList.length === 0 && (
             <div className="h-20 flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Records Defined</div>
          )}
        </div>

        <div className="group relative w-fit">
          <button 
            disabled={isAddDisabled}
            onClick={() => handleAddRecord(id as any)} 
            className={`flex items-center gap-3 text-[#1a3a6c] text-[12px] font-black uppercase px-6 py-3.5 rounded-lg border-2 border-[#1a3a6c]/10 bg-white shadow-md transition-all ${isAddDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' : 'active:scale-95 hover:border-[#1a3a6c]/30'}`}
          >
            <Plus size={18} strokeWidth={4} /> Add Ingredient
          </button>
          
          {isAddDisabled && (
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-tighter p-2 rounded shadow-xl z-[10001]">
              Please save or remove the pending row before adding another.
              <div className="absolute top-full left-6 border-4 border-transparent border-t-slate-800"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const titles: Record<string, string> = { inci: 'INCI Ingredients', impurities: 'Impurities', allergens: 'Allergens' };

  return (
    <div className="w-full" style={{ overflow: 'visible' }}>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <button onClick={handleSaveAll} className={`px-6 py-3 rounded-xl font-black text-[12px] text-white uppercase tracking-widest shadow-lg transition-all active:scale-95 ${saveStatus === 'success' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} className="inline mr-2" />}
          {isSaving ? 'Syncing...' : 'Save Specifications'}
        </button>
        <button 
          onClick={() => setIsFullScreen(!isFullScreen)} 
          className="bg-slate-800 text-white px-5 py-3 rounded-xl font-black uppercase text-[11px] shadow-md hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <Maximize2 size={16} className="mr-2" /> Open Full Screen
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
          setItems(prev => arrayMove(prev, prev.indexOf(active.id as string), prev.indexOf(over.id as string)));
        }
      }}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map(id => <SortableSection key={id} id={id} title={titles[id]}>{renderSectionContent(id)}</SortableSection>)}
        </SortableContext>
      </DndContext>

      {isFullScreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-100 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-300 px-4 md:px-8 py-5 flex justify-between items-center shadow-md z-[10000]">
            <h2 className="text-[#1a3a6c] text-lg md:text-xl font-black uppercase tracking-widest">Technical Specifications</h2>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={handleSaveAll} 
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-[12px] text-white uppercase tracking-widest shadow-lg transition-all active:scale-95 ${saveStatus === 'success' ? 'bg-emerald-500' : 'bg-blue-600'}`}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} className="inline mr-2" />}
                {isSaving ? 'Syncing...' : 'Save Specifications'}
              </button>
              <button onClick={() => setIsFullScreen(false)} className="bg-red-500 text-white p-2.5 md:p-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-red-600 transition-colors active:scale-95">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="max-w-[1920px] mx-auto p-4 md:p-12 space-y-10 pb-32" style={{ overflow: 'visible' }}>
            {items.map((id) => (
              <SortableSection key={`fs-${id}`} id={id} title={titles[id]} hideDragHandle>
                {renderSectionContent(id)}
              </SortableSection>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
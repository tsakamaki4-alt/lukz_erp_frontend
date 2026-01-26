'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Check, Maximize2, X, RefreshCw, AlertCircle, Save,
  List, PieChart, Activity, Search, ChevronDown
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

// --- Type Definitions ---
interface Ingredient {
  id?: number | null;
  line_number: number;
  line_type: string | number;
  code: string;
  comment: string;
  qty: number | string;
  uom: string;
  uom_desc: string;
  sg: number | string;
  unit_cost: number | string;
  formula_code?: string;
}

interface Result {
  id?: number | null;
  formula_code: string;
  equation: string;
  gross: number;
  net: number;
}

interface Equation {
  id: number;
  description: string;
}

interface UOM {
  id: string;
  code: string;
  name: string;
}

// Layout Constants
const thClass = "p-1 border-r border-slate-400 bg-[#D1D5DB] text-slate-800 font-bold uppercase text-[10px] sticky top-0 z-10";
const tdClass = "p-1 border-r border-slate-300 text-[11px] font-mono";
const footerLabelClass = "text-right pr-2 text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap";
const footerInputClass = "w-24 border border-slate-300 p-0.5 text-right font-mono bg-white focus:bg-blue-50 outline-none transition-colors";
const footerDisplayClass = "w-24 border border-slate-300 p-0.5 text-right font-mono bg-slate-100 text-slate-900 flex items-center justify-end px-1";
const cellInputClass = "w-full bg-transparent outline-none border-none p-0 focus:bg-white transition-colors disabled:cursor-not-allowed no-spinner";

/**
 * Custom Searchable Dropdown for Unit of Measure Selection
 */
const UnitSearchDropdown = ({ value, onSelect, disabled, uomList }: { value: string, onSelect: (uom: UOM) => void, disabled: boolean, uomList: UOM[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[1.25rem]" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-full flex items-center justify-center transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white group'}`}
      >
        <span className="font-bold text-[11px] uppercase">{value || '-'}</span>
      </div>

      {isOpen && (
        <div className="absolute z-[110] top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-400 shadow-2xl mt-1 overflow-hidden rounded-sm">
          <div className="max-h-48 overflow-auto">
            {uomList.map((uom: UOM) => (
              <div 
                key={uom.id}
                onClick={() => {
                  onSelect(uom);
                  setIsOpen(false);
                }}
                className="p-2 text-[10px] hover:bg-blue-600 hover:text-white cursor-pointer border-b border-slate-100 last:border-0 font-bold uppercase"
              >
                {uom.code} - {uom.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Custom Searchable Dropdown for Part Selection
 */
const PartSearchDropdown = ({ value, onSelect, disabled }: { value: string, onSelect: (part: any) => void, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [parts, setParts] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const data = await apiRequest('/api/inventory/parts/');
        if (Array.isArray(data)) setParts(data);
      } catch (e) {
        console.error("Error fetching parts:", e);
      }
    };
    fetchParts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParts = parts.filter(p => 
    (p.part_num?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative w-full h-full min-h-[1.25rem]" ref={containerRef}>
      {!isOpen ? (
        <div 
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full h-full flex items-center justify-between px-1 transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white group'}`}
        >
          <span className="truncate">{value || <span className="text-blue-300 italic uppercase">Select...</span>}</span>
          {!disabled && <ChevronDown className="w-2 h-2 text-slate-400 opacity-0 group-hover:opacity-100" />}
        </div>
      ) : (
        <div className="absolute z-[100] top-0 left-0 w-64 bg-white border border-slate-400 shadow-2xl mt-0 overflow-hidden rounded-sm">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-2 py-1">
            <Search className="w-3 h-3 text-slate-400 mr-2" />
            <input 
              autoFocus
              className="w-full bg-transparent text-[11px] outline-none py-1"
              placeholder="Search Code or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredParts.length > 0 ? (
              filteredParts.map((p) => (
                <div 
                  key={p.part_num}
                  onClick={() => {
                    onSelect(p);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="p-2 text-[10px] hover:bg-blue-600 hover:text-white cursor-pointer border-b border-slate-100 last:border-0"
                >
                  <div className="font-bold flex justify-between">
                    <span>{p.part_num}</span>
                    <span className="opacity-60 font-normal">SG: {p.specific_gravity || '1.0'}</span>
                  </div>
                  <div className="truncate opacity-90 italic">{p.description}</div>
                </div>
              ))
            ) : (
              <div className="p-2 text-[10px] text-slate-400 italic text-center">No parts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * GridContent maintains a stable component reference to prevent focus loss.
 */
const GridContent = ({ 
  isFullscreen = false, 
  formulaCode, 
  displayTitle, 
  handleAction, 
  handleResultAction,
  performSave,
  isDataLocked, 
  ingredients = [], 
  results = [],
  equationsList = [],
  uomList = [],
  selectedRows, 
  selectedResultRows,
  toggleRow, 
  toggleResultRow,
  handleInputChange,
  handleResultInputChange,
  handleReorder,
  handlePartSelect,
  handleUomSelect,
  totalWeight,
  totalSGValue,
  totalUnitCost,
  totalCost100Gal,
  manualYield,
  setManualYield,
  manualNet,
  setManualNet,
  netTotal,
  sgOverride,
  setSgOverride,
  lbGalOverride,
  setLbGalOverride,
  theoreticalSG,
  theoreticalLbGal,
  setIsModalOpen,
  isLoading,
  saveProgress,
  pendingIngredients,
  pendingResults
}: any) => {
  const [mobileTab, setMobileTab] = useState<'ingredients' | 'summary' | 'results'>('ingredients');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const safeIngredients: Ingredient[] = Array.isArray(ingredients) ? ingredients : [];
  const safeResults: Result[] = Array.isArray(results) ? results : [];

  const onDragStart = (e: React.DragEvent, index: number) => {
    if (isDataLocked) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    if (isDataLocked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isDataLocked || draggedIdx === null || draggedIdx === index) {
      setDraggedIdx(null);
      return;
    }
    handleReorder(draggedIdx, index);
    setDraggedIdx(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#E5E7EB] gap-1 p-1 overflow-hidden">
      
      {/* Top Status Bar */}
      <div className="bg-[#B0B5BC] border border-slate-400 p-1 flex justify-between items-center px-4">
        <div className="flex-1 text-center text-[10px] md:text-[11px] font-black tracking-tight text-slate-800 uppercase">
          {formulaCode} || {displayTitle}
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                  <span className="text-[9px] font-bold text-blue-700 uppercase leading-none">Processing...</span>
                </div>
                <div className="w-20 h-1 bg-slate-300 mt-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                    style={{ width: `${saveProgress}%` }}
                  />
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-green-700 uppercase">Ready</span>
              <Check className="w-3 h-3 text-green-700" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden bg-slate-300 p-1 gap-1 border border-slate-400">
        <button type="button"
          onClick={() => setMobileTab('ingredients')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded text-[10px] font-bold uppercase transition-all ${mobileTab === 'ingredients' ? 'bg-blue-600 text-white shadow-inner' : 'bg-slate-200 text-slate-600'}`}
        >
          <List className="w-3.5 h-3.5" /> Ingredients
        </button>
        <button  type="button"
          onClick={() => setMobileTab('summary')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded text-[10px] font-bold uppercase transition-all ${mobileTab === 'summary' ? 'bg-orange-600 text-white shadow-inner' : 'bg-slate-200 text-slate-600'}`}
        >
          <PieChart className="w-3.5 h-3.5" /> Summary
        </button>
        <button type="button"
          onClick={() => setMobileTab('results')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded text-[10px] font-bold uppercase transition-all ${mobileTab === 'results' ? 'bg-slate-700 text-white shadow-inner' : 'bg-slate-200 text-slate-600'}`}
        >
          <Activity className="w-3.5 h-3.5" /> Results
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden">
        
        {/* Ingredients Table Container */}
        <div className={`flex-[2] flex flex-col bg-white border border-slate-400 overflow-hidden min-h-[300px] ${mobileTab !== 'ingredients' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-auto relative">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-400 shadow-sm">
                  <th colSpan={10} className="bg-[#D1D5DB] p-0.5 sticky top-0 z-20">
                    <div className="flex items-center justify-between pr-4">
                      <div className="flex items-center gap-1 pl-1 h-10 md:h-8">
                          <button 
                           type="button"
                           onClick={() => handleAction('add')} 
                           disabled={isDataLocked || isLoading}
                           className="p-2 md:p-1.5 rounded text-slate-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                           title="Add Row"
                          >
                            <Plus className="w-5 h-5 md:w-4 md:h-4" strokeWidth={2.5}/>
                          </button>

                          <button 
                           type="button"
                           onClick={() => handleAction('delete')} 
                           disabled={isDataLocked || selectedRows.length === 0 || isLoading}
                           className="p-2 md:p-1.5 rounded text-slate-700 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                           title="Delete Selected"
                          >
                            <Trash2 className="w-5 h-5 md:w-4 md:h-4" strokeWidth={2.5}/>
                          </button>

                          <div className="w-px h-5 bg-slate-400 mx-1" />

                          <button 
                           type="button"
                           onClick={() => performSave('ingredients')} 
                           disabled={isDataLocked || isLoading}
                           className="p-2 md:p-1.5 rounded text-slate-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                           title="Save Ingredients"
                          >
                            <Save className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                      </div>

                      {pendingIngredients && !isLoading && (
                        <div className="flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-[9px] font-black text-amber-600 uppercase">Pending Changes</span>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
                <tr>
                  <th className={`${thClass} w-8`}>Check</th>
                  <th className={`${thClass} w-12`}>Line #</th>
                  <th className={`${thClass} w-20 text-left pl-2`}>Line Type</th>
                  <th className={`${thClass} w-48 text-left pl-2`}>Code</th>
                  <th className={`${thClass} text-left pl-2`}>Description</th>
                  <th className={`${thClass} w-24 text-right pr-2`}>Quantity</th>
                  <th className={`${thClass} w-16`}>Units</th>
                  <th className={`${thClass} w-20 text-right pr-2`}>SG</th>
                  <th className={`${thClass} w-28 text-right pr-2`}>Unit Cost</th>
                  <th className={`${thClass} w-28 text-right pr-2`}>Cost / 100G</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safeIngredients.map((item: Ingredient, idx: number) => {
                  const isStage = item.line_type === "5" || item.line_type === 5;
                  const isText = item.line_type === "3" || item.line_type === 3;
                  const isRaw = item.line_type === "1" || item.line_type === 1;

                  // CALCULATION LOGIC FOR LINE COST
                  const lineCost = isRaw ? (Number(totalSGValue) * 8.345800106 * Number(item.unit_cost || 0) * Number(item.qty || 0)).toFixed(4) : '';

                  return (
                    <tr 
                      key={idx} 
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDrop={(e) => onDrop(e, idx)}
                      className={`
                        ${isStage ? 'bg-slate-200 text-slate-500' : 'hover:bg-blue-50/50 even:bg-white odd:bg-slate-50/30'} 
                        ${selectedRows.includes(idx) ? 'bg-blue-100/50' : ''}
                        ${draggedIdx === idx ? 'opacity-30 bg-blue-200' : ''}
                        transition-colors duration-75
                      `}
                    >
                      <td className={`${tdClass} text-center`}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 md:w-3 md:h-3 cursor-pointer" 
                          checked={selectedRows.includes(idx)}
                          onChange={() => toggleRow(idx)}
                        />
                      </td>
                      <td 
                        draggable={!isDataLocked}
                        onDragStart={(e) => onDragStart(e, idx)}
                        className={`${tdClass} text-center text-slate-400 cursor-move hover:bg-slate-200 hover:text-slate-800 transition-colors select-none`}
                      >
                        {item.line_number || idx + 1}
                      </td>
                      <td className={`${tdClass} pl-2`}>
                        <select 
                          className={`${cellInputClass} ${isStage ? 'font-black' : ''}`}
                          value={item.line_type || ' '}
                          onChange={(e) => handleInputChange(idx, 'line_type', e.target.value)}
                          disabled={isDataLocked}
                        >
                            <option value="5">Stage</option>
                            <option value="1">Raw</option>
                            <option value="3">Text</option>
                        </select>
                      </td>
                      <td className={`${tdClass} p-0 ${isStage ? 'text-slate-500' : 'text-blue-700'} font-bold`}>
                        {isRaw ? (
                          <PartSearchDropdown 
                            value={item.code} 
                            onSelect={(part: any) => handlePartSelect(idx, part)} 
                            disabled={isDataLocked} 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100/30 min-h-[1.25rem]" />
                        )}
                      </td>
                      <td className={`${tdClass} pl-2 font-bold uppercase truncate`}>
                        <input 
                          className={cellInputClass}
                          value={item.comment || ''}
                          placeholder={isText ? "ENTER COMMENT..." : ""}
                          onChange={(e) => handleInputChange(idx, 'comment', e.target.value)}
                          readOnly={isDataLocked}
                        />
                      </td>
                      <td className={`${tdClass} text-right pr-2 ${isStage ? '' : 'bg-blue-50/30 font-bold text-blue-800 underline'}`}>
                        <input 
                          className={`${cellInputClass} text-right`}
                          type="number"
                          step="0.0001"
                          value={item.qty || 0}
                          onChange={(e) => handleInputChange(idx, 'qty', e.target.value)}
                          readOnly={isDataLocked || !isRaw || item.uom_desc === 'QS'}
                        />
                      </td>
                      <td className={`${tdClass} p-0`}>
                        {isRaw ? (
                           <UnitSearchDropdown 
                            value={item.uom_desc} 
                            uomList={uomList}
                            onSelect={(uom: UOM) => handleUomSelect(idx, uom)} 
                            disabled={isDataLocked} 
                           />
                        ) : null}
                      </td>
                      <td className={`${tdClass} text-right pr-2`}>
                        <input 
                          className={`${cellInputClass} text-right`}
                          type="number"
                          step="0.0001"
                          value={Number(item.sg || 1.0).toFixed(4)}
                          onChange={(e) => handleInputChange(idx, 'sg', e.target.value)}
                          readOnly={isDataLocked || !isRaw}
                        />
                      </td>
                      <td className={`${tdClass} text-right pr-2`}>
                        <input 
                          className={`${cellInputClass} text-right italic text-slate-500`}
                          type="number"
                          step="0.0001"
                          value={Number(item.unit_cost || 0).toFixed(4)}
                          onChange={(e) => handleInputChange(idx, 'unit_cost', e.target.value)}
                          readOnly={isDataLocked || !isRaw}
                          placeholder="0.0000"
                        />
                      </td>
                      <td className={`${tdClass} text-right pr-2 font-bold text-slate-700`}>
                        {isRaw ? lineCost : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-[#F8FAFC] border-t-2 border-slate-400">
                <tr className="border-b border-slate-200">
                  <td colSpan={4} className="p-2"></td>
                  <td className="text-right pr-2 text-[11px] font-bold uppercase text-slate-700">Total:</td>
                  <td className="p-1 text-right">
                    <div className="w-24 bg-white border border-slate-300 p-1 text-right font-mono text-slate-900 inline-block">{totalWeight.toFixed(4)}</div>
                  </td>
                  <td className="text-center text-slate-400 font-bold text-[11px]">%</td>
                  <td className={`${tdClass} text-right pr-2 font-bold text-slate-900`}>{totalSGValue}</td>
                  <td className={`${tdClass} text-right pr-2 font-bold text-slate-900`}>{totalUnitCost}</td>
                  <td className={`${tdClass} text-right pr-2 font-bold text-slate-900`}>{totalCost100Gal}</td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Manual Yield:</td>
                  <td className="p-0.5 text-right">
                    <input 
                      className={footerInputClass} 
                      type="number"
                      step="0.0001"
                      value={manualYield} 
                      onChange={(e) => setManualYield(e.target.value)}
                      disabled={isDataLocked}
                    />
                  </td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Net:</td>
                  <td className="p-0.5 text-right">
                    <input 
                      className={footerInputClass} 
                      type="number"
                      step="0.0001"
                      value={manualNet} 
                      onChange={(e) => setManualNet(e.target.value)}
                      disabled={isDataLocked}
                    />
                  </td>
                  <td colSpan={2}></td>
                  <td className={`${tdClass} text-right pr-2 font-bold text-slate-900`}>
                    {netTotal}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>SG Override:</td>
                  <td className="p-0.5 text-right">
                    <input 
                      className={footerInputClass} 
                      type="number" 
                      step="0.0001"
                      value={sgOverride} 
                      onChange={(e) => setSgOverride(e.target.value)}
                      disabled={isDataLocked}
                    />
                  </td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Lb/Gal Override:</td>
                  <td className="p-0.5 text-right">
                    <input 
                      className={footerInputClass} 
                      type="number" 
                      step="0.0001"
                      value={lbGalOverride} 
                      onChange={(e) => setLbGalOverride(e.target.value)}
                      disabled={isDataLocked}
                    />
                  </td>
                  <td colSpan={4}></td>
                </tr>
                <tr className="border-t border-slate-200"><td colSpan={10} className="h-2"></td></tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Theoretical: SG =</td>
                  <td className="p-0.5 text-right">
                    <div className={footerDisplayClass}>
                      {theoreticalSG}
                    </div>
                  </td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Theoretical: Lb/Gal =</td>
                  <td className="p-0.5 text-right">
                    <div className={footerDisplayClass}>
                      {theoreticalLbGal}
                    </div>
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-[#FB923C] text-white p-1 flex justify-between items-center border-t border-slate-400">
            <div className="flex-1 text-center text-[10px] font-black uppercase tracking-widest pl-20">
              Top Level Raw Material Summary
            </div>
            {!isDataLocked && (
              <div className="hidden md:flex items-center gap-1.5 px-2 bg-white/20 rounded border border-white/30 mr-2">
                <Save className="w-2.5 h-2.5 text-white" />
                <span className="text-[8px] font-bold text-white uppercase">
                  Click Save Icons Above Tables to Commit Changes
                </span>
              </div>
            )}
          </div>
          
          <div className="hidden lg:block h-32 md:h-40 overflow-auto bg-white">
            <SummaryTable safeIngredients={safeIngredients} />
          </div>
        </div>

        {/* Mobile Summary Container */}
        <div className={`flex-[2] flex flex-col bg-white border border-slate-400 overflow-hidden min-h-[300px] lg:hidden ${mobileTab !== 'summary' ? 'hidden' : 'flex'}`}>
            <div className="bg-[#FB923C] text-white p-2 text-center text-[10px] font-black uppercase tracking-widest">
              Top Level Raw Material Summary
            </div>
            <div className="flex-1 overflow-auto bg-white">
                <SummaryTable safeIngredients={safeIngredients} />
            </div>
        </div>

        {/* Calculation Results Table */}
        <div className={`flex-none lg:w-[320px] flex flex-col bg-[#D1D5DB] border border-slate-400 ${mobileTab !== 'results' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-[#B0B5BC] border-b border-slate-400 p-2 text-center text-[11px] font-bold text-slate-800 uppercase tracking-tight">
            Calculation Results
          </div>
          
          <div className="flex-1 bg-white m-1 border border-slate-400 overflow-auto">
            <table className="w-full text-[10px] border-collapse min-w-[280px]">
              <thead className="bg-slate-300 sticky top-0 border-b border-slate-400 shadow-sm">
                <tr className="border-b border-slate-400">
                  <th colSpan={4} className="bg-[#D1D5DB] p-0.5">
                    <div className="flex items-center justify-between pr-2">
                      <div className="flex items-center gap-1 pl-1 h-8">
                          <button 
                           type="button"
                           onClick={() => handleResultAction('add')} 
                           disabled={isDataLocked || isLoading}
                           className="p-1.5 rounded text-slate-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                           title="Add Result"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5}/>
                          </button>
                          <button 
                           type="button"
                           onClick={() => handleResultAction('delete')} 
                           disabled={isDataLocked || selectedResultRows.length === 0 || isLoading}
                           className="p-1.5 rounded text-slate-700 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                           title="Delete Result"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2.5}/>
                          </button>
                          
                          <div className="w-px h-4 bg-slate-400 mx-1" />

                          <button 
                           type="button"
                           onClick={() => performSave('results')} 
                           disabled={isDataLocked || isLoading}
                           className="p-1.5 rounded text-slate-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                           title="Save Results"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                      </div>

                      {pendingResults && !isLoading && (
                        <div className="flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                          <span className="text-[8px] font-black text-amber-600 uppercase">Pending</span>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
                <tr className="text-slate-700 font-bold uppercase text-[9px]">
                  <th className="p-1 border-r border-slate-400 w-8">Chk</th>
                  <th className="p-1 border-r border-slate-400 text-left pl-2">Equation</th>
                  <th className="p-1 border-r border-slate-400 text-right pr-1 w-16">Gross</th>
                  <th className="p-1 text-right pr-1 w-16">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safeResults.map((row: Result, idx: number) => {
                  const usedEquations = safeResults.map((r: Result) => r.equation);
                  const filteredEquations = equationsList.filter((eq: Equation) => 
                    !usedEquations.includes(eq.description) || eq.description === row.equation
                  );

                  return (
                    <tr key={idx} className={`hover:bg-slate-50 ${selectedResultRows.includes(idx) ? 'bg-blue-100/50' : ''}`}>
                      <td className="p-1 border-r border-slate-200 text-center">
                          <input 
                            type="checkbox" 
                            className="w-3 h-3 cursor-pointer" 
                            checked={selectedResultRows.includes(idx)}
                            onChange={() => toggleResultRow(idx)}
                          />
                      </td>
                      <td className="p-1 border-r border-slate-200 pl-1">
                        <select 
                          className={`${cellInputClass} font-bold text-slate-600 uppercase tracking-tighter cursor-pointer`}
                          value={row.equation || ''}
                          onChange={(e) => handleResultInputChange(idx, 'equation', e.target.value)}
                          disabled={isDataLocked}
                        >
                          <option value="" disabled>Select Equation</option>
                          {filteredEquations.map((eq: Equation) => (
                            <option key={eq.id} value={eq.description}>{eq.description}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200 text-right bg-slate-50/50">
                        <input 
                          className={`${cellInputClass} text-right font-mono font-bold text-slate-900`}
                          type="number"
                          step="0.0001"
                          value={row.gross || 0}
                          onChange={(e) => handleResultInputChange(idx, 'gross', e.target.value)}
                          readOnly={isDataLocked}
                        />
                      </td>
                      <td className="p-1 text-right bg-slate-50/50">
                        <input 
                          className={`${cellInputClass} text-right font-mono font-bold text-slate-900`}
                          type="number"
                          step="0.0001"
                          value={row.net || 0}
                          onChange={(e) => handleResultInputChange(idx, 'net', e.target.value)}
                          readOnly={isDataLocked}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-2 flex flex-col gap-1.5 bg-slate-300 border-t border-slate-400">
              {!isFullscreen && (
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 md:py-2 bg-white border border-slate-400 text-slate-600 text-[10px] font-bold rounded uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <Maximize2 className="w-3 h-3"/> Open Full Screen
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryTable = ({ safeIngredients }: { safeIngredients: Ingredient[] }) => (
  <table className="w-full text-[10px] border-collapse min-w-[800px]">
    <thead className="bg-[#E5E7EB] sticky top-0 border-b border-slate-300">
      <tr className="text-slate-700 font-bold uppercase">
        <th className="p-1 border-r border-slate-300 text-left pl-2">Item Code</th>
        <th className="p-1 border-r border-slate-300 text-left pl-2">Description</th>
        <th className="p-1 border-r border-slate-300 text-right pr-2 w-20">% Weight</th>
        <th className="p-1 border-r border-slate-300 text-left pl-2">Chemical Name</th>
        <th className="p-1 border-r border-slate-300 text-left pl-2">CAS/EINECS/TSN</th>
        <th className="p-1 border-r border-slate-300 text-left pl-2 w-24">Sub Class</th>
        <th className="p-1 w-10 text-center">Is View</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
        {safeIngredients.filter((i: Ingredient) => (i.line_type === '1' || i.line_type === 1) && i.code).map((item: Ingredient, idx: number) => (
          <tr key={idx} className="hover:bg-orange-50/50">
            <td className="p-1 pl-2 text-blue-600 font-mono underline">{item.code}</td>
            <td className="p-1 pl-2 font-bold uppercase">{item.comment}</td>
            <td className="p-1 pr-2 text-right font-mono font-bold text-orange-700">{Number(item.qty).toFixed(4)}</td>
            <td className="p-1 pl-2 italic">-</td>
            <td className="p-1 pl-2 text-slate-500">-</td>
            <td className="p-1 pl-2">-</td>
            <td className="p-1 text-center"><input type="checkbox" readOnly className="w-3 h-3" /></td>
          </tr>
        ))}
    </tbody>
  </table>
);

export default function FormulaIngredients({ ingredients = [], setIngredients, isDataLocked, formData }: any) {
  const [results, setResults] = useState<Result[]>([]);
  const [equationsList, setEquationsList] = useState<Equation[]>([]);
  const [uomList, setUomList] = useState<UOM[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedResultRows, setSelectedResultRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [pendingIngredients, setPendingIngredients] = useState(false);
  const [pendingResults, setPendingResults] = useState(false);
  
  // Footer Editable States
  const [manualYield, setManualYield] = useState<string | number>("100.0000");
  const [manualNet, setManualNet] = useState<string | number>("0.0000");
  const [sgOverride, setSgOverride] = useState<string | number>("0.0000");
  const [lbGalOverride, setLbGalOverride] = useState<string | number>("0.0000");
  
  const formulaCode = formData.formula_code || 'N/A';

  useEffect(() => {
    const fetchInit = async () => {
      if (formulaCode === 'N/A') return;
      try {
        const [eqData, ingData, resData, uomData] = await Promise.all([
          apiRequest('/api/setup/equations/'),
          apiRequest(`/api/formulation/formula-ingredients/${formulaCode}/`).catch(() => []),
          apiRequest(`/api/formulation/formula-results/${formulaCode}/`).catch(() => []),
          apiRequest('/api/setup/uom/').catch(() => [])
        ]);
        if (Array.isArray(eqData)) setEquationsList(eqData);
        if (Array.isArray(ingData)) setIngredients(ingData);
        if (Array.isArray(resData)) setResults(resData.map((r: Result) => ({ ...r, net: r.net ?? 0 })));
        if (Array.isArray(uomData)) setUomList(uomData);
        setPendingIngredients(false);
        setPendingResults(false);
      } catch (e) { console.error(e); }
    };
    fetchInit();
  }, [formulaCode, setIngredients]);

  const performSave = async (target: 'ingredients' | 'results') => {
    if (formulaCode === 'N/A' || isDataLocked) return;
    setIsLoading(true);
    setSaveProgress(10);
    try {
      if (target === 'ingredients') {
        setSaveProgress(40);
        if (ingredients.length === 0) {
          await apiRequest(`/api/formulation/formula-ingredients/${formulaCode}/`, { method: 'DELETE' }).catch(() => {});
        } else {
          const cleaned = ingredients.map((i: Ingredient) => ({
            id: i.id || null, formula_code: formulaCode, line_number: i.line_number,
            line_type: i.line_type, code: i.code, comment: i.comment,
            qty: Number(i.qty) || 0, sg: Number(i.sg) || 1.0, 
            uom: i.uom, 
            uom_desc: i.uom_desc
          }));
          await apiRequest(`/api/formulation/formula-ingredients/`, { method: 'POST', body: JSON.stringify(cleaned) });
        }
        setPendingIngredients(false);
        setSaveProgress(100);
      } else {
        setSaveProgress(40);
        if (results.length === 0) {
          await apiRequest(`/api/formulation/formula-results/${formulaCode}/`, { method: 'DELETE' }).catch(() => {});
        } else {
          const cleaned = results.map((r: Result) => ({
            id: r.id || null, formula_code: formulaCode, equation: r.equation,
            gross: Number(r.gross) || 0, net: Number(r.net) || 0 
          }));
          const updated = await apiRequest(`/api/formulation/formula-results/`, { method: 'POST', body: JSON.stringify(cleaned) });
          if (Array.isArray(updated)) setResults(updated.map((r: Result) => ({ ...r, net: r.net ?? 0 })));
        }
        setPendingResults(false);
        setSaveProgress(100);
      }
    } catch (error) { console.error(`Error saving ${target}:`, error); }
    finally {
      setTimeout(() => { setIsLoading(false); setSaveProgress(0); }, 500);
    }
  };

  const handleAction = (type: 'add' | 'delete') => {
    if (isDataLocked) return;
    setPendingIngredients(true);
    let newIng = [...ingredients];
    if (type === 'add') {
      const next = ingredients.length > 0 ? Math.max(...ingredients.map((i: Ingredient) => i.line_number || 0)) + 1 : 1;
      newIng.push({ code: '', comment: '', qty: 0, sg: 1.0, unit_cost: 0, uom: '3', uom_desc: '%', line_number: next, line_type: '1', formula_code: formulaCode });
    } else {
      newIng = ingredients.filter((_: any, i: number) => !selectedRows.includes(i));
      setSelectedRows([]);
      newIng = newIng.map((ing, idx) => ({ ...ing, line_number: idx + 1 }));
    }
    setIngredients(newIng);
  };

  const handleReorder = (fromIdx: number, toIdx: number) => {
    if (isDataLocked) return;
    setPendingIngredients(true);
    const newIng = [...ingredients];
    const [movedItem] = newIng.splice(fromIdx, 1);
    newIng.splice(toIdx, 0, movedItem);
    const updated = newIng.map((item, idx) => ({ ...item, line_number: idx + 1 }));
    setIngredients(updated);
  };

  const handlePartSelect = (idx: number, part: any) => {
    if (isDataLocked) return;
    setPendingIngredients(true);
    setIngredients((prev: Ingredient[]) => {
      const updated = [...prev];
      updated[idx] = { 
        ...updated[idx], 
        code: part.part_num,
        comment: part.description,
        sg: part.specific_gravity || 1.0,
        unit_cost: part.unit_cost || 0,
        uom: part.uom || '3',
        uom_desc: part.uom_desc || part.uom || '%'
      };
      return updated;
    });
  };

  const handleUomSelect = (idx: number, selectedUom: UOM) => {
    if (isDataLocked) return;
    setPendingIngredients(true);
    setIngredients((prev: Ingredient[]) => {
      let updated = [...prev];
      if (selectedUom.code === 'QS') {
        const pctUom = uomList.find((u: UOM) => u.code === '%');
        updated = updated.map((item, i) => {
          if (i !== idx && item.uom_desc === 'QS') {
            return { ...item, uom: pctUom ? pctUom.id : item.uom, uom_desc: '%' };
          }
          return item;
        });
      }
      updated[idx] = { ...updated[idx], uom: selectedUom.id, uom_desc: selectedUom.code };
      return updated;
    });
  };

  const handleResultAction = (type: 'add' | 'delete') => {
    if (isDataLocked) return;
    setPendingResults(true);
    let newRes = [...results];
    if (type === 'add') {
      newRes.push({ formula_code: formulaCode, equation: '', gross: 0, net: 0 });
    } else {
      newRes = results.filter((_: any, i: number) => !selectedResultRows.includes(i));
      setSelectedResultRows([]);
    }
    setResults(newRes);
  };

  const handleInputChange = (idx: number, field: string, value: any) => {
    if (isDataLocked) return;
    setPendingIngredients(true);
    setIngredients((prev: Ingredient[]) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value } as Ingredient;
      return updated;
    });
  };

  const handleResultInputChange = (idx: number, field: string, value: any) => {
    if (isDataLocked) return;
    setPendingResults(true);
    setResults(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value } as Result;
      return updated;
    });
  };

  const toggleRow = (idx: number) => setSelectedRows(p => p.includes(idx) ? p.filter(i => i !== idx) : [...p, idx]);
  const toggleResultRow = (idx: number) => setSelectedResultRows(p => p.includes(idx) ? p.filter(i => i !== idx) : [...p, idx]);

  // CALCULATION LOGIC
  const totalWeight = useMemo(() => {
    let hasQS = false;
    ingredients.forEach((i: Ingredient) => { if (i.uom_desc === 'QS') hasQS = true; });
    return hasQS ? 100 : ingredients.reduce((sum: number, i: Ingredient) => sum + (Number(i.qty) || 0), 0);
  }, [ingredients]);

  const ingredientsWithQS = useMemo(() => {
    const totalPercentageQty = ingredients.reduce((sum: number, i: Ingredient) => 
      (i.uom_desc === '%' && (i.line_type === '1' || i.line_type === 1)) ? sum + Number(i.qty || 0) : sum, 0
    );
    
    return ingredients.map((i: Ingredient) => {
      if (i.uom_desc === 'QS' && (i.line_type === '1' || i.line_type === 1)) {
        return { ...i, qty: (totalWeight - totalPercentageQty).toFixed(4) };
      }
      return i;
    });
  }, [ingredients, totalWeight]);

  const totalQtySg = useMemo(() => {
    return ingredientsWithQS.reduce((sum: number, i: Ingredient) => {
      if (i.line_type === '1' || i.line_type === 1) {
        const sg = parseFloat(i.sg as string) || 1;
        const qty = parseFloat(i.qty as string) || 0;
        return sum + (qty / sg);
      }
      return sum;
    }, 0);
  }, [ingredientsWithQS]);

  const totalSGValue = useMemo(() => {
    if (totalQtySg <= 0) return "1.0000";
    return (totalWeight / totalQtySg).toFixed(4);
  }, [totalWeight, totalQtySg]);

  const totalUnitCost = useMemo(() => {
    if (totalWeight <= 0) return "0.0000";
    const weightedSum = ingredientsWithQS.reduce((sum: number, i: Ingredient) => sum + (Number(i.qty || 0) * Number(i.unit_cost || 0)), 0);
    return (weightedSum / totalWeight).toFixed(4);
  }, [ingredientsWithQS, totalWeight]);

  const totalCost100Gal = useMemo(() => {
    const sgVal = Number(totalSGValue);
    const sum = ingredientsWithQS.reduce((acc: number, i: Ingredient) => {
      if (i.line_type === '1' || i.line_type === 1) {
        const lineCost = sgVal * 8.345800106 * Number(i.unit_cost || 0) * Number(i.qty || 0);
        return acc + lineCost;
      }
      return acc;
    }, 0);
    return sum.toFixed(4);
  }, [ingredientsWithQS, totalSGValue]);

  const netTotalCalculated = useMemo(() => {
    const manualNetNum = Number(manualNet) || 0;
    if (manualNetNum === 0) return "0.0000";
    // MATH: (Total Unit Cost) / (Manual Net / 100) formatted to 4 decimals
    return (Number(totalUnitCost) / (manualNetNum / 100)).toFixed(4);
  }, [totalUnitCost, manualNet]);

  const theoreticalSGVal = totalSGValue;
  const theoreticalLbGalVal = (Number(totalSGValue) * 8.34).toFixed(4);

  const gridProps = {
    formulaCode, displayTitle: formData.description || 'New Formula',
    handleAction, handleResultAction, performSave, isDataLocked, 
    ingredients: ingredientsWithQS, results, equationsList, uomList, selectedRows, selectedResultRows,
    toggleRow, toggleResultRow, handleInputChange, handleResultInputChange, handleReorder, handlePartSelect, handleUomSelect,
    totalWeight, totalSGValue, totalUnitCost, totalCost100Gal, 
    manualYield, setManualYield, manualNet, setManualNet, netTotal: netTotalCalculated, sgOverride, setSgOverride, lbGalOverride, setLbGalOverride,
    theoreticalSG: theoreticalSGVal, theoreticalLbGal: theoreticalLbGalVal,
    setIsModalOpen, isLoading, saveProgress, pendingIngredients, pendingResults
  };

  return (
    <>
      <GridContent {...gridProps} />
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-[#E5E7EB] w-full h-full rounded-lg shadow-2xl flex flex-col relative overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 z-[110] p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"><X className="w-5 h-5" /></button>
            <div className="flex-1 overflow-hidden">
              <GridContent {...gridProps} isFullscreen={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
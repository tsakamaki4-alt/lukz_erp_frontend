'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus, Trash2, Check, Maximize2, X, Calculator, RefreshCw, AlertCircle 
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

// Layout Constants
const thClass = "p-1 border-r border-slate-400 bg-[#D1D5DB] text-slate-800 font-bold uppercase text-[10px] sticky top-0 z-10";
const tdClass = "p-1 border-r border-slate-300 text-[11px] font-mono";
const footerLabelClass = "text-right pr-2 text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap";
const footerInputClass = "w-24 border border-slate-300 p-0.5 text-right font-mono bg-white";
const cellInputClass = "w-full bg-transparent outline-none border-none p-0 focus:bg-white transition-colors disabled:cursor-not-allowed no-spinner";

/**
 * GridContent maintains a stable component reference to prevent focus loss.
 */
const GridContent = ({ 
  isFullscreen = false, 
  formulaCode, 
  displayTitle, 
  handleAction, 
  handleResultAction,
  isDataLocked, 
  ingredients = [], 
  results = [],
  equationsList = [],
  selectedRows, 
  selectedResultRows,
  toggleRow, 
  toggleResultRow,
  handleInputChange,
  handleResultInputChange,
  totalWeight,
  totalSGValue,
  totalCost100Gal,
  manualYieldValue,
  netValue,
  theoreticalSG,
  theoreticalLbGal,
  setIsModalOpen,
  isLoading,
  hasPendingChanges,
  handleAutoSaveTrigger
}: any) => {
  // Defensive check for rendering logic
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  const safeResults = Array.isArray(results) ? results : [];

  return (
    <div className="flex flex-col h-full bg-[#E5E7EB] gap-1 p-1 overflow-hidden">
      
      <div className="bg-[#B0B5BC] border border-slate-400 p-1 flex justify-between items-center px-4">
        <div className="flex-1 text-center text-[10px] md:text-[11px] font-black tracking-tight text-slate-800 uppercase">
          {formulaCode} || {displayTitle}
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
              <span className="text-[9px] font-bold text-blue-700 uppercase">Saving...</span>
            </>
          ) : hasPendingChanges ? (
            <>
              <AlertCircle className="w-3 h-3 text-orange-600 animate-pulse" />
              <span className="text-[9px] font-bold text-orange-600 uppercase italic">Pending Changes (Press Enter to Save)</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-green-700" />
              <span className="text-[9px] font-bold text-green-700 uppercase">All Changes Saved</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden">
        
        <div className="flex-[2] flex flex-col bg-white border border-slate-400 overflow-hidden min-h-[300px]">
          
          <div className="flex-1 overflow-auto relative">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-400 shadow-sm">
                  <th colSpan={10} className="bg-[#D1D5DB] p-0.5 sticky top-0 z-20">
                    <div className="flex items-center gap-1 pl-1 h-10 md:h-8">
                        <button 
                         type="button"
                         onClick={() => handleAction('add')} 
                         disabled={isDataLocked}
                         className="p-2 md:p-1.5 rounded text-slate-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          <Plus className="w-5 h-5 md:w-4 md:h-4" strokeWidth={2.5}/>
                        </button>

                        <div className="w-px h-5 bg-slate-400 mx-1" />

                        <button 
                         type="button"
                         onClick={() => handleAction('delete')} 
                         disabled={isDataLocked || selectedRows.length === 0}
                         className="p-2 md:p-1.5 rounded text-slate-700 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          <Trash2 className="w-5 h-5 md:w-4 md:h-4" strokeWidth={2.5}/>
                        </button>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th className={`${thClass} w-8`}>Check</th>
                  <th className={`${thClass} w-12`}>Line #</th>
                  <th className={`${thClass} w-20 text-left pl-2`}>Line Type</th>
                  <th className={`${thClass} w-32 text-left pl-2`}>Code</th>
                  <th className={`${thClass} text-left pl-2`}>Description</th>
                  <th className={`${thClass} w-24 text-right pr-2`}>Quantity</th>
                  <th className={`${thClass} w-12`}>Units</th>
                  <th className={`${thClass} w-20 text-right pr-2`}>SG</th>
                  <th className={`${thClass} w-28 text-right pr-2`}>Unit Cost</th>
                  <th className={`${thClass} w-28 text-right pr-2`}>Cost / 100G</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safeIngredients.map((item: any, idx: number) => {
                  const lineCost = (Number(item.qty || 0) * Number(item.unit_cost || 0)).toFixed(4);
                  const isStage = item.line_type === "5" || item.line_type === 5;
                  const rowLocked = isDataLocked || isStage;

                  return (
                    <tr 
                      key={idx} 
                      className={`
                        ${isStage ? 'bg-slate-200 text-slate-500' : 'hover:bg-blue-50/50 even:bg-white odd:bg-slate-50/30'} 
                        ${selectedRows.includes(idx) ? 'bg-blue-100/50' : ''}
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
                      <td className={`${tdClass} text-center text-slate-400`}>{item.line_number || idx + 1}</td>
                      <td className={`${tdClass} pl-2`}>
                        <select 
                          className={`${cellInputClass} ${isStage ? 'font-black' : ''}`}
                          value={item.line_type || ' '}
                          onChange={(e) => {
                            handleInputChange(idx, 'line_type', e.target.value);
                            handleAutoSaveTrigger(); 
                          }}
                          disabled={isDataLocked}
                        >
                            <option value="5">Stage</option>
                            <option value="1">Raw</option>
                            <option value="3">Text</option>
                        </select>
                      </td>
                      <td className={`${tdClass} pl-2 ${isStage ? 'text-slate-500' : 'text-blue-700'} font-bold`}>
                        <input 
                          className={`${cellInputClass} placeholder:text-blue-300`}
                          value={item.code || ''}
                          placeholder=""
                          onChange={(e) => handleInputChange(idx, 'code', e.target.value)}
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={rowLocked}
                        />
                      </td>
                      <td className={`${tdClass} pl-2 font-bold uppercase truncate`}>
                        <input 
                          className={cellInputClass}
                          value={item.comment || ''}
                          placeholder=""
                          onChange={(e) => handleInputChange(idx, 'comment', e.target.value)}
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={rowLocked}
                        />
                      </td>
                      <td className={`${tdClass} text-right pr-2 ${isStage ? '' : 'bg-blue-50/30 font-bold text-blue-800 underline'}`}>
                        <input 
                          className={`${cellInputClass} text-right`}
                          type="number"
                          step="0.0001"
                          value={item.qty || 0}
                          onChange={(e) => handleInputChange(idx, 'qty', e.target.value)}
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={rowLocked}
                        />
                      </td>
                      <td className={`${tdClass} text-center text-slate-400 font-bold text-[11px]`}>%</td>
                      <td className={`${tdClass} text-right pr-2`}>
                        <input 
                          className={`${cellInputClass} text-right`}
                          type="number"
                          step="0.0001"
                          value={item.sg || 1.0}
                          onChange={(e) => handleInputChange(idx, 'sg', e.target.value)}
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={rowLocked}
                        />
                      </td>
                      <td className={`${tdClass} text-right pr-2`}>
                        <input 
                          className={`${cellInputClass} text-right italic text-slate-500`}
                          type="number"
                          step="0.0001"
                          value={item.unit_cost || 0}
                          onChange={(e) => handleInputChange(idx, 'unit_cost', e.target.value)}
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={rowLocked}
                          placeholder="0.0000"
                        />
                      </td>
                      <td className={`${tdClass} text-right pr-2 font-bold text-slate-700`}>
                        {lineCost}
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
                  <td colSpan={1} className="border-r border-slate-300"></td>
                  <td className={`${tdClass} text-right pr-2 font-bold text-slate-900`}>{totalCost100Gal}</td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Manual Yield:</td>
                  <td className="p-0.5 text-right"><input className={footerInputClass} value={manualYieldValue} readOnly /></td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Net:</td>
                  <td className="p-0.5 text-right"><input className={footerInputClass} value={netValue} readOnly /></td>
                  <td colSpan={4}></td>
                </tr>
                <tr className="border-t border-slate-200"><td colSpan={10} className="h-2"></td></tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Theoretical: SG =</td>
                  <td className="p-0.5 text-right"><input className={footerInputClass} value={theoreticalSG} readOnly /></td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={5} className={footerLabelClass}>Theoretical: Lb/Gal =</td>
                  <td className="p-0.5 text-right"><input className={footerInputClass} value={theoreticalLbGal} readOnly /></td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-[#FB923C] text-white p-1 text-center text-[10px] font-black uppercase tracking-widest border-t border-slate-400">
            Top Level Raw Material Summary
          </div>
          
          <div className="h-32 md:h-40 overflow-auto bg-white">
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
                  {safeIngredients.filter((i:any) => (i.line_type === '1' || i.line_type === 1) && i.code).map((item: any, idx: number) => (
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
                  {safeIngredients.filter((i:any) => (i.line_type === '1' || i.line_type === 1) && i.code).length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400 italic">No ingredients added to formula</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-none lg:w-[320px] flex flex-col bg-[#D1D5DB] border border-slate-400">
          <div className="bg-[#B0B5BC] border-b border-slate-400 p-2 text-center text-[11px] font-bold text-slate-800 uppercase tracking-tight">
            Calculation Results
          </div>
          
          <div className="flex-1 bg-white m-1 border border-slate-400 overflow-auto">
            <table className="w-full text-[10px] border-collapse min-w-[280px]">
              <thead className="bg-slate-300 sticky top-0 border-b border-slate-400 shadow-sm">
                <tr className="border-b border-slate-400">
                  <th colSpan={4} className="bg-[#D1D5DB] p-0.5">
                    <div className="flex items-center gap-1 pl-1 h-8">
                        <button 
                         type="button"
                         onClick={() => handleResultAction('add')} 
                         disabled={isDataLocked}
                         className="p-1.5 rounded text-slate-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2.5}/>
                        </button>
                        <div className="w-px h-4 bg-slate-400 mx-1" />
                        <button 
                         type="button"
                         onClick={() => handleResultAction('delete')} 
                         disabled={isDataLocked || selectedResultRows.length === 0}
                         className="p-1.5 rounded text-slate-700 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5}/>
                        </button>
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
                {safeResults.map((row: any, idx: number) => {
                  const usedEquations = safeResults.map((r: any) => r.equation);
                  const filteredEquations = equationsList.filter((eq: any) => 
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
                          onChange={(e) => {
                            handleResultInputChange(idx, 'equation', e.target.value);
                            handleAutoSaveTrigger();
                          }}
                          disabled={isDataLocked}
                        >
                          <option value="" disabled>Select Equation</option>
                          {filteredEquations.map((eq: any) => (
                            <option key={eq.id} value={eq.description}>
                              {eq.description}
                            </option>
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
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={isDataLocked}
                        />
                      </td>
                      <td className="p-1 text-right bg-slate-50/50">
                        <input 
                          className={`${cellInputClass} text-right font-mono font-bold text-slate-900`}
                          type="number"
                          step="0.0001"
                          value={row.net_value || 0}
                          onChange={(e) => handleResultInputChange(idx, 'net_value', e.target.value)}
                          onBlur={handleAutoSaveTrigger}
                          onKeyDown={(e) => e.key === 'Enter' && handleAutoSaveTrigger()}
                          readOnly={isDataLocked}
                        />
                      </td>
                    </tr>
                  );
                })}
                {safeResults.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400 italic">No results</td>
                  </tr>
                )}
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

export default function FormulaIngredients({ ingredients = [], setIngredients, isDataLocked, formData }: any) {
  const [results, setResults] = useState<any[]>([]);
  const [equationsList, setEquationsList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedResultRows, setSelectedResultRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const formulaCode = formData.formula_code || 'N/A';

  // Load Equations for Dropdown
  useEffect(() => {
    const fetchEquations = async () => {
      try {
        const data = await apiRequest('/api/setup/equations/');
        if (data && Array.isArray(data)) setEquationsList(data);
      } catch (error) {
        console.error("Fetch equations error:", error);
      }
    };
    fetchEquations();
  }, []);

  // Load Ingredients
  useEffect(() => {
    if (formulaCode !== 'N/A') {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await apiRequest(`/api/formulation/formula-ingredients/${formulaCode}/`);
          if (data && Array.isArray(data)) {
            setIngredients(data);
          } else {
            setIngredients([]);
          }
        } catch (error) {
          console.error("Fetch ingredients error:", error);
          setIngredients([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [formulaCode, setIngredients]);

  // Load Results
  useEffect(() => {
    if (formulaCode !== 'N/A') {
      const fetchResults = async () => {
        try {
          const data = await apiRequest(`/api/formulation/formula-results/${formulaCode}/`);
          if (data && Array.isArray(data)) {
            const mappedData = data.map((r: any) => ({
              ...r,
              net_value: r.net ?? r.net_value ?? 0
            }));
            setResults(mappedData);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error("Fetch results error:", error);
          setResults([]);
        }
      };
      fetchResults();
    }
  }, [formulaCode]);

  /**
   * REVISED Save Function: Explicitly cleans data to match Model fields.
   */
  const performSave = useCallback(async (currentIngredients: any[], currentResults: any[]) => {
    if (formulaCode === 'N/A' || isDataLocked) return;
    
    setIsLoading(true);
    try {
      const safeIng = Array.isArray(currentIngredients) ? currentIngredients : [];
      const safeRes = Array.isArray(currentResults) ? currentResults : [];

      // 1. Map results to match the Formula_Results model ('net_value' -> 'net')
      const cleanedResults = safeRes.map(r => ({
        id: r.id || null,
        formula_code: formulaCode,
        equation: r.equation,
        gross: Number(r.gross) || 0,
        net: Number(r.net_value) || 0 
      }));

      // 2. Map ingredients
      const cleanedIngredients = safeIng.map(i => ({
        id: i.id || null,
        formula_code: formulaCode,
        line_number: i.line_number,
        line_type: i.line_type,
        code: i.code,
        comment: i.comment,
        qty: Number(i.qty) || 0,
        sg: Number(i.sg) || 1.0,
        uom: i.uom || '%'
      }));

      // Save Ingredients
      await apiRequest(`/api/formulation/formula-ingredients/`, {
        method: 'POST',
        body: JSON.stringify(cleanedIngredients),
      });

      // Save Results
      const updatedResults = await apiRequest(`/api/formulation/formula-results/`, {
        method: 'POST',
        body: JSON.stringify(cleanedResults),
      });

      if (updatedResults && Array.isArray(updatedResults)) {
        setResults(updatedResults.map((r: any) => ({
          ...r,
          net_value: r.net ?? 0
        })));
      }
      
      setHasPendingChanges(false);
    } catch (error) {
      console.error("Auto-Save error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formulaCode, isDataLocked]);

  // Wrapper for UI-triggered saves (onBlur/Enter)
  const saveAllData = useCallback(() => {
    if (hasPendingChanges) {
      performSave(ingredients, results);
    }
  }, [hasPendingChanges, performSave, ingredients, results]);

  const handleAction = useCallback(async (type: 'add' | 'delete') => {
    if (isDataLocked) return;
    const currentIng = Array.isArray(ingredients) ? ingredients : [];
    let newIngredients = [...currentIng];
    
    if (type === 'add') {
      const nextLine = currentIng.length > 0 
        ? Math.max(...currentIng.map((i: any) => i.line_number || 0)) + 1 
        : 1;
        
      newIngredients = [...currentIng, { 
        code: '', 
        comment: '', 
        qty: 0, 
        sg: 1.0, 
        unit_cost: 0,
        uom: '%', 
        line_number: nextLine,
        line_type: '1',
        formula_code: formulaCode
      }];
      setIngredients(newIngredients);
      setHasPendingChanges(true);
    } else {
      if (selectedRows.length === 0) return;
      newIngredients = currentIng.filter((_: any, i: number) => !selectedRows.includes(i));
      setIngredients(newIngredients);
      setSelectedRows([]);
      setHasPendingChanges(false);
      await performSave(newIngredients, results);
    }
  }, [ingredients, results, isDataLocked, selectedRows, setIngredients, formulaCode, performSave]);

  const handleResultAction = useCallback(async (type: 'add' | 'delete') => {
    if (isDataLocked) return;
    const currentRes = Array.isArray(results) ? results : [];
    let newResults = [...currentRes];

    if (type === 'add') {
      newResults.push({
        formula_code: formulaCode,
        equation: '',
        gross: 0,
        net_value: 0
      });
      setResults(newResults);
      setHasPendingChanges(true);
    } else {
      if (selectedResultRows.length === 0) return;
      newResults = currentRes.filter((_: any, i: number) => !selectedResultRows.includes(i));
      setResults(newResults);
      setSelectedResultRows([]);
      setHasPendingChanges(false);
      await performSave(ingredients, newResults);
    }
  }, [results, ingredients, isDataLocked, selectedResultRows, formulaCode, performSave]);

  const handleInputChange = useCallback((idx: number, field: string, value: string | number) => {
    if (isDataLocked) return;
    setIngredients((prev: any) => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = [...current];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
    setHasPendingChanges(true);
  }, [isDataLocked, setIngredients]);

  const handleResultInputChange = useCallback((idx: number, field: string, value: string | number) => {
    if (isDataLocked) return;
    setResults(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = [...current];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
    setHasPendingChanges(true);
  }, [isDataLocked]);

  const toggleRow = (idx: number) => {
    setSelectedRows(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const toggleResultRow = (idx: number) => {
    setSelectedResultRows(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  // Foot Calculations
  const totalWeight = useMemo(() => ingredients.reduce((sum: number, i: any) => sum + (Number(i.qty) || 0), 0), [ingredients]);
  const totalSGValue = useMemo(() => (totalWeight > 0 ? (ingredients.reduce((sum: number, i: any) => sum + (Number(i.qty) * Number(i.sg || 1)), 0) / totalWeight).toFixed(4) : "0.0000"), [ingredients, totalWeight]);
  const totalCost100Gal = useMemo(() => ingredients.reduce((sum: number, i: any) => sum + (Number(i.qty) * Number(i.unit_cost || 0)), 0).toFixed(4), [ingredients]);

  const manualYieldValue = "0.0000";
  const netValue = "0.0000";
  const theoreticalSG = totalSGValue;
  const theoreticalLbGal = (Number(totalSGValue) * 8.34).toFixed(4);

  return (
    <>
      <GridContent 
        formulaCode={formulaCode}
        displayTitle={formData.description || 'New Formula'}
        handleAction={handleAction}
        handleResultAction={handleResultAction}
        isDataLocked={isDataLocked}
        ingredients={ingredients}
        results={results}
        equationsList={equationsList}
        selectedRows={selectedRows}
        selectedResultRows={selectedResultRows}
        toggleRow={toggleRow}
        toggleResultRow={toggleResultRow}
        handleInputChange={handleInputChange}
        handleResultInputChange={handleResultInputChange}
        totalWeight={totalWeight}
        totalSGValue={totalSGValue}
        totalCost100Gal={totalCost100Gal}
        manualYieldValue={manualYieldValue}
        netValue={netValue}
        theoreticalSG={theoreticalSG}
        theoreticalLbGal={theoreticalLbGal}
        setIsModalOpen={setIsModalOpen}
        isLoading={isLoading}
        hasPendingChanges={hasPendingChanges}
        handleAutoSaveTrigger={saveAllData}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-[#E5E7EB] w-full h-full rounded-lg shadow-2xl flex flex-col relative overflow-hidden">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 z-[110] p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-hidden">
              <GridContent 
                isFullscreen={true}
                formulaCode={formulaCode}
                displayTitle={formData.description || 'New Formula'}
                handleAction={handleAction}
                handleResultAction={handleResultAction}
                isDataLocked={isDataLocked}
                ingredients={ingredients}
                results={results}
                equationsList={equationsList}
                selectedRows={selectedRows}
                selectedResultRows={selectedResultRows}
                toggleRow={toggleRow}
                toggleResultRow={toggleResultRow}
                handleInputChange={handleInputChange}
                handleResultInputChange={handleResultInputChange}
                totalWeight={totalWeight}
                totalSGValue={totalSGValue}
                totalCost100Gal={totalCost100Gal}
                manualYieldValue={manualYieldValue}
                netValue={netValue}
                theoreticalSG={theoreticalSG}
                theoreticalLbGal={theoreticalLbGal}
                setIsModalOpen={setIsModalOpen}
                isLoading={isLoading}
                hasPendingChanges={hasPendingChanges}
                handleAutoSaveTrigger={saveAllData}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
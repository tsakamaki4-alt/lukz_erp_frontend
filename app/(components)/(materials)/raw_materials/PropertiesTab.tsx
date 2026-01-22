'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Plus, Trash2, Eye, EyeOff, RefreshCw, Info } from 'lucide-react';
import { Part } from './page';

interface PropertiesTabProps {
  selectedPart: Part;
  setSelectedPart: React.Dispatch<React.SetStateAction<Part | null>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function PropertiesTab({ 
  selectedPart, 
  setSelectedPart, 
  handleInputChange 
}: PropertiesTabProps) {
  
  const [showCOA, setShowCOA] = useState(false);

  // --- Logic: Use 4 if decimals is NULL or blank ---
  const precision = (selectedPart.decimals === null || selectedPart.decimals === undefined || selectedPart.decimals === '') 
                    ? 4 
                    : Number(selectedPart.decimals);

  /**
   * Effect: Auto-calculate display_density based on specific_gravity
   * Now respects the dynamic precision mandate.
   */
  useEffect(() => {
    const sg = Number(selectedPart.specific_gravity);
    if (!isNaN(sg) && selectedPart.specific_gravity !== '') {
      // Density constant: 8.345404 lbs/gal (water at STP)
      const calculatedDensity = parseFloat((sg * 8.345404).toFixed(precision));
      
      if (calculatedDensity !== Number(selectedPart.display_density)) {
        setSelectedPart((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            display_density: calculatedDensity,
          };
        });
      }
    }
  }, [selectedPart.specific_gravity, setSelectedPart, selectedPart.display_density, precision]);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        {/* Specific Gravity Row */}
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center border border-slate-300 rounded overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <label className="px-4 py-2 bg-slate-50 border-r border-slate-300 text-[11px] font-black text-slate-700 uppercase min-w-[140px]">
              Specific Gravity
            </label>
            <input 
              type="number" 
              name="specific_gravity"
              step="0.000000001"
              value={selectedPart.specific_gravity ?? ''}
              onChange={handleInputChange}
              placeholder="1.0000"
              className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 outline-none bg-white"
            />
          </div>
          
          <div className="flex flex-1 items-center border border-slate-300 rounded overflow-hidden bg-slate-50 relative group">
            <input 
              type="number" 
              name="display_density"
              readOnly
              value={selectedPart.display_density ?? ''}
              className="flex-1 px-3 py-2 text-xs bg-transparent outline-none font-bold text-blue-600 cursor-default"
            />
            <div className="px-4 py-2 bg-white border-l border-slate-300 text-[11px] font-black text-slate-700 uppercase flex items-center gap-2">
              lbs/gal
              <div className="group-hover:block hidden absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] font-medium rounded shadow-xl">
                Calculated: SG × 8.345404 
                <br/> Precision: {precision} decimals
              </div>
              <Info size={12} className="text-slate-300" />
            </div>
          </div>
        </div>

        {/* Recommended Use Level Row */}
        <div className="flex items-center border border-slate-300 rounded overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <label className="px-4 py-2 bg-slate-50 border-r border-slate-300 text-[11px] font-black text-slate-700 uppercase min-w-[140px]">
            Recommended Use Level
          </label>
          <div className="flex flex-1 items-center bg-white">
            <input 
              type="text" 
              name="product_class" 
              value={selectedPart.product_class || ''}
              onChange={handleInputChange}
              placeholder="min %"
              className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 outline-none"
            />
            <div className="px-10 py-2 bg-slate-50 border-x border-slate-300 text-[11px] font-black text-slate-400 uppercase">
              to
            </div>
            <input 
              type="text" 
              name="subclass" 
              value={selectedPart.subclass || ''}
              onChange={handleInputChange}
              placeholder="max %"
              className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start pt-2">
        <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-[#1d63d2] rounded text-white text-[11px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">
          <Plus size={14} strokeWidth={3} /> Add Properties
        </button>
      </div>

      {/* COA Section */}
      <div className="mt-8 border border-slate-300 rounded overflow-hidden bg-white shadow-sm">
        <div 
          onClick={() => setShowCOA(!showCOA)}
          className="bg-[#e8f0fe] px-4 py-3 border-b border-slate-300 flex justify-between items-center cursor-pointer hover:bg-[#dce9fd] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-[#1d63d2] uppercase tracking-[0.15em] flex items-center gap-2">
              Certificate of Analysis
            </span>
            <span className="text-[9px] font-bold text-blue-400 uppercase italic opacity-60">
              ({showCOA ? 'Click to hide' : 'Click to expand records'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showCOA ? <EyeOff size={16} className="text-[#1d63d2]" /> : <Eye size={16} className="text-[#1d63d2]" />}
            <ChevronDown size={18} className={`text-[#1d63d2] transition-transform duration-200 ${showCOA ? 'rotate-180' : ''}`} strokeWidth={3} />
          </div>
        </div>
        
        {showCOA && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            {/* TOOLBAR INSIDE COA SECTION */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
              <button 
                type="button" 
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} strokeWidth={3} /> Add
              </button>
              <button 
                type="button" 
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <RefreshCw size={12} strokeWidth={3} className="text-blue-500" /> Update
              </button>
              <div className="h-4 w-[1px] bg-slate-300 mx-1" />
              <button 
                type="button" 
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-rose-600 border border-slate-300 rounded text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
              >
                <Trash2 size={12} strokeWidth={3} /> Delete
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-300">
                  <tr>
                    <th className="px-6 py-4 border-r border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-tighter">Vendor Name</th>
                    <th className="px-6 py-4 border-r border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-tighter text-center">Lot #</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-tighter text-center">Pass/Fail</th>
                    <th className="px-6 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic text-slate-400 text-[11px]">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-r border-slate-50">{selectedPart.primary_supplier || "No data"}</td>
                    <td className="px-6 py-4 border-r border-slate-50 text-center">N/A</td>
                    <td className="px-6 py-4 text-center">Unchecked</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useRef, useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, X } from 'lucide-react';
import { Part } from './page';

interface GeneralTabProps {
  selectedPart: Part;
  setSelectedPart: (part: Part) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  dbStatuses: { id: number; name: string }[];
}

const CLASS_OPTIONS = ["Resins", "Additives", "Acids", "Solvents", "Pigments"];
const SUBCLASS_OPTIONS = ["Thermoplastics", "UV Stabilizers", "Strong Acids", "Organic Solvents"];
const CHEMICAL_CLASS_OPTIONS = ["Synthetic Polymers", "Inorganic Oxides", "Mineral Acids", "Hydrocarbons"];
const FUNCTION_OPTIONS = ["AntiAcne Agent", "Antiallergic", "Aesthetic Enhancer", "UV Protector", "Stabilizer", "Solvent"];

export default function GeneralTab({ 
  selectedPart, 
  setSelectedPart, 
  handleInputChange, 
  dbStatuses 
}: GeneralTabProps) {
  const [isFunctionDropdownOpen, setIsFunctionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks for the custom function dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFunctionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFunction = (func: string) => {
    const currentFunctions = selectedPart.functions || [];
    const exists = currentFunctions.includes(func);
    const newFunctions = exists 
      ? currentFunctions.filter(f => f !== func) 
      : [...currentFunctions, func];
    
    setSelectedPart({ ...selectedPart, functions: newFunctions });
  };

  const removeFunction = (funcToRemove: string) => {
    setSelectedPart({
      ...selectedPart,
      functions: (selectedPart.functions || []).filter(f => f !== funcToRemove)
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-500" /> part_num
          </label>
          <input 
            name="part_num" 
            value={selectedPart.part_num || ''} 
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm font-bold text-slate-800" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">trade_name</label>
          <input 
            name="trade_name" 
            value={selectedPart.trade_name || ''} 
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm text-slate-800" 
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">description</label>
        <input 
          name="description" 
          value={selectedPart.description || ''} 
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm font-medium text-slate-800" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">chemical_name</label>
          <input 
            name="chemical_name" 
            value={selectedPart.chemical_name || ''} 
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm font-mono text-blue-600" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">status</label>
          <div className="relative">
            <select 
              name="status" 
              value={selectedPart.status || ''} 
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm font-bold text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">Select Status</option>
              {dbStatuses.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Function Multi-Select Dropdown */}
      <div className="space-y-1.5 relative" ref={dropdownRef}>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Function</label>
        <div 
          onClick={() => setIsFunctionDropdownOpen(!isFunctionDropdownOpen)}
          className="w-full min-h-[46px] px-2 py-2 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-2 items-center relative cursor-pointer hover:border-slate-300 transition-colors"
        >
          {selectedPart.functions?.map((func) => (
            <div key={func} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 font-medium">
              <button 
                onClick={(e) => { e.stopPropagation(); removeFunction(func); }} 
                className="hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
              {func}
            </div>
          ))}
          {(!selectedPart.functions || selectedPart.functions.length === 0) && (
            <span className="text-sm text-slate-400 px-2">Select functions...</span>
          )}
          <div className="absolute right-3 flex items-center gap-2">
            <X 
              size={14} 
              className="text-slate-400 hover:text-slate-600 cursor-pointer" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedPart({ ...selectedPart, functions: [] }); 
              }} 
            />
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        {isFunctionDropdownOpen && (
          <div className="absolute z-[100] w-full bottom-full mb-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
            {FUNCTION_OPTIONS.map((option) => (
              <div 
                key={option}
                onClick={() => toggleFunction(option)}
                className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                  selectedPart.functions?.includes(option) 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</label>
          <div className="relative">
            <select 
              name="product_class" 
              value={selectedPart.product_class || ''} 
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">Select Class...</option>
              {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">subclass</label>
          <div className="relative">
            <select 
              name="subclass" 
              value={selectedPart.subclass || ''} 
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">Select Subclass...</option>
              {SUBCLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">chemical_class</label>
          <div className="relative">
            <select 
              name="chemical_class" 
              value={selectedPart.chemical_class || ''} 
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">Select Chemical Class...</option>
              {CHEMICAL_CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">notes</label>
        <textarea 
          name="notes" 
          rows={4} 
          value={selectedPart.notes || ''} 
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-sm text-slate-800 resize-none leading-relaxed shadow-inner" 
        />
      </div>
    </div>
  );
}
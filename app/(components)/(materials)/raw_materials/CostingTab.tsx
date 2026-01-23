'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, Plus, X, Search, Eye, EyeOff, Calendar, Globe, Hash } from 'lucide-react';
import { Part } from './page';

interface CostingTabProps {
  selectedPart: Part;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function CostingTab({ selectedPart, handleInputChange }: CostingTabProps) {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [showVendorTable, setShowVendorTable] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Logic: Use 4 if decimals is NULL or blank ---
  const precision = (selectedPart.decimals === null || selectedPart.decimals === undefined || selectedPart.decimals === '') 
                    ? 4 
                    : Number(selectedPart.decimals);

  const unitCost = Number(selectedPart.unit_cost || 0);
  const freightCost = Number(selectedPart.freight_cost || 0);
  
  // Apply precision to calculated values
  const totalCost = (unitCost + freightCost).toFixed(precision);
  const kgConversion = (unitCost * 2.20462).toFixed(precision);

  const countries = [
    "United States", "Canada", "Mexico", "United Kingdom", "France", 
    "Germany", "China", "Japan", "South Korea", "India", "Brazil", "Australia",
    "Italy", "Spain", "Netherlands", "Switzerland", "Vietnam", "Thailand"
  ];

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectCountry = (country: string) => {
    const event = { target: { name: 'country_of_origin', value: country } } as React.ChangeEvent<HTMLSelectElement>;
    handleInputChange(event);
    setIsCountryOpen(false);
    setCountrySearch('');
  };

  const clearField = (fieldName: string) => {
    const event = { target: { name: fieldName, value: '' } } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Financial Core Group */}
      <div className="bg-slate-50/50 p-4 md:p-5 rounded-xl border border-slate-200/60 space-y-5">
        
        {/* Current Cost Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Cost</label>
          <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-[1.5]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
              <input 
                type="number" 
                step="0.000000001"
                name="unit_cost"
                value={selectedPart.unit_cost ?? ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" 
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-black uppercase bg-slate-100 px-1.5 py-0.5 rounded">Lb</span>
            </div>
            
            <div className="flex items-center gap-3 px-0 md:px-2">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter whitespace-nowrap">As Of</span>
              <div className="relative flex-1 md:flex-none">
                <input 
                  type="date" 
                  name="cost_date"
                  value={selectedPart.cost_date || ''}
                  onChange={handleInputChange}
                  className="w-full md:w-44 pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-all font-medium" 
                />
                <Calendar size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input 
                type="text" 
                readOnly
                value={kgConversion} 
                className="w-full pl-10 pr-14 py-2.5 bg-slate-100/50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none cursor-not-allowed" 
              />
              <div className="absolute right-0 top-0 h-full flex items-center border-l border-slate-200 px-3 bg-white/80 rounded-r-lg">
                <span className="text-[9px] font-black uppercase text-slate-400 mr-1">Kg</span>
                <ChevronDown size={12} className="text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Freight Row + Decimal precision control */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Freight</label>
          <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
              <input 
                type="number" 
                step="0.000000001"
                name="freight_cost"
                value={selectedPart.freight_cost ?? ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" 
              />
            </div>

            <div className="flex items-center justify-between md:justify-start gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Decimal Precision</span>
              <div className="flex items-center gap-2 border-l pl-3 border-slate-100">
                <Hash size={12} className="text-blue-500" />
                <input 
                  type="number" 
                  name="decimals"
                  min="0"
                  max="10"
                  placeholder="4"
                  value={selectedPart.decimals ?? ''}
                  onChange={handleInputChange}
                  className="w-8 text-xs font-black text-blue-600 bg-transparent outline-none text-center placeholder:text-slate-300" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cost + Freight (Visual Impact) */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 pt-2">
          <label className="lg:w-36 text-[10px] font-black text-blue-600 uppercase tracking-widest">Cost + Freight</label>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-bold">$</span>
            <input 
              type="text" 
              readOnly 
              value={totalCost}
              className="w-full pl-12 pr-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-black text-blue-700 outline-none shadow-sm ring-4 ring-blue-50/50" 
            />
          </div>
        </div>
      </div>

      {/* Logistics & Sourcing Group */}
      <div className="space-y-4 px-1">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Time</label>
          <div className="relative flex-1 group">
            <input 
              type="number" 
              name="lead_time"
              value={selectedPart.lead_time ?? ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
              placeholder="0"
            />
            <span className="absolute right-0 top-0 h-full flex items-center border-l border-slate-200 px-5 bg-slate-50 text-[10px] font-black text-slate-500 uppercase rounded-r-lg tracking-widest group-focus-within:bg-blue-50 group-focus-within:text-blue-600 transition-colors">Days</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin Country</label>
          <div className="relative flex-1" ref={dropdownRef}>
            <div 
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className={`w-full px-4 py-2.5 bg-white border rounded-lg text-xs cursor-pointer flex justify-between items-center transition-all shadow-sm ${isCountryOpen ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className={selectedPart.country_of_origin ? 'text-blue-500' : 'text-slate-300'} />
                <span className={selectedPart.country_of_origin ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                  {selectedPart.country_of_origin || 'Select Country of Origin'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isCountryOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </div>

            {isCountryOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      autoFocus
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <div 
                        key={country}
                        onClick={() => selectCountry(country)}
                        className="px-4 py-2.5 text-[11px] text-slate-700 hover:bg-blue-600 hover:text-white rounded-lg cursor-pointer transition-colors font-bold"
                      >
                        {country}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-8 text-[10px] text-slate-400 text-center uppercase tracking-widest italic font-bold">No results matching "{countrySearch}"</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Manufacturer</label>
          <div className="relative flex-1">
            <input 
              type="text" 
              name="manufacturer"
              value={selectedPart.manufacturer || ''} 
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {selectedPart.manufacturer && (
                <X 
                  size={14} 
                  className="text-slate-300 cursor-pointer hover:text-rose-500 transition-colors" 
                  onClick={() => clearField('manufacturer')}
                />
              )}
              <ChevronDown size={14} className="text-slate-300 border-l pl-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Supplier</label>
          <div className="relative flex-1">
            <input 
              type="text" 
              name="primary_supplier"
              value={selectedPart.primary_supplier || ''} 
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-blue-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-300">
              {selectedPart.primary_supplier && (
                <X 
                  size={14} 
                  className="cursor-pointer hover:text-rose-500 transition-colors"
                  onClick={() => clearField('primary_supplier')}
                />
              )}
              <ChevronDown size={14} className="border-l pl-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          <label className="lg:w-36 text-[10px] font-black text-slate-500 uppercase tracking-widest">Handling</label>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
               <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Type</span>
               <input 
                type="text" 
                name="handling_type"
                placeholder="Type"
                value={selectedPart.handling_type || ''} 
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 shadow-sm" 
              />
            </div>
            <div className="space-y-1">
              <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Weight</span>
              <input 
                type="number" 
                name="handling_weight"
                placeholder="Weight"
                value={selectedPart.handling_weight ?? ''} 
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 shadow-sm" 
              />
            </div>
            <div className="space-y-1">
              <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase tracking-tighter">UOM</span>
              <input 
                type="text" 
                name="handling_unit"
                placeholder="UOM"
                value={selectedPart.handling_unit || ''} 
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-500 text-center outline-none focus:border-blue-500 shadow-sm uppercase tracking-tighter" 
              />
            </div>
            <div className="space-y-1">
              <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Container</span>
              <input 
                type="text" 
                name="handling_container"
                placeholder="Container"
                value={selectedPart.handling_container || ''} 
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 shadow-sm" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
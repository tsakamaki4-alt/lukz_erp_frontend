'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ArrowLeftRight, Scale, Droplets, Info } from 'lucide-react';
import Footer from '@/components/Footer';

export default function UnitConverter() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [value, setValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');
  const [result, setResult] = useState<number>(2.20462);

  // Conversion rates relative to 1 KG or 1 Liter
  const conversions: Record<string, number> = {
    // Weight (Base: kg)
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    oz: 0.0283495,
    // Volume (Base: L)
    l: 1,
    ml: 0.001,
    gal: 3.78541,
  };

  useEffect(() => {
    const fromInBase = value * conversions[fromUnit];
    const converted = fromInBase / conversions[toUnit];
    setResult(converted);
  }, [value, fromUnit, toUnit]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar 
          title="Unit Converter" 
          Icon={ArrowLeftRight} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="p-6 max-w-4xl mx-auto w-full">
          {/* Main Converter Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 overflow-hidden mb-8">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Quick Conversion</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* Input */}
                <div className="flex-1 w-full">
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-transparent text-4xl font-bold focus:outline-none border-b border-white/20 pb-2"
                  />
                  <select 
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="mt-4 bg-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full"
                  >
                    <optgroup label="Weight" className="text-slate-900">
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="oz">Ounces (oz)</option>
                    </optgroup>
                    <optgroup label="Volume" className="text-slate-900">
                      <option value="l">Liters (L)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="gal">Gallons (gal)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Swap Button */}
                <button 
                  onClick={swapUnits}
                  className="p-4 bg-blue-600 rounded-full hover:rotate-180 transition-transform duration-500 shadow-lg shadow-blue-600/40"
                >
                  <ArrowLeftRight size={24} />
                </button>

                {/* Result */}
                <div className="flex-1 w-full">
                  <div className="text-4xl font-bold text-blue-400 border-b border-white/20 pb-2 truncate">
                    {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                  <select 
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="mt-4 bg-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full"
                  >
                    <optgroup label="Weight" className="text-slate-900">
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="oz">Ounces (oz)</option>
                    </optgroup>
                    <optgroup label="Volume" className="text-slate-900">
                      <option value="l">Liters (L)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="gal">Gallons (gal)</option>
                    </optgroup>
                  </select>
                </div>

              </div>
            </div>
            
            <div className="p-6 bg-blue-50/50 flex items-center gap-3">
              <Info size={18} className="text-blue-500" />
              <p className="text-xs text-blue-700 font-medium">
                Note: Volume-to-weight conversions assume a specific gravity of 1.0 (water).
              </p>
            </div>
          </div>

          {/* Reference Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Scale size={18} className="text-amber-500" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Common Weights</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label: '1 kg to lbs', val: '2.2046 lbs' },
                  { label: '1 lb to grams', val: '453.59 g' },
                  { label: '1 oz to grams', val: '28.35 g' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-mono font-bold text-slate-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Droplets size={18} className="text-blue-500" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Common Volumes</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label: '1 gal to Liters', val: '3.785 L' },
                  { label: '1 Liter to fl oz', val: '33.814 oz' },
                  { label: '1 Cup to ml', val: '236.58 ml' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-mono font-bold text-slate-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
        
      </main>
    </div>
  );
}
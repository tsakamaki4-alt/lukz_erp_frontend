'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Calculator, Beaker, DollarSign, Info, Activity } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LabCalculator() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for Cost Calculator
  const [pricePerKg, setPricePerKg] = useState<number>(5.50);
  const [specificGravity, setSpecificGravity] = useState<number>(1.05);
  
  // Results
  const [costPerLiter, setCostPerLiter] = useState<number>(0);
  const [costPerGallon, setCostPerGallon] = useState<number>(0);
  const [densityLbGal, setDensityLbGal] = useState<number>(0);

  useEffect(() => {
    // 1 Liter of water = 1kg. 
    // Density (kg/L) = SG * 1
    const perLiter = pricePerKg * specificGravity;
    // 1 Gallon = 3.78541 Liters
    const perGallon = perLiter * 3.78541;
    // Density in lb/gal = SG * 8.3454 (weight of 1 gal of water)
    const lbGal = specificGravity * 8.3454;

    setCostPerLiter(perLiter);
    setCostPerGallon(perGallon);
    setDensityLbGal(lbGal);
  }, [pricePerKg, specificGravity]);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar 
          title="Lab Calculator" 
          Icon={Beaker} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* Main Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Inputs Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  Parameters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Cost per Kilogram ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={pricePerKg}
                        onChange={(e) => setPricePerKg(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Specific Gravity (SG)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      value={specificGravity}
                      onChange={(e) => setSpecificGravity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 italic">Ratio of material density to water density.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Formula Used</span>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Cost/Gal = (Price/kg × SG) × 3.7854
                </p>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <DollarSign className="text-emerald-500 mb-4" size={24} />
                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cost per Liter</h4>
                  <div className="text-4xl font-black text-slate-900 mt-2">
                    ${costPerLiter.toFixed(3)}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  Based on density of {specificGravity.toFixed(3)} kg/L
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <DollarSign className="text-blue-500 mb-4" size={24} />
                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cost per Gallon</h4>
                  <div className="text-4xl font-black text-slate-900 mt-2">
                    ${costPerGallon.toFixed(3)}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  Standard US Liquid Gallon
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900 p-8 rounded-2xl text-white flex items-center justify-between">
                <div>
                  <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Density (Weight/Volume)</h4>
                  <p className="text-slate-400 text-xs">Calculated density for production yields.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-white">
                    {densityLbGal.toFixed(4)} <span className="text-sm font-sans text-slate-500">lb/gal</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
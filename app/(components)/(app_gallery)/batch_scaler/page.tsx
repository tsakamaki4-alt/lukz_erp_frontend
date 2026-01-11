'use client';

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Scale, Plus, Trash2, Calculator, RefreshCw, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

interface Ingredient {
  id: string;
  name: string;
  percentage: number;
}

export default function BatchScaler() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [isSaved, setIsSaved] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Raw Material A', percentage: 70 },
    { id: '2', name: 'Raw Material B', percentage: 30 },
  ]);

  const totalPercentage = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);

  const addIngredient = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setIngredients([...ingredients, { id: newId, name: '', percentage: 0 }]);
    setIsSaved(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
    setIsSaved(false);
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (totalPercentage !== 100) {
      alert("Formula must equal 100% before saving!");
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* FIXED: Prop name changed from setIsOpen to setIsSidebarOpen to match Navbar interface */}
        <Navbar 
          title="Batch Scaler" 
          Icon={Scale} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* Top Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Target Batch Weight (kg)
              </label>
              <input 
                type="number" 
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full text-2xl font-bold text-blue-600 focus:outline-none bg-transparent"
              />
              <p className="text-slate-400 text-xs mt-1">Total weight to produce</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-500 ${totalPercentage === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Total Percentage
              </label>
              <div className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {totalPercentage.toFixed(2)}%
              </div>
              <p className="text-slate-500 text-xs mt-1">Must equal 100%</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center">
               <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Calculator size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Quick Actions</span>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {isSaved ? <CheckCircle2 size={14} /> : null}
                    {isSaved ? 'Formula Saved' : 'Save Formula'}
                  </button>
                  <button 
                    onClick={() => {setIngredients([]); setIsSaved(false);}} 
                    className="px-3 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg transition-all"
                    title="Clear All"
                  >
                    <RefreshCw size={14} />
                  </button>
               </div>
            </div>
          </div>

          {/* Calculator Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ingredient Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32 text-center">Percentage (%)</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-40 text-right">Required Weight (kg)</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <input 
                          type="text" 
                          placeholder="Enter ingredient name..."
                          value={ing.name}
                          onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                          className="bg-transparent w-full font-medium text-slate-700 focus:outline-none placeholder:text-slate-300"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input 
                          type="number" 
                          value={ing.percentage}
                          onChange={(e) => updateIngredient(ing.id, 'percentage', Number(e.target.value))}
                          className="w-full text-center font-mono font-bold text-blue-600 bg-blue-50/50 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                          {((ing.percentage / 100) * targetWeight).toFixed(3)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => removeIngredient(ing.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors md:opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button 
              onClick={addIngredient}
              className="w-full py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all font-bold text-sm"
            >
              <Plus size={16} /> Add Ingredient
            </button>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400 font-medium px-2">
            <span>* Precision set to 3 decimal places (grams)</span>
            <span>Portfolio Tool: Formulation Scaler v1.0</span>
          </div>
        </div>
        
        <Footer />
        
      </main>
    </div>
  );
}
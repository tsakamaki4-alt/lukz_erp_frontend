'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, Save, CheckCircle, Loader2, Settings, Maximize2, Minimize2, 
  Info, ChevronDown, X 
} from 'lucide-react';

interface FormulaInfoProps {
  formData: any;
  setFormData: (data: any) => void;
  isDataLocked: boolean;
  isStatusLocked: boolean;
  folders: any[];
  categories?: any[];
  subcategories?: any[];
  productTypes?: any[];
  productFormats?: any[];
  qualitySpecs?: any[]; 
  statuses?: any[]; 
  inputClass: (locked: boolean) => string;
  labelClass: string;
  isEditMode: boolean;
  isSubmitting: boolean;
  success: boolean;
  onDelete: () => void;
}

export default function FormulaInfo({
  formData,
  setFormData,
  isDataLocked,
  isStatusLocked,
  folders,
  categories = [],
  subcategories = [],
  productTypes = [],
  productFormats = [],
  qualitySpecs = [],
  statuses = [],
  inputClass,
  labelClass,
  isEditMode,
  isSubmitting,
  success,
  onDelete,
}: FormulaInfoProps) {
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const refinedLabel = "text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5";

  // --- Filtering Logic ---

  // Filter statuses to only show those belonging to the 'formulation' app
  const formulationStatuses = useMemo(() => {
    return statuses.filter(s => s.app_label === 'formulation');
  }, [statuses]);

  const filteredSubcategories = useMemo(() => {
    if (!formData.category) return [];
    return subcategories.filter(sub => sub.category_name === formData.category);
  }, [formData.category, subcategories]);

  const filteredProductTypes = useMemo(() => {
    if (!formData.subcategory) return [];
    return productTypes.filter(pt => pt.subcategory_name === formData.subcategory);
  }, [formData.subcategory, productTypes]);

  // --- Change Handlers ---

  const handleCategoryChange = (val: string) => {
    setFormData({ 
      ...formData, 
      category: val,
      subcategory: '', 
      product_type: '' 
    });
  };

  const handleSubcategoryChange = (val: string) => {
    setFormData({ 
      ...formData, 
      subcategory: val,
      product_type: '' 
    });
  };

  // --- Quality Tags Logic ---

  const selectedQualities: string[] = Array.isArray(formData.product_quality) 
    ? formData.product_quality 
    : [];

  const handleSelectQuality = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedQualities.includes(value)) {
      setFormData({
        ...formData,
        product_quality: [...selectedQualities, value]
      });
    }
    e.target.value = "";
  };

  const removeQuality = (qualityName: string) => {
    setFormData({
      ...formData,
      product_quality: selectedQualities.filter((q: string) => q !== qualityName)
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full min-h-0 space-y-6">
      
      {/* 1. HEADER ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/80 p-4 rounded-xl border border-slate-100 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 text-blue-600">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">General Specifications</h2>
            <p className="text-xs text-slate-500 font-medium">Core formula parameters and documentation</p>
          </div>
        </div>

        {!isStatusLocked && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {isEditMode && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white hover:border-red-200 rounded-lg transition-all border border-transparent shadow-sm"
                title="Delete Formula"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 ${
                success ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle size={16} /> : <Save size={16} />}
              <span>{success ? "Saved" : isEditMode ? "Update" : "Save"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. MAIN FORM CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden relative">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="space-y-4">
            
            {/* FORMULA CODE - MOVED TO TOP */}
            <div className="pt-2">
              <label className={refinedLabel}>Formula Code</label>
              <input
                required
                disabled={isDataLocked}
                className={inputClass(isDataLocked)}
                value={formData.formula_code}
                onChange={(e) => setFormData({ ...formData, formula_code: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* MASTER FOLDER */}
              <div>
                <label className={refinedLabel}>Master Folder</label>
                <div className="relative">
                  <select
                    required
                    disabled={isDataLocked}
                    className={`${inputClass(isDataLocked)} appearance-none`}
                    value={formData.folder_id}
                    onChange={(e) => setFormData({ ...formData, folder_id: e.target.value })}
                  >
                    <option value="">Select Folder...</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* STATUS */}
              <div>
                <label className={refinedLabel}>Status</label>
                <div className="relative">
                  <select
                    disabled={isStatusLocked}
                    className={`${inputClass(isStatusLocked)} appearance-none`}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="">Select Status</option>
                    {formulationStatuses.map((s) => (
                      <option key={s.id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className={refinedLabel}>Trade Name</label>
              <input
                disabled={isDataLocked}
                className={inputClass(isDataLocked)}
                placeholder="Product Market Name"
                value={formData.trade_name}
                onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
              />
            </div>

            {/* DESCRIPTION FIELD */}
            <div>
              <label className={refinedLabel}>Description</label>
              <textarea
                disabled={isDataLocked}
                className={`${inputClass(isDataLocked)} min-h-[80px] py-3 resize-none`}
                placeholder="Enter formula description or scope..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={refinedLabel}>Category</label>
                <div className="relative">
                  <select
                    disabled={isDataLocked}
                    className={`${inputClass(isDataLocked)} appearance-none`}
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id || c.category_name} value={c.category_name}>{c.category_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={refinedLabel}>Sub-Category</label>
                <div className="relative">
                  <select
                    disabled={isDataLocked || !formData.category}
                    className={`${inputClass(isDataLocked || !formData.category)} appearance-none`}
                    value={formData.subcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                  >
                    <option value="">{formData.category ? "Select Sub-Category" : "Select Category first"}</option>
                    {filteredSubcategories.map((s) => (
                      <option key={s.id || s.subcategory_name} value={s.subcategory_name}>{s.subcategory_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={refinedLabel}>Product Type</label>
                  <div className="relative">
                    <select
                      disabled={isDataLocked || !formData.subcategory}
                      className={`${inputClass(isDataLocked || !formData.subcategory)} appearance-none`}
                      value={formData.product_type}
                      onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    >
                      <option value="">{formData.subcategory ? "Select Type" : "Select Sub-Category first"}</option>
                      {filteredProductTypes.map((pt) => (
                        <option key={pt.id || pt.product_type} value={pt.product_type}>{pt.product_type}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={refinedLabel}>Format</label>
                  <div className="relative">
                    <select
                      disabled={isDataLocked}
                      className={`${inputClass(isDataLocked)} appearance-none`}
                      value={formData.product_format}
                      onChange={(e) => setFormData({ ...formData, product_format: e.target.value })}
                    >
                      <option value="">Select Format</option>
                      {productFormats.map((pf) => (
                        <option key={pf.id || pf.product_format} value={pf.product_format}>{pf.product_format}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={`lg:col-span-7 flex flex-col min-h-0 space-y-4 ${isFullscreen ? 'absolute inset-0 z-50 bg-white p-6 rounded-xl border-2 border-blue-500 animate-in zoom-in-95 duration-200' : ''}`}>
          
          {!isFullscreen && (
            <div className="flex-shrink-0 pt-2 h-auto flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className={refinedLabel}>
                  Product Quality
                  <span title="Select applicable product qualities">
                    <Info size={12} className="text-slate-300" />
                  </span>
                </label>
              </div>
              
              <div className={`p-1.5 min-h-[46px] flex flex-wrap gap-2 ${inputClass(isDataLocked)} bg-white relative`}>
                {selectedQualities.map((quality) => (
                  <span 
                    key={quality} 
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200"
                  >
                    {quality}
                    {!isDataLocked && (
                      <button 
                        type="button" 
                        onClick={() => removeQuality(quality)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                
                {!isDataLocked && (
                  <div className="flex-1 min-w-[120px] relative">
                    <select
                      className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                      onChange={handleSelectQuality}
                      value=""
                    >
                      <option value="" disabled>Add Quality...</option>
                      {qualitySpecs
                        .filter((spec: any) => !selectedQualities.includes(spec.product_quality))
                        .map((spec: any) => (
                          <option key={spec.id} value={spec.product_quality}>{spec.product_quality}</option>
                        ))
                      }
                    </select>
                    <div className="h-full flex items-center px-2 text-slate-400 text-xs italic pointer-events-none">
                      {selectedQualities.length === 0 ? "Select product qualities..." : "Add more..."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-1.5">
              <label className={refinedLabel}>Production Notes & Procedure</label>
              <button 
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all text-[10px] font-bold uppercase tracking-wider border border-transparent hover:border-blue-100"
              >
                  {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  {isFullscreen ? "Exit" : "Full Screen"}
              </button>
            </div>

            <textarea
              disabled={isDataLocked}
              className={`
                ${inputClass(isDataLocked)} 
                flex-1 w-full font-mono text-[13px] bg-slate-50/30 
                leading-loose p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200
                resize-none focus:bg-white transition-colors
                ${isFullscreen ? 'text-[15px] p-8' : ''}
              `}
              placeholder="Enter manufacturing steps..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
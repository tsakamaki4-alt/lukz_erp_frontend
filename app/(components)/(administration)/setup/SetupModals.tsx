'use client';

import React from 'react';
import { 
  X, Save, Loader2, FileSpreadsheet, AlertOctagon, 
  ArrowRight, ShieldAlert, FileWarning 
} from 'lucide-react';

interface SetupModalsProps {
  activeTab: any;
  showGuidelines: boolean;
  setShowGuidelines: (val: boolean) => void;
  importError: { title: string; message: string } | null;
  setImportError: (val: { title: string; message: string } | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  editingItem: any;
  formData: any;
  setFormData: (val: any) => void;
  isSaving: boolean;
  handleSave: (e: React.FormEvent) => void;
  parentData: any[];
  appLabels: any[];
  productClasses: any[];
}

export default function SetupModals({
  activeTab,
  showGuidelines,
  setShowGuidelines,
  importError,
  setImportError,
  isModalOpen,
  setIsModalOpen,
  editingItem,
  formData,
  setFormData,
  isSaving,
  handleSave,
  parentData,
  appLabels,
  productClasses
}: SetupModalsProps) {
  return (
    <>
      {/* Guidelines Slide-over */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileSpreadsheet size={24} /></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Import Blueprint</h2>
              </div>
              <button onClick={() => setShowGuidelines(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-4">
                <AlertOctagon className="text-rose-600 shrink-0" size={20} />
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  <strong>Strict Validation Active:</strong> The CSV header MUST match the required column name exactly. If a header or row value is missing, the import will stop.
                </p>
              </div>

              <p className="text-sm text-slate-500 font-medium">Required Headers for <span className="text-blue-600 font-bold underline decoration-2 underline-offset-4">{activeTab.name}</span>:</p>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandatory Columns</span>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-200">{activeTab.labelField}</div>
                    {(activeTab.id === 'countries' || activeTab.id === 'states' || activeTab.id === 'uom') && (
                      <div className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold">abbreviation</div>
                    )}
                    {activeTab.parentField && (
                      <div className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold">{activeTab.parentField}</div>
                    )}
                    {activeTab.secondaryFields?.map((field: string) => (
                        <div key={field} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">{field}</div>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-100 rounded-full" />
                    <div className="pl-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">CSV Content Example</span>
                      <div className="flex items-center gap-3 text-sm font-mono text-slate-600">
                        <span className="bg-white px-2 py-1 border border-slate-200 rounded">"Valuable Data"</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        {activeTab.parentField ? (
                          <span className="bg-white px-2 py-1 border border-slate-200 rounded">"12"</span>
                        ) : activeTab.id === 'countries' ? (
                          <span className="bg-white px-2 py-1 border border-slate-200 rounded">"US"</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Header Match", text: "Headers are case-insensitive but must match the specific column name." },
                  { title: "No Empty Rows", text: "Rows with missing values in the mandatory column will be skipped automatically." }
                ].map((note, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black group-hover:bg-blue-600 group-hover:text-white transition-all">{i+1}</div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">{note.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowGuidelines(false)} className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]">Got it, let's import</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Error Modal */}
      {importError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldAlert size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Import Rejected</h2>
              <p className="text-slate-500 text-sm font-medium mb-6 px-4">{importError.message}</p>
              
              <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileWarning size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Header</span>
                </div>
                <code className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-blue-600 font-bold text-sm block shadow-sm">
                  {activeTab.labelField}
                </code>
              </div>

              <button 
                onClick={() => setImportError(null)}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
              >
                Dismiss & Correct File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit' : 'New'} {activeTab.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto max-h-[70vh] no-scrollbar">
              {activeTab.parentField && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Parent {activeTab.parentField}</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-bold" 
                    value={formData.parentId} 
                    onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  >
                    <option value="">Choose parent...</option>
                    {parentData.map((p: any) => (
                        <option key={p.id} value={p.id}>
                            {p.category_name || p.subcategory_name || p.name || p.abbreviation}
                        </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab.id === 'sub-classes' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Product Class Mapping</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer font-medium" 
                    value={formData.class_name} 
                    onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                  >
                    <option value="">Select a Product Class...</option>
                    {productClasses.map((pc) => (
                      <option key={pc.id} value={pc.class_name}>{pc.class_name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab.id === 'statuses' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assign to Application</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" value={formData.app_label} onChange={(e) => setFormData({...formData, app_label: e.target.value})}>
                    {appLabels.map((app) => (<option key={app.id} value={app.id}>{app.name}</option>))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {activeTab.labelField.replace('_', ' ')}
                </label>
                <input required placeholder={`Enter ${activeTab.labelField}...`} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              {activeTab.id === 'equations' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Row Number</label>
                  <input type="number" placeholder="e.g. 1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.row_number} onChange={(e) => setFormData({...formData, row_number: e.target.value})} />
                </div>
              )}

              {activeTab.id === 'product-classes' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Class Type</label>
                  <input placeholder="e.g. Raw Material, Packaging" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.class_type} onChange={(e) => setFormData({...formData, class_type: e.target.value})} />
                </div>
              )}

              {activeTab.id === 'uom' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Unit Name</label>
                  <input placeholder="e.g. Kilograms, Liters" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.extra} onChange={(e) => setFormData({...formData, extra: e.target.value})} />
                </div>
              )}

              {(activeTab.id === 'countries' || activeTab.id === 'states') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Abbreviation</label>
                  <input maxLength={5} placeholder="e.g. US, NY, PH" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" value={formData.extra} onChange={(e) => setFormData({...formData, extra: e.target.value.toUpperCase()})} />
                </div>
              )}

              {activeTab.id === 'statuses' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Code</label>
                  <input required placeholder="e.g. ACT, OBS" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                </div>
              )}

              {activeTab.secondaryFields?.includes('description') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea rows={3} placeholder="Provide additional details..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-all active:scale-95">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
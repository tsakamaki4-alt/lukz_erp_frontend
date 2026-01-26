'use client';

import React from 'react';
import { 
  X, Save, Loader2, FileSpreadsheet, AlertOctagon, 
  ShieldAlert, Layers, Database, Layout, CheckCircle2,
  AlertTriangle, Trash2
} from 'lucide-react';

interface SetupModalsProps {
  activeTab: any;
  showGuidelines: boolean;
  setShowGuidelines: (val: boolean) => void;
  importError: { title: string; message: string; expected?: string; found?: string } | null;
  setImportError: (val: { title: string; message: string; expected?: string; found?: string } | null) => void;
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
  // Added Deletion Props
  itemToDelete: any | null;
  setItemToDelete: (val: any | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;
}

export default function SetupModals({
  activeTab, showGuidelines, setShowGuidelines, importError, setImportError,
  isModalOpen, setIsModalOpen, editingItem, formData, setFormData,
  isSaving, handleSave, parentData, appLabels, productClasses,
  itemToDelete, setItemToDelete, isDeleting, handleDelete
}: SetupModalsProps) {
  return (
    <>
      {/* --- GUIDELINES SIDEBAR --- */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"><FileSpreadsheet size={22} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Blueprint</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTab.name}</p>
                </div>
              </div>
              <button onClick={() => setShowGuidelines(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
                <AlertOctagon className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                  <strong>Strict Columns:</strong> CSV headers must match the blueprint below exactly.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-700 font-bold uppercase tracking-tight">Required Header Keys</p>
                <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border-4 border-slate-800 p-6">
                    <div className="flex flex-wrap gap-2">
                      {activeTab.id === 'statuses' ? (
                        <>
                          <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-mono font-bold">code</div>
                          <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-mono font-bold">name</div>
                          <div className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold">app_label</div>
                        </>
                      ) : (
                        <>
                          <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-mono font-bold">{activeTab.labelField}</div>
                          {activeTab.parentField && <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold">{activeTab.parentField}</div>}
                          {activeTab.secondaryFields?.map((f: string) => <div key={f} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold">{f}</div>)}
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>

            <button onClick={() => setShowGuidelines(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 mt-4"><CheckCircle2 size={18} /> Close</button>
          </div>
        </div>
      )}

      {/* --- ERROR MODAL --- */}
      {importError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0"><ShieldAlert size={32} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Blueprint Failure</h2>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{importError.title}</p>
                </div>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-6 text-sm font-semibold text-rose-800">{importError.message}</div>

              <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Header</label>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl font-mono text-xs text-emerald-700 font-bold">{importError.expected}</div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected in File</label>
                  <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl font-mono text-xs text-rose-600 font-bold italic">{importError.found}</div>
                </div>
              </div>
              
              <button onClick={() => setImportError(null)} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-rose-700 transition-all active:scale-95">Discard & Fix</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETION CONFIRMATION MODAL --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 relative">
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-600 mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Confirm Deletion</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Are you sure you want to delete <span className="font-bold text-slate-900 italic">"{(itemToDelete as any)[activeTab.labelField] || itemToDelete.name}"</span>? 
                This action is permanent and cannot be undone.
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                  ) : (
                    <> <Trash2 size={16} /> Delete Item</>
                  )}
                </button>
              </div>
            </div>
            <button 
              onClick={() => setItemToDelete(null)}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* --- FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-600">{editingItem ? <Layout size={24} /> : <Database size={24} />}</div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">{editingItem ? 'Edit' : 'Create'} {activeTab.name}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Data</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
              {activeTab.parentField && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Reference</label>
                  <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})}>
                    <option value="">Choose...</option>
                    {parentData.map((p: any) => <option key={p.id} value={p.id}>{p.subcategory_name || p.category_name || p.class_name || p.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab.id === 'statuses' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">App Assignment</label>
                  <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" value={formData.app_label} onChange={(e) => setFormData({...formData, app_label: e.target.value})}>
                    <option value="">Select App...</option>
                    {appLabels.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{activeTab.labelField.replace('_', ' ')}</label>
                <input required className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              {activeTab.id === 'statuses' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status Code</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono uppercase text-blue-600" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl text-sm font-black uppercase hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-[2] flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Commit Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import { Beaker, ArrowLeft, Loader2, Info, Lock, ClipboardList, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import DeleteFormulaModal from './DeleteFormulaModal';
import UnsavedChangesModal from '@/app/(components)/UnsavedChangesModal';
import FormulaInfo from './FormulaInfo';
import FormulaIngredients from './FormulaIngredients';
import { apiRequest } from '@/app/lib/api'; // Centralized API Wrapper

/**
 * generateStaticParams is required for 'output: export' when using dynamic routes.
 * This tells Next.js to pre-render the 'new' path. 
 * Note: Existing IDs will be handled by the client-side useEffect.
 */
export async function generateStaticParams() {
  return [{ id: 'new' }];
}

function FormulaFormContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [ingredients, setIngredients] = useState<any[]>([]);
  
  const formulaId = params?.id !== 'new' ? params?.id : null;
  const isEditMode = !!formulaId;
  
  const [activeTab, setActiveTab] = useState('general'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  
  // State for classification dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [productFormats, setProductFormats] = useState<any[]>([]);
  const [qualitySpecs, setQualitySpecs] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    formula_code: '',
    trade_name: '',
    folder_id: searchParams.get('folder_id') || '',
    class_name: '', 
    subclass: '',
    category: '', 
    subcategory: '',
    product_type: '',
    product_format: '',
    product_quality: {}, 
    status: 'Experimental',
    description: '',
    notes: '',
    can_edit: true 
  });

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !success) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, success]);

  const handleNavigationIntent = (path: string) => {
    if (isDirty && !success) {
      setPendingPath(path);
      setIsUnsavedModalOpen(true);
      return false;
    }
    return true;
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (isDirty && !success) {
      e.preventDefault();
      setPendingPath('/formula');
      setIsUnsavedModalOpen(true);
    } else {
      router.push('/formula');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all dropdown data using centralized apiRequest
        const [
          folderData, 
          catData, 
          subCatData, 
          typeData, 
          formatData, 
          qualityData,
          statusData
        ] = await Promise.all([
          apiRequest<any[]>('/api/formulation/folders/'),
          apiRequest<any[]>('/api/setup/categories/'),
          apiRequest<any[]>('/api/setup/subcategories/'),
          apiRequest<any[]>('/api/setup/product-types/'),
          apiRequest<any[]>('/api/setup/product-formats/'),
          apiRequest<any[]>('/api/setup/quality-specs/'),
          apiRequest<any[]>('/api/setup/statuses/'),
        ]);

        setFolders(folderData);
        setCategories(catData);
        setSubcategories(subCatData);
        setProductTypes(typeData);
        setProductFormats(formatData);
        setQualitySpecs(qualityData);
        setStatuses(statusData);

        if (isEditMode) {
          const data = await apiRequest<any>(`/api/formulation/formulas/${formulaId}/`);
          const loadedData = {
            formula_code: data.formula_code || '',
            trade_name: data.trade_name || '',
            folder_id: data.folder?.toString() || '',
            class_name: data.class_name || '',
            subclass: data.subclass || '',
            category: data.category || '',
            subcategory: data.subcategory || '',
            product_type: data.product_type || '',
            product_format: data.product_format || '',
            product_quality: data.product_quality || {},
            status: data.status || 'Experimental',
            description: data.description || '',
            notes: data.notes || '',
            can_edit: data.can_edit ?? true,
          };
          setFormData(loadedData);
          setInitialData(loadedData);
        } else {
          setInitialData(formData);
        }
      } catch (err: any) {
        setError(err.detail || "Error connecting to server or record not found.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [isEditMode, formulaId]);

  const isDataLocked = formData.status === 'Active' || (isEditMode && formData.can_edit === false);
  const isStatusLocked = isEditMode && formData.can_edit === false;

  const inputClass = (locked: boolean) => `
    w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md 
    focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none 
    transition-all text-[15px] font-medium text-slate-700 placeholder:text-slate-400
    ${locked ? 'bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200 shadow-none' : 'hover:border-slate-400 shadow-sm'}
  `;
  
  const labelClass = "text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStatusLocked) return; 

    setIsSubmitting(true);
    setError(null);
    
    const payload = { 
      ...formData, 
      folder: formData.folder_id || null 
    };

    const endpoint = isEditMode 
      ? `/api/formulation/formulas/${formulaId}/` 
      : '/api/formulation/formulas/';
    
    try {
      await apiRequest(endpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      setInitialData(formData); 
      setTimeout(() => router.push('/formula'), 1200);
    } catch (err: any) {
      setError(err.detail || "Validation error check input formats.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onNavigate={handleNavigationIntent} />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar title="Formula Master Records" Icon={Beaker} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 overflow-hidden">
          <form id="formula-form" onSubmit={handleSubmit} className="h-full flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4 truncate">
                <Link 
                  href="/formula" 
                  onClick={handleBackClick}
                  className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 transition-all flex-shrink-0"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div className="truncate">
                  <h1 className="text-lg font-bold text-slate-700 truncate flex items-center gap-3">
                    {isEditMode ? formData.formula_code : 'Create New Formula'}
                    {isDirty && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                            Pending Changes
                        </span>
                    )}
                  </h1>
                </div>
              </div>

              {isStatusLocked && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-semibold uppercase tracking-wider">
                  <Lock size={14} /> View Only
                </div>
              )}
            </div>

            <div className="flex px-6 border-b border-slate-100 bg-slate-50/50">
                <button 
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-600 bg-white shadow-[0_4px_0_-2px_rgba(37,99,235,1)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <ClipboardList size={18} />
                    General Info
                </button>
                {isEditMode && (
                  <button 
                      type="button" 
                      onClick={() => setActiveTab('ingredients')}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'ingredients' ? 'border-blue-600 text-blue-600 bg-white shadow-[0_4px_0_-2px_rgba(37,99,235,1)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                      <FlaskConical size={18} />
                      Formula Ingredients
                  </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-slate-200">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg flex items-center gap-3">
                   <Info size={18} /> {error}
                </div>
              )}

              {activeTab === 'general' && (
                <FormulaInfo 
                  formData={formData}
                  setFormData={setFormData}
                  isDataLocked={isDataLocked}
                  isStatusLocked={isStatusLocked}
                  folders={folders}
                  categories={categories}
                  subcategories={subcategories}
                  productTypes={productTypes}
                  productFormats={productFormats}
                  qualitySpecs={qualitySpecs}
                  statuses={statuses}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  isEditMode={isEditMode}
                  isSubmitting={isSubmitting}
                  success={success}
                  onDelete={() => setIsDeleteModalOpen(true)}
                />
              )}

              {isEditMode && activeTab === 'ingredients' && (
                <FormulaIngredients 
                  ingredients={ingredients}
                  setIngredients={setIngredients}
                  isDataLocked={isDataLocked}
                  formData={formData}
                />
              )}
            </div>
          </form>
        </div>
        <Footer />
      </main>

      <UnsavedChangesModal 
        isOpen={isUnsavedModalOpen}
        onClose={() => { setIsUnsavedModalOpen(false); setPendingPath(null); }}
        onDiscard={() => { setInitialData(null); setIsUnsavedModalOpen(false); router.push(pendingPath || '/formula'); }}
      />
      
      <DeleteFormulaModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => { setInitialData(null); setIsDeleteModalOpen(false); router.push('/formula'); }}
        formulaId={formulaId as string}
        formulaCode={formData.formula_code}
        hasUnsavedChanges={isDirty} 
      />
    </div>
  );
}

export default function FormulaFormPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-500" size={32} /></div>}>
      <FormulaFormContent />
    </Suspense>
  );
}
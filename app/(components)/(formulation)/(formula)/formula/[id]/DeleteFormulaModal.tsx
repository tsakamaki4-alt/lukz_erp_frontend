'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, X, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; // Centralized API helper

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formulaId: string;
  formulaCode: string;
  hasUnsavedChanges: boolean; 
}

export default function DeleteFormulaModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  formulaId, 
  formulaCode 
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      // Use the centralized apiRequest to handle BASE_URL, Token, and Method
      await apiRequest(`/api/formulation/formulas/${formulaId}/`, {
        method: 'DELETE',
      });

      // On successful 204/200 response
      onSuccess();
      onClose(); 
    } catch (err: any) {
      // Catch blocks in apiRequest throw structured errors
      const backendMessage = err.detail || err.error || "You do not have permission to delete this record.";
      setError(backendMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Deletion</h3>
          <p className="text-sm text-slate-500 mb-6">
            Are you sure you want to delete <span className="font-bold text-red-600 italic px-1 bg-red-50 rounded uppercase">{formulaCode}</span>? 
            This action is permanent and cannot be reversed.
          </p>

          {/* DYNAMIC ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Security Guardrail</span>
                <p className="text-sm text-red-700 font-semibold leading-snug">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`
                flex-[1.5] px-4 py-3 text-sm font-bold text-white rounded-xl transition-all 
                flex items-center justify-center gap-2 shadow-lg order-1 sm:order-2
                ${isDeleting ? 'bg-red-400 shadow-none' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}
              `}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Purging...</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Delete Formula</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
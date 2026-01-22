'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folder: { id: number; name: string } | null;
}

export default function DeleteFolderModal({ isOpen, onClose, onSuccess, folder }: DeleteFolderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !folder) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    setErrorMessage(null); 
    
    try {
      // The apiRequest now handles 204 No Content globally.
      // It will no longer throw "Unexpected end of JSON input".
      await apiRequest(`/api/formulation/folders/${folder.id}/`, {
        method: 'DELETE',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      const msg = error.detail || error.error || error.message || "Deletion failed.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-100 animate-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Folder?</h3>
          <p className="text-sm text-slate-500 mb-4">
            Are you sure you want to delete <span className="font-bold text-slate-800">"{folder.name}"</span>? 
          </p>

          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-left">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-red-700 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          {!errorMessage && (
             <p className="text-xs text-slate-400 italic mb-6">
               This action cannot be undone and may affect associated formulas.
             </p>
          )}

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:bg-red-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Confirm Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
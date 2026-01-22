'use client';

import React, { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; // Centralized API helper

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFolderModal({ isOpen, onClose, onSuccess }: AddFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Use centralized apiRequest for automated Auth and BaseURL
      // The helper handles potential JSON parsing issues globally now
      await apiRequest('/api/formulation/folders/', {
        method: 'POST',
        body: JSON.stringify({ name: folderName.trim() }),
      });

      setFolderName('');
      onSuccess(); // Refresh the list in parent component
      onClose();   // Close modal
    } catch (err: any) {
      console.error("Error creating folder:", err);
      // Pull detail from the error object thrown by apiRequest
      const msg = err.detail || err.error || err.message || 'Could not create folder. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FolderPlus size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Create New Folder</h3>
          </div>
          <button 
            onClick={onClose} 
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="folderName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Folder Name
              </label>
              <input
                autoFocus
                id="folderName"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Skin Care 2024"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg font-medium border border-rose-100 animate-in slide-in-from-top-1">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-transparent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderName.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Create Folder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
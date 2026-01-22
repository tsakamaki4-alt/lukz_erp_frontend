'use client';

import React, { useState, useEffect } from 'react';
import { X, Pencil, Loader2 } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

interface RenameFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folder: { id: number; name: string } | null;
}

export default function RenameFolderModal({ isOpen, onClose, onSuccess, folder }: RenameFolderModalProps) {
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync internal state when the folder prop changes
  useEffect(() => {
    if (folder) {
      setNewName(folder.name);
    } else {
      setNewName('');
    }
  }, [folder]);

  // If the modal isn't open or no folder is provided, do not render
  if (!isOpen || !folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guard: Don't submit if name hasn't changed or is empty
    if (!newName.trim() || newName === folder.name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Using centralized apiRequest for PATCH operation
      await apiRequest(`/api/formulation/folders/${folder.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName.trim() }),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error renaming folder:", error);
      // Logic for error notifications could be added here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-blue-600">
            <Pencil size={18} />
            <h3 className="font-bold text-slate-800">Rename Folder</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                New Folder Name
              </label>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900"
                required
              />
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="flex gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newName.trim() || newName === folder.name}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { AlertCircle, ArrowLeft, Save, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesModal({ isOpen, onClose, onDiscard }: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-amber-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4">
            <AlertCircle size={28} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2">Unsaved Changes</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You have unsaved modifications. Leaving this page will <span className="text-red-600 font-bold">permanently lose</span> your edits.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Stay & Save Changes
            </button>
            <button
              onClick={onDiscard}
              className="w-full py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
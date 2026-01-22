'use client';

import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteUserModalProps {
  user: { id: number; username: string } | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
}

export default function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  isProcessing
}: DeleteUserModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        <div className="p-8 text-center">
          {/* Icon Circle */}
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            {isProcessing ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <Trash2 size={32} />
            )}
          </div>

          {/* Text Content */}
          <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">
            Confirm Deletion
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Are you sure you want to permanently delete user{' '}
            <span className="text-rose-600 font-semibold px-1 italic">
              "{user.username}"
            </span>? This action cannot be undone.
          </p>
        </div>
        
        {/* Footer Actions */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-white hover:border-slate-300 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-black shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-700"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
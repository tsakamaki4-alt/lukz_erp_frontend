'use client';

import React from 'react';
import { ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';

interface DeleteGroupModalProps {
  group: { id: number; name: string } | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
}

export default function DeleteGroupModal({
  group,
  onClose,
  onConfirm,
  isProcessing
}: DeleteGroupModalProps) {
  if (!group) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        <div className="p-8 text-center">
          {/* Icon Header */}
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
            {isProcessing ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <ShieldAlert size={32} />
            )}
          </div>

          {/* Warning Content */}
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
            Delete Security Group?
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            You are about to dissolve the 
            <span className="text-slate-900 font-bold italic px-1">
              "{group.name}"
            </span> 
            clearance level. Users currently assigned to this group will lose their associated permissions.
          </p>

          {/* Critical Warning Badge */}
          <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-bold uppercase tracking-wider justify-center">
            <AlertTriangle size={14} />
            This action is irreversible
          </div>
        </div>
        
        {/* Action Footer */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-bold text-sm hover:text-slate-800 hover:border-slate-400 transition-all disabled:opacity-50"
          >
            Dismiss
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing
              </>
            ) : (
              'Confirm Deletion'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
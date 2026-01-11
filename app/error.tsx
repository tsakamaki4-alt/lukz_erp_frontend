'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
      <div className="space-y-6">
        <div className="bg-rose-500/20 p-4 rounded-full inline-block">
          <AlertTriangle className="text-rose-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white">System Interruption</h2>
        <p className="text-slate-400 max-w-sm">An unexpected error occurred in the ERP core. Our team has been notified.</p>
        <button onClick={() => reset()} className="px-6 py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 mx-auto">
          <RefreshCcw size={18} /> Re-initialize Module
        </button>
      </div>
    </div>
  );
}
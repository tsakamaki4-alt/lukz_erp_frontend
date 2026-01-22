import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import FormulaFormContent from './FormulaFormContent';

export default function FormulaFormPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    }>
      <FormulaFormContent />
    </Suspense>
  );
}
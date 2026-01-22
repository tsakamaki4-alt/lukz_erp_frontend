// app/(components)/(formulation)/formula/page.tsx
import FormulaClient from './FormulaClient';

export const metadata = {
  title: 'Formula Management | Lukz ERP',
  description: 'Manage batch records and R&D logs',
};

export default function FormulaPage() {
  return <FormulaClient />;
}
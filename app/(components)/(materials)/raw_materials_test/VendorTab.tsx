'use client';

import React from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Plus, 
  Trash2, 
  CreditCard, 
  Globe, 
  ExternalLink 
} from 'lucide-react';
import { Part } from './page';

interface VendorTabProps {
  selectedPart: Part;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function VendorTab({ selectedPart, handleInputChange }: VendorTabProps) {
  
  const clearField = (fieldName: string) => {
    handleInputChange({ target: { name: fieldName, value: '' } } as any);
  };

  return (
    <div className="w-full space-y-6">
      {/* SECTION 1: Strategic Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Logistics Panel */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={16} className="text-blue-600" />
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Fulfillment Specs</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/10">
              <label className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-[10px] font-bold text-slate-500 uppercase min-w-[120px]">Shipping Point</label>
              <input 
                type="text" 
                name="notes" // Using notes field as placeholder for vendor notes
                value={selectedPart.notes || ''}
                onChange={handleInputChange}
                placeholder="City, State / Port of Origin"
                className="flex-1 px-3 py-2 text-xs font-medium outline-none"
              />
            </div>

            <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden">
              <label className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-[10px] font-bold text-slate-500 uppercase min-w-[120px]">Payment Terms</label>
              <select 
                name="status" // Using status as placeholder for term logic if not defined
                className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              >
                <option>Net 30</option>
                <option>Net 60</option>
                <option>Due on Receipt</option>
                <option>Prepaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requirements Panel */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-emerald-600" />
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Order Thresholds</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden">
              <label className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-[10px] font-bold text-slate-500 uppercase min-w-[120px]">Min Order Qty</label>
              <div className="flex flex-1 items-center">
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 text-xs font-bold outline-none"
                />
                <span className="px-3 text-[10px] font-black text-slate-400 uppercase">Lb</span>
              </div>
            </div>

            <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden">
              <label className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-[10px] font-bold text-slate-500 uppercase min-w-[120px]">IncoTerms</label>
              <select className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 outline-none">
                <option>FOB Origin</option>
                <option>FOB Destination</option>
                <option>DDP</option>
                <option>EXW</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Vendor Contacts */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <User size={18} className="text-blue-600" />
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Assigned Contacts</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Primary Vendor: {selectedPart.primary_supplier || "N/A"}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
            <Plus size={14} /> Add Contact
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tighter">Contact Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">Direct Phone</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tighter">Email Address</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700">James Sullivan</span>
                    <span className="text-[9px] text-blue-600 font-bold uppercase tracking-tight">Main Point of Contact</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">Sales</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                    <Phone size={12} className="text-slate-300" />
                    (555) 123-4567
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 underline decoration-blue-200 underline-offset-4">
                    <Mail size={12} className="text-blue-400" />
                    jsullivan@vendor-corp.com
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Compliance & Documents */}
      <div className="bg-[#eef2ff] border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-200">
            <Globe size={24} className="text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-blue-900 uppercase">Vendor Supplier Portal</h4>
            <p className="text-[10px] text-blue-700/70 font-bold uppercase">Access safety data sheets and compliance certifications</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 border border-blue-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm">
          Launch Portal <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
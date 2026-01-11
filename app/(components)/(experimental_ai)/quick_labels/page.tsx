'use client';

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tag, Printer, Download, Calendar, CheckCircle2, Flame, Skull, Biohazard, Truck, Settings2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

export default function LabelGenerator() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [productName, setProductName] = useState('Organic Base Solvent');
  const [batchNo, setBatchNo] = useState('B-2026-001');
  const [customer, setCustomer] = useState('Global Logistics Corp');
  const [isDownloading, setIsDownloading] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  
  // Hydration Fix: Store date in state to prevent server/client mismatch
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  const [hazards, setHazards] = useState({
    flammable: false,
    toxic: false,
    corrosive: false,
  });

  const labelRef = useRef<HTMLDivElement>(null);

  const downloadLabel = async () => {
    if (labelRef.current === null) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(labelRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: '#ffffff' 
      });
      const link = document.createElement('a');
      link.download = `LUKZ-${customer}-${batchNo}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .printable-label, .printable-label * { visibility: visible; }
          .printable-label {
            position: fixed;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: ${orientation === 'landscape' ? '6in 4in' : '4in 6in'};
            margin: 0;
          }
        }
      `}</style>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Fixed prop name: setIsSidebarOpen */}
        <Navbar 
          title="Quick Label Generator" 
          Icon={Tag} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            <div className="space-y-6 no-print">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings2 size={16} /> Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Name</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch No.</label>
                      <input type="text" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</label>
                      <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-widest">Print Layout</label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                      <button onClick={() => setOrientation('landscape')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orientation === 'landscape' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Landscape (6x4)</button>
                      <button onClick={() => setOrientation('portrait')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orientation === 'portrait' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Portrait (4x6)</button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Hazard Icons</label>
                  <div className="flex gap-3">
                    <button onClick={() => setHazards(h => ({...h, flammable: !h.flammable}))} className={`p-3 rounded-xl border transition-all ${hazards.flammable ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-white border-slate-200 text-slate-300'}`}><Flame size={20} /></button>
                    <button onClick={() => setHazards(h => ({...h, toxic: !h.toxic}))} className={`p-3 rounded-xl border transition-all ${hazards.toxic ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-white border-slate-200 text-slate-300'}`}><Skull size={20} /></button>
                    <button onClick={() => setHazards(h => ({...h, corrosive: !h.corrosive}))} className={`p-3 rounded-xl border transition-all ${hazards.corrosive ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-300'}`}><Biohazard size={20} /></button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
                  <Printer size={18} /> Print Label
                </button>
                <button onClick={downloadLabel} className="px-8 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center">
                  {isDownloading ? <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Download size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-start py-4">
              <div 
                ref={labelRef} 
                className={`printable-label bg-white border-[6px] border-black p-8 shadow-2xl flex flex-col justify-between relative text-black overflow-hidden transition-all duration-300 ${
                  orientation === 'landscape' ? 'w-[480px] h-[320px]' : 'w-[320px] h-[480px]'
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-black rotate-45 translate-x-6 -translate-y-6 no-print" />
                
                <div className={`flex justify-between items-start border-b-4 border-black pb-4 relative z-10 ${orientation === 'portrait' ? 'flex-col gap-4' : ''}`}>
                  <div className="flex-1">
                    <h2 className={`${orientation === 'portrait' ? 'text-2xl' : 'text-3xl'} font-black uppercase leading-none tracking-tighter mb-1 break-words`}>{productName}</h2>
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-blue-700" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">SHIP TO: {customer}</span>
                    </div>
                  </div>
                  <div className="bg-white p-1.5 border-2 border-black flex-shrink-0">
                    <QRCodeSVG value={`https://lukz-erp.com/trace/${batchNo}`} size={75} level="H" />
                  </div>
                </div>

                {/* Horizontal Hazard Icons */}
                <div className="flex flex-1 items-center justify-center gap-6 py-4 flex-row flex-wrap">
                  {hazards.flammable && <div className="border-[3px] border-red-600 p-1.5 rotate-45 bg-white"><Flame size={28} className="text-red-600 -rotate-45" /></div>}
                  {hazards.toxic && <div className="border-[3px] border-red-600 p-1.5 rotate-45 bg-white"><Skull size={28} className="text-red-600 -rotate-45" /></div>}
                  {hazards.corrosive && <div className="border-[3px] border-red-600 p-1.5 rotate-45 bg-white"><Biohazard size={28} className="text-red-600 -rotate-45" /></div>}
                </div>

                <div className="flex justify-between items-end bg-slate-50 -mx-8 -mb-8 p-6 border-t-4 border-black">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500">
                      <Calendar size={12} /> DATE: {mounted ? currentDate : ''}
                    </div>
                    <div className="text-xl font-mono font-black tracking-tighter leading-none">
                      LOT: {batchNo}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">SECURE LOGISTICS</p>
                    <p className="text-xs font-black text-blue-800 italic uppercase">LUKZ-ERP</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
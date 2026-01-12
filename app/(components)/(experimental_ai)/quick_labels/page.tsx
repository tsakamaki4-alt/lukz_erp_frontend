'use client';

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tag, Printer, Download, Calendar, Flame, Skull, Biohazard, Truck, Settings2, Smartphone, Monitor } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

export default function LabelGenerator() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [productName, setProductName] = useState('Organic Base Solvent');
  const [batchNo, setBatchNo] = useState('B-2026-001');
  const [customer, setCustomer] = useState('Global Logistics Corp');
  const [isDownloading, setIsDownloading] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  
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
            transform: scale(1) !important; /* Reset scale for print */
          }
          @page {
            size: ${orientation === 'landscape' ? '6in 4in' : '4in 6in'};
            margin: 0;
          }
        }
      `}</style>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar 
          title="Label Engine" 
          Icon={Tag} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 space-y-6 no-print">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Settings2 size={16} className="text-blue-600" /> Parameters
                  </h3>
                  <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">V2.0 STABLE</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Specification</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifier (Lot)</label>
                      <input type="text" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consignee</label>
                      <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-widest">Output Dimensions</label>
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                      <button onClick={() => setOrientation('landscape')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${orientation === 'landscape' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                        <Monitor size={14} /> 6x4 (L)
                      </button>
                      <button onClick={() => setOrientation('portrait')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${orientation === 'portrait' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                        <Smartphone size={14} /> 4x6 (P)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Hazard Classification</label>
                  <div className="flex gap-3">
                    <button onClick={() => setHazards(h => ({...h, flammable: !h.flammable}))} className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${hazards.flammable ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-slate-100 text-slate-300'}`}>
                      <Flame size={20} />
                      <span className="text-[8px] font-bold uppercase">Flammable</span>
                    </button>
                    <button onClick={() => setHazards(h => ({...h, toxic: !h.toxic}))} className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${hazards.toxic ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-slate-100 text-slate-300'}`}>
                      <Skull size={20} />
                      <span className="text-[8px] font-bold uppercase">Toxic</span>
                    </button>
                    <button onClick={() => setHazards(h => ({...h, corrosive: !h.corrosive}))} className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${hazards.corrosive ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-300'}`}>
                      <Biohazard size={20} />
                      <span className="text-[8px] font-bold uppercase">Corrosive</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                  <Printer size={18} /> Deploy to Print
                </button>
                <button onClick={downloadLabel} className="sm:w-20 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center py-4">
                  {isDownloading ? <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Download size={18} />}
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Preview Wrapper */}
            <div className="lg:col-span-7 flex flex-col items-center justify-start min-h-[400px] bg-slate-200/50 rounded-[2.5rem] p-4 md:p-12 border-2 border-dashed border-slate-300">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Production_Preview_Manifest</span>
              
              {/* Responsive Scaling Container */}
              <div className="relative w-full flex justify-center items-center overflow-visible">
                <div 
                  ref={labelRef} 
                  className={`printable-label bg-white border-[6px] border-black p-6 md:p-8 shadow-2xl flex flex-col justify-between relative text-black transition-all origin-center sm:origin-top
                    ${orientation === 'landscape' 
                      ? 'w-[480px] h-[320px] scale-[0.65] xs:scale-[0.75] sm:scale-100' 
                      : 'w-[320px] h-[480px] scale-[0.75] xs:scale-[0.85] sm:scale-100'
                    }`}
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-black rotate-45 translate-x-6 -translate-y-6" />
                  
                  <div className={`flex justify-between items-start border-b-4 border-black pb-4 relative z-10 ${orientation === 'portrait' ? 'flex-col gap-4' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <h2 className={`${orientation === 'portrait' ? 'text-2xl' : 'text-3xl'} font-black uppercase leading-none tracking-tighter mb-2 break-words`}>{productName}</h2>
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-blue-700 flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 truncate">SHIP TO: {customer}</span>
                      </div>
                    </div>
                    <div className="bg-white p-1.5 border-2 border-black flex-shrink-0">
                      <QRCodeSVG value={`https://lukz-erp.com/trace/${batchNo}`} size={orientation === 'landscape' ? 65 : 80} level="H" />
                    </div>
                  </div>

                  {/* Hazard Grid */}
                  <div className="flex flex-1 items-center justify-center gap-6 py-4 flex-row flex-wrap">
                    {hazards.flammable && <div className="border-[3px] border-red-600 p-2 rotate-45 bg-white shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]"><Flame size={24} className="text-red-600 -rotate-45" /></div>}
                    {hazards.toxic && <div className="border-[3px] border-red-600 p-2 rotate-45 bg-white shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]"><Skull size={24} className="text-red-600 -rotate-45" /></div>}
                    {hazards.corrosive && <div className="border-[3px] border-black p-2 rotate-45 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"><Biohazard size={24} className="text-black -rotate-45" /></div>}
                  </div>

                  {/* Footer Section */}
                  <div className="flex justify-between items-end bg-slate-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 border-t-4 border-black">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500 mb-1">
                        <Calendar size={12} /> {mounted ? currentDate : ''}
                      </div>
                      <div className="text-xl font-mono font-black tracking-tighter leading-none">
                        LOT: {batchNo}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">SECURE_CHAIN</p>
                      <p className="text-sm font-black text-blue-800 italic uppercase tracking-tighter">LUKZ_INDUSTRIAL</p>
                    </div>
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
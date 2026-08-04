import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Ship, Check, Info, Shield, Leaf, X, PlusCircle, FileText } from 'lucide-react';
import { INCOTERMS, type IncotermInfo } from '../data/incoterms';

interface CompareProps {
  onReset: () => void;
}

export default function Compare({ onReset }: CompareProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const allCodes = Object.keys(INCOTERMS);

  const toggleSelection = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter(c => c !== code));
    } else if (selectedCodes.length < 4) {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const selectedIncoterms = selectedCodes.map(code => INCOTERMS[code]);

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          Strategic Comparison — Select 2 to 4 Terms
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
          Compare <span className="text-emerald-600">Mechanics</span>
        </h2>
        <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
          Analyze the delicate balance between risk transfer, carbon footprints, and operational control across different Incoterms® 2020 frameworks.
        </p>
      </div>

      {/* Selection Grid */}
      <div className="flex flex-wrap gap-3">
        {allCodes.map(code => {
          const isSelected = selectedCodes.includes(code);
          const isDisabled = !isSelected && selectedCodes.length >= 4;
          return (
            <button
              key={code}
              onClick={() => toggleSelection(code)}
              disabled={isDisabled}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 border-2 ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                  : isDisabled
                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                  : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              {code}
            </button>
          );
        })}
      </div>

      {/* Comparison Area */}
      <AnimatePresence mode="wait">
        {selectedCodes.length >= 2 ? (
          <motion.div
            key="comparison-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-x-auto pb-6 custom-scrollbar"
          >
            <div className={`grid gap-6 min-w-[800px]`} style={{ gridTemplateColumns: `repeat(${selectedCodes.length}, minmax(0, 1fr))` }}>
              {selectedIncoterms.map((info) => (
                <div key={info.code} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-colors group-hover:bg-blue-50" />
                  
                  {/* Header */}
                  <div className="relative z-10 space-y-2">
                    <div className="text-4xl font-black text-slate-900">{info.code}</div>
                    <div className="text-xs font-black uppercase text-blue-600 tracking-wider h-10">{info.name}</div>
                  </div>

                  {/* Sustainability Section */}
                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sustainability Index</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600">Score</span>
                        <span className="text-emerald-600">{info.carbonScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${info.carbonScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Risk Section */}
                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Profile</div>
                    <div className="flex items-center gap-3">
                      <Shield size={16} className={info.riskScore > 60 ? "text-red-500" : "text-blue-500"} />
                      <span className="text-sm font-bold text-slate-700">{info.riskScore}% Intensity</span>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div className="space-y-6 flex-1">
                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Responsibilities</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <RespItem label="Export" value={info.responsibilities.export} />
                        <RespItem label="Freight" value={info.responsibilities.mainTransport} />
                        <RespItem label="Insurance" value={info.responsibilities.insurance === 'Optional' ? 'Opt.' : info.responsibilities.insurance} />
                        <RespItem label="Import" value={info.responsibilities.import} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transfer Point</div>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                        {info.transferPoint}
                      </p>
                    </div>

                    {/* All Analysis Sections Added Here */}
                    <div className="space-y-8 pt-6 border-t border-slate-50">
                      {/* Sustainability Breakdown */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emissions Analysis</div>
                        <div className="space-y-3">
                          {info.scope3Allocation?.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                <span>{item.label}</span>
                                <span>{item.percentage}%</span>
                              </div>
                              <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategic Insights */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Tips</div>
                        <div className="space-y-2">
                          {info.insights?.map((insight, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border flex gap-3 ${
                              insight.type === 'tip' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                              insight.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                              insight.type === 'danger' ? 'bg-red-50 border-red-100 text-red-900' :
                              'bg-blue-50 border-blue-100 text-blue-900'
                            }`}>
                              <p className="text-[10px] font-bold leading-normal">{insight.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Primary Responsibilities */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Responsibilities</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Export</div>
                             <div className="text-[10px] font-black text-slate-700">{info.responsibilities.export}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Freight</div>
                             <div className="text-[10px] font-black text-slate-700">{info.responsibilities.mainTransport}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Insurance</div>
                             <div className="text-[10px] font-black text-slate-700">{info.responsibilities.insurance}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Import</div>
                             <div className="text-[10px] font-black text-slate-700">{info.responsibilities.import}</div>
                          </div>
                        </div>
                      </div>

                      {/* Required Docs - More structured */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Documentation Basis</div>
                        <div className="grid gap-2">
                          {info.requiredDocuments?.map((doc, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl group relative overflow-hidden">
                              <div className="absolute left-0 top-0 w-1 h-full bg-blue-500/20" />
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-700">{doc}</span>
                                <FileText size={10} className="text-slate-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium italic">
                          Compliance: Incoterms® 2020 & UCP 600 standards.
                        </div>
                      </div>

                      {/* Expert Conclusion */}
                      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="text-[9px] font-black uppercase text-blue-600 mb-2 opacity-60 italic">Expert Conclusion</div>
                        <p className="text-[11px] text-slate-800 font-medium italic leading-relaxed">
                          "{info.advice}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transport Mode */}
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      {info.mode.includes('Sea') ? <Ship size={14} /> : <Truck size={14} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{info.mode}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="py-32 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <PlusCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-400 tracking-tight">Select Incoterms to Compare</h3>
              <p className="text-slate-400 font-medium">Choose at least two terms from the list above to see their detailed <span className="text-emerald-600 font-semibold">mechanics</span> side-by-side.</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6 mt-16 pt-8 border-t border-slate-100">
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all bg-white px-8 py-4 rounded-2xl border border-slate-100 hover:border-slate-300"
        >
          <X size={14} />
          Clear & Exit
        </button>
      </div>
    </div>
  );
}

function RespItem({ label, value }: { label: string, value: string }) {
  const isSeller = value === 'Seller';
  return (
    <div className="space-y-1">
      <div className="text-[8px] font-black uppercase text-slate-400">{label}</div>
      <div className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${
        isSeller ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}>
        {value}
      </div>
    </div>
  );
}

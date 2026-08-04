import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Globe, ShieldCheck, Leaf, FileText, Ship, Truck, Package, Clock } from 'lucide-react';

interface HomeProps {
  onStartWizard: () => void;
  onStartCompare: () => void;
  onStartContract: () => void;
}

export default function Home({ onStartWizard, onStartCompare, onStartContract }: HomeProps) {
  const [hoveredNode, setHoveredNode] = React.useState<'none' | 'banking' | 'incoterms' | 'sustainability' | 'central'>('none');

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900 py-20 px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=1920" 
            alt="Cargo Ship at Sea"
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-2 items-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck size={14} />
                Built on International Trade Standards
              </div>
              <div className="text-xs text-slate-400 font-semibold tracking-wide pl-1">
                Incoterms® 2020 • UCP 600 • ISBP 821 • CSRD Scope 3
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95]">
              Smart Trade Compliance &<br />
              <span className="text-emerald-500">Risk Management</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed font-semibold">
              decision-support platform helping SMEs navigate international trade regulations, Letter of Credit documentation, Incoterms® 2020, sustainability requirements, and trade compliance through practical guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button 
                onClick={onStartWizard}
                className="group px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Start Assessment
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </button>
              <button 
                onClick={onStartCompare}
                className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-lg transition-all backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Compare Incoterms®
              </button>
              <button 
                onClick={onStartContract}
                className="px-8 py-5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 rounded-2xl font-black text-lg transition-all border border-emerald-500/30 hover:border-emerald-500/60 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={18} />
                Review Contract
              </button>
            </div>
          </motion.div>          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block relative w-full h-[480px]"
          >
             {/* Keyframe animation stylesheet */}
             <style>{`
               @keyframes flowLeft {
                 from { stroke-dashoffset: 0; }
                 to { stroke-dashoffset: 40; }
               }
               @keyframes flowRight {
                 from { stroke-dashoffset: 0; }
                 to { stroke-dashoffset: -40; }
               }
               .animate-flow-left {
                 animation: flowLeft 1.5s linear infinite;
               }
               .animate-flow-right {
                 animation: flowRight 1.5s linear infinite;
               }
             `}</style>

             <div className="bg-slate-950/65 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-2xl relative w-full h-full overflow-hidden flex flex-col justify-between">
                {/* SVG Connecting Lines Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="incoterms-grad" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="banking-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="sustain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                    </linearGradient>
                    <radialGradient id="glow-center" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Central Glow */}
                  <circle cx="250" cy="235" r="110" fill="url(#glow-center)" />

                  {/* Connection Line 1: Center to Incoterms Analysis (Top-Center) */}
                  <path 
                    d="M 250 235 L 250 115" 
                    stroke={hoveredNode === 'incoterms' ? '#34d399' : '#334155'} 
                    strokeWidth={hoveredNode === 'incoterms' ? '4' : '2'} 
                    className="transition-all duration-300"
                  />
                  <path 
                    d="M 250 235 L 250 115" 
                    stroke="url(#incoterms-grad)" 
                    strokeWidth="3" 
                    strokeDasharray="8 12" 
                    className="animate-flow-right opacity-80"
                  />

                  {/* Connection Line 2: Center to Banking Docs (Bottom-Left) */}
                  <path 
                    d="M 250 235 L 114 340" 
                    stroke={hoveredNode === 'banking' ? '#60a5fa' : '#334155'} 
                    strokeWidth={hoveredNode === 'banking' ? '4' : '2'} 
                    className="transition-all duration-300"
                  />
                  <path 
                    d="M 250 235 L 114 340" 
                    stroke="url(#banking-grad)" 
                    strokeWidth="3" 
                    strokeDasharray="8 12" 
                    className="animate-flow-left opacity-80"
                  />

                  {/* Connection Line 3: Center to Sustainability (Bottom-Right) */}
                  <path 
                    d="M 250 235 L 386 340" 
                    stroke={hoveredNode === 'sustainability' ? '#a5b4fc' : '#334155'} 
                    strokeWidth={hoveredNode === 'sustainability' ? '4' : '2'} 
                    className="transition-all duration-300"
                  />
                  <path 
                    d="M 250 235 L 386 340" 
                    stroke="url(#sustain-grad)" 
                    strokeWidth="3" 
                    strokeDasharray="8 12" 
                    className="animate-flow-right opacity-80"
                  />
                </svg>

                {/* Nodes layout absolute positions */}
                
                {/* 1. Trade Rules Node (Top-Center) */}
                <div 
                  style={{ left: '50%', top: '6%' }}
                  className={`absolute -translate-x-1/2 w-[250px] z-20 cursor-pointer transition-all duration-300 p-4 rounded-2xl border text-center ${
                    hoveredNode === 'incoterms' 
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' 
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                  onMouseEnter={() => setHoveredNode('incoterms')}
                  onMouseLeave={() => setHoveredNode('none')}
                >
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">📊</span>
                    <h4 className="text-white font-black text-xs">Trade Rules</h4>
                  </div>
                  <p className="text-slate-200 text-xs font-bold mb-1">
                    Incoterms® Analysis
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5">
                    <span className="text-[9px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">Responsibilities</span>
                    <span className="text-[9px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">Risk Transfer</span>
                    <span className="text-[9px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">Cost Allocation</span>
                  </div>
                </div>

                {/* 2. Central Node: Smart Trade Decision */}
                <div 
                  style={{ left: '50%', top: '53%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${
                    hoveredNode === 'central' ? 'scale-110' : ''
                  }`}
                  onMouseEnter={() => setHoveredNode('central')}
                  onMouseLeave={() => setHoveredNode('none')}
                >
                  {/* Glowing Aura Rings */}
                  <div className="absolute inset-0 -m-6 rounded-full border border-emerald-500/10 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                  <div className="absolute inset-0 -m-3 rounded-full border border-emerald-500/20 animate-pulse pointer-events-none" />
                  
                  {/* Central Button / Ring */}
                  <div className="w-36 h-36 rounded-full bg-slate-900 border-2 border-emerald-500 flex flex-col items-center justify-center text-center p-3 shadow-[0_0_35px_rgba(16,185,129,0.3)] transition-all">
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest leading-none mb-1">SMART TRADE</span>
                    <span className="text-white font-black text-xs tracking-wider leading-none uppercase mb-2">DECISION</span>
                    <div className="flex flex-col text-[9px] text-slate-300 font-bold leading-tight uppercase tracking-wider">
                      <span>Compliance</span>
                      <span>Risk</span>
                      <span className="text-emerald-400">Sustainability</span>
                    </div>
                  </div>
                </div>

                {/* 3. Documentary Compliance Node (Bottom-Left) */}
                <div 
                  style={{ left: '4%', bottom: '8%' }}
                  className={`absolute w-[220px] z-20 cursor-pointer transition-all duration-300 p-4 rounded-2xl border text-left ${
                    hoveredNode === 'banking' 
                      ? 'bg-blue-950/60 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' 
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                  onMouseEnter={() => setHoveredNode('banking')}
                  onMouseLeave={() => setHoveredNode('none')}
                >
                  <div className="flex items-center justify-start gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">📜</span>
                    <h4 className="text-white font-black text-xs">Documentary Compliance</h4>
                  </div>
                  <p className="text-slate-200 text-xs font-bold mb-1">
                    LC Documents
                  </p>
                  <div className="flex flex-wrap items-center justify-start gap-1 mt-1.5">
                    <span className="text-[9px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-500/30 font-bold">Discrepancy Check</span>
                    <span className="text-[9px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-500/30 font-bold">UCP 600</span>
                    <span className="text-[9px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-500/30 font-bold">ISBP</span>
                  </div>
                </div>

                {/* 4. Sustainability Node (Bottom-Right) */}
                <div 
                  style={{ right: '4%', bottom: '8%' }}
                  className={`absolute w-[220px] z-20 cursor-pointer transition-all duration-300 p-4 rounded-2xl border text-left ${
                    hoveredNode === 'sustainability' 
                      ? 'bg-indigo-950/60 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' 
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                  onMouseEnter={() => setHoveredNode('sustainability')}
                  onMouseLeave={() => setHoveredNode('none')}
                >
                  <div className="flex items-center justify-start gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">🌱</span>
                    <h4 className="text-white font-black text-xs">Sustainability</h4>
                  </div>
                  <p className="text-slate-200 text-xs font-bold mb-1">
                    Scope 3
                  </p>
                  <div className="flex flex-wrap items-center justify-start gap-1 mt-1.5">
                    <span className="text-[9px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30 font-bold">CSRD</span>
                    <span className="text-[9px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30 font-bold">Logistics Data</span>
                  </div>
                </div>
             </div>

             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px]" />
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px]" />
          </motion.div>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem label="Active Users" value="12,000+" />
          <StatItem label="Ports Covered" value="450+" />
          <StatItem label="Compliance Accuracy" value="99.9%" />
          <StatItem label="CO2 Reduced" value="4.2M Tons" />
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6 max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight flex flex-col">
              Beyond Static Charts.
              <span className="text-emerald-600">Dynamic Intelligence.</span>
            </h2>
            <p className="text-slate-600 text-xl font-medium leading-relaxed">
              Why settle for an old-fashioned PDF? TradeTrust provides real-time risk assessment and sustainability data for the modern supply chain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-20 items-center">
             <div className="space-y-12">
                <FeatureBlock 
                  icon={<ShieldCheck className="text-emerald-600" size={32} />}
                  title="Risk-First Compliance"
                  description="We don't just tell you the term. We show you exactly where your liability starts and ends with visual risk mapping."
                />
                <FeatureBlock 
                  icon={<Leaf className="text-emerald-600" size={32} />}
                  title="Sustainability Scoring"
                  description="Choose Incoterms that empower you to select green carriers and reduce first-mile emissions."
                />
                <FeatureBlock 
                  icon={<FileText className="text-emerald-600" size={32} />}
                  title="Digital Documentation"
                  description="Every recommendation comes with a full checklist of required commercial and transport documents."
                />
             </div>
             <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200"
                  alt="Modern Logistics Hub"
                  className="rounded-[3rem] shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl space-y-4 max-w-[280px]">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <Clock size={20} />
                      </div>
                      <span className="font-bold text-slate-900">Real-time Analysis</span>
                   </div>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Takes less than 45 seconds to find the perfect term for your specific trade scenario.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <Ship size={400} className="absolute -top-40 -left-40" />
              <Package size={300} className="absolute -bottom-20 -right-20" />
           </div>
           
           <h3 className="text-4xl md:text-7xl font-black text-white tracking-widest uppercase">
              Ready to <span className="text-emerald-500">Scale?</span>
           </h3>
           <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Join thousands of SMEs and global exporters who rely on TradeTrust for their international logistics strategy.
           </p>
           <button 
             onClick={onStartWizard}
             className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-2xl transition-all shadow-2xl shadow-emerald-900 shadow-offset-y-10 hover:scale-105 active:scale-95 relative z-10"
           >
              Get Started Now
           </button>
        </div>
      </section>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{value}</div>
      <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">{label}</div>
    </div>
  );
}

function FeatureBlock({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
        {icon}
      </div>
      <div className="space-y-2">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

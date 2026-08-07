import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Ship, ArrowRight, ShieldCheck, HelpCircle, Globe, FileText, Leaf, Columns } from 'lucide-react';
import { DECISION_TREE } from './data/incoterms';
import ResultDisplay from './components/ResultDisplay';
import Home from './components/Home';
import Compare from './components/Compare';
import ContractCompliance from './components/ContractCompliance';

export default function App() {
  const [view, setView] = useState<'home' | 'wizard' | 'compare' | 'contract'>('home');
  const [currentStepId, setCurrentStepId] = useState<string>('START_ROLE');
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const currentStep = DECISION_TREE[currentStepId];

  const handleOptionSelect = (option: typeof DECISION_TREE[string]['options'][number]) => {
    if (option.result) {
      setResult(option.result);
    } else if (option.nextStep) {
      setHistory([...history, currentStepId]);
      setCurrentStepId(option.nextStep);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevStepId = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentStepId(prevStepId);
      setResult(null);
    } else {
      setView('home');
    }
  };

  const reset = () => {
    setCurrentStepId('START_ROLE');
    setHistory([]);
    setResult(null);
  };

  const startWizard = () => {
    reset();
    setView('wizard');
  };

  const startCompare = () => {
    reset();
    setView('compare');
  };

  const startContract = () => {
    reset();
    setView('contract');
  };

  const goHome = () => {
    setView('home');
    reset();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]/95 text-slate-900 font-sans selection:bg-emerald-100">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={goHome}>
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white transform group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-200">
              <Globe size={24} fill="currentColor" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Trade<span className="text-emerald-600">Trust</span></span>
              <span className="text-[10px] font-bold text-slate-500 tracking-normal capitalize mt-0.5">Trade with Confidence</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <button onClick={goHome} className="hover:text-emerald-600 transition-colors">Intelligence</button>
            <button onClick={startCompare} className={`hover:text-emerald-600 transition-colors ${view === 'compare' ? 'text-emerald-600' : ''}`}>Compare</button>
            <button onClick={startWizard} className={`hover:text-emerald-600 transition-colors ${view === 'wizard' ? 'text-emerald-600' : ''}`}>Analyzer</button>
            <button onClick={startContract} className={`hover:text-emerald-600 transition-colors ${view === 'contract' ? 'text-emerald-600' : ''}`}>Review Contract</button>
            <a href="#standards" onClick={(e) => {
              if (view !== 'home') {
                e.preventDefault();
                goHome();
                setTimeout(() => {
                  document.getElementById('standards')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }} className="hover:text-emerald-600 transition-colors">Standards</a>
            <button 
              onClick={startWizard}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
            >
              Start Trial
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Home onStartWizard={startWizard} onStartCompare={startCompare} onStartContract={startContract} />
            </motion.div>
          ) : view === 'compare' ? (
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 min-h-[70vh]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Compare onReset={goHome} />
              </motion.div>
            </div>
          ) : view === 'contract' ? (
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 min-h-[70vh]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ContractCompliance />
              </motion.div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 min-h-[70vh]">
              <AnimatePresence mode="wait">
                {result ? (
                  <ResultDisplay code={result} onReset={reset} />
                ) : (
                  <motion.div
                    key={currentStepId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-12">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 rounded-full flex-1 transition-all duration-700 ease-in-out ${
                            i <= history.length ? 'bg-emerald-600 w-full shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-200'
                          }`} 
                        />
                      ))}
                    </div>

                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        Operational Wizard — Analysis {history.length + 1}
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
                        {currentStep?.question ? (
                          currentStep.question.split(/(role)/i).map((part, index) =>
                            part.toLowerCase() === 'role' ? (
                              <span key={index} className="text-emerald-600">
                                {part}
                              </span>
                            ) : (
                              part
                            )
                          )
                        ) : null}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                      {currentStep?.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(option)}
                          className="group relative p-12 bg-white border-2 border-slate-100 rounded-[3rem] text-left hover:border-emerald-500 hover:shadow-4xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden"
                          id={`option-${idx}`}
                        >
                          <div className="flex justify-between items-center relative z-10">
                            <span className="text-3xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors tracking-tight">
                              {option.label}
                            </span>
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                              <ArrowRight size={32} />
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-emerald-50 transition-colors" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 mt-16 pt-8 border-t border-slate-100">
                      <button
                        onClick={handleBack}
                        className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all bg-white px-8 py-4 rounded-2xl border border-slate-100 hover:border-slate-300"
                        id="back-btn"
                      >
                        <ArrowRight size={14} className="rotate-180" />
                        Previous Step
                      </button>
                      <button
                        onClick={goHome}
                        className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Exit Wizard
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full bg-slate-950 py-24 px-6 mt-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-900/50">
                  <Globe size={24} fill="currentColor" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-black tracking-tighter text-white uppercase">Trade<span className="text-emerald-600">Trust</span></span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-normal capitalize mt-0.5">Trade with Confidence</span>
                </div>
              </div>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed text-lg">
                The global benchmark for digital Incoterms® intelligence. Built for modern supply chains.
              </p>
            </div>
            <div className="space-y-6">
              <h5 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-30">Products</h5>
              <div className="flex flex-col gap-4 text-slate-500 font-bold text-sm">
                <a href="#" className="hover:text-emerald-400 transition-colors">Risk Engine</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">CO2 Tracker</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Legal Vault</a>
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-30">Support</h5>
              <div className="flex flex-col gap-4 text-slate-500 font-bold text-sm">
                <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">API Status</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
              © 2026 TradeTrust. All rights reserved. Developed by Sadaf Shivaei
            </p>
            <div className="flex gap-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, titleColor }: { icon: React.ReactNode, title: string, description: string, titleColor?: string }) {
  return (
    <div className="p-12 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-8 hover:shadow-4xl transition-all hover:-translate-y-2">
      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-2 shadow-inner">
        {icon}
      </div>
      <div className="space-y-4">
        <h4 className={`text-3xl font-black tracking-tight ${titleColor || 'text-slate-900'}`}>{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  );
}

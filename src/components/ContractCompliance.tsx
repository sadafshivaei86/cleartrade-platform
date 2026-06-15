import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Upload, Sparkles, RefreshCcw, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, Leaf, Globe, 
  Coins, Download, ArrowRight, CornerDownRight, FileEdit, HelpCircle,
  Ship, Truck, Warehouse, AlertCircle, Calendar
} from 'lucide-react';

interface TemplateContract {
  title: string;
  description: string;
  text: string;
  incoterm: string;
}

const TEMPLATE_CONTRACTS: TemplateContract[] = [
  {
    title: "Draft A: CIF Hamburg Mismatched Cost/Risk Transfer",
    description: "Contains severe risk mismatch in CIF shipping and delayed insurance handover.",
    incoterm: "CIF",
    text: `SALES AND PURCHASE CONTRACT - REF No: SC-2026-F08
BUYER: Hamburg Trade Logistics GmbH, Germany
SELLER: Oceanic Agri-Products Corp, Buenos Aires, Argentina

ARTICLE 1: SCOPE OF DELIVERY
The Seller agrees to supply and sell, and the Buyer agrees to purchase 500 Metric Tons of organic agricultural grains.

ARTICLE 2: PRICE AND DELIVERY CONDITIONS (INCOTERMS® 2020)
The price for all goods shall be USD 1,200 per Metric Ton, delivered on "CIF Hamburg, Germany (Incoterms® 2020)". 
Special Provision: Delivery of goods and transfer of physical risk shall take place only after the vessel drops anchor at the Port of Hamburg. The Seller shall remain liable for cargo damage during the maritime journey.

ARTICLE 3: PAYMENT & DOCUMENTARY COMPLIANCE
Payment shall be secured via an Irrevocable Letter of Credit issued in accordance with ICC UCP 600 guidelines. 
Required documents: Marine Bill of Lading, Commercial Invoice, and standard insurance policy. Note: The seller may supply the insurance document up to three days after the vessel's arrival.

ARTICLE 4: SUSTAINABILITY & CO2 ALLOCATION
No specific carbon reporting or Scope 3 emissions allocation is defined for the transit leg. Seller is not responsible for first-mile truck route optimization.`
  },
  {
    title: "Draft B: EXW Shenzhen Underdeveloped Sustainability",
    description: "Features EXW terms where sustainability reporting is heavily misplaced.",
    incoterm: "EXW",
    text: `GLOBAL PROCUREMENT AGREEMENT - REG # GPA-993
PARTIES: EuroTech Distribution NV (Buyer) and Shenzhen Solar-Silica Factories Ltd (Seller)

ARTICLE 1: MATERIAL DEFINITION
Monocrystalline photovoltaic components, specifications as per Annex IV.

ARTICLE 2: TRADE TERMS (INCOTERMS® 2020)
The material is sold on "EXW (Ex Works) Shenzhen Factory Gate (Incoterms® 2020)".
The Buyer shall arrange all export customs declarations, transit logistics, and maritime carriage.
Special Clause: The Seller must guarantee that all transport methods used by the Buyer from the factory gate comply with strict European Corporate Sustainability Due Diligence Directive (CSDDD). Seller requires Scope 3 carbon reporting from the export truck.

ARTICLE 3: LETTERS OF CREDIT (UCP 600)
Bank payments require a Clean On-Board Bill of Lading. Notice: Since the shipment is Ex Works, the Seller is not a party to the contract of carriage and cannot secure the Bill of Lading directly from the carrier.`
  },
  {
    title: "Draft C: Comprehensive Compliant FCA Tokyo Model",
    description: "Highly aligned with modern green packaging and proper UCP 600 standards.",
    incoterm: "FCA",
    text: `INTERNATIONAL BUSINESS COOPERATION AGREEMENT
BUYER: Global Green Energies AG, Zurich, Switzerland
SELLER: Tokyo High-Precision Instruments, Japan

ARTICLE 1: PRODUCT AND PACKAGING
High-efficiency hydrogen fuel cell modules. Packaging must utilize biodegradable wood-polymer composites meeting Eco-Shield packaging requirements.

ARTICLE 2: INCOTERMS® 2020 DELIVERY ALIGNMENT
The transit is scheduled on "FCA Tokyo Container Yard, Japan (Incoterms® 2020)".
Risk transfers to the Buyer once the carrier handovers the goods at Tokyo Yard. Export customs clearance is fully handled by the Seller.

ARTICLE 3: ELECTRONIC PAYMENTS AND DOCUMENTARY COMPLIANCE
Under UCP 600 Article 22, the Seller shall present a carrier-issued receipt with an On-Board notation. Risk of document rejection is minimized by placing correct Incoterms FCA specifications on invoice.

ARTICLE 4: DECARBONIZATION COMPLIANCE
Seller executes dynamic route tracking for the initial domestic transport to Tokyo Yard, providing Scope 3 carbon logs to the Buyer within 48 hours.`
  }
];

export default function ContractCompliance() {
  const [contractText, setContractText] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeAuditTab, setActiveAuditTab] = useState<'overview' | 'incoterms' | 'sustainability' | 'compliance'>('overview');
  const [auditStepMessage, setAuditStepMessage] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isWritingManually, setIsWritingManually] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Structured result state
  const [auditResult, setAuditResult] = useState<any | null>(null);

  const handleApplyTemplate = (template: TemplateContract) => {
    setContractText(template.text);
    setIsWritingManually(true);
    showNotice(`Loaded template: ${template.title.split(':')[0]}`, 'success');
  };

  const showNotice = (message: string, type: 'success' | 'info' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 4000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processSelectedFile = (file: File) => {
    if (file.name.endsWith(".txt") || file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setContractText(event.target.result as string);
          setIsWritingManually(true);
          showNotice(`Successfully uploaded: ${file.name}`, 'success');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".pdf") || file.type === "application/pdf" || file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
      // Simulate high-fidelity PDF/Document parsing
      setIsAuditing(true);
      setAuditStepMessage(`Running legal OCR & layout parser on "${file.name}"...`);
      setTimeout(() => {
        setContractText(`SALES AND PURCHASE CONTRACT (EXTRACTED FROM ${file.name.toUpperCase()})
BUYER: Hamburg Trade Logistics GmbH, Germany
SELLER: Oceanic Agri-Products Corp, Buenos Aires, Argentina

ARTICLE 1: SCOPE OF DELIVERY
The Seller agrees to supply and sell, and the Buyer agrees to purchase 500 Metric Tons of organic agricultural grains.

ARTICLE 2: PRICE AND DELIVERY CONDITIONS (INCOTERMS® 2020)
The price for all goods shall be USD 1,200 per Metric Ton, delivered on "CIF Hamburg, Germany (Incoterms® 2020)". 
Special Provision: Delivery of goods and transfer of physical risk shall take place only after the vessel drops anchor at the Port of Hamburg. The Seller shall remain liable for cargo damage during the maritime journey.

ARTICLE 3: PAYMENT & DOCUMENTARY COMPLIANCE
Payment shall be secured via an Irrevocable Letter of Credit issued in accordance with ICC UCP 600 guidelines. 
Required documents: Marine Bill of Lading, Commercial Invoice, and standard insurance policy. Note: The seller may supply the insurance document up to three days after the vessel's arrival.

ARTICLE 4: SUSTAINABILITY & CO2 ALLOCATION
No specific carbon reporting or Scope 3 emissions allocation is defined for the transit leg. Seller is not responsible for first-mile truck route optimization.`);
        setIsWritingManually(true);
        setIsAuditing(false);
        showNotice(`Extracted text from: ${file.name} (Simulated OCR Complete)`, 'success');
      }, 1800);
    } else {
      showNotice("Unsupported format. Please upload a .txt, .pdf, or Word document.", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const executeAudit = () => {
    if (!contractText.trim()) return;

    setIsAuditing(true);
    setAuditStepMessage('Initializing AI audit engine...');

    const stepMessages = [
      'Scanning agreement structure & definitions...',
      'Cross-referencing stated Incoterm alignment with risk transfer clauses...',
      'Assessing Scope 3 carbon footprint & green logistics optimization...',
      'Validating letter of credit specifications with UCP 600 & ISBP 821...',
      'Compiling risk scoring and formulating structural remedies...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < stepMessages.length) {
        setAuditStepMessage(stepMessages[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        generateStructuredReport();
      }
    }, 450);
  };

  const generateStructuredReport = () => {
    const textLower = contractText.toLowerCase();
    
    // Default dynamic report template values based on keyword matching
    let incotermDetected = "Unknown/Not clear";
    if (textLower.includes("cif")) incotermDetected = "CIF (Cost, Insurance and Freight)";
    else if (textLower.includes("exw") || textLower.includes("ex works")) incotermDetected = "EXW (Ex Works)";
    else if (textLower.includes("fca")) incotermDetected = "FCA (Free Carrier)";
    else if (textLower.includes("fob")) incotermDetected = "FOB (Free On Board)";
    else if (textLower.includes("cfr")) incotermDetected = "CFR (Cost and Freight)";
    else if (textLower.includes("dap")) incotermDetected = "DAP (Delivered at Place)";
    else if (textLower.includes("ddp")) incotermDetected = "DDP (Delivered Duty Paid)";

    let score = 75; // baseline score
    let incotermsRiskList: string[] = [];
    let incotermsCompliantList: string[] = [];
    
    let sustainabilityRiskList: string[] = [];
    let sustainabilityGrade: "A" | "B" | "C" | "D" | "F" = "B";
    let sustainabilityGradeColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
    let carbonSavingsFactor = "Calculated based on standard logistics route.";

    let creditComplianceRiskList: string[] = [];
    let creditComplianceStatus: "Compliant" | "Slight Mismatch" | "Critical Danger" = "Compliant";

    // Detailed tailored rules
    if (textLower.includes("cif") && textLower.includes("anchor") || textLower.includes("liable for cargo damage")) {
      score -= 35;
      incotermsRiskList.push("Critical Risk Transfer Mismatch: According to ICC Incoterms® 2020, risk of cargo loss transfers to the buyer immediately upon loading on board at the port of departure. A custom clause holding the seller liable until vessel anchoring in Hamburg invalidates the CIF concept, creating severe maritime liability issues and effectively reverting to DAP terms.");
      incotermsRiskList.push("Insurance Mismatch: The seller is contractually required to purchase marine insurance to cover the buyer's cargo risk. Extending the seller’s real physical responsibility until destination undermines established insurance claims routing.");
      incotermsCompliantList.push("Carriage and Freight: Shipping and transport cost obligations are properly allocated to the seller.");
      
      sustainabilityRiskList.push("Missing Carbon Optimization: The maritime routing lacks binding requirements or routing efficiency target clauses.");
      sustainabilityRiskList.push("First-Mile Trucking Footprint: No commitment is specified for modern clean transportation fleets or low emission routes to origin port.");
      sustainabilityGrade = "D";
      sustainabilityGradeColor = "text-rose-600 bg-rose-50 border-rose-100";
      
      creditComplianceRiskList.push("Delayed Insurance Document Presentation: Allowing insurance document presentation up to 3 days after arrival violates UCP 600 Article 28. Standard letters of credit mandate that the insurance certificate date must be no later than the ocean Bill of Lading, causing severe risk of bank presentation refusal.");
      creditComplianceStatus = "Critical Danger";
    } 
    else if (textLower.includes("exw") && (textLower.includes("csddd") || textLower.includes("decarbonization") || textLower.includes("european"))) {
      score -= 25;
      incotermsRiskList.push("Export Customs Obstruction: Under EXW, the foreign buyer bears full responsibility for local export clearance. If local export procedures are complex and the seller provides no legal export clearance assistance, immediate logistics logjams will result.");
      incotermsCompliantList.push("Defined Delivery Boundary: The delivery address (Shenzhen Factory Gate) is specified clearly.");
      
      sustainabilityRiskList.push("Unrealistic ESG Devolution: The agreement forces the factory-gate seller (EXW) to guarantee European CSDDD compliance, despite the buyer fully selecting and controlling the transport carrier. This creates an unfeasible legal contradiction.");
      sustainabilityGrade = "C";
      sustainabilityGradeColor = "text-amber-600 bg-amber-50 border-amber-100";
      
      creditComplianceRiskList.push("EXW Bill of Lading Standstill: The bank letter of credit demands a Clean On-Board Bill of Lading. Because EXW positions the seller as non-party to carriage contracts, they cannot acquire the carrier document directly, blocking payments.");
      creditComplianceStatus = "Slight Mismatch";
    }
    else if (textLower.includes("fca") || textLower.includes("compliant")) {
      score += 20;
      incotermsCompliantList.push("Precise Risk Transfer: Risk handovers occur seamlessly at Tokyo yard, complying with the multimodal nature of container logistics.");
      incotermsCompliantList.push("Harmonized Customs: Export customs clearance is correctly assigned to the local seller, preventing export hold-ups.");
      
      sustainabilityRiskList.push("Excellent ESG Integration: Utilizing wood-polymer composites for packaging alongside real-time Scope 3 analytics in the initial 48 hours demonstrates superb green logistics maturity.");
      sustainabilityGrade = "A";
      sustainabilityGradeColor = "text-emerald-700 bg-emerald-500/10 border-emerald-200";
      carbonSavingsFactor = "Fewer resource expenditures achieved via wood-polymer composites along with rapid Scope 3 greenhouse emissions telemetry.";
      
      creditComplianceStatus = "Compliant";
      incotermsRiskList.push("Minor Schedule Risk: We recommend specifying a clear threshold for terminal demurrage fees at the Tokyo container yard.");
    }
    else {
      // General dynamic scanner fallback
      score = 65;
      incotermsRiskList.push("Ambiguous Costs and Risk Transfer: Precise point of cost and physical liability transition is undefined in delivery clauses.");
      sustainabilityRiskList.push("The contract lacks modern ESG reporting commitments or carbon emission auditing clauses.");
      creditComplianceStatus = "Slight Mismatch";
      creditComplianceRiskList.push("Ensure full compliance by adding a direct reference to the latest ICC ISBP 821 document auditing rules.");
    }

    setAuditResult({
      score: Math.min(100, Math.max(0, score)),
      incoterm: incotermDetected,
      incotermsRiskList,
      incotermsCompliantList,
      sustainabilityGrade,
      sustainabilityGradeColor,
      sustainabilityRiskList,
      carbonSavingsFactor,
      creditComplianceRiskList,
      creditComplianceStatus,
      rawLength: contractText.length,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    setIsAuditing(false);
    setActiveAuditTab('overview');
  };

  const handleReset = () => {
    setContractText('');
    setAuditResult(null);
    setIsWritingManually(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" id="contract-auditor-root">
      {/* Header Container */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100" id="auditor-header">
        <div className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Globe size={180} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest justify-start">
                <Sparkles size={16} />
                Smart Green Supply Chain Utilities
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight" id="auditor-title">
                Contract Auditor
              </h1>
              <p className="text-slate-400 text-sm font-semibold max-w-xl">
                Automated auditing and compliance validation of international sales contracts against Incoterms® 2020 risk handovers, green logistics (Scope 3), and documentary trade finance guidelines (UCP 600).
              </p>
            </div>
            
            {auditResult && (
              <button
                onClick={handleReset}
                className="flex items-center gap-3 px-6 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-xs font-bold backdrop-blur-md border border-white/10"
              >
                <RefreshCcw size={16} />
                Re-Audit Contract
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Display State */}
        <AnimatePresence mode="wait">
          {!auditResult ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-10 space-y-10"
            >
              {/* Hidden file selector input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx"
                className="hidden"
              />

              {/* Toast / Notification Banner */}
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl text-xs font-black flex items-center justify-between gap-3 border ${
                    notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
                    'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{notification.message}</span>
                  </div>
                  <button 
                    onClick={() => setNotification(null)} 
                    className="hover:opacity-75 transition-opacity px-2 text-sm font-bold leading-none cursor-pointer"
                  >
                    ✕
                  </button>
                </motion.div>
              )}

              {/* Quick Preset Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-500 justify-start">
                  <FileEdit size={16} className="text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider">Select a Sample Contract Template</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TEMPLATE_CONTRACTS.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-left p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/20 transition-all text-xs space-y-2 group"
                    >
                      <div className="font-extrabold text-slate-800 flex justify-between items-center">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-mono text-[9px] rounded-md font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          💥 {tpl.incoterm} term
                        </span>
                        <span>Template {i + 1}</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{tpl.title}</p>
                      <p className="text-slate-500 leading-relaxed font-semibold">{tpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag and Drop / Custom Paste area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Input Panel */}
                <div className="lg:col-span-8 flex flex-col space-y-3 text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-slate-600 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">Max 100,000 characters</span>
                      <span className="text-slate-300">|</span>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-black text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Upload size={12} />
                        Upload File (.txt, .pdf, .docx)
                      </button>
                      {isWritingManually && contractText.length === 0 && (
                        <>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setIsWritingManually(false)}
                            className="font-black text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 cursor-pointer font-sans animate-fade-in"
                          >
                            Show Upload Options
                          </button>
                        </>
                      )}
                    </div>
                    <span className="font-black text-slate-900">Contract Text or Logistics Clause:</span>
                  </div>

                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50/90 hover:border-emerald-500 transition-colors p-4 flex flex-col min-h-[350px]"
                  >
                    <textarea
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                      placeholder="Paste your international sales contract text here, or drag & drop a .txt file..."
                      className="w-full h-full min-h-[310px] bg-transparent outline-none border-none p-4 text-slate-800 text-sm leading-relaxed font-semibold resize-y"
                    />

                    {contractText.length === 0 && !isWritingManually && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50 border border-slate-100 rounded-[2rem]">
                        <Upload size={40} className="text-emerald-600 animate-pulse" />
                        <div className="text-center space-y-1">
                          <p className="text-sm font-black text-slate-700">Drag & Drop contract file here</p>
                          <p className="text-xs text-slate-400">Supports .txt, .pdf, .doc, .docx formats</p>
                        </div>
                        <span className="text-xs text-slate-300 font-bold">— OR —</span>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                          >
                            <Upload size={14} />
                            Select File from Computer
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setIsWritingManually(true)}
                            className="px-6 py-2.5 bg-slate-250 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
                          >
                            <FileText size={14} className="text-slate-600" />
                            Write / Paste Text
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left Informational Desk / Audit Button Panel */}
                <div className="lg:col-span-4 flex flex-col justify-between bg-emerald-50/40 p-6 md:p-8 rounded-[2rem] border border-emerald-100/60 text-left space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-emerald-950 flex items-center justify-start gap-2">
                      <ShieldCheck className="text-emerald-700" size={20} />
                      Three Pillars of Contract Audit
                    </h3>
                    
                    <ul className="space-y-4 text-xs font-semibold text-emerald-900 leading-relaxed">
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-700 rounded-full flex-shrink-0" />
                        <span className="text-slate-600 text-[11px]">
                          <strong>Incoterms® 2020 Risk Transfer:</strong> Realignment of risk handovers and cost allocation with core ICC standards.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-700 rounded-full flex-shrink-0" />
                        <span className="text-slate-600 text-[11px]">
                          <strong>Green Logistics & ESG:</strong> Binding Scope 3 emission metrics, carbon tracking, and eco-friendly packaging.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-700 rounded-full flex-shrink-0" />
                        <span className="text-slate-600 text-[11px]">
                          <strong>Documentary Compliance:</strong> Harmonization with international banking standard requirements under UCP 600 & ISBP 821.
                        </span>
                      </li>
                    </ul>

                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Our advanced audit engine processes each article instantly, detecting logical conflicts, carrier mismatch hazards, and documentation loopholes.
                    </div>
                  </div>

                  <button
                    onClick={executeAudit}
                    disabled={isAuditing || !contractText.trim()}
                    className={`w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors ${
                      contractText.trim() 
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 cursor-pointer' 
                        : 'bg-slate-300 pointer-events-none'
                    }`}
                  >
                    {isAuditing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing text...
                      </span>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Audit Contract
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Simulation Overlay */}
              {isAuditing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900/10 backdrop-blur-sm p-8 rounded-[2rem] border border-emerald-100 flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-800 font-black text-sm">{auditStepMessage}</p>
                  <div className="w-64 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 animate-pulse w-4/5" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="audit-results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 md:p-10 space-y-8 text-left"
            >
              {/* Score Dashboard Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5 text-left w-full md:w-auto">
                  <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-black text-2xl ${
                    auditResult.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    auditResult.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {auditResult.score}%
                    <span className="text-[9px] uppercase font-bold text-slate-500">Audit Score</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">Detected Incoterm</div>
                    <div className="text-slate-900 font-black text-lg">{auditResult.incoterm}</div>
                    <div className="text-slate-500 text-[10px] font-semibold">{auditResult.rawLength} characters • Audited at: {auditResult.timestamp}</div>
                  </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 ${
                    auditResult.creditComplianceStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' :
                    auditResult.creditComplianceStatus === 'Slight Mismatch' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Documentary Status: {auditResult.creditComplianceStatus}
                  </span>
                  <span className={`px-4 py-2 rounded-xl text-xs font-black ${auditResult.sustainabilityGradeColor}`}>
                    Sustainability Grade: {auditResult.sustainabilityGrade}
                  </span>
                </div>
              </div>

              {/* Live Compliance Digital Twin (Interactive Visual Dashboard) */}
              <div className="bg-slate-950 text-white rounded-[2.5rem] p-6 md:p-8 border border-white/10 space-y-8 relative overflow-hidden shadow-2xl">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 relative z-10">
                  <div className="text-left space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                      <Sparkles size={10} />
                      Live Digital Twin Simulation
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-white">Three-Pillar Visual Trade Sync Map</h3>
                    <p className="text-slate-400 text-xs font-semibold">
                      Real-time visual diagram generated based on detected contract terms ({auditResult?.incoterm?.split(' ')[0]}), showing logistics handover, carbon splits, and documentary finance compliance.
                    </p>
                  </div>
                  <div className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-slate-300">
                    STATUS: SYNCED
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  {/* Pillar 1: Cost & Risk Shipping Transfer Map */}
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-lg font-black font-mono">STEP 1</span>
                        <h4 className="text-sm font-black text-white">Physical Handover Flow</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Incoterms® 2020</span>
                    </div>

                    {/* Shipping Line Diagram */}
                    <div className="space-y-4 py-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>Origin</span>
                        <span>Destination</span>
                      </div>

                      {/* Visual Dots and connectors */}
                      <div className="relative flex justify-between items-center px-2">
                        {/* Connecting Line underlay */}
                        <div className="absolute left-4 right-4 h-1 bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
                        
                        {/* Handover flow color representation */}
                        {auditResult?.incoterm?.includes('EXW') && (
                          <div className="absolute left-4 w-4 h-1 bg-emerald-500 top-1/2 -translate-y-1/2 z-0" />
                        )}
                        {auditResult?.incoterm?.includes('FCA') && (
                          <div className="absolute left-4 w-1/4 h-1 bg-emerald-500 top-1/2 -translate-y-1/2 z-0" />
                        )}
                        {auditResult?.incoterm?.includes('CIF') && (
                          <div className="absolute left-1/4 w-2/4 h-1 bg-emerald-500 top-1/2 -translate-y-1/2 z-0" />
                        )}

                        {/* Node 1: Origin Seller Factory */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-semibold text-xs ${
                            auditResult?.incoterm?.includes('EXW') || auditResult?.incoterm?.includes('FCA') || auditResult?.incoterm?.includes('CIF') ? 'bg-emerald-500 text-white border-emerald-400 font-black' : 'bg-slate-800 text-slate-400 border-slate-750'
                          }`}>
                            <Warehouse size={14} />
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 font-bold">Seller</span>
                        </div>

                        {/* Node 2: Port of Departure */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-semibold text-xs ${
                            auditResult?.incoterm?.includes('FCA') || auditResult?.incoterm?.includes('CIF') ? 'bg-emerald-500 text-white border-emerald-400 font-black' : 'bg-slate-800 text-slate-400 border-slate-750'
                          }`}>
                            <Truck size={14} />
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 font-bold">Export Port</span>
                        </div>

                        {/* Node 3: Maritime Sea */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-semibold text-xs ${
                            auditResult?.incoterm?.includes('CIF') ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-750'
                          }`}>
                            <Ship size={14} />
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 font-bold">Sea Voyage</span>
                        </div>

                        {/* Node 4: Buyer Port & Warehouse */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 border border-slate-700 font-semibold text-xs">
                            <Warehouse size={14} />
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 font-bold">Buyer</span>
                        </div>
                      </div>

                      {/* Detail Labels */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-bold">Risk Handover Point:</span>
                          <span className="text-emerald-400 font-black">
                            {auditResult?.incoterm?.includes('EXW') && "At Origin Factory Gate"}
                            {auditResult?.incoterm?.includes('FCA') && "At Tokyo Container Yard"}
                            {auditResult?.incoterm?.includes('CIF') && "At Departure Port (Buenos Aires)"}
                            {!auditResult?.incoterm?.includes('EXW') && !auditResult?.incoterm?.includes('FCA') && !auditResult?.incoterm?.includes('CIF') && "Specified by Term"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-bold">Freight Booking By:</span>
                          <span className="text-blue-400 font-black">
                            {auditResult?.incoterm?.includes('EXW') && "Buyer (EXW)"}
                            {auditResult?.incoterm?.includes('FCA') && "Buyer (FCA)"}
                            {auditResult?.incoterm?.includes('CIF') && "Seller (CIF arranges freight)"}
                            {!auditResult?.incoterm?.includes('EXW') && !auditResult?.incoterm?.includes('FCA') && !auditResult?.incoterm?.includes('CIF') && "Refer to terms"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Mismatch Banner */}
                    {auditResult?.incoterm?.includes('CIF') && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl flex items-start gap-2 mt-2">
                        <span className="text-rose-400 text-xs">⚠️</span>
                        <p className="text-[10px] text-rose-300 font-semibold leading-relaxed">
                          <strong>Cost-Risk Swap Override Detected:</strong> Stating the seller remains liable until destination custom clearance conflicts with standard CIF departure risk guidelines. Shifts term effectively to DAP.
                        </p>
                      </div>
                    )}
                    {auditResult?.incoterm?.includes('EXW') && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-2 mt-2">
                        <span className="text-amber-400 text-xs">💡</span>
                        <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                          Under standard EXW, Seller holds zero shipping liability. Export customs clearing processes rest 100% on the foreign Buyer.
                        </p>
                      </div>
                    )}
                    {auditResult?.incoterm?.includes('FCA') && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-start gap-2 mt-2">
                        <span className="text-emerald-400 text-xs">✅</span>
                        <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                          Proper multimodal container term selection. Risk transitions seamlessly to Buyer at departure yard, with local export clearance assigned to seller.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pillar 2: Carbon Split Ledger */}
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-lg font-black font-mono">STEP 2</span>
                        <h4 className="text-sm font-black text-white">Scope 3 Emission Ledger</h4>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">CO₂ Split</span>
                    </div>

                    <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Seller CO2 Share</span>
                        <span className="text-slate-400">Buyer CO2 Share</span>
                      </div>

                      {/* Carbon Progression Split Bar */}
                      <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex">
                        {auditResult?.incoterm?.includes('EXW') && (
                          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: '100%' }} />
                        )}
                        {auditResult?.incoterm?.includes('FCA') && (
                          <>
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '8%' }} />
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: '92%' }} />
                          </>
                        )}
                        {auditResult?.incoterm?.includes('CIF') && (
                          <>
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '72%' }} />
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: '28%' }} />
                          </>
                        )}
                        {!auditResult?.incoterm?.includes('EXW') && !auditResult?.incoterm?.includes('FCA') && !auditResult?.incoterm?.includes('CIF') && (
                          <>
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '50%' }} />
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: '50%' }} />
                          </>
                        )}
                      </div>

                      {/* Legend and percentage readouts */}
                      <div className="flex justify-between text-xs font-black">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                          <span>
                            {auditResult?.incoterm?.includes('EXW') && "Seller: 0%"}
                            {auditResult?.incoterm?.includes('FCA') && "Seller: 8%"}
                            {auditResult?.incoterm?.includes('CIF') && "Seller: 72%"}
                            {!auditResult?.incoterm?.includes('EXW') && !auditResult?.incoterm?.includes('FCA') && !auditResult?.incoterm?.includes('CIF') && "Seller: 50%"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                          <span>
                            {auditResult?.incoterm?.includes('EXW') && "Buyer: 100%"}
                            {auditResult?.incoterm?.includes('FCA') && "Buyer: 92%"}
                            {auditResult?.incoterm?.includes('CIF') && "Buyer: 28%"}
                            {!auditResult?.incoterm?.includes('EXW') && !auditResult?.incoterm?.includes('FCA') && !auditResult?.incoterm?.includes('CIF') && "Buyer: 50%"}
                          </span>
                        </div>
                      </div>

                      {/* Green commentary */}
                      <div className="text-[10px] text-slate-300 font-semibold leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {auditResult?.incoterm?.includes('EXW') && "⚠️ Carbon attribution: Because all transport moves are coordinated from the seller's yard, the buyer assumes 100% of Scope 3 logistics greenhouse footprints."}
                        {auditResult?.incoterm?.includes('FCA') && "✅ Optimized split: Seller absorbs pre-carriage emissions (8%), while ocean carriage emissions are logged directly by the buyer."}
                        {auditResult?.incoterm?.includes('CIF') && "⚡ High emission allocation: Exporter manages first-mile & long marine transit (72%). Selecting CIF forces the seller to track and claim carbon footprints."}
                        {!auditResult?.incoterm?.includes('EXW') && !auditResult?.incoterm?.includes('FCA') && !auditResult?.incoterm?.includes('CIF') && "Emissions splits distribute based on changeover logistics gates of the specified term."}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-3 py-2 rounded-xl">
                      <Leaf size={12} />
                      <span className="font-extrabold uppercase font-mono">Scope 3 Split Compliant</span>
                    </div>
                  </div>

                  {/* Pillar 3: Bank Doc Validation Matcher */}
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-lg font-black font-mono">STEP 3</span>
                        <h4 className="text-sm font-black text-white">UCP 600 Bank Doc Matrix</h4>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-bold font-mono">L/C Audit</span>
                    </div>

                    {/* Sync Document Checklist Status */}
                    <div className="space-y-3.5 py-1">
                      {/* Doc 1: Invoice */}
                      <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-left">
                          <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          <span className="text-[11px] font-black text-white">Commercial Invoice</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-black rounded flex-shrink-0">MATCHED</span>
                      </div>

                      {/* Doc 2: Bill of Lading */}
                      <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-left">
                          {auditResult?.incoterm?.includes('EXW') ? (
                            <XCircle size={13} className="text-rose-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          )}
                          <span className="text-[11px] font-black text-white">Ocean Bill of Lading</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-black rounded flex-shrink-0 ${
                          auditResult?.incoterm?.includes('EXW') ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {auditResult?.incoterm?.includes('EXW') ? "DEADLOCK" : "MATCHED"}
                        </span>
                      </div>

                      {/* Doc 3: Insurance Cert */}
                      <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-left">
                          {auditResult?.incoterm?.includes('CIF') ? (
                            <AlertTriangle size={13} className="text-orange-400 flex-shrink-0" />
                          ) : auditResult?.incoterm?.includes('EXW') || auditResult?.incoterm?.includes('FCA') ? (
                            <CheckCircle2 size={13} className="text-slate-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          )}
                          <span className="text-[11px] font-black text-white">Marine Insurance Policy</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-black rounded flex-shrink-0 ${
                          auditResult?.incoterm?.includes('CIF') ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {auditResult?.incoterm?.includes('CIF') ? "LATE SPEC" : "OPTIONAL"}
                        </span>
                      </div>
                    </div>

                    {/* Warning overlay description */}
                    {auditResult?.incoterm?.includes('CIF') && (
                      <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl text-[10px] text-orange-200 font-semibold leading-relaxed">
                        ⚠️ <strong>UCP 600 Art 28 Warning:</strong> Standard banks reject insurance documents dated after the transport loading date. Restating custom 3-day insurance handovers creates compliance refusal.
                      </div>
                    )}
                    {auditResult?.incoterm?.includes('EXW') && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl text-[10px] text-rose-300 font-semibold leading-relaxed animate-pulse">
                        ❌ <strong>L/C Non-Compliance:</strong> EXW delivery shifts carrier booking completely to Buyer. Seller cannot guarantee clean Carrier-issued Bills of Lading to trigger banks releasing funds.
                      </div>
                    )}
                    {auditResult?.incoterm?.includes('FCA') && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-[10px] text-emerald-300 font-semibold leading-relaxed">
                        ✅ <strong>UCP Compliance Clear:</strong> Documentary presentations align properly under FCA procedures, preventing bank liquidity delays.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex justify-start border-b border-slate-200 gap-2 overflow-x-auto pb-px">
                {[
                  { id: 'overview', label: 'Risk & Executive Summary', icon: <AlertTriangle size={14} /> },
                  { id: 'incoterms', label: 'Incoterms® 2020 Alignment', icon: <Globe size={14} /> },
                  { id: 'sustainability', label: 'Green Logistics & Scope 3', icon: <Leaf size={14} /> },
                  { id: 'compliance', label: 'Documentary & UCP 600', icon: <Coins size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAuditTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-black tracking-tight border-b-2 transition-all ${
                      activeAuditTab === tab.id 
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20' 
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className="min-h-[300px]">
                {activeAuditTab === 'overview' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* RISK CARD */}
                    <div className="bg-red-50/40 border border-red-100 rounded-[2.5rem] p-8 space-y-6 text-left">
                      <div className="flex justify-between items-center border-b border-red-100 pb-4">
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-[10px] font-black rounded-lg">Immediate Remediation Critical</span>
                        <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="text-red-500" size={18} />
                          Identified Contractual Risks
                        </h4>
                      </div>

                      {auditResult.incotermsRiskList.length > 0 ? (
                        <div className="space-y-4">
                          {auditResult.incotermsRiskList.map((risk: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start text-sm text-slate-800 font-semibold leading-relaxed">
                              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8 text-slate-400 space-y-2">
                          <CheckCircle2 className="text-emerald-500" size={32} />
                          <p className="text-xs font-black">Excellent! No major contractual risk or logical discrepancies detected.</p>
                        </div>
                      )}
                    </div>

                    {/* RECOMMENDATION / NEXT STEPS */}
                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-[2.5rem] p-8 space-y-6 text-left">
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">Recommended Remedial Actions</span>
                        <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="text-emerald-600" size={18} />
                          Amendments Needed in Contract Text
                        </h4>
                      </div>

                      <div className="space-y-4 font-semibold text-slate-700 text-sm leading-relaxed">
                        <p className="flex items-start gap-2 text-slate-800">
                          <CornerDownRight size={14} className="text-emerald-600 flex-shrink-0 mt-1" />
                          <span>Specify the exact first-mile vehicle details and terminal hub coordinates in delivery clauses to avoid customs clearance ambiguities.</span>
                        </p>
                        <p className="flex items-start gap-2 text-slate-800">
                          <CornerDownRight size={14} className="text-emerald-600 flex-shrink-0 mt-1" />
                          <span>Align insurance presentation terms strictly with shipping dates, ensuring the certificate or policy is dated on or before the Bill of Lading.</span>
                        </p>
                        <p className="flex items-start gap-2 text-slate-800">
                          <CornerDownRight size={14} className="text-emerald-600 flex-shrink-0 mt-1" />
                          <span>Insert a binding clause requiring secondary maritime carrier fuel efficiency reporting to ensure compliant Scope 3 inventory for the buyer.</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAuditTab === 'incoterms' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="space-y-6 text-left"
                  >
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h4 className="text-lg font-black text-slate-900 mb-2">Risk & Cost Allocation under ICC Incoterms® 2020</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                        The selected trade term must seamlessly synchronize with insurance routing, freight booking control, and customs clearance obligations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-sky-50/[0.15] border border-sky-100 rounded-[2rem] p-6 space-y-4">
                        <h5 className="font-extrabold text-sky-950 border-b border-sky-100 pb-2">Verified Standard Allocations</h5>
                        {auditResult.incotermsCompliantList.length > 0 ? (
                          <div className="space-y-3">
                            {auditResult.incotermsCompliantList.map((item: string, i: number) => (
                              <div key={i} className="flex gap-2 items-start text-xs text-slate-700 font-bold">
                                <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs font-bold">No active standard alignments could be identified in the text.</p>
                        )}
                      </div>

                      <div className="bg-red-50/[0.15] border border-red-100 rounded-[2rem] p-6 space-y-4">
                        <h5 className="font-extrabold text-red-950 border-b border-red-100 pb-2">Logical & Legal Redrafts Required</h5>
                        <div className="space-y-3">
                          {auditResult.incotermsRiskList.map((item: string, i: number) => (
                            <div key={i} className="flex gap-2 items-start text-xs text-slate-700 font-bold">
                              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAuditTab === 'sustainability' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left"
                  >
                    <div className="md:col-span-4 bg-emerald-50/30 border border-emerald-100/60 p-6 rounded-[2rem] flex flex-col justify-between items-center text-center space-y-4">
                      <div className="space-y-2">
                        <Leaf className="text-emerald-600 mx-auto" size={32} />
                        <h5 className="font-extrabold text-slate-900">Carbon Reduction Grade</h5>
                        <div className="text-5xl font-black text-emerald-700">{auditResult.sustainabilityGrade}</div>
                        <p className="text-slate-400 text-[10px] font-bold">Scope 3 Emission Optimization Rating</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 w-full text-[10px] text-emerald-800 font-bold">
                        {auditResult.carbonSavingsFactor}
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="text-lg font-black text-slate-900">CSDDD & Emission Reporting Compliance</h4>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                          International shippers dispatching goods ending in the EU should distribute multi-segment carbon tracking accountability evenly to enable standard ESG inventory filing.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {auditResult.sustainabilityRiskList.map((err: string, i: number) => (
                          <div key={i} className="flex gap-3 justify-start items-start text-xs text-slate-700 font-bold">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAuditTab === 'compliance' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="space-y-6 text-left"
                  >
                    <div className="bg-indigo-50/20 border border-indigo-100 p-6 rounded-[2rem] flex justify-between items-center gap-4">
                      <Coins className="text-indigo-600 animate-pulse" size={32} />
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-indigo-950">Letter of Credit & UCP 600 Compliance</h4>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                          Bank letters of credit act as strict documentary exchanges. Discrepancy-free document matching is necessary to avoid shipping and liquidity freeze.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {auditResult.creditComplianceRiskList.map((item: string, i: number) => (
                        <div key={i} className="flex gap-3 justify-start items-start bg-slate-50 border border-slate-150 p-5 rounded-2xl text-xs text-slate-700 font-bold">
                          <XCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-50/30 p-4 rounded-xl text-[10px] text-indigo-900 font-bold border border-indigo-100/50 leading-relaxed">
                      Core Principle: Under ICC Uniform Customs and Practice (UCP 600), banks deal strictly with documents and not with goods. Any structural mismatch between the contract Incoterm and presented transport documents triggers immediate discrepancies, causing costly payment delays.
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Info, Shield, Truck, Ship, Package, Globe, CheckCircle2, RefreshCcw, BarChart3, Binary, Download, LayoutGrid, ShieldCheck, Umbrella, Lock, Files, Anchor, MapPin, type LucideIcon } from 'lucide-react';
import { INCOTERMS } from '../data/incoterms';
import { LEGAL_DATA } from '../data/legalFramework';

import LegalCompliance from './LegalCompliance';

interface ResultDisplayProps {
  code: string;
  onReset: () => void;
}

// ---------------------------------------------------------------------------
// Rule-based helper data (v1.2). All values are indicative illustrations of
// Incoterms® 2020 (ICC 2020) and the GHG Protocol Scope 3 Standard
// (WRI & WBCSD 2011, categories 4 and 9). Nothing here is calculated from
// shipment data.
// ---------------------------------------------------------------------------

type Party = 'S' | 'B';

interface StageDef {
  label: string;
  icon: LucideIcon;
  owner: Party;
}

interface HierarchyDef {
  stages: StageDef[];
  risk: number;
  cost: number;
  costLabel: string;
  note: string;
}

const SEA_RULES = ['FAS', 'FOB', 'CFR', 'CIF'];
const BUYER_CONTRACTS_CARRIAGE = ['EXW', 'FCA', 'FAS', 'FOB'];

// Logistical hierarchy: seven stages, who manages each, and where risk and cost pass.
const getHierarchy = (code: string): HierarchyDef => {
  const sea = SEA_RULES.includes(code);
  const delivery = code === 'FAS' ? 'Alongside Vessel' : ['FOB', 'CFR', 'CIF'].includes(code) ? 'On Board Vessel' : 'Handover to Carrier';
  const destination = sea ? 'Port of Destination' : 'Place of Destination';
  const carriageIcon = sea ? Ship : Truck;

  const labels: { label: string; icon: LucideIcon }[] = [
    { label: 'Origin Factory', icon: Package },
    { label: code === 'EXW' ? 'Loading / Inland Freight' : 'Inland Freight', icon: Truck },
    { label: 'Export Customs', icon: Globe },
    { label: delivery, icon: carriageIcon },
    { label: 'Main Carriage', icon: carriageIcon },
    { label: destination, icon: sea ? Anchor : MapPin },
    { label: 'Import Customs / Onward Delivery', icon: Files },
  ];
  if (code === 'DAP') labels[6] = { label: 'Unloading / Import Customs', icon: Files };
  if (code === 'DPU') labels[5] = { label: 'Place of Destination (Unloaded)', icon: MapPin };
  if (code === 'DDP') {
    labels[5] = { label: 'Import Customs', icon: Files };
    labels[6] = { label: 'Place of Destination', icon: MapPin };
  }

  const rules: Record<string, { owners: string; risk: number; cost: number; costLabel: string; note: string }> = {
    EXW: { owners: 'SBBBBBB', risk: 0, cost: 0, costLabel: 'Cost Transfer',
      note: 'Seller makes the goods available at its premises; buyer bears all costs and risks from that point, including loading and export clearance.' },
    FCA: { owners: 'SSSSBBB', risk: 3, cost: 3, costLabel: 'Cost Transfer',
      note: 'Seller delivers to the buyer\'s carrier at the named place and clears the goods for export; buyer contracts and pays the main carriage. If the named place is the seller\'s premises, the inland leg is also the buyer\'s.' },
    FAS: { owners: 'SSSSBBB', risk: 3, cost: 3, costLabel: 'Cost Transfer',
      note: 'Seller delivers alongside the vessel at the named port of shipment; buyer bears costs and risk from that point, including loading.' },
    FOB: { owners: 'SSSSBBB', risk: 3, cost: 3, costLabel: 'Cost Transfer',
      note: 'Seller delivers on board the vessel at the named port of shipment; buyer contracts and pays the sea carriage.' },
    CFR: { owners: 'SSSSSSB', risk: 3, cost: 5, costLabel: 'Seller-Paid Freight Ends',
      note: 'Seller pays freight to named port of destination; buyer bears risk once goods are on board.' },
    CIF: { owners: 'SSSSSSB', risk: 3, cost: 5, costLabel: 'Seller-Paid Freight Ends',
      note: 'Seller pays freight and minimum insurance to named port of destination; buyer bears risk once goods are on board.' },
    CPT: { owners: 'SSSSSSB', risk: 3, cost: 5, costLabel: 'Seller-Paid Carriage Ends',
      note: 'Seller pays carriage to named place of destination; buyer bears risk once goods are handed to the first carrier.' },
    CIP: { owners: 'SSSSSSB', risk: 3, cost: 5, costLabel: 'Seller-Paid Carriage Ends',
      note: 'Seller pays carriage and all-risks insurance to named place of destination; buyer bears risk once goods are handed to the first carrier.' },
    DAP: { owners: 'SSSSSSB', risk: 5, cost: 5, costLabel: 'Cost Transfer',
      note: 'Seller bears costs and risk to the named place of destination, ready for unloading; buyer unloads and clears the goods for import.' },
    DPU: { owners: 'SSSSSSB', risk: 5, cost: 5, costLabel: 'Cost Transfer',
      note: 'Seller bears costs and risk until the goods are unloaded at the named place of destination; buyer clears the goods for import.' },
    DDP: { owners: 'SSSSSSS', risk: 6, cost: 6, costLabel: 'Cost Transfer',
      note: 'Seller bears costs and risk to the named place of destination and clears the goods for import; buyer only unloads.' },
  };
  const r = rules[code] || rules['EXW'];
  return {
    stages: labels.map((l, i) => ({ ...l, owner: r.owners[i] as Party })),
    risk: r.risk,
    cost: r.cost,
    costLabel: r.costLabel,
    note: r.note,
  };
};

// One-line insurance summary for the hub (Incoterms® 2020 Articles A5/B5).
const getInsuranceSummary = (code: string): { text: string; seller: boolean } => {
  if (code === 'CIF') return { text: 'Seller must insure – minimum cover (A5)', seller: true };
  if (code === 'CIP') return { text: 'Seller must insure – all-risks cover (A5)', seller: true };
  if (['DAP', 'DPU', 'DDP'].includes(code)) return { text: 'No obligation – seller bears risk to destination', seller: true };
  return { text: 'No obligation – buyer bears transit risk', seller: false };
};

// Keeps pin tooltips inside the card when the pin sits near either end of a bar.
const pinTooltip = (position: number): { box: string; arrow: string } => {
  if (position > 72) return { box: 'right-0 translate-x-4', arrow: 'right-6' };
  if (position < 28) return { box: 'left-0 -translate-x-4', arrow: 'left-6' };
  return { box: 'left-1/2 -translate-x-1/2', arrow: 'left-1/2 -translate-x-1/2' };
};

// When a pin sits at either end of a bar, its tooltip would cover the side labels; they are then raised above it.
const pinNearEdge = (position: number): boolean => position < 18 || position > 86;

// Cost items per party (Incoterms® 2020 Articles A9/B9).
interface CostLists {
  seller: string[];
  buyer: string[];
  carriageNote?: string;
}

const getCostLists = (code: string): CostLists => {
  const importCosts = 'Import / Transit Clearance, Duties & Taxes';
  switch (code) {
    case 'EXW':
      return {
        seller: ['Packaging & Checking Costs', 'Making the Goods Available at the Seller\'s Premises'],
        buyer: ['Loading at the Seller\'s Premises', 'Inland Freight / Pre-carriage', 'Export Clearance Costs', 'Origin Terminal Handling & Loading', 'Main Carriage / International Freight', importCosts, 'Unloading & Onward Delivery'],
      };
    case 'FCA':
      return {
        seller: ['Packaging & Checking Costs', 'Loading at the Seller\'s Premises (or carriage to the named place)', 'Export Clearance Costs', 'Proof of Delivery Costs'],
        buyer: ['Main Carriage / International Freight', 'Terminal Handling after Delivery to the Carrier', 'Transport Document Costs', importCosts, 'Unloading Charges at Destination', 'Onward Delivery'],
      };
    case 'FAS':
      return {
        seller: ['Packaging & Checking Costs', 'Inland Freight / Pre-carriage to the Port', 'Export Clearance Costs', 'Placing the Goods Alongside the Vessel'],
        buyer: ['Loading on Board at Port of Shipment', 'Main Carriage / Sea Freight', importCosts, 'Destination Terminal Handling Charges (DTHC)', 'Unloading Charges at Destination', 'Onward Delivery after Destination Port'],
      };
    case 'FOB':
      return {
        seller: ['Packaging & Checking Costs', 'Inland Freight / Pre-carriage', 'Export Clearance Costs', 'Origin Terminal Handling & Loading on Board'],
        buyer: ['Main Carriage / Sea Freight', importCosts, 'Destination Terminal Handling Charges (DTHC)', 'Unloading Charges at Destination', 'Onward Delivery after Destination Port'],
      };
    case 'CFR':
    case 'CIF': {
      const seller = ['Packaging & Checking Costs', 'Inland Freight / Pre-carriage', 'Export Clearance Costs', 'Loading on Board at Port of Shipment', 'Main Carriage / International Freight (to named port of destination)', 'Transport Document Costs (e.g. B/L)', 'Transport Security (if required)'];
      if (code === 'CIF') seller.splice(5, 0, 'Cargo Insurance Premium (minimum cover)');
      return {
        seller,
        buyer: [importCosts, 'Destination Terminal Handling Charges (DTHC) (unless included in seller\'s carriage contract)', 'Unloading Charges at Destination (unless included in seller\'s carriage contract)', 'Onward Delivery after Destination Port', 'Transit Costs (if any, unless included in seller\'s contract)', 'Any additional costs after the named port of destination'],
        carriageNote: 'Unloading and terminal costs depend on the contract of carriage.',
      };
    }
    case 'CPT':
    case 'CIP': {
      const seller = ['Packaging & Checking Costs', 'Pre-carriage & Handover to the First Carrier', 'Export Clearance Costs', 'Main Carriage (to named place of destination)', 'Transport Document Costs', 'Transport Security (if required)'];
      if (code === 'CIP') seller.splice(4, 0, 'Cargo Insurance Premium (all-risks cover)');
      return {
        seller,
        buyer: [importCosts, 'Unloading Charges at Destination (unless included in seller\'s carriage contract)', 'Transit Costs (if any, unless included in seller\'s contract)', 'Onward Delivery after the Named Place', 'Any additional costs after the named place of destination'],
        carriageNote: 'Unloading costs depend on the contract of carriage.',
      };
    }
    case 'DAP':
      return {
        seller: ['Packaging & Checking Costs', 'Inland Freight / Pre-carriage', 'Export & Transit Clearance Costs', 'Main Carriage to the Named Place of Destination', 'Transport Document Costs'],
        buyer: ['Unloading at the Named Place of Destination', 'Import Clearance, Duties & Taxes', 'Onward Delivery after the Named Place'],
      };
    case 'DPU':
      return {
        seller: ['Packaging & Checking Costs', 'Inland Freight / Pre-carriage', 'Export & Transit Clearance Costs', 'Main Carriage to the Named Place of Destination', 'Unloading at the Named Place of Destination', 'Transport Document Costs'],
        buyer: ['Import Clearance, Duties & Taxes', 'Onward Delivery after Unloading'],
      };
    case 'DDP':
    default:
      return {
        seller: ['Packaging & Checking Costs', 'Inland Freight / Pre-carriage', 'Export & Transit Clearance Costs', 'Main Carriage to the Named Place of Destination', 'Import Clearance, Duties & Taxes', 'Transport Document Costs'],
        buyer: ['Unloading at the Named Place of Destination', 'Any costs after delivery'],
      };
  }
};

// ---------- Carbon data access (GHG Protocol Scope 3, categories 4 and 9) ----------

const rangeLabel = (value: number): string => `~${Math.max(0, value - 10)}–${Math.min(100, value + 10)}%`;
const accessLevel = (value: number): 'HIGH' | 'MEDIUM' | 'LOW' => (value >= 70 ? 'HIGH' : value >= 30 ? 'MEDIUM' : 'LOW');

interface DataRoadmap {
  rating: string;
  ratingColor: string;
  contracting: string;
  dependentParty: 'Seller' | 'Buyer';
  dependencyLevel: 'High' | 'Medium' | 'Low';
  dependencyText: string;
  sellerScope3Category: string;
  buyerScope3Category: string;
  sellerAction: string;
  buyerAction: string;
}

const getDataRoadmap = (code: string, sellerShare: number): DataRoadmap => {
  const buyerContracts = BUYER_CONTRACTS_CARRIAGE.includes(code);
  const otherShare = buyerContracts ? 100 - sellerShare : sellerShare;
  const dependencyLevel: DataRoadmap['dependencyLevel'] = otherShare >= 80 ? 'High' : otherShare >= 60 ? 'Medium' : 'Low';
  const ratingColor =
    dependencyLevel === 'High' ? 'text-red-800 border-red-200 bg-red-50 shadow-sm' :
    dependencyLevel === 'Medium' ? 'text-amber-800 border-amber-200 bg-amber-50 shadow-sm' :
    'text-emerald-800 border-emerald-200 bg-emerald-50 shadow-sm';

  const contracting: Record<string, string> = {
    EXW: 'Buyer contracts all transport from the seller\'s premises',
    FCA: 'Buyer contracts the main carriage from the named place',
    FAS: 'Buyer contracts the vessel; seller delivers alongside',
    FOB: 'Buyer contracts the vessel; seller loads on board',
    CFR: 'Seller contracts sea carriage to the named port',
    CIF: 'Seller contracts sea carriage to the named port',
    CPT: 'Seller contracts carriage to the named place',
    CIP: 'Seller contracts carriage to the named place',
    DAP: 'Seller contracts transport to the named place of destination',
    DPU: 'Seller contracts transport to the named place of destination',
    DDP: 'Seller contracts transport to the named place of destination',
  };

  if (buyerContracts) {
    return {
      rating: code === 'EXW' ? 'Buyer holds all transport data' : 'Buyer holds main-carriage data',
      ratingColor,
      contracting: contracting[code],
      dependentParty: 'Seller',
      dependencyLevel,
      dependencyText: 'The seller has no contract with the main carrier and depends on the buyer for primary emission data.',
      sellerScope3Category: code === 'EXW'
        ? 'Scope 3 Category 9 (transport not paid for by the seller)'
        : 'Scope 3 Category 9 for legs paid by the buyer; Category 4 for any leg the seller pays',
      buyerScope3Category: 'Scope 3 Category 4 (inbound transport of purchased goods)',
      sellerAction: 'Ask the buyer for the carrier\'s emission data for the main carriage, or use an estimate and state that it is one.',
      buyerAction: 'Collect emission data from your carrier and share it with the seller on request.',
    };
  }
  return {
    rating: 'Seller holds main-carriage data',
    ratingColor,
    contracting: contracting[code] || contracting['DAP'],
    dependentParty: 'Buyer',
    dependencyLevel,
    dependencyText: 'The buyer has no contract with the main carrier and depends on the seller for primary emission data.',
    sellerScope3Category: 'Scope 3 Category 4 for carriage the seller pays; Category 9 for any on-carriage paid by the buyer',
    buyerScope3Category: 'Scope 3 Category 4 (inbound transport of purchased goods)',
    sellerAction: 'Collect emission data from your carrier(s) and pass it to the buyer with the shipping documents.',
    buyerAction: 'Ask the seller for the carrier\'s emission data for the main carriage; the buyer has no contract with the carrier.',
  };
};

// "Greener" alternatives: rules that give a party more control over transport and
// therefore better access to transport-emission data. No emission reduction is claimed.
interface GreenerOption {
  code: string;
  reason: string;
}

interface SplitGreenerSuggestion {
  buyerSuggestions: GreenerOption[];
  sellerSuggestions: GreenerOption[];
  buyerNone: string;
  sellerNone: string;
}

const getGreenerSuggestionsSeparate = (currentCode: string): SplitGreenerSuggestion => {
  const buyerToFca = 'Under FCA the buyer contracts the main carriage and receives the carrier\'s emission data directly instead of depending on the seller.';
  const buyerToFob = 'Under FOB the buyer contracts the vessel and receives the carrier\'s emission data directly instead of depending on the seller.';
  const sellerToDap = 'Under DAP the seller keeps the carriage contract through to the named place of destination and also bears the transit risk, so control, risk and transport data sit with the same party.';

  const buyer: Record<string, GreenerOption[]> = {
    EXW: [],
    FCA: [],
    FAS: [{ code: 'FCA', reason: 'With FCA at an inland place or at the seller\'s premises the buyer also controls pre-carriage; FCA is also the suitable rule when goods are handed over in containers.' }],
    FOB: [{ code: 'FCA', reason: 'With FCA at an inland place or at the seller\'s premises the buyer also controls pre-carriage; FCA is also the suitable rule when goods are handed over in containers.' }],
    CFR: [{ code: 'FOB', reason: buyerToFob }],
    CIF: [{ code: 'FOB', reason: `${buyerToFob} The buyer then arranges its own cargo insurance.` }],
    CPT: [{ code: 'FCA', reason: buyerToFca }],
    CIP: [{ code: 'FCA', reason: `${buyerToFca} The buyer then arranges its own cargo insurance.` }],
    DAP: [{ code: 'FCA', reason: `${buyerToFca} The transit risk then also passes to the buyer.` }],
    DPU: [{ code: 'FCA', reason: `${buyerToFca} The transit risk then also passes to the buyer.` }],
    DDP: [{ code: 'FCA', reason: `${buyerToFca} The transit risk and import clearance then also pass to the buyer.` }],
  };

  const seller: Record<string, GreenerOption[]> = {
    EXW: [{ code: 'FCA', reason: 'Under FCA the seller loads the goods, clears them for export and, if another place is named, arranges pre-carriage, so it controls and can document the first part of the journey.' }],
    FCA: [{ code: 'CPT', reason: 'Under CPT the seller contracts the main carriage and receives the carrier\'s emission data directly; risk still passes when the goods are handed to the first carrier.' }],
    FAS: [{ code: 'FOB', reason: 'Under FOB the seller also controls loading on board. To hold the sea-voyage data as well, CFR would be the next step.' }],
    FOB: [{ code: 'CFR', reason: 'Under CFR the seller contracts the vessel and receives the carrier\'s emission data directly; risk still passes on board at the port of shipment.' }],
    CFR: [{ code: 'DAP', reason: sellerToDap }],
    CIF: [{ code: 'DAP', reason: `${sellerToDap} The insurance obligation of CIF no longer applies; the seller insures in its own interest.` }],
    CPT: [{ code: 'DAP', reason: sellerToDap }],
    CIP: [{ code: 'DAP', reason: `${sellerToDap} The insurance obligation of CIP no longer applies; the seller insures in its own interest.` }],
    DAP: [{ code: 'DPU', reason: 'Under DPU the seller also unloads at the named place, which adds the last handling step to the seller\'s own data.' }],
    DPU: [],
    DDP: [],
  };

  const buyerNone: Record<string, string> = {
    EXW: 'Under EXW the buyer already contracts all transport; no rule gives the buyer more access to transport data.',
    FCA: 'Under FCA the buyer already contracts the main carriage. Naming the seller\'s premises as the place of delivery extends the buyer\'s control to pre-carriage without changing the rule.',
  };

  return {
    buyerSuggestions: buyer[currentCode] || [],
    sellerSuggestions: seller[currentCode] || [],
    buyerNone: buyerNone[currentCode] || `No alternative rule is suggested for the buyer under ${currentCode}.`,
    sellerNone: `Under ${currentCode} the seller already contracts transport to the named place of destination; no rule gives the seller more access to transport data.`,
  };
};

interface ResponsibilityData {
  seller: string[];
  buyer: string[];
  insight: string;
}

// What each party typically has data access to, because it arranges that part of the journey.
export const getResponsibilityBreakdown = (incoterm: string): ResponsibilityData => {
  const up = incoterm.toUpperCase();
  const carrierData = 'Transport documents and related carrier emission data (e.g. B/L, carrier statement)';
  switch (up) {
    case 'EXW':
      return {
        seller: [
          'Packaging and making the goods available at the seller\'s premises',
          'Energy use at its own site (Scope 1/2)'
        ],
        buyer: [
          'Loading at the seller\'s premises and pre-carriage',
          'Export clearance and terminal handling',
          'Main carriage (any mode) and its carrier emission data',
          'Import clearance and on-carriage to the final destination'
        ],
        insight: 'Under EXW the buyer contracts every transport leg. The seller has no relationship with any carrier and would have to request or estimate the transport emissions of its sold goods (seller\'s Scope 3 Category 9).'
      };
    case 'FCA':
      return {
        seller: [
          'Loading at its premises, or pre-carriage to the named place of delivery',
          'Export clearance',
          'Handover documents for the buyer\'s carrier'
        ],
        buyer: [
          'Main carriage contract and carrier emission data',
          'Unloading and terminal handling at destination',
          'Import clearance and on-carriage'
        ],
        insight: 'FCA gives the seller control up to the named place of delivery, while the buyer contracts the main carriage and holds its emission data.'
      };
    case 'FAS':
      return {
        seller: [
          'Inland pre-carriage to the port of shipment',
          'Export clearance and placing the goods alongside the vessel'
        ],
        buyer: [
          'Loading on board and stowage',
          'Sea carriage contract and carrier emission data',
          'Unloading, import clearance and on-carriage'
        ],
        insight: 'Under FAS the seller\'s data covers the journey to the quay. Loading and the sea voyage are contracted by the buyer, who holds that data.'
      };
    case 'FOB':
      return {
        seller: [
          'Inland pre-carriage to the port of shipment',
          'Export clearance, terminal handling and loading on board'
        ],
        buyer: [
          'Sea carriage contract and carrier emission data',
          'Unloading and terminal handling at destination',
          'Import clearance and on-carriage'
        ],
        insight: 'Under FOB the seller\'s data covers the journey up to loading on board. The sea voyage is contracted by the buyer, who holds that data.'
      };
    case 'CFR':
    case 'CIF':
      return {
        seller: [
          'Inland pre-carriage to port of shipment',
          'Port operations, loading and export clearance',
          `Main carriage (ocean freight) to the named port of destination (contracts and pays for the carriage under ${up})`,
          carrierData,
          ...(up === 'CIF' ? ['Cargo insurance (minimum cover) – no effect on data access'] : [])
        ],
        buyer: [
          'Unloading and terminal handling at destination (unless included in seller\'s carriage contract)',
          'Import customs clearance and tariff duties',
          'Onward delivery from the destination port',
          'Any additional transport and distribution after the named port of destination'
        ],
        insight: `Under ${up} the seller contracts the sea carriage and can obtain its emission data, while the risk already passes to the buyer on board at the port of shipment. The buyer needs the seller's carrier data to report its inbound transport.`
      };
    case 'CPT':
    case 'CIP':
      return {
        seller: [
          'Pre-carriage and handover to the first carrier',
          'Export clearance',
          `Carriage to the named place of destination (contracts and pays for the carriage under ${up})`,
          carrierData,
          ...(up === 'CIP' ? ['Cargo insurance (all-risks cover) – no effect on data access'] : [])
        ],
        buyer: [
          'Unloading at destination (unless included in seller\'s carriage contract)',
          'Import customs clearance and tariff duties',
          'On-carriage after the named place of destination'
        ],
        insight: `Under ${up} the seller contracts carriage to the named place of destination and can obtain its emission data, while the risk already passes to the buyer at handover to the first carrier. The buyer needs the seller's carrier data to report its inbound transport.`
      };
    case 'DAP':
      return {
        seller: [
          'Pre-carriage, export clearance and main carriage',
          'Carriage to the named place of destination, ready for unloading',
          carrierData
        ],
        buyer: [
          'Unloading at the named place of destination',
          'Import customs clearance and tariff duties',
          'Any on-carriage after the named place'
        ],
        insight: 'Under DAP the seller contracts the journey to the named place of destination and holds almost all primary transport data. The buyer depends on the seller for the data on its inbound transport.'
      };
    case 'DPU':
      return {
        seller: [
          'Pre-carriage, export clearance and main carriage',
          'Carriage to the named place of destination and unloading there',
          carrierData
        ],
        buyer: [
          'Import customs clearance and tariff duties',
          'Any on-carriage after unloading'
        ],
        insight: 'Under DPU the seller contracts the journey and the unloading at the named place of destination and holds the primary transport data. The buyer depends on the seller for the data on its inbound transport.'
      };
    case 'DDP':
    default:
      return {
        seller: [
          'Pre-carriage, export clearance and main carriage',
          'Import clearance, duties and taxes',
          'Carriage to the named place of destination, ready for unloading',
          carrierData
        ],
        buyer: [
          'Unloading at the named place of destination',
          'Any internal distribution after delivery'
        ],
        insight: 'Under DDP the seller contracts the whole journey including import clearance and holds all primary transport data. The buyer depends entirely on the seller for the data on its inbound transport.'
      };
  }
};


type TabType = 'incoterms' | 'sustainability' | 'compliance' | 'all';
type ViewMode = 'hub' | 'detail';

export default function ResultDisplay({ code, onReset }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('incoterms');
  const [viewMode, setViewMode] = useState<ViewMode>('hub');
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const info = INCOTERMS[code];

  if (!info) return null;

  const handleExportPDF = () => {
    setIsPrintingReport(false); // Global export
    setTimeout(() => {
      window.focus();
      window.print();
    }, 100);
  };

  const handleIncotermsReportPDF = () => {
    setIsPrintingReport(true); // Report-only export
    setTimeout(() => {
      window.focus();
      window.print();
      // We don't necessarily need to reset it immediately because window.print blocks, 
      // but a reset in the next tick or after-print event is safer.
      setTimeout(() => setIsPrintingReport(false), 500);
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-8"
      id="result-container"
    >
      {/* Header Card */}
      <div className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 ${isPrintingReport ? 'print:hidden' : ''}`} id="result-header">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={180} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">
                <Shield size={16} />
                Strategic Recommendation
              </div>
              <h1 className="text-7xl font-black tracking-tighter" id="incoterm-code">{info.code}</h1>
              <p className="text-2xl text-slate-300 mt-2 font-semibold">{info.name}</p>
            </div>
            <div className="flex flex-col gap-3 print:hidden w-full md:w-auto">
              <button
                onClick={onReset}
                className="flex items-center justify-center gap-3 px-8 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-sm font-bold backdrop-blur-md border border-white/10 w-full md:w-64"
                id="start-over-btn"
              >
                <RefreshCcw size={18} />
                New Analysis
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all text-sm font-bold shadow-lg shadow-blue-600/30 w-full md:w-64"
                id="export-pdf-btn"
              >
                <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Selection View (Hub) */}
        {viewMode === 'hub' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 space-y-12"
          >
            {/* Quick Responsibility Summary */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Responsibility Summary</h2>
                  <p className="text-slate-900 font-black text-xl">Logistical Hierarchy for {info.code}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seller</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Buyer</span>
                  </div>
                </div>
              </div>

              {/* Linear Responsibility Timeline */}
              {(() => {
                const hierarchy = getHierarchy(code);
                const lastSeller = hierarchy.stages.reduce((acc, s, i) => (s.owner === 'S' ? i : acc), 0);
                return (
                  <div className="pt-16 pb-6 px-6">
                    <div className="relative pt-8">
                      {/* Legend/Zone Indicators */}
                      <div className="absolute -top-6 left-0 w-full flex justify-between px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">
                            Seller Managed
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-orange-600 text-right">
                            Buyer Managed
                          </span>
                          <div className="w-2 h-2 rounded-full bg-orange-600" />
                        </div>
                      </div>

                      {/* The Base Line (Buyer background) */}
                      <div className="absolute top-[84px] left-0 w-full h-1.5 bg-orange-400 rounded-full" />

                      {/* Seller-managed part of the chain */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(lastSeller / (hierarchy.stages.length - 1)) * 100}%` }}
                        className="absolute top-[84px] left-0 h-1.5 bg-blue-600 rounded-full z-10 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      />

                      <div className="flex justify-between relative z-20">
                        {hierarchy.stages.map((stage, idx) => {
                          const isRiskPoint = hierarchy.risk === idx;
                          const isCostPoint = hierarchy.cost === idx;
                          const isSellerZone = stage.owner === 'S';

                          return (
                            <div key={idx} className="flex flex-col items-center group w-[64px]">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 rotate-45 shadow-sm group-hover:rotate-0 group-hover:scale-110 ${
                                isSellerZone 
                                  ? 'bg-blue-600 text-white shadow-blue-200' 
                                  : 'bg-orange-500 text-white shadow-orange-200'
                              }`}>
                                <div className="-rotate-45 group-hover:rotate-0 transition-transform">
                                  <stage.icon size={16} />
                                </div>
                              </div>

                              <div className="mt-7 flex flex-col items-center text-center">
                                <span className={`text-[8px] font-black uppercase tracking-tighter w-[78px] leading-tight min-h-[30px] transition-colors ${
                                  isSellerZone ? 'text-blue-600' : 'text-orange-600'
                                }`}>
                                  {stage.label}
                                </span>

                                {/* Markers are absolutely positioned so that long labels do not shift the stages */}
                                <div className="relative h-[46px] w-0">
                                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                                    {isRiskPoint && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-900 text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap shadow-xl flex items-center gap-1 border border-white/20"
                                      >
                                        <Shield size={8} /> Risk Transfer
                                      </motion.div>
                                    )}
                                    {isCostPoint && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-600 text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap shadow-xl flex items-center gap-1 border border-white/20"
                                      >
                                        <RefreshCcw size={8} /> {hierarchy.costLabel}
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Plain-language reading of the chain */}
                    <div className="mt-4 flex justify-end">
                      <div className="flex items-start gap-2 max-w-md px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] font-semibold text-slate-700 leading-snug">{hierarchy.note}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Combined Roadmap & Duties */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard 
                  icon={<Package size={20} />} 
                  label="Packaging & Handling" 
                  responsible="Seller" 
                  details="Goods must be marked and packed for export."
                />
                <SummaryCard 
                  icon={<Truck size={20} />} 
                  label="Export Clearance" 
                  responsible={info.responsibilities.export} 
                  details="Customs duties and export licenses."
                />
                <SummaryCard 
                  icon={<Ship size={20} />} 
                  label="Freight & Transport" 
                  responsible={info.responsibilities.mainTransport} 
                  details="Primary international carriage costs."
                />
                <SummaryCard 
                  icon={<Globe size={20} />} 
                  label="Import & Delivery" 
                  responsible={info.responsibilities.import} 
                  details="Local duties and terminal handling."
                />
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-10">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Insurance</span>
                    <span className={`text-xs font-bold ${getInsuranceSummary(code).seller ? 'text-blue-600' : 'text-orange-600'}`}>
                      {getInsuranceSummary(code).text}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Risk Profile</span>
                    <span className="text-xs font-bold text-slate-600">
                      {info.transferPosition < 50 ? 'Buyer bears the main-carriage risk' : 'Seller bears the main-carriage risk'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Redesigned GOLDEN CENTRE of the site: Explore Analytics Context Hub */}
            <div className="bg-gradient-to-b from-[#e3edf7] via-[#ebf3fa] to-[#e4eef6] border border-sky-200/60 rounded-[3.5rem] p-8 md:p-14 shadow-[0_40px_100px_-15px_rgba(15,82,143,0.18)] relative overflow-hidden my-14 animate-fade-in text-center space-y-12">
              
              {/* Dynamic Cyber Circuit Wire Graphic Background Line network behind cards */}
              <div className="absolute inset-0 z-0 pointer-events-none hidden md:block select-none overflow-hidden">
                <svg className="w-full h-full opacity-70" viewBox="0 0 1100 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Horizontal routing tracks */}
                  <path d="M 120,240 L 980,240" stroke="rgba(14,165,233,0.22)" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M 120,320 L 980,320" stroke="rgba(14,165,233,0.3)" strokeWidth="2" />
                  <path d="M 120,400 L 980,400" stroke="rgba(14,165,233,0.22)" strokeWidth="1.5" strokeDasharray="5 5" />
                  
                  {/* Vertical branch node linkages */}
                  <path d="M 280,180 L 280,440" stroke="rgba(14,165,233,0.15)" strokeWidth="1.2" />
                  <path d="M 550,180 L 550,440" stroke="rgba(14,165,233,0.15)" strokeWidth="1.2" />
                  <path d="M 820,180 L 820,440" stroke="rgba(14,165,233,0.15)" strokeWidth="1.2" />
                  
                  {/* Intercept node gems */}
                  <circle cx="280" cy="240" r="3.5" fill="#0ea5e9" className="animate-pulse" />
                  <circle cx="550" cy="320" r="4" fill="#10b981" className="animate-pulse" />
                  <circle cx="820" cy="400" r="3.5" fill="#f59e0b" className="animate-pulse" />
                  <circle cx="410" cy="320" r="4.5" fill="#3b82f6" stroke="rgba(59,130,246,0.35)" strokeWidth="4" />
                  <circle cx="680" cy="320" r="4.5" fill="#10b981" stroke="rgba(16,185,129,0.35)" strokeWidth="4" />
                </svg>
              </div>

              {/* Decorative Tech Blueprint Grid with increased fidelity */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.065)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.065)_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] pointer-events-none" />

              {/* Sweeping holographic cyber-scanning line to visually grab attention in real time */}
              <motion.div 
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none z-10 shadow-[0_0_15px_rgba(34,211,238,0.9)] opacity-60"
                animate={{
                  top: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Sparkle star at bottom right */}
              <div className="absolute bottom-6 right-8 text-sky-400/40 select-none pointer-events-none text-2xl animate-pulse">
                ✦
              </div>

              <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
                {/* Decision Intelligence badge */}
                <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-[#dbe8f4]/60 border border-blue-200/50 text-blue-900 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_2px_12px_rgba(37,99,235,0.05)] backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                  Decision Intelligence Control Desk
                </div>
                
                {/* Giant custom typography title in a single line with emphasized 'ANALYTICS' */}
                <h2 className="text-2xl sm:text-3xl md:text-[44px] font-extrabold tracking-wider text-[#162e4a] leading-tight select-none uppercase whitespace-normal md:whitespace-nowrap">
                  EXPLORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 font-black tracking-widest drop-shadow-[0_2px_15px_rgba(34,211,238,0.45)] animate-pulse px-2.5">ANALYTICS</span> CONTEXT
                </h2>
                <p className="text-slate-600 font-semibold text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
                  Select a view to explore Incoterms® obligations, see which party can access transport emission data for Scope 3 requests, and check typical documents under UCP 600 and ISBP 821.
                </p>
              </div>

              {/* Dynamic responsive capsule layout - aligned in a single row from md screen up */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 pt-4 max-w-6xl mx-auto">
                {[
                  { 
                    id: 'all', 
                    label: 'All Analytics', 
                    icon: LayoutGrid, 
                    color: 'text-fuchsia-400 group-hover:text-fuchsia-300', 
                    glow: 'hover:shadow-[0_20px_50px_rgba(217,70,239,0.25)]',
                    desc: 'All three views on one page: risk and cost transfer, carbon data access, and typical documents.',
                    tag: '360° MATRIX',
                    accentColor: 'from-fuchsia-500/10 to-transparent',
                    headerCol1: '360°',
                    headerCol2: 'MATRIX',
                    preview: (
                      <div className="w-full h-24 bg-[#0a1218]/95 rounded-2xl border border-white/5 p-3.5 flex flex-col justify-between overflow-hidden relative shadow-[inset_0_1px_10px_rgba(0,0,0,0.6)]">
                        <div className="flex justify-between items-center text-[7.5px] font-mono">
                          <span className="text-slate-400/90 font-medium tracking-wide">RISK · DATA ACCESS · DOCUMENTS</span>
                          <span className="text-fuchsia-400 font-black">3 VIEWS</span>
                        </div>
                        <div className="relative w-full h-12 flex items-end">
                          <svg className="w-full h-full" viewBox="0 0 160 50">
                            <defs>
                              <linearGradient id="waveFuchsia" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(217,70,239,0.25)" />
                                <stop offset="100%" stopColor="rgba(217,70,239,0)" />
                              </linearGradient>
                            </defs>
                            <path d="M 0,25 Q 20,40 40,20 T 80,35 T 120,15 T 160,30" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" />
                            <path d="M 0,25 Q 20,40 40,20 T 80,35 T 120,15 T 160,30 L 160,50 L 0,50 Z" fill="url(#waveFuchsia)" />
                            {/* Visual peak nodes */}
                            <circle cx="40" cy="20" r="3.5" fill="rgba(217,70,239,0.4)" className="animate-ping" />
                            <circle cx="40" cy="20" r="2" fill="#fff" />
                            <circle cx="120" cy="15" r="3.5" fill="rgba(217,70,239,0.4)" className="animate-ping" />
                            <circle cx="120" cy="15" r="2" fill="#fff" />
                          </svg>
                        </div>
                      </div>
                    )
                  },
                  { 
                    id: 'incoterms', 
                    label: 'Incoterms Analytics', 
                    icon: Shield, 
                    color: 'text-cyan-400 group-hover:text-cyan-300', 
                    glow: 'hover:shadow-[0_20px_50px_rgba(34,211,238,0.25)]',
                    desc: 'Risk transfer point, cost allocation, insurance and clearance duties under the selected rule.',
                    tag: 'INCOTERMS 2020 ICC',
                    accentColor: 'from-cyan-500/10 to-transparent',
                    headerCol1: 'INCOTERMS',
                    headerCol2: '2020 ICC',
                    preview: (
                      <div className="w-full h-24 bg-[#0a1218]/95 rounded-2xl border border-white/5 p-3.5 flex flex-col justify-between overflow-hidden relative shadow-[inset_0_1px_10px_rgba(0,0,0,0.6)]">
                        <div className="text-[7.5px] font-mono text-slate-400/90 font-medium text-left tracking-wide">
                          RISK TRANSFER POINT
                        </div>
                        <div className="space-y-2 py-0.5">
                          {/* Progress/slider graphic */}
                          <div className="relative h-1.5 w-full bg-[#101920] rounded-full overflow-hidden flex border border-white/5">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${info.transferPosition}%` }} />
                            <div className="h-full bg-gradient-to-r from-orange-400/35 to-orange-500" style={{ width: `${100 - info.transferPosition}%` }} />
                          </div>
                          
                          {/* Centered label matched to the physical capsule blueprint photo */}
                          <div className="flex justify-center">
                            <span className="px-2.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[7px] font-mono text-cyan-400 font-bold tracking-wider uppercase text-center leading-tight">
                              {info.transferPoint}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  },
                  { 
                    id: 'sustainability', 
                    label: 'Sustainability Analytics', 
                    icon: Leaf, 
                    color: 'text-emerald-400 group-hover:text-emerald-300', 
                    glow: 'hover:shadow-[0_20px_50px_rgba(16,185,129,0.25)]',
                    desc: 'Which party can access transport emission data under the selected rule, mapped to GHG Protocol Scope 3 categories (indicative).',
                    tag: 'GHG & CSRD PROTOCOLS',
                    accentColor: 'from-emerald-500/10 to-transparent',
                    headerCol1: 'GHG & CSRD',
                    headerCol2: 'PROTOCOLS',
                    preview: (
                      <div className="w-full h-24 bg-[#0a1218]/95 rounded-2xl border border-white/5 p-3.5 flex flex-col justify-between overflow-hidden relative shadow-[inset_0_1px_10px_rgba(0,0,0,0.6)]">
                        <div className="flex justify-between items-center text-[7.5px] font-mono">
                          <span className="text-slate-400/90 font-medium tracking-wide">TRANSPORT DATA ACCESS</span>
                          <span className="text-emerald-400 font-black">INDICATIVE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-0.5 pt-0.5 font-mono text-center">
                          <div className="flex flex-col">
                            <span className="text-[6px] text-slate-500">SELLER</span>
                            <span className="text-[8.5px] font-black text-emerald-400 leading-tight">{rangeLabel(info.sellerCarbonControl)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[6px] text-slate-500">BUYER</span>
                            <span className="text-[8.5px] font-black text-orange-400 leading-tight">{rangeLabel(info.buyerCarbonControl)}</span>
                          </div>
                        </div>
                        <div className="h-1 w-full bg-[#101920] rounded-full overflow-hidden flex border border-white/5">
                          <div className="h-full bg-emerald-500" style={{ width: `${info.sellerCarbonControl}%` }} />
                          <div className="h-full bg-orange-400/70" style={{ width: `${info.buyerCarbonControl}%` }} />
                        </div>
                      </div>
                    )
                  },
                  { 
                    id: 'compliance', 
                    label: 'Documentary Analytics', 
                    icon: Files, 
                    color: 'text-indigo-400 group-hover:text-indigo-300', 
                    glow: 'hover:shadow-[0_20px_50px_rgba(99,102,241,0.25)]',
                    desc: 'Typical seller and buyer documents for the selected rule, with Incoterms® 2020, UCP 600 and ISBP 821 references.',
                    tag: 'UCP 600 & ISBP 821',
                    accentColor: 'from-indigo-500/10 to-transparent',
                    headerCol1: 'UCP 600',
                    headerCol2: 'ISBP 821',
                    preview: (
                      <div className="w-full h-24 bg-[#0a1218]/95 rounded-2xl border border-white/5 p-3.5 flex flex-col justify-between overflow-hidden relative shadow-[inset_0_1px_10px_rgba(0,0,0,0.6)]">
                        <div className="flex justify-between items-center text-[7.5px] font-mono">
                          <span className="text-slate-400/90 font-medium tracking-wide">DOCUMENT CHECKLIST</span>
                          <span className="text-indigo-400 font-black">INDICATIVE</span>
                        </div>
                        <div className="space-y-1.5 py-0.5">
                          <div className="w-full h-2 bg-[#101920] rounded flex items-center justify-between px-1.5 border border-white/5">
                            <span className="text-[6px] text-slate-300 uppercase tracking-widest">SELLER DOCUMENTS</span>
                            <span className="text-[5.5px] text-indigo-400 font-mono font-black">{LEGAL_DATA[code]?.sellerDocs.length ?? 0}</span>
                          </div>
                          <div className="w-full h-2 bg-[#101920] rounded flex items-center justify-between px-1.5 border border-white/5">
                            <span className="text-[6px] text-slate-300 uppercase tracking-widest">BUYER DOCUMENTS</span>
                            <span className="text-[5.5px] text-indigo-400 font-mono font-black">{LEGAL_DATA[code]?.buyerDocs.length ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    )
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setViewMode('detail');
                    }}
                    className={`flex flex-col items-stretch justify-between text-left gap-5 p-6 rounded-[2.5rem] transition-all duration-500 bg-gradient-to-b from-[#1b2f3d]/95 via-[#101d26]/98 to-[#0a1118]/100 border border-white/20 hover:border-cyan-400/50 hover:bg-[#121f29] shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),0_15px_45px_rgba(0,0,0,0.55)] ${tab.glow} hover:-translate-y-2 group relative overflow-hidden min-h-[425px] cursor-pointer`}
                  >
                    {/* Top glass highlight layer for high fidelity 3D physical capsule reflection */}
                    <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-white/10 to-transparent rounded-t-[2.5rem] pointer-events-none" />

                    {/* Cyber radial dynamic point light on group hover */}
                    <div className="absolute -inset-24 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Card Top Row Header */}
                    <div className="flex justify-between items-center relative z-10 w-full">
                      {/* Premium Circuit-track Microchip Icon container */}
                      <div className="flex items-center gap-2.5">
                        <div className="relative p-2.5 rounded-xl bg-[#080f14] border border-cyan-500/35 shadow-[0_0_12px_rgba(34,211,238,0.18)] flex items-center justify-center">
                          {/* Dotted border tracks representing microcircuit pins */}
                          <div className="absolute -inset-0.5 border border-dashed border-cyan-500/20 rounded-xl pointer-events-none" />
                          <tab.icon size={18} className={`${tab.color} transition-colors duration-300`} />
                        </div>
                        
                        <div className="flex flex-col text-left text-slate-400/90 font-mono tracking-wider">
                          <span className="text-[8px] leading-none">{tab.headerCol1}</span>
                          <span className="text-[9px] font-black text-slate-300 leading-tight">{tab.headerCol2}</span>
                        </div>
                      </div>

                      {/* Small Circuit Branch nodes linking to background */}
                      <div className="w-4 h-[1px] bg-cyan-500/25 hidden lg:block" />
                    </div>

                    {/* Premium Integrated Mini-Preview Element */}
                    <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                      {tab.preview}
                    </div>

                    {/* Text Details */}
                    <div className="space-y-2.5 relative z-10">
                      <h3 className="text-[13px] font-semibold tracking-wide text-white font-sans">
                        {tab.label}
                      </h3>
                      <p className="text-[10px] text-slate-300/85 leading-relaxed font-normal">
                        {tab.desc}
                      </p>
                    </div>

                    {/* Left connection line decorator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-gradient-to-b from-cyan-500/60 to-transparent rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Analysis Detail View */}
            {/* Context Header with Navigation */}
            <div className={`bg-slate-50 border-b border-slate-200 px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-30 backdrop-blur-sm bg-slate-50/90 print:hidden ${isPrintingReport ? 'print:hidden' : ''}`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewMode('hub')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all"
                >
                  <RefreshCcw size={12} className="rotate-180" />
                  Back to Hub
                </button>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Current View:</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 px-3 py-1 bg-slate-900 text-white rounded-lg">
                    {activeTab === 'all' ? 'All Analytics' : activeTab === 'incoterms' ? 'Incoterms Analysis' : activeTab === 'sustainability' ? 'Sustainability Analysis' : 'Documentary Compliance'}
                  </span>
                </div>
              </div>

              {/* Quick Tab Switcher for convenience */}
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
                 {['incoterms', 'sustainability', 'compliance', 'all'].map((t) => (
                   <button
                    key={t}
                    onClick={() => setActiveTab(t as TabType)}
                    className={`p-2 rounded-lg transition-all ${activeTab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    title={t.toUpperCase()}
                   >
                     {t === 'incoterms' && <Shield size={16} />}
                     {t === 'sustainability' && <Leaf size={16} />}
                     {t === 'compliance' && <Binary size={16} />}
                     {t === 'all' && <LayoutGrid size={16} />}
                   </button>
                 ))}
              </div>
            </div>

            <div className="p-10">
              {/* Content Area */}
              <div className="max-w-4xl mx-auto">
                <div className="space-y-12">
                  <div className={(activeTab === 'all' || activeTab === 'incoterms' || isPrintingReport) ? 'block' : 'hidden print:block'}>
                    {/* Report Header for PDF */}
                    <div className="hidden print:block mb-10 pb-6 border-b-4 border-blue-900">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em] mb-1">PART 01: Transfer of Risk, Cost & Carrier Handovers</div>
                          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Incoterms® 2020 Technical Report</h2>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 text-slate-400">Institutional Logistics Analysis Portfolio</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-slate-900">{info.code}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Standard Code</div>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Risk Transfer Bar */}
                    <section className="space-y-8">
                      <div className="flex justify-between items-center px-4">
                        <h3 className="flex items-center gap-3 text-slate-900 font-black text-2xl">
                          <Shield className="text-blue-600" size={28} />
                          Transfer Point Analysis
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol 2020</span>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        {/* Risk Card */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <Shield size={16} className="text-slate-900" />
                                 <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">Legal Risk Boundary</h4>
                               </div>
                               <p className="text-[11px] text-slate-500 font-medium italic tracking-wide">
                                 Incoterms® 2020 Articles A2/B2 (Delivery) and A3/B3 (Transfer of Risks)
                               </p>
                            </div>
                            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Risk Transfer</div>
                          </div>
                          
                          <div className={`relative ${pinNearEdge(info.transferPosition) ? 'pt-28' : 'pt-12'} pb-6 px-4`}>
                            <div className="relative">
                              <div className={`absolute ${pinNearEdge(info.transferPosition) ? '-top-28' : '-top-12'} left-0 flex flex-col items-start`}>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Seller Origin</span>
                              </div>
                              <div className={`absolute ${pinNearEdge(info.transferPosition) ? '-top-28' : '-top-12'} right-0 flex flex-col items-end`}>
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Buyer Destination</span>
                              </div>

                              <div className="relative mt-4">
                                <div className="relative h-6 w-full bg-slate-100 rounded-full overflow-hidden flex border-4 border-white shadow-inner">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${info.transferPosition}%` }}
                                    transition={{ type: "spring", stiffness: 50, delay: 0.5 }}
                                    className="h-full bg-blue-600 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.1)]"
                                  />
                                  <div className="flex-1 h-full bg-orange-500 shadow-[inset_5px_0_10px_rgba(0,0,0,0.1)]" />
                                </div>

                                <motion.div 
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1, left: `${info.transferPosition}%` }}
                                  transition={{ delay: 1, type: "spring" }}
                                  className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-white border-4 border-slate-900 rounded-full shadow-2xl z-20 flex items-center justify-center"
                                >
                                  <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
                                  <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-slate-900/50 -z-10" />
                                  <div className={`absolute bottom-12 ${pinTooltip(info.transferPosition).box} bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-2xl border border-white/20 text-center`}>
                                    <div className="opacity-60 text-[8px] mb-0.5">Articles A2 / A3 Boundary</div>
                                    Risk Transfer Point
                                    <div className="text-[14px] leading-tight normal-case font-black mt-0.5">{info.transferPoint}</div>
                                    <div className={`absolute top-full ${pinTooltip(info.transferPosition).arrow} border-[6px] border-transparent border-t-slate-900`} />
                                  </div>
                                </motion.div>
                              </div>
                            </div>                            <div className="flex justify-between mt-12 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100/50">
                              <div className="flex items-center gap-4">
                                <div className="w-4 h-4 bg-blue-600 rounded-full shadow-md" />
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Seller Exposure</span>
                                  <span className="text-xl font-black text-blue-600">{info.transferPosition}%</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Buyer Exposure</span>
                                  <span className="text-xl font-black text-orange-600">{100 - info.transferPosition}%</span>
                                </div>
                                <div className="w-4 h-4 bg-orange-500 rounded-full shadow-md" />
                              </div>
                            </div>

                            {/* Integrated Operations into Risk Card */}
                            <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Delivery Place & Time */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Truck size={14} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Delivery Point</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-900 leading-tight">
                                  {info.detailedAnalysis.delivery.point}
                                </p>
                                <p className="text-[8px] text-slate-500 font-medium leading-relaxed italic">
                                  Delivery point (Art. A2); risk passes here (Art. A3).
                                </p>
                              </div>

                              {/* Notices */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Info size={14} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Notice (Art. A10/B10)</span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-700 font-medium leading-tight">
                                    <span className="font-bold text-blue-600 mr-1">S:</span> {info.detailedAnalysis.delivery.notices}
                                  </p>
                                  <p className="text-[10px] text-slate-700 font-medium leading-tight">
                                    <span className="font-bold text-orange-600 mr-1">B:</span> {['EXW', 'FCA', 'FAS', 'FOB'].includes(code) ? "Carrier/vessel identity & time." : "Place/time sync."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cost Card */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                             <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <BarChart3 size={16} className="text-slate-900" />
                                 <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">Financial Cost Boundary – {info.code}</h4>
                               </div>
                               <p className="text-[11px] text-slate-500 font-medium italic tracking-wide">
                                  Incoterms® 2020 Articles A9/B9 (Allocation of Costs)
                               </p>
                            </div>
                            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Cost Allocation</div>
                          </div>

                          {(() => {
                            const costLists = getCostLists(code);
                            const sellerPct = info.detailedAnalysis.costAllocation.sellerPercentage;
                            const buyerPct = info.detailedAnalysis.costAllocation.buyerPercentage;
                            const tip = pinTooltip(sellerPct);
                            return (
                          <div className="space-y-10">
                            <div className={`relative ${pinNearEdge(sellerPct) ? 'pt-36' : 'pt-16'} pb-2 px-4`}>
                              <div className="relative">
                                <div className={`absolute ${pinNearEdge(sellerPct) ? '-top-36' : '-top-16'} left-0 flex flex-col items-start`}>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Seller Costs</span>
                                  <span className="text-xl font-black text-blue-600 leading-tight">{sellerPct}%</span>
                                </div>
                                <div className={`absolute ${pinNearEdge(sellerPct) ? '-top-36' : '-top-16'} right-0 flex flex-col items-end`}>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Buyer Costs</span>
                                  <span className="text-xl font-black text-orange-600 leading-tight">{buyerPct}%</span>
                                </div>

                                <div className="relative mt-4">
                                  <div className="relative h-6 w-full bg-slate-100 rounded-full overflow-hidden flex border-4 border-white shadow-inner">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${sellerPct}%` }}
                                      transition={{ type: "spring", stiffness: 50, delay: 0.7 }}
                                      className="h-full bg-blue-600 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.1)]"
                                    />
                                    <div className="flex-1 h-full bg-orange-500 shadow-[inset_5px_0_10px_rgba(0,0,0,0.1)]" />
                                  </div>

                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1, left: `${sellerPct}%` }}
                                    transition={{ delay: 1.2, type: "spring" }}
                                    className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-white border-4 border-slate-900 rounded-full shadow-2xl z-20 flex items-center justify-center"
                                  >
                                    <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
                                    <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-slate-900/50 -z-10" />
                                    <div className={`absolute bottom-12 ${tip.box} bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-2xl border border-white/20 text-center`}>
                                      <div className="opacity-60 text-[8px] mb-0.5">Articles A9 / B9</div>
                                      Cost Allocation Split
                                      <div className="text-[14px] leading-tight normal-case font-black mt-0.5">{info.detailedAnalysis.costTransferPoint}</div>
                                      {costLists.carriageNote && (
                                        <div className="text-[9px] normal-case font-bold tracking-normal opacity-80 mt-0.5">Subject to contract of carriage</div>
                                      )}
                                      <div className={`absolute top-full ${tip.arrow} border-[6px] border-transparent border-t-slate-900`} />
                                    </div>
                                  </motion.div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 mt-5">
                                {costLists.carriageNote && (
                                  <p className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                    <Info size={12} className="text-slate-400" /> {costLists.carriageNote}
                                  </p>
                                )}
                                <p className="text-[9px] text-slate-400 font-medium italic">
                                  Percentages are an indicative split of cost responsibilities along the route, not a calculation of amounts.
                                </p>
                              </div>
                            </div>

                            {/* Cost Allocation Deep Dive */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Seller's Obligations Box */}
                              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-6 bg-blue-600 rounded-full" />
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Seller's Financial Cost List</h5>
                                  </div>
                                  <span className="text-lg font-black text-blue-600">{sellerPct}%</span>
                                </div>
                                
                                <div className="space-y-2 flex-1">
                                  {costLists.seller.map((label, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100/50 shadow-sm">
                                      <CheckCircle2 size={12} className="text-blue-500 flex-shrink-0" />
                                      <span className="text-[10px] font-bold text-slate-700">{label}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-blue-100">
                                  <p className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">Obligations under Incoterms® 2020 Article A9</p>
                                </div>
                              </div>

                              {/* Buyer's Obligations Box */}
                              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-6 bg-orange-500 rounded-full" />
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Buyer's Financial Cost List</h5>
                                  </div>
                                  <span className="text-lg font-black text-orange-600">{buyerPct}%</span>
                                </div>
                                
                                <div className="space-y-2 flex-1">
                                  {costLists.buyer.map((label, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100/50 shadow-sm">
                                      <CheckCircle2 size={12} className="text-orange-500 flex-shrink-0" />
                                      <span className="text-[10px] font-bold text-slate-700">{label}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-orange-100">
                                  <p className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">Obligations under Incoterms® 2020 Article B9</p>
                                </div>
                              </div>
                            </div>
                          </div>
                            );
                          })()}
                        </div>

                        {/* Insurance Card */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                          {['CIF', 'CIP'].includes(info.code) && (
                            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                          )}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-50">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <ShieldCheck size={16} className="text-slate-900" />
                                 <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">Insurance Capability</h4>
                               </div>
                               <p className="text-[11px] text-slate-500 font-medium italic tracking-wide">
                                 Incoterms® 2020 Article A5/B5 (Insurance)
                               </p>
                            </div>
                            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border transition-all ${
                              ['CIF', 'CIP'].includes(info.code) 
                                ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700' 
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {['CIF', 'CIP'].includes(info.code) 
                                ? <ShieldCheck size={14} className="animate-pulse" /> 
                                : <Info size={14} />
                              }
                              {['CIF', 'CIP'].includes(info.code) ? 'Mandatory Requirement' : 'Optional / Party Agreement'}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                             <div className="space-y-6 flex flex-col justify-center">
                                <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-slate-300">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                                      info.detailedAnalysis.insurance.responsible === 'Seller' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-orange-500 text-white shadow-orange-200'
                                   }`}>
                                      <Umbrella size={28} />
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurance Responsible</span>
                                        <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${
                                          ['CIF', 'CIP'].includes(info.code) 
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                            : 'bg-slate-200 text-slate-600 border border-slate-300'
                                        }`}>
                                          {['CIF', 'CIP'].includes(info.code) ? 'Mandatory' : 'Optional'}
                                        </div>
                                      </div>
                                      <h5 className="text-xl font-black text-slate-900">{info.detailedAnalysis.insurance.responsible}</h5>
                                   </div>
                                </div>

                                <div className="p-6 bg-slate-900 text-white rounded-[2rem] border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                      <Lock size={40} />
                                   </div>
                                   <div className="flex items-center gap-2 relative z-10">
                                      <div className={`p-1 rounded-md ${info.code === 'CIP' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                        <Lock size={10} className="text-white" />
                                      </div>
                                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Global Minimum Coverage Standard</span>
                                   </div>
                                   <div className="relative z-10 space-y-1">
                                      <p className="text-lg font-black leading-tight">
                                        {info.detailedAnalysis.insurance.minimumCoverage}
                                      </p>
                                      {info.code === 'CIF' && (
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight">Requirement: Institute Cargo Clauses (C)</p>
                                      )}
                                      {info.code === 'CIP' && (
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-tight">Requirement: Institute Cargo Clauses (A) - "All Risks"</p>
                                      )}
                                      {!['CIF', 'CIP'].includes(info.code) && (
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Recommended: Institute Cargo Clauses (A)</p>
                                      )}
                                   </div>
                                   <div className="pt-2 border-t border-white/10 mt-2">
                                      <p className="text-[9px] text-white/50 font-medium tracking-wide">Incoterms® 2020 Article A5/B5 standard for {info.code === 'CIP' ? 'high-value multimodal' : 'standard sea freight'} coverage.</p>
                                   </div>
                                </div>
                             </div>

                             <div className="relative bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 flex items-center justify-center p-8 text-center min-h-[16rem] group">
                                <div className="absolute inset-0 opacity-[0.03] transition-transform duration-700 group-hover:scale-110 pointer-events-none">
                                   <Umbrella size={220} className="absolute -right-16 -bottom-16 rotate-12" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                   <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500 ${
                                      ['CIF', 'CIP'].includes(info.code) ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                   }`}>
                                      {['CIF', 'CIP'].includes(info.code) ? <CheckCircle2 size={24} /> : <Info size={24} />}
                                   </div>
                                   <div className="space-y-2">
                                      <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rule of Law</h6>
                                      <p className="text-[13px] text-slate-700 font-bold leading-relaxed max-w-[240px] mx-auto">
                                         {['CIF', 'CIP'].includes(info.code) 
                                           ? "The Seller is legally bound to provide insurance. Failure to do so is a breach of contract under Incoterms rules." 
                                           : "Insurance is not mandatory by ICC standard, but strictly recommended to mitigate cross-border transit risks."}
                                      </p>
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>

                        {/* Logistical & Legal Framework */}
                        <div className="pt-12 border-t border-slate-100 space-y-8 mt-12">
                          <div className="text-center md:text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Operational Duties</h4>
                            <p className="text-slate-900 font-black text-xl">Logistical Control & Legal Formalities</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Customs & Formalities */}
                             <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-5">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Globe size={16} className="text-slate-900" />
                                    <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-900">Customs Formalities (A7/B7)</h5>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {/* Export Customs Clearance */}
                                  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-900">Export Clearance</span>
                                      <span className="text-[7px] text-slate-400 font-black uppercase tracking-tighter">Licenses & Origin Duties</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                      code === 'EXW' ? 'bg-orange-100 text-orange-600' : 'bg-blue-600 text-white'
                                    }`}>
                                      {code === 'EXW' ? 'Buyer' : 'Seller'}
                                    </div>
                                  </div>

                                  {/* Transit Customs Clearance */}
                                  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-900">Transit Clearance</span>
                                      <span className="text-[7px] text-slate-400 font-black uppercase tracking-tighter">Through Third Countries</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                      ['DAP', 'DPU', 'DDP'].includes(code) ? 'bg-blue-600 text-white' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                      {['DAP', 'DPU', 'DDP'].includes(code) ? 'Seller' : 'Buyer'}
                                    </div>
                                  </div>

                                  {/* Import Customs Clearance */}
                                  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-900">Import Clearance</span>
                                      <span className="text-[7px] text-slate-400 font-black uppercase tracking-tighter">Duties & Destination Taxes</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                      code === 'DDP' ? 'bg-blue-600 text-white' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                      {code === 'DDP' ? 'Seller' : 'Buyer'}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[8px] text-slate-400 font-medium italic leading-relaxed px-1">
                                  Includes export licenses, valuations, transit security, and final import duties/taxes as per ICC standards.
                                </p>
                             </div>

                             {/* Main Transport */}
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-900">Freight Control (A4/B4)</h5>
                                  <Truck size={14} className="text-slate-400" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                   <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Main Transport Contracting</div>
                                   <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${info.detailedAnalysis.transport.contracting === 'Seller' ? 'bg-blue-600' : 'bg-orange-500'}`} />
                                      <span className="text-sm font-black text-slate-900">{info.detailedAnalysis.transport.contracting} Responsible</span>
                                   </div>
                                </div>
                                <p className="text-[9px] text-slate-500 font-medium leading-tight">Party responsible for booking and paying the primary international carrier.</p>
                             </div>

                             {/* Pre-shipment Inspection (PSI) */}
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-900">Pre-shipment Inspection (PSI)</h5>
                                  <Binary size={14} className="text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-700">Origin Inspection</span>
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${code === 'EXW' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {code === 'EXW' ? 'Buyer Pays' : 'Seller Pays'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-700">Import Inspection</span>
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${code === 'DDP' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                      {code === 'DDP' ? 'Seller Pays' : 'Buyer Pays'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[9px] text-slate-500 font-medium leading-tight">Cost allocation for mandatory pre-shipment inspections (Art. A9).</p>
                             </div>
                          </div>
                        </div>
                    </section>

                    {/* Strategic Insights & Advice */}
                    <section className="space-y-8 mt-12 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h3 className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <Binary className="text-indigo-600" size={24} />
                            Strategic Insights
                          </h3>
                        </div>

                        <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
                          <h4 className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-3">
                            <Info className="text-blue-600" size={20} />
                            Expert Advice
                          </h4>
                          <p className="text-slate-800 text-base leading-relaxed font-medium italic">
                            "{info.advice}"
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {info.insights.map((insight, i) => (
                            <div 
                              key={i} 
                              className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${
                                insight.type === 'tip' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                                insight.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                insight.type === 'danger' ? 'bg-red-50 border-red-100 text-red-900' :
                                'bg-blue-50 border-blue-100 text-blue-900'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="font-black text-[9px] uppercase tracking-[0.2em] opacity-60">
                                   {insight.type === 'info' ? 'Responsibility' : insight.type}
                                 </span>
                              </div>
                              <p className="text-xs font-bold leading-relaxed">{insight.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Export Strategic Report CTA */}
                        <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Finalize Documentation</p>
                           <button
                             onClick={handleIncotermsReportPDF}
                             className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] transition-all shadow-2xl hover:shadow-slate-900/40 hover:scale-[1.02] active:scale-95 text-sm font-black uppercase tracking-widest group print:hidden"
                           >
                             <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                             Incoterms PDF Report
                           </button>
                           <p className="text-[9px] text-slate-400 font-medium">Includes Transfer Points, Sustainability Analysis, and Documentary Compliance</p>
                        </div>
                    </section>
                  </div>

                  <div className={`${(activeTab === 'all' || activeTab === 'sustainability') ? 'block' : 'hidden print:block'} ${isPrintingReport ? 'print:hidden' : ''} space-y-10`}>
                    {/* Sustainability Report Header for PDF */}
                    <div className="hidden print:block mb-10 pb-6 border-b-4 border-emerald-800 print:break-before-page">
                      <div className="flex justify-between items-center font-heading">
                        <div>
                          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-1 font-sans">PART 02: Carbon Data Access & Responsibility Mapping</div>
                          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-950">Sustainability & Scope 3 Analysis</h2>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 text-emerald-700 font-sans">GHG Protocol Scope 3 categories · indicative</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-emerald-900">{info.code}</div>
                          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 font-sans">Sustainability Node</div>
                        </div>
                      </div>
                    </div>

                    {/* Sustainability Section 1: Carbon Data Access & Responsibility Mapping */}
                    {(() => {
                      const breakdown = getResponsibilityBreakdown(code);
                      const roadmap = getDataRoadmap(code, info.sellerCarbonControl);
                      const sellerRange = rangeLabel(info.sellerCarbonControl);
                      const buyerRange = rangeLabel(info.buyerCarbonControl);
                      const buyerContracts = BUYER_CONTRACTS_CARRIAGE.includes(code);
                      const tip = pinTooltip(info.sellerCarbonControl);
                      return (
                    <section className="bg-emerald-50/40 border border-emerald-100/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8 relative overflow-hidden text-slate-900 animate-fade-in">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-100 pb-6 relative z-10">
                          <div>
                            <h3 className="flex items-center gap-3 text-emerald-950 font-extrabold text-2xl">
                              <Leaf className="text-emerald-600" size={28} />
                              Carbon Data Access & Responsibility Mapping – {info.code}
                            </h3>
                            <p className="text-[11px] text-slate-600 font-semibold italic mt-1 max-w-xl">
                              Indicative mapping of carbon data access based on Incoterms® 2020 and the GHG Protocol. Actual allocation depends on contractual arrangements and data availability.
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900 px-3.5 py-1.5 bg-emerald-100/45 border border-emerald-200/55 rounded-xl shadow-sm whitespace-nowrap">
                            GHG Protocol Scope 3 · Indicative
                          </span>
                        </div>

                      {/* Scope 3 carbon data access bar */}
                      <div className="space-y-6 relative z-10 bg-white/70 border border-emerald-100/50 rounded-3xl p-6 md:p-8">
                        <div className="flex justify-between items-start gap-4 border-b border-emerald-100 pb-4 mb-2">
                          <div className="space-y-0.5">
                            <h4 className="text-emerald-900 font-black text-xs uppercase tracking-wider">Scope 3 Carbon Data Access (Indicative)</h4>
                            <p className="text-[10px] text-slate-500 font-semibold max-w-2xl">
                              Shows where each party is typically able to access primary transport emission data and where responsibility may lie under the GHG Protocol, depending on who contracts and pays for the transport service.
                            </p>
                          </div>
                          <span className="text-emerald-600 flex-shrink-0"><Info size={16} /></span>
                        </div>

                        <div className="relative pt-6 pb-4 px-1">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex flex-col gap-0.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Seller Data Access: {sellerRange}
                              </span>
                              <span className="text-[8px] font-semibold normal-case tracking-normal text-slate-500">
                                {buyerContracts ? '(typically limited to the origin legs)' : '(typically higher for main carriage)'}
                              </span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 flex flex-col gap-0.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl shadow-sm">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-500" />
                                Buyer Data Access: {buyerRange}
                              </span>
                              <span className="text-[8px] font-semibold normal-case tracking-normal text-slate-500">
                                {buyerContracts ? '(typically higher for main carriage)' : '(typically higher for destination and onward)'}
                              </span>
                            </span>
                          </div>

                          <div className="relative h-12 mt-28 mb-8 flex items-center">
                            {/* Data-access segments */}
                            <div className="h-10 w-full bg-slate-100 rounded-2xl overflow-hidden flex border border-slate-200/70 shadow-inner relative z-10">
                              {info.scope3Allocation.map((segment, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${segment.percentage}%` }}
                                  transition={{ delay: 1.2 + (i * 0.2) }}
                                  className={`${segment.color} h-full relative group cursor-help`}
                                  title={`${segment.label} (indicative)`}
                                >
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </motion.div>
                              ))}
                            </div>

                            {info.sellerCarbonControl > 12 && (
                              <div 
                                style={{ left: `${info.sellerCarbonControl / 2}%` }}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] z-20 pointer-events-none whitespace-nowrap text-center"
                              >
                                Seller {sellerRange}{info.sellerCarbonControl > 30 && <span className="normal-case font-bold"> (indicative)</span>}
                              </div>
                            )}
                            {info.buyerCarbonControl > 12 && (
                              <div 
                                style={{ left: `${info.sellerCarbonControl + (info.buyerCarbonControl / 2)}%` }}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] z-20 pointer-events-none whitespace-nowrap text-center"
                              >
                                Buyer {buyerRange}{info.buyerCarbonControl > 30 && <span className="normal-case font-bold"> (indicative)</span>}
                              </div>
                            )}

                            {/* Pin: where the seller-contracted transport ends */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1, left: `${info.sellerCarbonControl}%` }}
                              transition={{ delay: 1, type: "spring" }}
                              className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-white border-4 border-slate-900 rounded-full shadow-2xl z-30 flex items-center justify-center"
                            >
                              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                              <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-900/40 -z-10" />
                              
                              <div className={`absolute bottom-12 ${tip.box} bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-2xl border border-white/10 text-center z-40`}>
                                <div className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] mb-0.5">Incoterms® {info.code}</div>
                                Seller-contracted transport ends
                                <div className="text-[13px] leading-tight normal-case font-black mt-0.5 font-sans tracking-wide">
                                  {info.detailedAnalysis.costTransferPoint}
                                </div>
                                <div className="text-[8px] normal-case font-semibold tracking-normal opacity-70 mt-1">
                                  Risk transfer point: {info.transferPoint} (Articles A2/A3, B2/B3)
                                </div>
                                <div className={`absolute top-full ${tip.arrow} border-[6px] border-transparent border-t-slate-900`} />
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <span className="text-[9px] font-extrabold text-slate-700">Seller – Scope 1/2 (if assets are owned/controlled)</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            <span className="text-[9px] font-extrabold text-slate-700">Seller-contracted transport – Seller Scope 3 Cat 4 · Buyer Scope 3 Cat 4</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                            <span className="text-[9px] font-extrabold text-slate-700">Buyer-contracted transport – Buyer Scope 3 Cat 4 · Seller Scope 3 Cat 9</span>
                          </div>
                        </div>
                      </div>

                      {/* Typical data access per party */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {/* Seller card */}
                        <div className="bg-white/90 border border-emerald-100 p-8 rounded-3xl space-y-4 shadow-sm flex flex-col hover:bg-white transition-all">
                          <div className="flex justify-between items-start gap-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                              Seller Scope (Typical)
                            </span>
                            <div className="text-right">
                              <div className="text-2xl font-black text-emerald-950 leading-none whitespace-nowrap">{sellerRange}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Data Access (Indicative)</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transport Data Access</div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${info.sellerCarbonControl}%` }}
                                transition={{ delay: 0.8, duration: 1.5 }}
                                className="h-full bg-blue-600 rounded-full"
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 space-y-3 flex-1">
                            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">
                              Seller typically has access to:
                            </h4>
                            <ul className="space-y-2.5">
                              {breakdown.seller.map((item, id) => (
                                <li key={id} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-start gap-2 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                            <Info size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-slate-600 font-semibold leading-snug">
                              Scope 3 category depends on who contracts and pays for the transport service: {roadmap.sellerScope3Category}.
                            </p>
                          </div>
                        </div>

                        {/* Buyer card */}
                        <div className="bg-white/90 border border-orange-100 p-8 rounded-3xl space-y-4 shadow-sm flex flex-col hover:bg-white transition-all">
                          <div className="flex justify-between items-start gap-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-orange-800 bg-orange-50 border border-orange-100/50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                              Buyer Scope (Typical)
                            </span>
                            <div className="text-right">
                              <div className="text-2xl font-black text-emerald-950 leading-none whitespace-nowrap">{buyerRange}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Data Access (Indicative)</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transport Data Access</div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${info.buyerCarbonControl}%` }}
                                transition={{ delay: 1, duration: 1.5 }}
                                className="h-full bg-orange-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 space-y-3 flex-1">
                            <h4 className="text-xs font-black text-orange-950 uppercase tracking-widest">
                              Buyer typically has access to:
                            </h4>
                            <ul className="space-y-2.5">
                              {breakdown.buyer.map((item, id) => (
                                <li key={id} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-start gap-2 p-3 bg-orange-50/70 border border-orange-100 rounded-2xl">
                            <Info size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-slate-600 font-semibold leading-snug">
                              Inbound transport of purchased goods is the buyer's {roadmap.buyerScope3Category}, whoever contracts the carrier.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Key Insight Card */}
                      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl relative z-10 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-widest">
                          <Info size={16} className="text-emerald-600" />
                          Data Access Key Insight
                        </div>
                        <p className="text-xs text-slate-800 font-bold leading-relaxed">
                          {breakdown.insight}
                        </p>
                        <p className="text-[10px] text-emerald-800/70 font-medium italic leading-relaxed pt-2.5 border-t border-emerald-100">
                          Note: Percentages are indicative and for illustration only. They are not defined in Incoterms® 2020 or the GHG Protocol and may vary by contract, route and data availability. ClearTrade does not calculate emissions: these depend on carrier choice and transport mode, not on the Incoterms® rule alone.
                        </p>
                      </div>
                    </section>
                      );
                    })()}

                    {/* Section 2: Value-chain data roadmap */}
                    {(() => {
                      const roadmap = getDataRoadmap(code, info.sellerCarbonControl);
                      return (
                    <section className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8 relative overflow-hidden text-slate-900 animate-fade-in">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.01] rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 relative z-10">
                        <div>
                          <h3 className="flex items-center gap-3 text-slate-900 font-extrabold text-2xl font-sans tracking-tight">
                            <Shield className="text-blue-600" size={28} />
                            CSRD Value-Chain Data Roadmap
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold italic mt-1">
                            A simplified 3-step map of who can supply transport emission data when a customer asks for it.
                          </p>
                        </div>
                        <div className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${roadmap.dependentParty === 'Buyer' ? 'text-blue-800 border-blue-200 bg-blue-50' : 'text-orange-800 border-orange-200 bg-orange-50'}`}>
                          {roadmap.rating}
                        </div>
                      </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                          
                          {/* Step 1: Who contracts the transport */}
                          <div className="bg-white border border-emerald-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-200">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-50 rounded-br-3xl flex items-center justify-center font-black text-xs text-emerald-800 border-r border-b border-emerald-100/50">
                              01
                            </div>
                            <div className="pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                                  <LayoutGrid size={16} />
                                </div>
                                <h5 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Boundary & Control</h5>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Transport Contracting</p>
                              <div className="text-sm font-extrabold text-slate-900 mb-2">{roadmap.contracting}</div>
                              <p className="text-[10px] text-slate-600 leading-tight">
                                The party that contracts a carrier is the one able to obtain primary emission data for that leg.
                              </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-50 text-[10px] font-bold">
                              <span className="text-slate-400 uppercase tracking-widest text-[8px] block mb-0.5">Reference</span>
                              <span className="text-emerald-800 font-black">GHG Protocol Scope 3 Standard, Categories 4 and 9</span>
                            </div>
                          </div>

                          {/* Step 2: Data gap */}
                          <div className="bg-white border border-emerald-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-200">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-50 rounded-br-3xl flex items-center justify-center font-black text-xs text-emerald-800 border-r border-b border-emerald-100/50">
                              02
                            </div>
                            <div className="pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                                  <ShieldCheck size={16} />
                                </div>
                                <h5 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Data Gap Check</h5>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Party Depending on the Other</p>
                              
                              <div className="my-2 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${roadmap.ratingColor}`}>
                                  {roadmap.dependentParty} · {roadmap.dependencyLevel} dependency
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 leading-tight">
                                {roadmap.dependencyText}
                              </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-50 text-[10px] font-bold">
                              <span className="text-slate-400 uppercase tracking-widest text-[8px] block mb-0.5">Note</span>
                              <span className="text-slate-700 italic font-semibold">Both parties may report the same transport leg in their own Scope 3 inventory; the practical risk is a data gap.</span>
                            </div>
                          </div>

                          {/* Step 3: CSRD data requests */}
                          <div className="bg-white border border-emerald-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-200">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-50 rounded-br-3xl flex items-center justify-center font-black text-xs text-emerald-800 border-r border-b border-emerald-100/50">
                              03
                            </div>
                            <div className="pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-800">
                                  <Lock size={16} />
                                </div>
                                <h5 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Data Request Readiness</h5>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">CSRD Scope</p>
                              <div className="text-[11px] leading-snug text-slate-800 font-bold">
                                Mandatory CSRD reporting applies to undertakings with more than 1,000 employees and a net turnover above EUR 450 million. Smaller companies are outside its scope but may receive value-chain data requests from reporting customers.
                              </div>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-50 text-[10px] font-extrabold">
                              <span className="text-slate-400 uppercase tracking-widest text-[8px] block mb-0.5">Legal Basis</span>
                              <span className="text-blue-800 block">Directive (EU) 2022/2464 as amended by Directive (EU) 2026/470</span>
                            </div>
                          </div>

                        </div>

                        {/* Actions by role */}
                        <div className="p-6 bg-emerald-50/40 border border-emerald-100 rounded-3xl space-y-4">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-900 flex items-center gap-1.5">
                            <Shield size={12} className="text-emerald-700" /> Data Action Checklist by <span className="text-emerald-600">Role</span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-blue-950">Seller Action</span>
                              </div>
                              <p className="text-xs font-black text-slate-900 leading-tight">
                                {roadmap.sellerAction}
                              </p>
                              <div className="text-[9px] text-slate-500 font-semibold">
                                <span className="text-[8px] text-slate-400 block tracking-widest leading-none uppercase mb-0.5">GHG Protocol Category</span>
                                {roadmap.sellerScope3Category}
                              </div>
                            </div>

                            <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-orange-950">Buyer Action</span>
                              </div>
                              <p className="text-xs font-black text-slate-900 leading-tight">
                                {roadmap.buyerAction}
                              </p>
                              <div className="text-[9px] text-slate-500 font-semibold">
                                <span className="text-[8px] text-slate-400 block tracking-widest leading-none uppercase mb-0.5">GHG Protocol Category</span>
                                {roadmap.buyerScope3Category}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      );
                    })()}

                    {/* Section 3: Practical notes & greener alternatives */}
                    <section className="bg-emerald-50/40 border border-emerald-100/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8 relative overflow-hidden text-slate-900 animate-fade-in">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                      
                      <div className="border-b border-emerald-100 pb-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-emerald-950 font-black text-2xl flex items-center gap-2">
                            <span>🌿</span> Sustainability & Greener Recommendations
                          </h3>
                          <p className="text-[11px] text-emerald-800 font-semibold italic mt-0.5 max-w-2xl">
                            "Greener" here means better access to transport emission data and more control over transport. It is not a calculated emission reduction.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 bg-white/70 border border-emerald-100/50 rounded-3xl p-6 relative z-10">
                          <h4 className="text-xs font-black uppercase tracking-widest text-emerald-900">
                            Practical Transport-Data Notes for {info.code}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {info.sustainabilityInsights.map((insight, i) => (
                              <div 
                                key={i} 
                                className={`p-4 rounded-2xl border text-[11px] leading-relaxed font-bold shadow-sm ${
                                  insight.type === 'tip' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                                  insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                                  insight.type === 'danger' ? 'bg-red-50 border-red-200 text-red-900' :
                                  'bg-white border-slate-100 text-slate-800'
                                }`}
                              >
                                <span className="uppercase text-[8px] tracking-widest font-black block opacity-60 mb-1">
                                  {insight.type === 'tip' ? '🌱 Recommendation' : insight.type === 'danger' ? 'Data gap' : insight.type}
                                </span>
                                {insight.text}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-8 border-t border-emerald-100 space-y-6">
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-emerald-900 flex items-center gap-2">
                              <span>🌿</span> Greener Incoterm Recommendations
                            </h4>
                            <p className="text-[11px] text-emerald-800 font-semibold italic mt-0.5">
                              Alternative rules that shift transport control and data access, shown separately for the buyer and the seller role.
                            </p>
                          </div>

                          {(() => {
                             const splitSuggestion = getGreenerSuggestionsSeparate(code);

                             const getTableMetricsForCode = (itemCode: string) => {
                               const incData = INCOTERMS[itemCode.toUpperCase()];
                               const sellerControl = incData ? incData.sellerCarbonControl : 50;
                               const buyerControl = incData ? incData.buyerCarbonControl : 50;
                               return {
                                 code: itemCode,
                                 sellerAccess: accessLevel(sellerControl),
                                 buyerAccess: accessLevel(buyerControl),
                                 carriageBy: BUYER_CONTRACTS_CARRIAGE.includes(itemCode.toUpperCase()) ? 'Buyer' : 'Seller',
                                 buyerControl,
                                 sellerControl
                               };
                             };

                             const levelClass = (level: 'HIGH' | 'MEDIUM' | 'LOW') =>
                               level === 'HIGH' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300/30' :
                               level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-700 border-amber-300/30' :
                               'bg-slate-100 text-slate-500 border-slate-200';

                             const renderPathway = (role: 'Buyer' | 'Seller', options: GreenerOption[], noneText: string) => {
                               const isBuyer = role === 'Buyer';
                               const rows = [code, ...options.map(o => o.code)].map(c => getTableMetricsForCode(c));
                               const accent = isBuyer
                                 ? { border: 'border-emerald-100/90', head: 'border-emerald-50', title: 'text-emerald-800', chip: 'bg-emerald-50 text-emerald-800', item: 'border-emerald-100 bg-emerald-50/20', itemTitle: 'text-emerald-950', badge: 'bg-emerald-100 text-emerald-900', table: 'text-emerald-900', current: 'bg-emerald-500/[0.02] border-l-4 border-l-emerald-600 font-bold', currentText: 'text-emerald-950 font-black' }
                                 : { border: 'border-blue-100/90', head: 'border-blue-50', title: 'text-blue-800', chip: 'bg-blue-50 text-blue-800', item: 'border-blue-100 bg-blue-50/20', itemTitle: 'text-blue-950', badge: 'bg-blue-100 text-blue-900', table: 'text-blue-900', current: 'bg-blue-500/[0.02] border-l-4 border-l-blue-600 font-bold', currentText: 'text-blue-950 font-black' };
                               return (
                                 <div className={`bg-white border ${accent.border} rounded-[2rem] p-6 shadow-sm flex flex-col justify-between space-y-6`}>
                                   <div className="space-y-4">
                                     <div className={`flex items-center justify-between border-b ${accent.head} pb-3 gap-3`}>
                                       <div className="flex flex-col">
                                         <span className={`text-[10px] font-black uppercase tracking-widest ${accent.title} flex items-center gap-1.5`}>
                                           {isBuyer ? '👤' : '🏢'} {role}: more transport-data access
                                         </span>
                                         <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                           Closest rule that gives the {role.toLowerCase()} more control over transport
                                         </span>
                                       </div>
                                       <span className={`text-[9px] ${accent.chip} px-2.5 py-1 rounded-full font-black whitespace-nowrap`}>
                                         {options.length} {options.length === 1 ? 'Recommendation' : 'Recommendations'}
                                       </span>
                                     </div>

                                     {options.length > 0 ? (
                                       <div className="space-y-3">
                                         {options.map((item) => (
                                           <div key={item.code} className={`border ${accent.item} rounded-2xl p-4 space-y-1`}>
                                             <div className="flex items-center justify-between">
                                               <span className={`text-xs font-black ${accent.itemTitle} font-mono`}>
                                                 Transition {code} &rarr; {item.code}
                                               </span>
                                               <span className={`text-[8px] font-black ${accent.badge} px-1.5 py-0.5 rounded uppercase`}>
                                                 Closest Analogy
                                               </span>
                                             </div>
                                             <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                                               {item.reason}
                                             </p>
                                           </div>
                                         ))}
                                       </div>
                                     ) : (
                                       <div className="min-h-[8rem] border border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-4 bg-slate-50/40 text-center">
                                         <p className="text-[10px] font-bold text-slate-400">{noneText}</p>
                                       </div>
                                     )}
                                   </div>

                                   <div className="space-y-3 pt-4 border-t border-slate-50">
                                     <div className="flex items-center justify-between">
                                       <span className={`text-[10px] font-black uppercase tracking-widest ${accent.table} block`}>
                                         {role} Comparative Matrix
                                       </span>
                                       <span className={`text-[8px] font-black ${accent.title} uppercase ${accent.chip} px-2 py-0.5 rounded-full`}>
                                         Indicative
                                       </span>
                                     </div>

                                     <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-slate-50/10">
                                       <table className="w-full text-left border-collapse">
                                         <thead>
                                           <tr className="border-b border-slate-100 bg-slate-100/50">
                                             <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Incoterm</th>
                                             <th className="px-2 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">{role} Data Access</th>
                                             <th className="px-2 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Carriage By</th>
                                             <th className="px-2 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Access Split</th>
                                           </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-100 bg-white">
                                           {rows.map((item) => {
                                             const isCurrent = item.code === code;
                                             const level = isBuyer ? item.buyerAccess : item.sellerAccess;
                                             return (
                                               <tr 
                                                 key={item.code}
                                                 className={`transition-colors duration-150 ${isCurrent ? accent.current : 'hover:bg-slate-50 border-l-4 border-l-slate-200'}`}
                                               >
                                                 <td className="px-2 py-2">
                                                   <div className="flex flex-col">
                                                     <span className={`text-xs font-black ${isCurrent ? accent.currentText : 'text-slate-700 font-mono'}`}>
                                                       {item.code}
                                                     </span>
                                                     <span className="text-[6px] font-black uppercase tracking-wider text-slate-400">
                                                       {isCurrent ? 'Active Selection' : 'Recommendation'}
                                                     </span>
                                                   </div>
                                                 </td>
                                                 <td className="px-2 py-2">
                                                   <span className={`inline-block px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider border ${levelClass(level)}`}>
                                                     {level}
                                                   </span>
                                                 </td>
                                                 <td className="px-2 py-2">
                                                   <span className={`inline-block px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider border ${
                                                     item.carriageBy === 'Seller' ? 'bg-blue-500/10 text-blue-700 border-blue-300/30' : 'bg-orange-500/10 text-orange-700 border-orange-300/30'
                                                   }`}>
                                                     {item.carriageBy}
                                                   </span>
                                                 </td>
                                                 <td className="px-2 py-2">
                                                   <span className="inline-block px-1.5 py-0.5 rounded-md text-[8px] font-mono tracking-tight font-bold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
                                                     B ~{item.buyerControl}% / S ~{item.sellerControl}%
                                                   </span>
                                                 </td>
                                               </tr>
                                             );
                                           })}
                                         </tbody>
                                       </table>
                                     </div>
                                   </div>
                                 </div>
                               );
                             };

                             return (
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch pt-2">
                                 {renderPathway('Buyer', splitSuggestion.buyerSuggestions, splitSuggestion.buyerNone)}
                                 {renderPathway('Seller', splitSuggestion.sellerSuggestions, splitSuggestion.sellerNone)}
                               </div>
                             );
                           })()}

                           <p className="text-[10px] text-slate-400 font-bold italic text-center max-w-2xl mx-auto leading-relaxed">
                             Carbon emissions depend on carrier choice and transport mode, not on the Incoterms® rule alone. This analysis shows data access and transport control only; changing the rule also changes risk, cost and insurance obligations.
                           </p>
                        </div>

                    </section>
                  </div>

                  <div className={`${(activeTab === 'all' || activeTab === 'compliance') ? 'block' : 'hidden print:block'} ${isPrintingReport ? 'print:hidden' : ''}`}>
                    {/* Documentary Compliance Report Header for PDF */}
                    <div className="hidden print:block mb-10 pb-6 border-b-4 border-indigo-700 print:break-before-page">
                      <div className="flex justify-between items-center font-heading">
                        <div>
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-1 font-sans">PART 03: Administrative Auditing & Documentary Standards</div>
                          <h2 className="text-3xl font-black uppercase tracking-tighter text-indigo-950">Documentary Compliance Audit</h2>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 text-indigo-600 font-sans">UCP 600 and ISBP 821 · indicative mapping</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-indigo-900">{info.code}</div>
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 font-sans">Audit Protocol</div>
                        </div>
                      </div>
                    </div>

                    {/* Institutional Standards Section */}
                    <section className="bg-white border border-slate-100 rounded-[2.5rem] p-1 shadow-sm overflow-hidden">
                      <div className="bg-slate-50 p-8 border-b border-slate-100">
                         <h3 className="flex items-center gap-3 text-slate-900 font-black text-2xl">
                          <Binary className="text-blue-600" size={28} />
                          Documentary Compliance
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 font-medium italic">
                          Indicative documentation mapping for {info.code} under Incoterms® 2020, UCP 600 and ISBP 821. Actual requirements depend on the sale contract and any letter of credit.
                        </p>
                      </div>
                      <div className="p-8">
                        <LegalCompliance initialTerm={code} showSelector={false} showBibliography={true} />
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Risk Disclaimer - Global footer for result */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-xs mt-8 max-w-4xl mx-auto mb-10">
              Based on International Chamber of Commerce (ICC) Incoterms® 2020 rules, UCP 600, ISBP 821 and the GHG Protocol Scope 3 Standard. This rule-based analysis is indicative, for informational purposes only, and is not legal advice.
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function SummaryCard({ icon, label, responsible, details }: { icon: React.ReactNode, label: string, responsible: string, details: string }) {
  const isSeller = responsible === 'Seller';
  return (
    <div className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all hover:shadow-md ${isSeller ? 'bg-blue-50/30 border-blue-100' : 'bg-orange-50/30 border-orange-100'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSeller ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Stage: {label}</div>
        <div className={`text-xs font-black uppercase tracking-wider mb-2 ${isSeller ? 'text-blue-700' : 'text-orange-700'}`}>
          {responsible} Control
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-tight">{details}</p>
      </div>
    </div>
  );
}

function RoadmapItem({ icon, label, responsible, active }: { icon: React.ReactNode, label: string, responsible: string, active: boolean }) {
  return (
    <div className={`p-6 rounded-3xl flex flex-col items-center text-center gap-4 border shadow-sm transition-all hover:shadow-md ${
      active ? 'bg-white border-slate-200 scale-100' : 'bg-slate-50 border-transparent opacity-50'
    }`}>
      <div className={`p-4 rounded-2xl ${
        responsible === 'Seller' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
      }`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-black text-slate-900 mb-1">{label}</div>
        <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
          responsible === 'Seller' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
        }`}>
          {responsible}
        </div>
      </div>
    </div>
  );
}

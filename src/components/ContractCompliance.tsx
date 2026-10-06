import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Upload, RefreshCcw, CheckCircle2, AlertTriangle,
  ShieldCheck, Globe, FileEdit, Info, ListChecks
} from 'lucide-react';
import { INCOTERMS } from '../data/incoterms';
import { LEGAL_DATA } from '../data/legalFramework';

// Review Contract (v1.3): rule-based screening of pasted contract text.
// The sample contracts below are fictitious and are screened by the same
// checks as any other text; no prepared findings are attached to them.

interface TemplateContract {
  title: string;
  description: string;
  text: string;
  incoterm: string;
}

const TEMPLATE_CONTRACTS: TemplateContract[] = [
  {
    title: "Sample A: CIF Hamburg with a conflicting risk clause",
    description: "Fictitious text whose risk clause and insurance-document clause conflict with CIF.",
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
    title: "Sample B: EXW Shenzhen with duties the seller cannot meet",
    description: "Fictitious text that asks an EXW seller for an on-board bill of lading and a transport guarantee.",
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
    title: "Sample C: FCA Tokyo, consistent example",
    description: "Fictitious text with an agreed on-board notation and an emission-data clause.",
    incoterm: "FCA",
    text: `INTERNATIONAL BUSINESS COOPERATION AGREEMENT
BUYER: Global Green Energies AG, Zurich, Switzerland
SELLER: Tokyo High-Precision Instruments, Japan

ARTICLE 1: PRODUCT AND PACKAGING
High-efficiency hydrogen fuel cell modules. Packaging must utilize biodegradable wood-polymer composites meeting Eco-Shield packaging requirements.

ARTICLE 2: INCOTERMS® 2020 DELIVERY ALIGNMENT
The transit is scheduled on "FCA Tokyo Container Yard, Japan (Incoterms® 2020)".
Risk transfers to the Buyer once the carrier handovers the goods at Tokyo Yard. Export customs clearance is fully handled by the Seller.

ARTICLE 3: PAYMENT AND DOCUMENTARY COMPLIANCE
Payment is made by irrevocable letter of credit subject to UCP 600. The Buyer shall instruct the carrier to issue a transport document with an on-board notation to the Seller, who presents it under the credit (Incoterms® 2020, FCA A6/B6).

ARTICLE 4: DECARBONIZATION COMPLIANCE
Seller executes dynamic route tracking for the initial domestic transport to Tokyo Yard, providing Scope 3 carbon logs to the Buyer within 48 hours.`
  }
];


// ---------------------------------------------------------------------------
// Rule-based screening. No language model is used. The checks below look for
// keywords and simple patterns in the pasted text and compare them with the
// rule data that the rest of ClearTrade uses (INCOTERMS, LEGAL_DATA).
// ---------------------------------------------------------------------------

type CheckStatus = 'ok' | 'review' | 'info';

interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  finding: string;
  evidence?: string;
  basis?: string;
}

interface ScreeningResult {
  code: string | null;
  codesFound: string[];
  ruleName: string;
  checks: CheckResult[];
  reviewCount: number;
  rawLength: number;
  timestamp: string;
}

const RULE_NAMES: Record<string, RegExp> = {
  EXW: /\bex\s+works\b/i,
  FCA: /\bfree\s+carrier\b/i,
  FAS: /\bfree\s+alongside\s+ship\b/i,
  FOB: /\bfree\s+on\s+board\b/i,
  CFR: /\bcost\s+and\s+freight\b/i,
  CIF: /\bcost,?\s+insurance\s+and\s+freight\b/i,
  CPT: /\bcarriage\s+paid\s+to\b/i,
  CIP: /\bcarriage\s+and\s+insurance\s+paid\b/i,
  DPU: /\bdelivered\s+at\s+place\s+unloaded\b/i,
  DAP: /\bdelivered\s+at\s+place\b(?!\s+unloaded)/i,
  DDP: /\bdelivered\s+duty\s+paid\b/i
};

const EARLY_DELIVERY_RULES = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP'];

const DOC_KEYWORDS: { test: RegExp; find: RegExp }[] = [
  { test: /invoice/i, find: /invoice/i },
  { test: /packing/i, find: /packing\s+list/i },
  { test: /bill of lading/i, find: /bill\s+of\s+lading|\bB\/L\b/i },
  { test: /waybill/i, find: /waybill/i },
  { test: /insurance/i, find: /insur/i },
  { test: /export/i, find: /export\s+(licen[cs]e|clearance|customs|declaration)/i },
  { test: /freight/i, find: /freight\s+(pre)?paid/i },
  { test: /transport document|receipt|delivery/i, find: /transport\s+document|receipt|bill\s+of\s+lading|waybill|CMR/i }
];

// Returns the sentence (or line) around a match, shortened for display.
const snippetAround = (text: string, re: RegExp): string | undefined => {
  const m = re.exec(text);
  if (!m) return undefined;
  const start = Math.max(text.lastIndexOf('\n', m.index), text.lastIndexOf('. ', m.index)) + 1;
  let end = text.length;
  const nextBreaks = [text.indexOf('\n', m.index + m[0].length), text.indexOf('. ', m.index + m[0].length)].filter(i => i !== -1);
  if (nextBreaks.length) end = Math.min(...nextBreaks) + 1;
  const s = text.slice(start, end).replace(/\s+/g, ' ').trim();
  return s.length > 260 ? s.slice(0, 257) + '…' : s;
};

const detectRules = (text: string): string[] => {
  const found: { code: string; pos: number }[] = [];
  Object.keys(INCOTERMS).forEach(code => {
    const byCode = new RegExp(`\\b${code}\\b`).exec(text);
    const byName = RULE_NAMES[code] ? RULE_NAMES[code].exec(text) : null;
    const positions = [byCode?.index, byName?.index].filter((p): p is number => typeof p === 'number');
    if (positions.length) found.push({ code, pos: Math.min(...positions) });
  });
  return found.sort((a, b) => a.pos - b.pos).map(f => f.code);
};

const runScreening = (text: string): ScreeningResult => {
  const checks: CheckResult[] = [];
  const codes = detectRules(text);
  const code = codes[0] || null;
  const info = code ? INCOTERMS[code] : null;
  const legal = code ? LEGAL_DATA[code] : null;

  // 1. Incoterms rule
  if (!code || !info) {
    checks.push({
      id: 'rule', title: 'Incoterms® rule stated', status: 'review',
      finding: 'No Incoterms® rule was found in the text (three-letter code in capitals or full name). State the rule, the named place or port and the edition, for example “FCA Helsinki, Incoterms® 2020”. The rule-specific checks below could not be run.'
    });
  } else if (codes.length > 1) {
    checks.push({
      id: 'rule', title: 'Incoterms® rule stated', status: 'review',
      finding: `More than one rule appears in the text: ${codes.join(', ')}. The checks below use the first one (${code}). A contract should state a single rule for the delivery, or make clear which rule applies to which shipment.`,
      evidence: snippetAround(text, new RegExp(`\\b${code}\\b`)) || snippetAround(text, RULE_NAMES[code])
    });
  } else {
    checks.push({
      id: 'rule', title: 'Incoterms® rule stated', status: 'ok',
      finding: `The text states ${code} (${info.name}).`,
      evidence: snippetAround(text, new RegExp(`\\b${code}\\b`)) || snippetAround(text, RULE_NAMES[code])
    });
  }

  // 2. Edition
  const otherEdition = /incoterms\s*®?\s*\(?\s*(2010|2000|1990)/i.exec(text);
  if (/incoterms\s*®?\s*\(?\s*2020/i.test(text)) {
    checks.push({ id: 'edition', title: 'Edition stated', status: 'ok', finding: 'The text refers to Incoterms® 2020, the edition on which ClearTrade is based.' });
  } else if (otherEdition) {
    checks.push({ id: 'edition', title: 'Edition stated', status: 'review', finding: `The text refers to Incoterms® ${otherEdition[1]}. ClearTrade uses the 2020 rules, so the checks below may not fit the edition named in the contract.`, evidence: snippetAround(text, /incoterms\s*®?\s*\(?\s*(2010|2000|1990)/i) });
  } else {
    checks.push({ id: 'edition', title: 'Edition stated', status: 'review', finding: 'No edition was found. Add “Incoterms® 2020” after the rule and the named place so that it is clear which version of the rules applies.' });
  }

  if (code && info && legal) {
    // 3. Named place
    const placeRe = new RegExp(`\\b${code}\\b\\s*(?:\\([^)]{0,40}\\)\\s*)?([A-Z][\\w.'’-]+(?:[ ,]+[A-Z][\\w.'’-]+){0,4})`);
    const place = placeRe.exec(text);
    const placeText = place ? place[1].replace(/[ ,]*\bIncoterms\b.*$/, '').replace(/[ ,]+$/, '') : '';
    if (place && placeText && !/^(Incoterms|Term|Terms|Rule|Delivery|Shipment|The|And|Or)\b/.test(placeText)) {
      checks.push({
        id: 'place', title: 'Named place or port', status: 'info',
        finding: `Text after the rule: “${placeText}”. Check that this is the exact place or port intended. Under ${code} the named place is: ${info.description}.`,
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020)`
      });
    } else {
      checks.push({
        id: 'place', title: 'Named place or port', status: 'review',
        finding: `No place or port name was recognised directly after ${code}. An Incoterms® rule is complete only with a named place or port (${info.description}).`,
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020)`
      });
    }

    // 4. Transport mode
    const modeRe = /(containeri[sz]ed|container|air\s?freight|air\s+waybill|by\s+air|multimodal)/i;
    if (legal.isSeaOnly) {
      const hit = modeRe.exec(text);
      if (hit) {
        checks.push({
          id: 'mode', title: 'Rule and mode of transport', status: 'review',
          finding: `${code} is intended for sea and inland waterway transport, and the text mentions “${hit[0]}”. ${legal.seaAdvisory || ''}`.trim(),
          evidence: snippetAround(text, modeRe),
          basis: `ClearTrade rule data for ${code} (Incoterms® 2020)`
        });
      } else {
        checks.push({ id: 'mode', title: 'Rule and mode of transport', status: 'info', finding: `${code} is intended for sea and inland waterway transport only. No wording pointing to another mode or to a container handover before loading was found.`, basis: `ClearTrade rule data for ${code} (Incoterms® 2020)` });
      }
    } else {
      checks.push({ id: 'mode', title: 'Rule and mode of transport', status: 'ok', finding: `${code} can be used for any mode of transport.`, basis: `ClearTrade rule data for ${code} (Incoterms® 2020)` });
    }

    // 5. Risk-transfer wording
    const early = EARLY_DELIVERY_RULES.includes(code);
    const lateRisk1 = /(risk|liab\w+)[^.\n]{0,120}\b(until|upon|after|not\s+before)\b[^.\n]{0,80}\b(arriv\w*|destination|discharg\w*|unload\w*|anchor|buyer['’]s\s+(premises|warehouse))/i;
    const lateRisk2 = /seller[^.\n]{0,60}\b(remain\w*|shall\s+be|stays?)\b[^.\n]{0,20}\b(liable|responsible)\b[^.\n]{0,80}\b(during|until|throughout)\b[^.\n]{0,60}\b(voyage|journey|transit|carriage|transport|arriv\w*|destination)/i;
    const earlyRisk = /risk[^.\n]{0,100}\b(pass\w*|transfer\w*)\b[^.\n]{0,80}\b(on\s+board|port\s+of\s+(shipment|loading)|handed\s+(over\s+)?to\s+the\s+(first\s+)?carrier|seller['’]s\s+premises)/i;
    const conflictRe = early ? (lateRisk1.test(text) ? lateRisk1 : lateRisk2.test(text) ? lateRisk2 : null) : (earlyRisk.test(text) ? earlyRisk : null);
    if (conflictRe) {
      checks.push({
        id: 'risk', title: 'Risk-transfer wording', status: 'review',
        finding: `The text appears to place the transfer of risk at a different point from the one set by ${code}. Under ${code} the risk passes: ${info.transferPoint}. A clause that moves this point contradicts the rule; choose a rule that matches the intention or remove the clause.`,
        evidence: snippetAround(text, conflictRe),
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A2/A3)`
      });
    } else {
      checks.push({
        id: 'risk', title: 'Risk-transfer wording', status: 'info',
        finding: `Under ${code} the risk passes: ${info.transferPoint}. No wording that moves this point was found by keyword. This is not a confirmation that the clauses are consistent.`,
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A2/A3)`
      });
    }

    // 6. Insurance
    const sellerMustInsure = info.responsibilities.insurance === 'Seller';
    if (sellerMustInsure) {
      if (/insur/i.test(text)) {
        checks.push({ id: 'insurance', title: 'Insurance', status: 'ok', finding: `${code} obliges the seller to insure the goods; minimum cover in the rule data: ${info.detailedAnalysis.insurance.minimumCoverage}. An insurance clause was found; check that the agreed cover is sufficient for the buyer.`, evidence: snippetAround(text, /insur/i), basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A5)` });
      } else {
        checks.push({ id: 'insurance', title: 'Insurance', status: 'review', finding: `${code} obliges the seller to insure the goods (minimum cover in the rule data: ${info.detailedAnalysis.insurance.minimumCoverage}), but no insurance wording was found in the text.`, basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A5)` });
      }
    } else {
      const sellerInsRe = /seller[^.\n]{0,80}\b(shall|must|will|agrees\s+to|is\s+to)\b[^.\n]{0,40}\b(insur\w+)/i;
      if (sellerInsRe.test(text)) {
        checks.push({ id: 'insurance', title: 'Insurance', status: 'review', finding: `${code} does not oblige the seller to insure the goods. The text appears to add such an obligation; make sure this is intended and state the required cover.`, evidence: snippetAround(text, sellerInsRe), basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A5)` });
      } else {
        checks.push({ id: 'insurance', title: 'Insurance', status: 'info', finding: `${code} does not oblige the seller to insure the goods, and no such obligation was found in the text. The party bearing the risk during carriage should consider its own cover.`, basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A5)` });
      }
    }

    // 7. Letter of credit and documents
    const lcRe = /(letter\s+of\s+credit|letters\s+of\s+credit|documentary\s+credit|\bL\/C\b|\bUCP\b)/i;
    if (!lcRe.test(text)) {
      checks.push({
        id: 'lc', title: 'Letter of credit and documents', status: 'info',
        finding: `No letter of credit is mentioned, so documentary points under UCP 600 were not checked. Typical seller documents under ${code}: ${legal.sellerDocs.map(d => d.name).join('; ')}.`,
        basis: `ClearTrade document data for ${code}`
      });
    } else {
      if (/UCP\s*600/i.test(text)) {
        checks.push({ id: 'ucp', title: 'Credit subject to UCP 600', status: 'ok', finding: 'The text refers to UCP 600.', evidence: snippetAround(text, /UCP\s*600/i) });
      } else {
        checks.push({ id: 'ucp', title: 'Credit subject to UCP 600', status: 'review', finding: 'A letter of credit is mentioned, but UCP 600 is not. UCP 600 applies only if the credit expressly says so.', evidence: snippetAround(text, lcRe) });
      }

      const mentioned: string[] = [];
      const notMentioned: string[] = [];
      legal.sellerDocs.forEach(doc => {
        const kw = DOC_KEYWORDS.find(k => k.test.test(doc.name));
        const isThere = kw ? kw.find.test(text) : false;
        (isThere ? mentioned : notMentioned).push(doc.name);
      });
      checks.push({
        id: 'docs', title: 'Typical seller documents', status: 'info',
        finding: `Typical seller documents under ${code} that the text mentions: ${mentioned.length ? mentioned.join('; ') : 'none'}. Not mentioned: ${notMentioned.length ? notMentioned.join('; ') : 'none'}. A document that is not mentioned is not necessarily missing: some are needed only if the contract or the credit calls for them.`,
        basis: `ClearTrade document data for ${code}`
      });

      const onBoardRe = /on[-\s]board/i;
      if ((code === 'EXW' || code === 'FCA') && onBoardRe.test(text)) {
        if (code === 'FCA' && /instruct\w*[^.\n]{0,80}carrier/i.test(text)) {
          checks.push({ id: 'onboard', title: 'On-board transport document', status: 'ok', finding: 'The text asks for an on-board notation under FCA and provides that the buyer instructs the carrier to issue the document to the seller, which is the mechanism foreseen in Incoterms® 2020 (FCA A6/B6).', evidence: snippetAround(text, onBoardRe), basis: 'Incoterms® 2020, FCA A6/B6' });
        } else if (code === 'FCA') {
          checks.push({ id: 'onboard', title: 'On-board transport document', status: 'review', finding: 'The text asks for an on-board document, but under FCA the buyer contracts the carriage. The seller can present such a document only if the parties agree that the buyer instructs the carrier to issue it to the seller (Incoterms® 2020, FCA A6/B6). No such agreement was found in the text.', evidence: snippetAround(text, onBoardRe), basis: 'Incoterms® 2020, FCA A6/B6' });
        } else {
          checks.push({ id: 'onboard', title: 'On-board transport document', status: 'review', finding: 'The text asks for an on-board document, but under EXW the seller does not contract the carriage and has no obligation to provide a transport document. A credit that requires it may be impossible for the seller to satisfy; FCA with an agreed on-board notation, or another rule, may fit better.', evidence: snippetAround(text, onBoardRe), basis: `ClearTrade rule data for ${code} (Incoterms® 2020)` });
        }
      }

      const lateInsRe = /insurance\s+(document|certificate|policy)[^.\n]{0,100}\b(after|later\s+than)\b[^.\n]{0,60}\b(arrival|shipment|loading|sailing)/i;
      if (lateInsRe.test(text)) {
        checks.push({ id: 'insdoc', title: 'Date of the insurance document', status: 'review', finding: 'The text allows the insurance document to be supplied after shipment or arrival. Under a letter of credit the insurance document is examined under UCP 600 Art. 28, and a document dated after the date of shipment is normally refused unless it shows that cover was effective from that date.', evidence: snippetAround(text, lateInsRe), basis: 'UCP 600, Art. 28' });
      }
    }

    // 8. Transport-emission data
    const contracting = info.detailedAnalysis.transport.contracting;
    const other = contracting === 'Seller' ? 'Buyer' : 'Seller';
    const emissionRe = /(emission|carbon|\bco2\b|co₂|scope\s*3|\bghg\b|greenhouse)/i;
    const misplacedRe = new RegExp(`${other}[^.\\n]{0,60}\\b(guarantee\\w*|ensure\\w*|is\\s+responsible\\s+for|shall\\s+be\\s+responsible)\\b[^.\\n]{0,160}(emission|carbon|scope\\s*3|sustainab)`, 'i');
    if (misplacedRe.test(text)) {
      checks.push({
        id: 'emissions', title: 'Transport-emission data clause', status: 'review',
        finding: `The text places a transport-related sustainability or emissions duty on the ${other.toLowerCase()}, although under ${code} the ${contracting.toLowerCase()} contracts the main carriage. The ${other.toLowerCase()} can meet such a duty only with data passed on by the ${contracting.toLowerCase()}.`,
        evidence: snippetAround(text, misplacedRe),
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A4/B4)`
      });
    } else if (emissionRe.test(text)) {
      checks.push({
        id: 'emissions', title: 'Transport-emission data clause', status: 'info',
        finding: `A clause on emissions or carbon data was found. Under ${code} the ${contracting.toLowerCase()} contracts the main carriage and is best placed to request the carrier's emission data; check that the clause puts each duty on the party able to fulfil it.`,
        evidence: snippetAround(text, emissionRe),
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A4/B4)`
      });
    } else {
      checks.push({
        id: 'emissions', title: 'Transport-emission data clause', status: 'review',
        finding: `No clause on transport-emission data was found. Under ${code} the ${contracting.toLowerCase()} contracts the main carriage. If the ${other.toLowerCase()} expects data requests from its customers, agree in the contract that the carrier's emission data is passed on.`,
        basis: `ClearTrade rule data for ${code} (Incoterms® 2020, A4/B4)`
      });
    }
  }

  return {
    code,
    codesFound: codes,
    ruleName: info ? `${code} – ${info.name}` : 'No rule identified',
    checks,
    reviewCount: checks.filter(c => c.status === 'review').length,
    rawLength: text.length,
    timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  };
};

const STATUS_STYLE: Record<CheckStatus, { card: string; badge: string; label: string }> = {
  ok: { card: 'bg-emerald-50/40 border-emerald-100', badge: 'bg-emerald-100 text-emerald-800', label: 'No issue found' },
  review: { card: 'bg-amber-50/50 border-amber-200', badge: 'bg-amber-100 text-amber-900', label: 'Review' },
  info: { card: 'bg-slate-50 border-slate-200', badge: 'bg-slate-200 text-slate-700', label: 'Information' }
};

export default function ContractCompliance() {
  const [contractText, setContractText] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isWritingManually, setIsWritingManually] = useState<boolean>(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (message: string, type: 'success' | 'info' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const handleApplyTemplate = (template: TemplateContract) => {
    setContractText(template.text);
    setIsWritingManually(true);
    showNotice(`Loaded ${template.title.split(':')[0]} (fictitious sample text)`, 'success');
  };

  const processSelectedFile = (file: File) => {
    if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setContractText(event.target.result.slice(0, 100000));
          setIsWritingManually(true);
          showNotice(`Loaded text from ${file.name}`, 'success');
        }
      };
      reader.readAsText(file);
    } else {
      showNotice('This prototype reads plain-text (.txt) files only. Please copy the text from your PDF or Word file and paste it into the box.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) processSelectedFile(files[0]);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processSelectedFile(files[0]);
  };

  const executeScreening = () => {
    if (!contractText.trim()) return;
    setResult(runScreening(contractText));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setContractText('');
    setResult(null);
    setIsWritingManually(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" id="contract-auditor-root">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100" id="auditor-header">
        <div className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Globe size={180} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest justify-start">
                <ListChecks size={16} />
                Rule-based screening · Prototype
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight" id="auditor-title">
                Review Contract
              </h1>
              <p className="text-slate-400 text-sm font-semibold max-w-2xl">
                Screens pasted contract text for a small set of points on the Incoterms® 2020 rule, risk transfer, insurance, letter-of-credit documents and transport-emission data. It works with keywords and the ClearTrade rule data, does not use AI and is not legal advice.
              </p>
            </div>

            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-3 px-6 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-xs font-bold backdrop-blur-md border border-white/10"
              >
                <RefreshCcw size={16} />
                Check Another Text
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-10 space-y-10"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,text/plain"
                className="hidden"
              />

              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
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

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-500 justify-start">
                  <FileEdit size={16} className="text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider">Load a sample contract (fictitious text)</span>
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
                          {tpl.incoterm}
                        </span>
                        <span>Sample {i + 1}</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{tpl.title}</p>
                      <p className="text-slate-500 leading-relaxed font-semibold">{tpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
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
                        Upload text file (.txt)
                      </button>
                    </div>
                    <span className="font-black text-slate-900">Contract text or delivery clause:</span>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50/90 hover:border-emerald-500 transition-colors p-4 flex flex-col min-h-[350px]"
                  >
                    <textarea
                      value={contractText}
                      maxLength={100000}
                      onChange={(e) => setContractText(e.target.value)}
                      placeholder="Paste the text of your sales contract or delivery clause here, or drop a .txt file..."
                      className="w-full h-full min-h-[310px] bg-transparent outline-none border-none p-4 text-slate-800 text-sm leading-relaxed font-semibold resize-y"
                    />

                    {contractText.length === 0 && !isWritingManually && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50 border border-slate-100 rounded-[2rem]">
                        <Upload size={40} className="text-emerald-600" />
                        <div className="text-center space-y-1 px-6">
                          <p className="text-sm font-black text-slate-700">Drop a plain-text (.txt) file here</p>
                          <p className="text-xs text-slate-400">PDF and Word files are not read by this prototype. Copy their text and paste it instead.</p>
                        </div>
                        <span className="text-xs text-slate-300 font-bold">— OR —</span>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsWritingManually(true)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                          >
                            <FileText size={14} />
                            Write / Paste Text
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2.5 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Upload size={14} className="text-slate-600" />
                            Select .txt File
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-between bg-emerald-50/40 p-6 md:p-8 rounded-[2rem] border border-emerald-100/60 text-left space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-emerald-950 flex items-center justify-start gap-2">
                      <ShieldCheck className="text-emerald-700" size={20} />
                      What is checked
                    </h3>

                    <ul className="space-y-4 text-xs font-semibold text-emerald-900 leading-relaxed">
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-700 rounded-full flex-shrink-0" />
                        <span className="text-slate-600 text-[11px]">
                          <strong>Incoterms® 2020 rule:</strong> rule, edition and named place stated; rule fits the mode of transport; risk-transfer and insurance wording against the rule.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-700 rounded-full flex-shrink-0" />
                        <span className="text-slate-600 text-[11px]">
                          <strong>Letter of credit:</strong> reference to UCP 600, typical documents for the rule, and document demands the seller may be unable to meet.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-700 rounded-full flex-shrink-0" />
                        <span className="text-slate-600 text-[11px]">
                          <strong>Transport-emission data:</strong> whether a data clause exists and whether it sits with the party that contracts the carriage.
                        </span>
                      </li>
                    </ul>

                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-[11px] text-slate-500 font-semibold leading-relaxed">
                      The screening searches for keywords and simple patterns. It cannot interpret clauses, and the text you paste is processed in your browser only; it is not stored or sent anywhere.
                    </div>
                  </div>

                  <button
                    onClick={executeScreening}
                    disabled={!contractText.trim()}
                    className={`w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors ${
                      contractText.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 cursor-pointer'
                        : 'bg-slate-300 pointer-events-none'
                    }`}
                  >
                    <ListChecks size={16} />
                    Run Check
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="screening-results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 md:p-10 space-y-8 text-left"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="screening-summary">
                <div className="space-y-1">
                  <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">Rule identified in the text</div>
                  <div className="text-slate-900 font-black text-2xl" id="screening-rule">{result.ruleName}</div>
                  <div className="text-slate-500 text-[11px] font-semibold">{result.rawLength} characters · checked at {result.timestamp}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black ${result.reviewCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`} id="screening-count">
                    {result.reviewCount} of {result.checks.length} checks to review
                  </span>
                  <span className="px-4 py-2 rounded-xl text-xs font-black bg-slate-200 text-slate-700">
                    Keyword screening · not legal advice
                  </span>
                </div>
              </div>

              <div className="space-y-4" id="screening-checks">
                {result.checks.map((check) => (
                  <div key={check.id} className={`border rounded-[1.5rem] p-6 space-y-3 ${STATUS_STYLE[check.status].card}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        {check.status === 'ok' && <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={18} />}
                        {check.status === 'review' && <AlertTriangle className="text-amber-600 flex-shrink-0" size={18} />}
                        {check.status === 'info' && <Info className="text-slate-500 flex-shrink-0" size={18} />}
                        {check.title}
                      </h4>
                      <span className={`self-start px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[check.status].badge}`}>
                        {STATUS_STYLE[check.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">{check.finding}</p>
                    {check.evidence && (
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-white/70 border border-slate-200 rounded-xl p-3">
                        <span className="font-black text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Text found</span>
                        “{check.evidence}”
                      </p>
                    )}
                    {check.basis && (
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Basis: {check.basis}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50/30 p-5 rounded-2xl text-xs text-indigo-950 font-semibold border border-indigo-100/60 leading-relaxed">
                <strong>What this screening does not do.</strong> It looks for keywords and simple patterns and compares them with the ClearTrade rule data. It does not interpret clauses, read attachments or check documents, and a point marked “Information” or “No issue found” is not a confirmation that the contract is correct. Have the contract reviewed by a qualified adviser before signing.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

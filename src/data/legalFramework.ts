// ClearTrade – documentary compliance data (v1.2)
// Typical documents per Incoterms® 2020 rule, with references to
//   - Incoterms® 2020 (ICC 2020), articles A1–A10 / B1–B10
//   - UCP 600 (ICC 2007), articles 14–28
//   - ISBP 821 (ICC 2023)
// Each document states its basis: an obligation allocated by the Incoterms® rule itself,
// or a document that is needed only if the sales contract or the letter of credit calls for it.
// The mapping is indicative: actual requirements depend on the sales contract and any letter of credit.

export interface LegalRef {
  source: 'Incoterms® 2020' | 'UCP 600' | 'ISBP 821';
  article?: string;
}

export type DocBasis = 'incoterms' | 'contract';

export interface LegalDoc {
  name: string;
  description: string;
  refs: LegalRef[];
  basis: DocBasis;
  whoPrepares: 'Seller' | 'Buyer';
  legalBasis: string;
  lcNote: string;
  practicalNote: string;
}

export interface LegalFramework {
  code: string;
  name: string;
  sellerDocs: LegalDoc[];
  buyerDocs: LegalDoc[];
  note: string;
  isSeaOnly?: boolean;
  seaAdvisory?: string;
}

export const DOC_BASIS_LABEL: Record<DocBasis, string> = {
  incoterms: 'Obligation under the Incoterms® rule',
  contract: 'Only if the contract or letter of credit requires it'
};

const inco = (article: string): LegalRef => ({ source: 'Incoterms® 2020', article });
const ucp = (article: string): LegalRef => ({ source: 'UCP 600', article });
const isbp: LegalRef = { source: 'ISBP 821' };

// ---------- Documents shared by several rules ----------

const commercialInvoice: LegalDoc = {
  name: 'Commercial Invoice',
  description: 'Primary sales document.',
  refs: [inco('A1'), ucp('Art. 18')],
  basis: 'incoterms',
  whoPrepares: 'Seller',
  legalBasis: 'Incoterms® 2020 Article A1: the seller provides the goods and the commercial invoice in conformity with the contract of sale.',
  lcNote: 'Under a letter of credit the invoice is examined under UCP 600 Art. 18: issued by the beneficiary, made out in the name of the applicant and in the currency of the credit.',
  practicalNote: 'The description of the goods must correspond with the description in the credit.'
};

const packingList: LegalDoc = {
  name: 'Packing List (if required by contract or LC)',
  description: 'Details contents, weights and packing.',
  refs: [inco('A1'), isbp],
  basis: 'contract',
  whoPrepares: 'Seller',
  legalBasis: 'Incoterms® 2020 Article A1: other evidence of conformity only where the contract requires it.',
  lcNote: 'Presented only if the credit calls for it; its data must not conflict with the invoice or the transport document (UCP 600 Art. 14(d)).',
  practicalNote: 'Not an Incoterms® obligation in itself, but very commonly agreed.'
};

const exportDocsSeller: LegalDoc = {
  name: 'Export licence / export customs documents (where applicable)',
  description: 'Export clearance.',
  refs: [inco('A7')],
  basis: 'incoterms',
  whoPrepares: 'Seller',
  legalBasis: 'Incoterms® 2020 Article A7: the seller carries out and pays for export clearance formalities.',
  lcNote: 'Normally not presented under a letter of credit unless the credit calls for it.',
  practicalNote: 'Applies where an export licence or declaration is required in the country of export.'
};

const importDocsBuyer: LegalDoc = {
  name: 'Import licence / import customs documents (where applicable)',
  description: 'Destination import clearance.',
  refs: [inco('B7')],
  basis: 'incoterms',
  whoPrepares: 'Buyer',
  legalBasis: 'Incoterms® 2020 Article B7: the buyer carries out and pays for import clearance formalities.',
  lcNote: 'Not part of a presentation under a letter of credit.',
  practicalNote: 'The seller assists with information at the buyer\'s request, risk and cost (A7).'
};

const buyerOwnInsurance = (code: string, label = 'Cargo insurance'): LegalDoc => ({
  name: `${label} (if buyer chooses)`,
  description: `Buyer arranges cover at own expense; seller has no obligation to insure under ${code}.`,
  refs: [inco('A5/B5')],
  basis: 'contract',
  whoPrepares: 'Buyer',
  legalBasis: `Incoterms® 2020 Articles A5/B5: neither party is obliged to insure under ${code}.`,
  lcNote: 'Not part of a presentation under a letter of credit.',
  practicalNote: 'The buyer bears the transit risk under this rule, so cover from the point of delivery is advisable.'
});

const freightEvidence = (article: string): LegalDoc => ({
  name: 'Freight evidence / freight prepaid indication (if required by LC)',
  description: 'Only if separately required.',
  refs: [ucp(article), isbp],
  basis: 'contract',
  whoPrepares: 'Seller',
  legalBasis: 'Not an Incoterms® document; follows from the terms of the credit.',
  lcNote: 'Where the credit requires it, the transport document indicates that freight has been paid or prepaid.',
  practicalNote: 'Usually shown on the transport document itself rather than as a separate paper.'
});

const sellerInsurance = (code: string, clauses: string, label: string): LegalDoc => ({
  name: label,
  description: `Seller must insure: at least Institute Cargo Clauses ${clauses}.`,
  refs: [inco('A5'), ucp('Art. 28'), isbp],
  basis: 'incoterms',
  whoPrepares: 'Seller',
  legalBasis: `Incoterms® 2020 Article A5: under ${code} the seller obtains cargo insurance complying at least with Institute Cargo Clauses ${clauses}, covering at least 110% of the contract price.`,
  lcNote: 'Examined under UCP 600 Art. 28: the amount of cover is at least 110% of the CIF or CIP value unless the credit states otherwise.',
  practicalNote: clauses === '(C)'
    ? 'Clauses (C) give minimum cover only; the parties may agree a higher level.'
    : 'Clauses (A) give all-risks cover; the parties may agree a lower level.'
});

const SEA_ADVISORY = (code: string, alternative: string) =>
  `${code} is for sea and inland waterway transport only. If goods are handed to a carrier before loading on board, consider ${alternative} instead.`;

// ---------- Rule-by-rule mapping ----------

export const LEGAL_DATA: Record<string, LegalFramework> = {
  EXW: {
    code: 'EXW',
    name: 'Ex Works',
    sellerDocs: [
      commercialInvoice,
      packingList
    ],
    buyerDocs: [
      {
        name: 'Evidence of having taken delivery',
        description: 'Confirms the goods were collected at the seller\'s premises.',
        refs: [inco('B6')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Article B6: the buyer provides the seller with appropriate evidence of having taken delivery.',
        lcNote: 'EXW gives the seller no transport document; a credit asking for one does not fit this rule.',
        practicalNote: 'Under EXW the seller has no obligation to provide a delivery or transport document (A6).'
      },
      {
        name: 'Export licence / export customs documents (where applicable)',
        description: 'Export clearance is the buyer\'s task under EXW.',
        refs: [inco('B7')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Article B7: the buyer carries out export, transit and import clearance; the seller only assists (A7).',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'Often difficult for a foreign buyer; FCA places export clearance on the seller.'
      },
      importDocsBuyer,
      buyerOwnInsurance('EXW')
    ],
    note: 'Under EXW the seller only makes the goods available at its premises. The buyer loads, clears the goods for export and arranges all transport. Where export clearance by the buyer is impractical or a letter of credit is used, FCA is the more suitable rule.'
  },
  FCA: {
    code: 'FCA',
    name: 'Free Carrier',
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Proof of delivery to the carrier',
        description: 'Usual proof that the goods were handed to the buyer\'s carrier at the named place.',
        refs: [inco('A6')],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the buyer with the usual proof that the goods have been delivered.',
        lcNote: 'If the credit calls for a transport document, it is examined under the UCP 600 article for that mode of transport (Arts. 19–25).',
        practicalNote: 'For example a carrier\'s receipt, CMR note or air waybill, depending on the mode of transport.'
      },
      {
        name: 'Transport document with on-board notation (if agreed)',
        description: 'Only where the parties agree that the buyer instructs its carrier to issue it to the seller.',
        refs: [inco('A6/B6'), ucp('Art. 20'), isbp],
        basis: 'contract',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Articles A6/B6: if agreed, the buyer instructs the carrier to issue a transport document stating that the goods have been loaded.',
        lcNote: 'Needed when a letter of credit requires an on-board bill of lading although delivery takes place before loading.',
        practicalNote: 'Option introduced in Incoterms® 2020; it must be agreed in the contract.'
      }
    ],
    buyerDocs: [
      {
        name: 'Carrier nomination / transport instructions',
        description: 'Name of the carrier and time and place of handover.',
        refs: [inco('B4'), inco('B10')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Articles B4 and B10: the buyer contracts the carriage and gives the seller sufficient notice.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'Without timely notice the buyer bears the resulting risks and costs.'
      },
      importDocsBuyer,
      buyerOwnInsurance('FCA')
    ],
    note: 'Under FCA the seller delivers to the buyer\'s carrier at the named place and clears the goods for export. Incoterms® 2020 allows the parties to agree that the buyer instructs its carrier to issue an on-board transport document to the seller, which helps where a letter of credit requires one.'
  },
  CPT: {
    code: 'CPT',
    name: 'Carriage Paid To',
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Transport document',
        description: 'Usual transport document for the carriage contracted by the seller.',
        refs: [inco('A6'), ucp('Arts. 19–25'), isbp],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the usual transport document for the contracted carriage.',
        lcNote: 'Examined under the UCP 600 article for the mode of transport, e.g. Art. 19 (multimodal), Art. 23 (air) or Art. 24 (road and rail).',
        practicalNote: 'It must cover the contract goods and be dated within the agreed shipment period.'
      },
      freightEvidence('Arts. 19–25')
    ],
    buyerDocs: [
      importDocsBuyer,
      buyerOwnInsurance('CPT')
    ],
    note: 'Under CPT the seller contracts and pays carriage to the named place of destination, but risk passes to the buyer when the goods are handed to the first carrier. The seller has no obligation to insure.'
  },
  CIP: {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Transport document',
        description: 'Usual transport document for the carriage contracted by the seller.',
        refs: [inco('A6'), ucp('Arts. 19–25'), isbp],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the usual transport document for the contracted carriage.',
        lcNote: 'Examined under the UCP 600 article for the mode of transport, e.g. Art. 19 (multimodal), Art. 23 (air) or Art. 24 (road and rail).',
        practicalNote: 'It must cover the contract goods and be dated within the agreed shipment period.'
      },
      sellerInsurance('CIP', '(A)', 'Insurance policy / certificate'),
      freightEvidence('Arts. 19–25')
    ],
    buyerDocs: [
      importDocsBuyer,
      {
        name: 'Additional insurance (if buyer chooses)',
        description: 'Only if the buyer wants cover beyond the seller\'s policy.',
        refs: [inco('B5')],
        basis: 'contract',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Article B5: the buyer has no obligation to insure.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'The seller provides information for additional cover at the buyer\'s request, risk and cost.'
      }
    ],
    note: 'Under CIP the seller contracts carriage and insures the goods to the named place of destination. Incoterms® 2020 raised the minimum cover for CIP to Institute Cargo Clauses (A). Risk still passes to the buyer when the goods are handed to the first carrier.'
  },
  DAP: {
    code: 'DAP',
    name: 'Delivered at Place',
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Document enabling the buyer to take delivery',
        description: 'For example a delivery order or the transport document.',
        refs: [inco('A6')],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides any document required to enable the buyer to take over the goods.',
        lcNote: 'Delivery takes place at destination, so a credit asking for an on-board bill of lading fits this rule poorly; the document should be agreed in advance.',
        practicalNote: 'Risk stays with the seller until the goods are placed at the buyer\'s disposal, ready for unloading.'
      }
    ],
    buyerDocs: [
      importDocsBuyer,
      {
        name: 'Unloading arrangements',
        description: 'The buyer unloads at the named place of destination.',
        refs: [inco('B2')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Article B2: the buyer takes delivery of the goods on the arriving means of transport.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'Waiting costs at destination caused by late unloading are normally for the buyer.'
      }
    ],
    note: 'Under DAP the seller bears costs and risk to the named place of destination, ready for unloading. The buyer unloads and clears the goods for import. Neither party is obliged to insure, but the seller carries the transit risk.'
  },
  DPU: {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Document enabling the buyer to take delivery',
        description: 'For example a delivery order or evidence that the goods have been unloaded.',
        refs: [inco('A6')],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides any document required to enable the buyer to take over the goods.',
        lcNote: 'Delivery takes place at destination, so a credit asking for an on-board bill of lading fits this rule poorly; the document should be agreed in advance.',
        practicalNote: 'DPU is the only rule under which the seller unloads at destination; risk passes once unloading is complete.'
      }
    ],
    buyerDocs: [
      importDocsBuyer
    ],
    note: 'Under DPU the seller bears costs and risk until the goods are unloaded at the named place of destination. The buyer clears the goods for import. Neither party is obliged to insure, but the seller carries the transit risk.'
  },
  DDP: {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Import licence / import customs documents and duty payment',
        description: 'Import clearance is the seller\'s task under DDP.',
        refs: [inco('A7')],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A7: under DDP the seller carries out and pays for export, transit and import clearance.',
        lcNote: 'Not normally part of a presentation under a letter of credit.',
        practicalNote: 'The seller must be able to act as importer in the buyer\'s country; if it cannot, DAP is the suitable rule.'
      },
      {
        name: 'Document enabling the buyer to take delivery',
        description: 'For example a delivery order or the transport document.',
        refs: [inco('A6')],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides any document required to enable the buyer to take over the goods.',
        lcNote: 'Delivery takes place at destination, so a credit asking for an on-board bill of lading fits this rule poorly; the document should be agreed in advance.',
        practicalNote: 'Risk stays with the seller until the goods are placed at the buyer\'s disposal, ready for unloading.'
      }
    ],
    buyerDocs: [
      {
        name: 'Unloading arrangements',
        description: 'The buyer unloads at the named place of destination.',
        refs: [inco('B2')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Article B2: the buyer takes delivery of the goods on the arriving means of transport.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'The buyer assists the seller with import information at the seller\'s request, risk and cost (B7).'
      }
    ],
    note: 'DDP places the maximum obligation on the seller, including import clearance and duties. The parties should confirm before agreeing DDP that the seller is able to clear the goods for import in the buyer\'s country.'
  },
  FAS: {
    code: 'FAS',
    name: 'Free Alongside Ship',
    isSeaOnly: true,
    seaAdvisory: SEA_ADVISORY('FAS', 'FCA'),
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Proof of delivery alongside the vessel',
        description: 'Usual proof of delivery, e.g. a dock or quay receipt.',
        refs: [inco('A6')],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the usual proof of delivery and assists the buyer in obtaining a transport document.',
        lcNote: 'A dock receipt is not a bill of lading; a credit requiring an on-board bill of lading depends on the buyer\'s carrier.',
        practicalNote: 'Delivery takes place before loading, so damage during loading is at the buyer\'s risk.'
      }
    ],
    buyerDocs: [
      {
        name: 'Vessel nomination',
        description: 'Vessel name, loading point and delivery time.',
        refs: [inco('B4'), inco('B10')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Articles B4 and B10: the buyer contracts the carriage and gives the seller sufficient notice.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'Without timely notice the buyer bears the resulting risks and costs.'
      },
      importDocsBuyer,
      buyerOwnInsurance('FAS', 'Marine insurance')
    ],
    note: 'Under FAS the seller delivers alongside the vessel at the named port of shipment and clears the goods for export. Loading on board and the sea carriage are the buyer\'s responsibility.'
  },
  FOB: {
    code: 'FOB',
    name: 'Free On Board',
    isSeaOnly: true,
    seaAdvisory: SEA_ADVISORY('FOB', 'FCA'),
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'Proof of delivery on board (usually an on-board Bill of Lading)',
        description: 'Evidences shipment on board.',
        refs: [inco('A6'), ucp('Art. 20'), isbp],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the usual proof of delivery and assists the buyer in obtaining a transport document.',
        lcNote: 'A bill of lading is examined under UCP 600 Art. 20: it indicates shipment on board a named vessel at the port of loading stated in the credit.',
        practicalNote: 'The carrier is contracted by the buyer, so the bill of lading is issued by the buyer\'s carrier.'
      }
    ],
    buyerDocs: [
      {
        name: 'Vessel nomination',
        description: 'Vessel name, loading point and delivery time.',
        refs: [inco('B4'), inco('B10')],
        basis: 'incoterms',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Articles B4 and B10: the buyer contracts the carriage and gives the seller sufficient notice.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'Without timely notice the buyer bears the resulting risks and costs.'
      },
      importDocsBuyer,
      buyerOwnInsurance('FOB', 'Marine insurance')
    ],
    note: 'Under FOB the seller delivers the goods on board the vessel nominated by the buyer and clears them for export. The buyer contracts and pays the sea carriage.'
  },
  CFR: {
    code: 'CFR',
    name: 'Cost and Freight',
    isSeaOnly: true,
    seaAdvisory: SEA_ADVISORY('CFR', 'FCA/CPT'),
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'On-board Bill of Lading',
        description: 'Usual transport document; evidences shipment on board.',
        refs: [inco('A6'), ucp('Art. 20'), isbp],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the usual transport document for the agreed port of destination.',
        lcNote: 'Examined under UCP 600 Art. 20: it indicates shipment on board a named vessel at the port of loading stated in the credit.',
        practicalNote: 'It must enable the buyer to claim the goods from the carrier at the port of destination.'
      },
      freightEvidence('Art. 20')
    ],
    buyerDocs: [
      importDocsBuyer,
      buyerOwnInsurance('CFR', 'Marine insurance')
    ],
    note: 'Under CFR the seller contracts and pays the sea freight to the named port of destination but does not insure. Risk passes to the buyer when the goods are on board at the port of shipment.'
  },
  CIF: {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    isSeaOnly: true,
    seaAdvisory: SEA_ADVISORY('CIF', 'FCA/CIP'),
    sellerDocs: [
      commercialInvoice,
      packingList,
      exportDocsSeller,
      {
        name: 'On-board Bill of Lading',
        description: 'Usual transport document; evidences shipment on board.',
        refs: [inco('A6'), ucp('Art. 20'), isbp],
        basis: 'incoterms',
        whoPrepares: 'Seller',
        legalBasis: 'Incoterms® 2020 Article A6: the seller provides the usual transport document for the agreed port of destination.',
        lcNote: 'Examined under UCP 600 Art. 20: it indicates shipment on board a named vessel at the port of loading stated in the credit.',
        practicalNote: 'It must enable the buyer to claim the goods from the carrier at the port of destination.'
      },
      sellerInsurance('CIF', '(C)', 'Marine insurance policy / certificate'),
      freightEvidence('Art. 20')
    ],
    buyerDocs: [
      importDocsBuyer,
      {
        name: 'Additional insurance (if buyer chooses)',
        description: 'Only if the buyer wants cover beyond the seller\'s minimum policy.',
        refs: [inco('B5')],
        basis: 'contract',
        whoPrepares: 'Buyer',
        legalBasis: 'Incoterms® 2020 Article B5: the buyer has no obligation to insure.',
        lcNote: 'Not part of a presentation under a letter of credit.',
        practicalNote: 'The seller provides information for additional cover at the buyer\'s request, risk and cost.'
      }
    ],
    note: 'Under CIF the seller contracts the sea freight and insures the goods with at least Institute Cargo Clauses (C). Invoice, bill of lading and insurance document must be consistent with each other. Risk passes to the buyer when the goods are on board at the port of shipment.'
  }
};

// Reference list shown in the Standards library
export const STANDARD_SOURCES = [
  {
    id: 1,
    citation: 'International Chamber of Commerce (ICC). (2020). Incoterms® 2020: ICC Rules for the Use of Domestic and International Trade Terms. ICC Services, Paris.',
    notes: ['Articles A1–A10 and B1–B10 of the eleven rules: risk transfer, costs, carriage, insurance, documents and clearance']
  },
  {
    id: 2,
    citation: 'International Chamber of Commerce (ICC). (2007). Uniform Customs and Practice for Documentary Credits (UCP 600). ICC Publication No. 600. ICC Services, Paris.',
    notes: ['Articles used: 14 (examination of documents), 18 (commercial invoice), 19–25 (transport documents), 28 (insurance document)']
  },
  {
    id: 3,
    citation: 'International Chamber of Commerce (ICC). (2023). International Standard Banking Practice for the Examination of Documents under UCP 600 (ISBP 821). ICC Services, Paris.',
    notes: ['Practice reference for examining invoices, transport documents and insurance documents']
  },
  {
    id: 4,
    citation: 'World Resources Institute & World Business Council for Sustainable Development. (2011). Corporate Value Chain (Scope 3) Accounting and Reporting Standard. GHG Protocol.',
    notes: ['Category 4 (upstream transportation and distribution) and Category 9 (downstream transportation and distribution)']
  },
  {
    id: 5,
    citation: 'Directive (EU) 2022/2464 (Corporate Sustainability Reporting Directive), as amended by Directive (EU) 2026/470.',
    notes: ['Scope of mandatory sustainability reporting and limits on value-chain data requests to smaller undertakings']
  }
];

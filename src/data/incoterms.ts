export type Role = 'Buyer' | 'Seller';
export type TransportMode = 'Ocean' | 'Any';

export interface IncotermInfo {
  code: string;
  name: string;
  advice: string;
  carbonScore: number; // 0 to 100 (100 = most sustainable)
  riskScore: number; // 0 to 100 (100 = most risky for the party responsible)
  co2Impact: 'Low' | 'Medium' | 'High';
  description: string;
  requiredDocuments: string[];
  mode: 'All Modes' | 'Sea / Inland Waterway';
  transferPoint: string;
  transferPosition: number; // 0-100 on the risk bar
  sellerCarbonControl: number; // indicative share of the journey for which the seller can access transport data (0-100)
  buyerCarbonControl: number;
  scope3Allocation: {
    label: string;
    percentage: number;
    color: string;
  }[];
  sustainabilityInsights: {
    type: 'tip' | 'warning' | 'danger' | 'info';
    text: string;
  }[];
  insights: {
    type: 'tip' | 'warning' | 'danger' | 'info';
    text: string;
  }[];
  responsibilities: {
    export: 'Buyer' | 'Seller';
    mainTransport: 'Buyer' | 'Seller';
    insurance: 'Buyer' | 'Seller' | 'Optional';
    import: 'Buyer' | 'Seller';
  };
  detailedAnalysis: {
    costAllocation: {
      sellerPercentage: number;
      buyerPercentage: number;
    };
    costTransferPoint: string;
    customs: {
      export: Role;
      transit: Role;
      import: Role;
    };
    insurance: {
      responsible: Role | 'Optional' | 'Both';
      minimumCoverage: string;
    };
    transport: {
      contracting: Role;
    };
    delivery: {
      point: string;
      notices: string;
    };
  };
}

export const INCOTERMS: Record<string, IncotermInfo> = {
  FAS: {
    code: 'FAS',
    name: 'Free Alongside Ship',
    advice: 'Seller delivers when goods are placed alongside the vessel. Risk transfers at the port of shipment. Ideal for bulk or heavy-lift cargo where terminals handle the loading.',
    carbonScore: 65,
    riskScore: 45,
    co2Impact: 'Medium',
    description: 'Free Alongside Ship (named port of shipment)',
    requiredDocuments: ['Commercial Invoice', 'Packing List', 'Dock Receipt', 'Export License'],
    mode: 'Sea / Inland Waterway',
    transferPoint: 'Alongside vessel at port',
    transferPosition: 30,
    sellerCarbonControl: 30,
    buyerCarbonControl: 70,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 25, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 70, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller arranges pre-carriage to the quay; the Buyer contracts the vessel and holds the data for loading and the sea voyage.' },
      { type: 'warning', text: 'Loading on board is arranged by the Buyer, so the Seller has no data on terminal loading or the voyage.' },
      { type: 'danger', text: 'For containers handed over at a terminal, FAS does not fit; FCA describes the real handover and the data split more accurately.' },
      { type: 'tip', text: 'Agree in the contract that the Buyer shares the carrier\'s emission statement for the voyage.' }
    ],
    insights: [
      { type: 'tip', text: 'Best for bulk commodities like grain or coal where shore-based cranes are used.' },
      { type: 'info', text: 'Buyer should clarify if the ship has its own gear to load from alongside.' },
      { type: 'warning', text: 'Risk transfers before loading. Damage during crane lift is Buyer\'s risk.' },
      { type: 'danger', text: 'Avoid if ship cannot dock at the named terminal; Seller must deliver to terminal.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Buyer',
      insurance: 'Buyer',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 30, buyerPercentage: 70 },
      costTransferPoint: 'Alongside vessel at named port',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Buyer', minimumCoverage: 'No obligation for Seller; Buyer carries risk' },
      transport: { contracting: 'Buyer' },
      delivery: { point: 'Alongside vessel at named port', notices: 'Seller must give Buyer notice that goods have been delivered alongside' }
    }
  },
  FOB: {
    code: 'FOB',
    name: 'Free On Board',
    advice: 'Very common in ocean freight. Seller is responsible until goods are loaded on board. Avoid using FOB for containerized cargo; use FCA instead.',
    carbonScore: 70,
    riskScore: 40,
    co2Impact: 'Medium',
    description: 'Free On Board (named port of shipment)',
    requiredDocuments: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Export Declaration'],
    mode: 'Sea / Inland Waterway',
    transferPoint: 'On board the vessel',
    transferPosition: 40,
    sellerCarbonControl: 40,
    buyerCarbonControl: 60,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 35, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 60, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller arranges pre-carriage and loading on board; the Buyer contracts the vessel and holds the voyage data.' },
      { type: 'warning', text: 'The Seller depends on the Buyer for sea-voyage data (Seller\'s Scope 3 Category 9).' },
      { type: 'danger', text: 'For containerised cargo handed to a terminal before loading, FOB does not match the real handover; FCA is the suitable rule.' },
      { type: 'tip', text: 'Agree in the contract that the Buyer shares the carrier\'s emission statement for the voyage.' }
    ],
    insights: [
      { type: 'tip', text: 'Standard for many ocean shipments. Clear cut-off point for risk.' },
      { type: 'info', text: 'Risk passes to the Buyer once the goods are on board the vessel; any cover the Buyer wants should start from that moment.' },
      { type: 'warning', text: 'Incoterms 2020: Seller must now assist with on-board security requirements.' },
      { type: 'danger', text: 'Do NOT use for containers. Use FCA if cargo is handed to a carrier inland.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Buyer',
      insurance: 'Buyer',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 40, buyerPercentage: 60 },
      costTransferPoint: 'On board the vessel at named port',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Buyer', minimumCoverage: 'No obligation for Seller; risk transfers on board' },
      transport: { contracting: 'Buyer' },
      delivery: { point: 'On board the vessel at named port', notices: 'Seller must notify Buyer that goods have been delivered on board' }
    }
  },
  CIF: {
    code: 'CIF',
    name: 'Cost, Insurance & Freight',
    advice: 'Seller organizes transport and minimum insurance. Only for sea/inland waterway transport. Buyer should check if minimum insurance is sufficient.',
    carbonScore: 60,
    riskScore: 50,
    co2Impact: 'High',
    description: 'Cost, Insurance and Freight (named port of destination)',
    requiredDocuments: ['Insurance Policy', 'Bill of Lading', 'Commercial Invoice', 'Packing List'],
    mode: 'Sea / Inland Waterway',
    transferPoint: 'On board the vessel (origin)',
    transferPosition: 40,
    sellerCarbonControl: 80,
    buyerCarbonControl: 20,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 75, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 20, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts and pays the sea carriage to the named port and can obtain carrier emission data for the main leg (Seller\'s Scope 3 Category 4).' },
      { type: 'info', text: 'The Seller\'s insurance obligation under CIF does not change who holds the transport data.' },
      { type: 'danger', text: 'The Buyer has no contract with the carrier and depends on the Seller for main-carriage data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Agree in the contract that the Seller passes the carrier\'s emission data for the voyage to the Buyer.' }
    ],
    insights: [
      { type: 'tip', text: 'Seller handles booking freight, making it easier for first-time buyers.' },
      { type: 'info', text: 'Default insurance is Level C (minimum). Buyer may need higher (Level A).' },
      { type: 'warning', text: 'Critical: Risk transfers at origin, but Seller pays for freight to destination.' },
      { type: 'danger', text: 'Buyer cannot control the carrier choice; potential for hidden port fees.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Seller',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 80, buyerPercentage: 20 },
      costTransferPoint: 'Named port of destination',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Seller', minimumCoverage: 'ICC Clause C (Minimum coverage required)' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'On board at origin port', notices: 'Seller must give Buyer notice for checking of goods' }
    }
  },
  CFR: {
    code: 'CFR',
    name: 'Cost & Freight',
    advice: 'Seller pays for transport to the port. Risk passes to buyer once goods are on board. Buyer is responsible for insurance.',
    carbonScore: 62,
    riskScore: 55,
    co2Impact: 'High',
    description: 'Cost and Freight (named port of destination)',
    requiredDocuments: ['Bill of Lading', 'Commercial Invoice', 'Packing List', 'Export Clearance'],
    mode: 'Sea / Inland Waterway',
    transferPoint: 'On board the vessel (origin)',
    transferPosition: 40,
    sellerCarbonControl: 80,
    buyerCarbonControl: 20,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 75, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 20, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts and pays the sea carriage to the named port and can obtain carrier emission data for the main leg (Seller\'s Scope 3 Category 4).' },
      { type: 'warning', text: 'Risk passes to the Buyer on board at the port of shipment, although the Seller chooses the carrier and the route.' },
      { type: 'danger', text: 'The Buyer has no contract with the carrier and depends on the Seller for main-carriage data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Agree in the contract that the Seller passes the carrier\'s emission data for the voyage to the Buyer.' }
    ],
    insights: [
      { type: 'tip', text: 'Useful when the Buyer has its own global insurance policy.' },
      { type: 'info', text: 'Similar to CIF but excludes the insurance premium cost for Seller.' },
      { type: 'warning', text: 'Buyer must ensure insurance is active BEFORE goods are loaded.' },
      { type: 'danger', text: 'Wait-time at destination port (demurrage) is usually Buyer\'s cost.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Buyer',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 75, buyerPercentage: 25 },
      costTransferPoint: 'Named port of destination',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Buyer', minimumCoverage: 'No obligation for Seller' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'On board at origin port', notices: 'Seller must notify Buyer that goods have been delivered' }
    }
  },
  EXW: {
    code: 'EXW',
    name: 'Ex Works',
    advice: 'Warning: Avoid EXW if you lack local logistics expertise at the origin. Seller has minimum obligation. Buyer handles everything including export clearance.',
    carbonScore: 40,
    riskScore: 90,
    co2Impact: 'High',
    description: 'Ex Works (named place of delivery)',
    requiredDocuments: ['Commercial Invoice', 'Warehouse Receipt', 'Packing List'],
    mode: 'All Modes',
    transferPoint: 'Seller\'s warehouse/factory',
    transferPosition: 5,
    sellerCarbonControl: 5,
    buyerCarbonControl: 95,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 0, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 95, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Buyer contracts all transport from the Seller\'s premises and therefore holds the primary emission data for the whole journey.' },
      { type: 'warning', text: 'The Seller has no contract with any carrier and must ask the Buyer for transport data if a customer requests value-chain emissions.' },
      { type: 'danger', text: 'Largest data gap for the Seller: under the GHG Protocol this transport is the Seller\'s Scope 3 Category 9, but the Seller cannot measure it.' },
      { type: 'tip', text: 'Sellers who expect data requests can consider FCA, where they control loading, export clearance and any pre-carriage to the named place.' }
    ],
    insights: [
      { type: 'danger', text: 'Buyer is responsible for loading. Seller has NO duty to assist.' },
      { type: 'warning', text: 'Export clearance is Buyer\'s duty. Hard if you don\'t have a local entity.' },
      { type: 'info', text: 'Maximum risk for Buyer. Use only for domestic or simple cross-border trade.' },
      { type: 'tip', text: 'Total control over logistics for the Buyer if they have elite freight forwarders.' }
    ],
    responsibilities: {
      export: 'Buyer',
      mainTransport: 'Buyer',
      insurance: 'Buyer',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 5, buyerPercentage: 95 },
      costTransferPoint: 'Seller\'s premises',
      customs: { export: 'Buyer', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Buyer', minimumCoverage: 'No obligation for Seller; Buyer handles all insurance' },
      transport: { contracting: 'Buyer' },
      delivery: { point: 'Seller\'s warehouse or named place', notices: 'Seller must give Buyer notice of the date goods will be at disposal' }
    }
  },
  FCA: {
    code: 'FCA',
    name: 'Free Carrier',
    advice: 'Highly recommended for containerized cargo. Flexible and covers all modes of transport. Better than EXW as seller handles export clearance.',
    carbonScore: 85,
    riskScore: 30,
    co2Impact: 'Low',
    description: 'Free Carrier (named place of delivery)',
    requiredDocuments: ['Commercial Invoice', 'Packing List', 'Carrier Receipt', 'Export License'],
    mode: 'All Modes',
    transferPoint: 'Carrier\'s terminal or Seller\'s site',
    transferPosition: 20,
    sellerCarbonControl: 20,
    buyerCarbonControl: 80,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 15, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 80, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller controls the leg up to the named place of delivery; the Buyer contracts the main carriage and holds its emission data.' },
      { type: 'tip', text: 'Name the place of delivery precisely: it is also the point where data responsibility passes from one party\'s carrier to the other\'s.' },
      { type: 'warning', text: 'The Seller needs the Buyer\'s carrier data to report the main carriage (Seller\'s Scope 3 Category 9).' },
      { type: 'info', text: 'If the named place is the Seller\'s premises, pre-carriage is also arranged by the Buyer and the Seller\'s data access is close to that under EXW.' }
    ],
    insights: [
      { type: 'tip', text: 'The modern standard for containers. Replaces FOB for tech, retail, etc.' },
      { type: 'info', text: 'Seller clears goods for export. Much easier for international buyers.' },
      { type: 'warning', text: 'Specify the exact delivery point to avoid mid-transit risk disputes.' },
      { type: 'tip', text: 'Incoterms 2020: Allows Buyer to instruct carrier to issue "On Board" BL to Seller.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Buyer',
      insurance: 'Buyer',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 20, buyerPercentage: 80 },
      costTransferPoint: 'Named place of delivery to carrier',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Buyer', minimumCoverage: 'No obligation for Seller' },
      transport: { contracting: 'Buyer' },
      delivery: { point: 'Named carrier or place', notices: 'Seller must give notice that goods have been delivered to carrier' }
    }
  },
  CIP: {
    code: 'CIP',
    name: 'Carriage & Insurance Paid To',
    advice: 'Incoterms® 2020 requires higher insurance coverage (ICC A) for CIP. Good for multimodal transport.',
    carbonScore: 75,
    riskScore: 45,
    co2Impact: 'Medium',
    description: 'Carriage and Insurance Paid To (named place of destination)',
    requiredDocuments: ['Comprehensive Insurance Policy', 'Waybill', 'Commercial Invoice', 'Packing List'],
    mode: 'All Modes',
    transferPoint: 'First carrier (origin)',
    transferPosition: 15,
    sellerCarbonControl: 85,
    buyerCarbonControl: 15,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 80, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 15, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts and pays carriage to the named place of destination and can obtain carrier data for these legs (Seller\'s Scope 3 Category 4).' },
      { type: 'info', text: 'The Seller\'s insurance obligation under CIP does not change who holds the transport data.' },
      { type: 'danger', text: 'The Buyer depends on the Seller for main-carriage data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Where several carriers are used, ask the Seller for data per leg rather than a single average figure.' }
    ],
    insights: [
      { type: 'warning', text: 'Higher insurance required! Seller MUST provide ICC Clause A (All Risk).' },
      { type: 'tip', text: 'Ideal for high-value tech or luxury goods moving by air or road.' },
      { type: 'info', text: 'Risk transfers at first carrier, but insurance covers until destination.' },
      { type: 'danger', text: 'Buyer might pay higher freight prices compared to sourcing locally.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Seller',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 85, buyerPercentage: 15 },
      costTransferPoint: 'Named place of destination',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Seller', minimumCoverage: 'ICC Clause A (All Risk required)' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'Handed over to first carrier', notices: 'Seller must notify Buyer that goods are delivered to carrier' }
    }
  },
  CPT: {
    code: 'CPT',
    name: 'Carriage Paid To',
    advice: 'Seller pays for transport but risk passes when goods are handed over to the first carrier. Buyer should organize their own insurance.',
    carbonScore: 72,
    riskScore: 60,
    co2Impact: 'Medium',
    description: 'Carriage Paid To (named place of destination)',
    requiredDocuments: ['Transport Waybill', 'Commercial Invoice', 'Packing List', 'Export Declaration'],
    mode: 'All Modes',
    transferPoint: 'First carrier (origin)',
    transferPosition: 15,
    sellerCarbonControl: 85,
    buyerCarbonControl: 15,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 80, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 15, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts and pays carriage to the named place of destination and can obtain carrier data for these legs (Seller\'s Scope 3 Category 4).' },
      { type: 'warning', text: 'Risk passes to the Buyer when the goods are handed to the first carrier, although the Seller selects the carriers and routes.' },
      { type: 'danger', text: 'The Buyer depends on the Seller for main-carriage data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Where several carriers are used, ask the Seller for data per leg rather than a single average figure.' }
    ],
    insights: [
      { type: 'tip', text: 'Efficient for road transport within Europe or North America.' },
      { type: 'info', text: 'Buyer assumes risk as soon as the first driver picks up the cargo.' },
      { type: 'warning', text: 'Buyer MUST have their global insurance ready to cover transit.' },
      { type: 'danger', text: 'Multiple carriers? Risk passes at the VERY FIRST one. Be careful.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Buyer',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 80, buyerPercentage: 20 },
      costTransferPoint: 'Named place of destination',
      customs: { export: 'Seller', transit: 'Buyer', import: 'Buyer' },
      insurance: { responsible: 'Buyer', minimumCoverage: 'No obligation for Seller' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'Handed over to first carrier', notices: 'Seller must notify Buyer of delivery to carrier' }
    }
  },
  DPU: {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    advice: 'The only Incoterm where seller is responsible for unloading. Useful for projects requiring specialized unloading at destination.',
    carbonScore: 80,
    riskScore: 25,
    co2Impact: 'Low',
    description: 'Delivered at Place Unloaded (named place of destination)',
    requiredDocuments: ['Delivery Note', 'Unloading Report', 'Commercial Invoice', 'Packing List'],
    mode: 'All Modes',
    transferPoint: 'Named place, unloaded',
    transferPosition: 95,
    sellerCarbonControl: 95,
    buyerCarbonControl: 5,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 90, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 5, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts transport to the named place of destination, including unloading there, and holds the primary data (Seller\'s Scope 3 Category 4).' },
      { type: 'warning', text: 'Import clearance and any on-carriage after unloading are arranged by the Buyer.' },
      { type: 'danger', text: 'The Buyer has no carrier contract for the main journey and depends on the Seller for its inbound transport data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Agree a data-sharing clause so that the Buyer receives the Seller\'s carrier data with the delivery documents.' }
    ],
    insights: [
      { type: 'tip', text: 'Perfect for oversized machinery where Seller has the specialized team.' },
      { type: 'warning', text: 'Risk transfers only AFTER unloading is completed.' },
      { type: 'info', text: 'Under DPU the buyer clears the goods for import. If the seller should also handle import clearance, this must be agreed separately in the sales contract.' },
      { type: 'danger', text: 'Seller must ensure they have rights/permits to unload at Buyer\'s site.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Optional',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 95, buyerPercentage: 5 },
      costTransferPoint: 'Named place of destination, unloaded',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
      insurance: { responsible: 'Seller', minimumCoverage: 'No obligation under Incoterms® 2020; the seller bears the risk until delivery' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'Named destination, unloaded', notices: 'Seller must notify Buyer to allow receiving of goods' }
    }
  },
  DAP: {
    code: 'DAP',
    name: 'Delivered at Place',
    advice: 'Seller delivers goods to a named place. Buyer is responsible for unloading and import clearance.',
    carbonScore: 78,
    riskScore: 35,
    co2Impact: 'Low',
    description: 'Delivered at Place (named place of destination)',
    requiredDocuments: ['Delivery Receipt', 'Commercial Invoice', 'Packing List', 'Transport Documents'],
    mode: 'All Modes',
    transferPoint: 'Named place, ready for unloading',
    transferPosition: 90,
    sellerCarbonControl: 90,
    buyerCarbonControl: 10,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 85, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 10, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts transport to the named place of destination and holds primary data for almost the whole journey (Seller\'s Scope 3 Category 4).' },
      { type: 'warning', text: 'Unloading and any on-carriage after the named place are arranged by the Buyer.' },
      { type: 'danger', text: 'The Buyer has no carrier contract for the main journey and depends on the Seller for its inbound transport data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Agree a data-sharing clause so that the Buyer receives the Seller\'s carrier data with the delivery documents.' }
    ],
    insights: [
      { type: 'tip', text: 'Great for e-commerce or regular B2B road freight.' },
      { type: 'warning', text: 'Buyer handles unloading. If the truck waits, Buyer pays detention.' },
      { type: 'info', text: 'Seller is NOT responsible for import taxes or customs clearance.' },
      { type: 'tip', text: 'Highly flexible: Place can be a port, terminal, or warehouse.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Optional',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 90, buyerPercentage: 10 },
      costTransferPoint: 'Named place of destination',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
      insurance: { responsible: 'Seller', minimumCoverage: 'No obligation under Incoterms® 2020; the seller bears the risk until delivery' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'Named destination, ready for unloading', notices: 'Seller must notify Buyer for unloading preparation' }
    }
  },
  DDP: {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    advice: 'Maximum obligation for seller. Warning: Seller must be able to handle import customs in the buyer\'s country. If not possible, use DAP.',
    carbonScore: 70,
    riskScore: 15,
    co2Impact: 'Medium',
    description: 'Delivered Duty Paid (named place of destination)',
    requiredDocuments: ['Import Clearance Confirmation', 'Duty Payment Receipt', 'Commercial Invoice', 'Packing List'],
    mode: 'All Modes',
    transferPoint: 'Named place, cleared for import',
    transferPosition: 98,
    sellerCarbonControl: 98,
    buyerCarbonControl: 2,
    scope3Allocation: [
      { label: 'Seller own sites (Scope 1/2)', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller-contracted transport', percentage: 93, color: 'bg-blue-400' },
      { label: 'Buyer-contracted transport', percentage: 2, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: 'The Seller contracts the whole journey, including import clearance, and holds all primary transport data (Seller\'s Scope 3 Category 4).' },
      { type: 'warning', text: 'Only unloading at the named place of destination is arranged by the Buyer.' },
      { type: 'danger', text: 'The Buyer depends entirely on the Seller for inbound transport data (Buyer\'s Scope 3 Category 4).' },
      { type: 'tip', text: 'Buyers that receive data requests from their own customers should agree data sharing with the Seller before choosing DDP.' }
    ],
    insights: [
      { type: 'danger', text: 'Maximum risk for Seller. Everything is their responsibility until delivery.' },
      { type: 'warning', text: 'Seller MUST be able to get a VAT/Tax ID in the Buyer\'s country.' },
      { type: 'info', text: 'Buyer only takes delivery and unloads; the Seller handles export, carriage and import clearance.' },
      { type: 'tip', text: 'Use for small parcels or internal company intra-movements.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Optional',
      import: 'Seller'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 98, buyerPercentage: 2 },
      costTransferPoint: 'Named place of destination',
      customs: { export: 'Seller', transit: 'Seller', import: 'Seller' },
      insurance: { responsible: 'Seller', minimumCoverage: 'No obligation under Incoterms® 2020; the seller bears the risk until delivery' },
      transport: { contracting: 'Seller' },
      delivery: { point: 'Buyer\'s destination, cleared for import', notices: 'Seller must notify Buyer for unloading' }
    }
  }
};

export interface QuestionStep {
  id: string;
  question: string;
  options: {
    label: string;
    nextStep?: string;
    result?: string;
    action?: (val: string) => void;
  }[];
}

export const DECISION_TREE: Record<string, QuestionStep> = {
  START_ROLE: {
    id: 'START_ROLE',
    question: 'Select your role:',
    options: [
      { label: 'Buyer', nextStep: 'TRANSPORT_MODE' },
      { label: 'Seller', nextStep: 'TRANSPORT_MODE' }
    ]
  },
  TRANSPORT_MODE: {
    id: 'TRANSPORT_MODE',
    question: 'How will the goods be transported ?',
    options: [
      { label: 'Ocean / Water', nextStep: 'OCEAN_FLOW_STEP2' },
      { label: 'Any Mode', nextStep: 'ANY_MODE_FLOW_STEP2' }
    ]
  },

  // ---------- Ocean / Water path ----------
  // I-01: this question now asks only about the main carriage.
  OCEAN_FLOW_STEP2: {
    id: 'OCEAN_FLOW_STEP2',
    question: 'Who arranges and pays for the main sea transport?',
    options: [
      { label: 'Buyer', nextStep: 'OCEAN_BUYER_STEP3' },
      { label: 'Seller', nextStep: 'OCEAN_RISK_POINT' }
    ]
  },
  OCEAN_BUYER_STEP3: {
    id: 'OCEAN_BUYER_STEP3',
    question: 'Who is in charge of loading the goods onto the ship?',
    options: [
      { label: 'Buyer', result: 'FAS' },
      { label: 'Seller', result: 'FOB' }
    ]
  },
  // I-01: risk is asked separately once the seller pays for the carriage.
  OCEAN_RISK_POINT: {
    id: 'OCEAN_RISK_POINT',
    question: 'Where should the risk pass from the seller to the buyer?',
    options: [
      { label: 'On board the ship at the port of shipment', nextStep: 'OCEAN_SELLER_STEP3' },
      { label: 'At the destination', nextStep: 'DESTINATION_FLOW' }
    ]
  },
  OCEAN_SELLER_STEP3: {
    id: 'OCEAN_SELLER_STEP3',
    question: 'Does the seller also need to buy insurance for the shipment?',
    options: [
      { label: 'Yes', result: 'CIF' },
      { label: 'No', result: 'CFR' }
    ]
  },

  // ---------- Any Mode path ----------
  // I-05: the question now asks about risk, and the import-country answer leads to the D rules.
  ANY_MODE_FLOW_STEP2: {
    id: 'ANY_MODE_FLOW_STEP2',
    question: 'Where should the risk pass from the seller to the buyer?',
    options: [
      { label: 'Seller’s Premises', nextStep: 'SELLER_PREMISES_FLOW' },
      { label: 'Named Place (Export)', nextStep: 'EXPORT_FLOW' },
      { label: 'Destination (Import)', nextStep: 'DESTINATION_FLOW' }
    ]
  },
  // I-03
  SELLER_PREMISES_FLOW: {
    id: 'SELLER_PREMISES_FLOW',
    question: 'Who loads the goods and clears them for export?',
    options: [
      { label: 'Buyer', result: 'EXW' },
      { label: 'Seller', result: 'FCA' }
    ]
  },
  // I-04
  EXPORT_FLOW: {
    id: 'EXPORT_FLOW',
    question: 'Who arranges and pays for the main transport?',
    options: [
      { label: 'Buyer', result: 'FCA' },
      { label: 'Seller', nextStep: 'CARRIAGE_INSURANCE_FLOW' }
    ]
  },
  // Replaces IMPORT_FLOW; CPT/CIP now sit under the export-country answer.
  CARRIAGE_INSURANCE_FLOW: {
    id: 'CARRIAGE_INSURANCE_FLOW',
    question: 'Does the seller also need to buy insurance for the shipment?',
    options: [
      { label: 'Yes', result: 'CIP' },
      { label: 'No', result: 'CPT' }
    ]
  },

  // ---------- Destination (D rules), shared by both paths ----------
  // Replaces BUYER_PREMISES_FLOW.
  DESTINATION_FLOW: {
    id: 'DESTINATION_FLOW',
    question: 'Should the seller be responsible for unloading at the destination?',
    options: [
      { label: 'Yes', result: 'DPU' },
      { label: 'No', nextStep: 'CUSTOMS_FLOW' }
    ]
  },
  CUSTOMS_FLOW: {
    id: 'CUSTOMS_FLOW',
    question: 'Who should organize the import customs clearance?',
    options: [
      { label: 'Buyer', result: 'DAP' },
      { label: 'Seller', result: 'DDP' }
    ]
  }
};

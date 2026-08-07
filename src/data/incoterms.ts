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
  sellerCarbonControl: number;
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 25, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 70, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Use electric terminal tractors for alongside delivery to lower port emissions.' },
      { type: 'warning', text: 'Scope 3 data handover at "alongside" point is often a reporting blind spot.' },
      { type: 'danger', text: 'Major data gaps exist in terminal loading emissions; Buyer lacks visibility.' },
      { type: 'info', text: 'All ocean transport emissions fall under Buyer Cat 4 responsibility.' }
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 35, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 60, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Prioritize carriers with eco-efficient ship designs for the main carriage.' },
      { type: 'warning', text: 'Detailed primary data needed from the stevedoring company for loading emissions.' },
      { type: 'danger', text: 'Containerized cargo on FOB often leads to Scope 3 "Double Counting" errors.' },
      { type: 'info', text: 'New rules require digital product passports to include FOB port data.' }
    ],
    insights: [
      { type: 'tip', text: 'Standard for many ocean shipments. Clear cut-off point for risk.' },
      { type: 'info', text: 'Insurance starts once goods pass the ship\'s rail (on board).' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 75, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 20, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Use green procurement criteria when the Seller selects the ocean carrier.' },
      { type: 'info', text: 'Although Seller pays, Buyer must still report as Cat 4 (upstream).' },
      { type: 'warning', text: 'Seller must share actual emission data, not just theoretical averages.' },
      { type: 'danger', text: 'CIF limits Buyer\'s ability to switch to low-carbon vessel options.' }
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
      costTransferPoint: 'Destination port/vessel',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 75, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 20, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Optimize vessel filling rates to reduce the intensity per TEU.' },
      { type: 'warning', text: 'Detailed secondary data is required if primary carrier data is absent.' },
      { type: 'info', text: 'Reporting obligations for CFR must account for cross-border carbon taxes.' },
      { type: 'danger', text: 'Risk/Control decoupling makes carbon optimization difficult for the Buyer.' }
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
      costTransferPoint: 'Destination port/vessel',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 0, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 95, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'info', text: '95% of logistical emissions are the Buyer\'s Upstream Cat 4 responsibility.' },
      { type: 'warning', text: 'SMEs using EXW often fail to capture factory-gate loading emissions.' },
      { type: 'danger', text: 'Maximum "Data Gap" risk. Buyer rarely gets accurate energy data from Seller.' },
      { type: 'tip', text: 'Use EXW if you have a "Green First" carrier partnership at the origin.' }
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
      costTransferPoint: 'Seller\'s warehouse or named place',
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 15, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 80, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Encourage Seller to use electric last-mile vans for terminal delivery.' },
      { type: 'info', text: 'FCA provides a clean data split point for legal carbon reporting.' },
      { type: 'warning', text: 'Small sellers may need help calculating their Cat 9 (outbound) share.' },
      { type: 'info', text: 'Higher reporting accuracy due to clear carrier handover documentation.' }
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
      costTransferPoint: 'Named carrier or place',
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 80, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 15, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'warning', text: 'Seller must disclose if air-freight was used for faster transit under CIP.' },
      { type: 'tip', text: 'Use Intermodal transport (Rail+Road) to reduce Cat 9 emissions by 60%.' },
      { type: 'info', text: 'Insurance premiums under CIP rarely factor in carbon-offsetting costs.' },
      { type: 'danger', text: 'New taxes on aviation fuel make CIP air-delivery significantly more expensive.' }
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
      costTransferPoint: 'Named destination',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 80, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 15, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Consolidate smaller CPT shipments into full truckloads (FTL) to save fuel.' },
      { type: 'warning', text: 'Buyer still holds responsibility for Cat 4 reporting under CPT.' },
      { type: 'info', text: 'CPT allows smaller buyers to leverage Seller\'s larger logistics scale.' },
      { type: 'danger', text: ' "Least-cost" routing by the Seller often ignores carbon-intensive routes.' }
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
      costTransferPoint: 'Named destination',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 90, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 5, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Use biodiesel-powered forklifts for the heavy unloading mandated by DPU.' },
      { type: 'warning', text: 'Unloading energy consumption is often omitted from Cat 9 reports.' },
      { type: 'info', text: 'Simplifies reporting for the Buyer significantly compared to EXW.' },
      { type: 'danger', text: 'Seller specialized unloading equipment must meet local GHG standards.' }
    ],
    insights: [
      { type: 'tip', text: 'Perfect for oversized machinery where Seller has the specialized team.' },
      { type: 'warning', text: 'Risk transfers only AFTER unloading is completed.' },
      { type: 'info', text: 'The only term that explicitly includes unloading by the Seller.' },
      { type: 'danger', text: 'Seller must ensure they have rights/permits to unload at Buyer\'s site.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Seller',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 95, buyerPercentage: 5 },
      costTransferPoint: 'Named destination, unloaded',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
      insurance: { responsible: 'Seller', minimumCoverage: 'Recommended All Risk (Seller covers until destination)' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 85, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 10, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'Select final-mile delivery windows to avoid peak-traffic congestion (and CO2).' },
      { type: 'info', text: 'Clear allocation of emissions until the doorstep of the destination.' },
      { type: 'warning', text: 'Mandatory reporting of fuel use for cross-border trucking under DAP.' },
      { type: 'danger', text: 'Waiting times at destination increase idling emissions (Buyer responsibility).' }
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
      insurance: 'Seller',
      import: 'Buyer'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 90, buyerPercentage: 10 },
      costTransferPoint: 'Named destination',
      customs: { export: 'Seller', transit: 'Seller', import: 'Buyer' },
      insurance: { responsible: 'Seller', minimumCoverage: 'Seller usually insures until point of delivery' },
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
      { label: 'Seller Scope 1/2', percentage: 5, color: 'bg-blue-600' },
      { label: 'Seller Scope 3 Cat 9', percentage: 93, color: 'bg-blue-400' },
      { label: 'Buyer Scope 3 Cat 4', percentage: 2, color: 'bg-orange-500' }
    ],
    sustainabilityInsights: [
      { type: 'tip', text: 'DDP offers the Seller total control to implement "Net Zero" logistics end-to-end.' },
      { type: 'danger', text: 'Carbon Border Adjustment Mechanism (CBAM) complicates DDP tax filings.' },
      { type: 'warning', text: 'Seller must include all international legs in their Scope 3 disclosure.' },
      { type: 'info', text: 'Highest transparency for the Buyer, as they inherit a carbon-cleared product.' }
    ],
    insights: [
      { type: 'danger', text: 'Maximum risk for Seller. Everything is their responsibility until delivery.' },
      { type: 'warning', text: 'Seller MUST be able to get a VAT/Tax ID in the Buyer\'s country.' },
      { type: 'info', text: 'Buyer literally does nothing but receive the cargo.' },
      { type: 'tip', text: 'Use for small parcels or internal company intra-movements.' }
    ],
    responsibilities: {
      export: 'Seller',
      mainTransport: 'Seller',
      insurance: 'Seller',
      import: 'Seller'
    },
    detailedAnalysis: {
      costAllocation: { sellerPercentage: 98, buyerPercentage: 2 },
      costTransferPoint: 'Buyer\'s destination',
      customs: { export: 'Seller', transit: 'Seller', import: 'Seller' },
      insurance: { responsible: 'Seller', minimumCoverage: 'Seller covers all risks until final delivery' },
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
  // OCEAN_FLOW
  OCEAN_FLOW_STEP2: {
    id: 'OCEAN_FLOW_STEP2',
    question: 'Who pays for shipping, and who takes the risk if something goes wrong?',
    options: [
      { label: 'Buyer', nextStep: 'OCEAN_BUYER_STEP3' },
      { label: 'Seller', nextStep: 'OCEAN_SELLER_STEP3' }
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
  OCEAN_SELLER_STEP3: {
    id: 'OCEAN_SELLER_STEP3',
    question: 'Does the seller also need to buy insurance for the shipment?',
    options: [
      { label: 'Yes', result: 'CIF' },
      { label: 'No', result: 'CFR' }
    ]
  },
  // ANY_MODE_FLOW
  ANY_MODE_FLOW_STEP2: {
    id: 'ANY_MODE_FLOW_STEP2',
    question: 'When does responsibility shift from the seller to the buyer?',
    options: [
      { label: 'Seller’s Premises', result: 'EXW' },
      { label: 'Named Place (Export)', result: 'FCA' },
      { label: 'Named Place (Import)', nextStep: 'IMPORT_FLOW' },
      { label: 'Buyer’s Premises', nextStep: 'BUYER_PREMISES_FLOW' }
    ]
  },
  IMPORT_FLOW: {
    id: 'IMPORT_FLOW',
    question: 'Does the seller also need to buy insurance for the shipment?',
    options: [
      { label: 'Yes', result: 'CIP' },
      { label: 'No', result: 'CPT' }
    ]
  },
  BUYER_PREMISES_FLOW: {
    id: 'BUYER_PREMISES_FLOW',
    question: 'Should the seller be responsible for unloading?',
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

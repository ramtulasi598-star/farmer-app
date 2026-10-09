import { Market, MarketArrivalImport, MarketCycleEvent, MarketRequirement, PriceHistoryPoint } from '../types';

export const MARKET_CYCLE_DURATION_SECONDS = 8 * 60; // 8 minutes = 480 seconds

export const INITIAL_INWARD_ARRIVALS: MarketArrivalImport[] = [
  {
    id: 'arr_init_1',
    marketId: 'mkt_tirupati',
    marketName: 'Tirupati APMC Central Agricultural Market Yard',
    cropName: 'Tomato',
    variety: 'Hybrid Sahu (F1)',
    grade: 'A',
    importedQuantityKg: 14000,
    sourceRegion: 'Kolar & Chintamani Belts, Karnataka',
    arrivalVehicle: 'Eicher Pro 1110 (AP-04-TX-4421)',
    timestamp: '8 min ago',
    updatedInCycle: 1,
    marketBuyingPrice: 32,
  },
  {
    id: 'arr_init_2',
    marketId: 'mkt_palamaner',
    marketName: 'Palamaner APMC Agricultural Market',
    cropName: 'Potato',
    variety: 'Kufri Jyoti Fresh Dig',
    grade: 'A',
    importedQuantityKg: 8500,
    sourceRegion: 'Hassan & Kolar Cold Logistics, Karnataka',
    arrivalVehicle: 'Tata 407 Heavy (KA-08-E-1209)',
    timestamp: '16 min ago',
    updatedInCycle: 1,
    marketBuyingPrice: 24,
  },
  {
    id: 'arr_init_3',
    marketId: 'mkt_chittoor',
    marketName: 'Chittoor Murakambattu APMC Market Yard',
    cropName: 'Onion',
    variety: 'Nasik Red Medium',
    grade: 'B',
    importedQuantityKg: 11000,
    sourceRegion: 'Kurnool & Solapur Wholesale Transit',
    arrivalVehicle: 'Ashok Leyland Dost XL (AP-03-V-7712)',
    timestamp: '24 min ago',
    updatedInCycle: 1,
    marketBuyingPrice: 30,
  },
  {
    id: 'arr_init_4',
    marketId: 'mkt_kuppam',
    marketName: 'Kuppam Vegetable & Floriculture APMC Market',
    cropName: 'Green Chilli',
    variety: 'G-4 Spicy Green',
    grade: 'A',
    importedQuantityKg: 5500,
    sourceRegion: 'Krishnagiri Border Hub, Tamil Nadu',
    arrivalVehicle: 'Mahindra Bolero Maxi Truck (TN-24-H-3190)',
    timestamp: '32 min ago',
    updatedInCycle: 1,
    marketBuyingPrice: 38,
  },
];

export const INITIAL_CYCLE_EVENTS: MarketCycleEvent[] = [
  {
    id: 'evt_init_1',
    timestamp: 'Just now',
    cycleNumber: 1,
    marketId: 'mkt_palamaner',
    marketName: 'Palamaner APMC Agricultural Market',
    type: 'PRICE_CHANGE',
    cropName: 'Potato',
    title: 'Mandi Auction Price Adjusted (+₹2/kg)',
    description: 'Official APMC buying price increased from ₹22/kg to ₹24/kg due to high northern processing demand. Note: Price changed exclusively by Market Committee, not farmer.',
    oldPrice: 22,
    newPrice: 24,
    updatedBy: 'APMC Market Board',
  },
  {
    id: 'evt_init_2',
    timestamp: '8 min ago',
    cycleNumber: 1,
    marketId: 'mkt_tirupati',
    marketName: 'Tirupati APMC Central Agricultural Market Yard',
    type: 'IMPORT_ARRIVAL',
    cropName: 'Tomato',
    title: 'Inward Crop Import Arrival (14 Tonnes)',
    description: '14,000 kg Grade A Tomato arrived from Kolar production belts via Eicher AP-04-TX-4421 and unloaded at Shed-B.',
    importedQuantityKg: 14000,
    updatedBy: 'APMC Market Board',
  },
  {
    id: 'evt_init_3',
    timestamp: '16 min ago',
    cycleNumber: 1,
    marketId: 'mkt_madanapalle',
    marketName: 'Madanapalle Tomato APMC Market Yard',
    type: 'PREBOOK_UPDATE',
    cropName: 'Tomato',
    title: 'Mandi Quota Pre-Booked (+1,500 kg)',
    description: 'Venkateswara Agro Traders locked 1,500 kg of Grade A Tomato from the morning APMC yard quota.',
    preBookedIncrementKg: 1500,
    updatedBy: 'APMC Market Board',
  },
  {
    id: 'evt_init_4',
    timestamp: '24 min ago',
    cycleNumber: 1,
    marketId: 'mkt_kuppam',
    marketName: 'Kuppam Vegetable & Floriculture APMC Market',
    type: 'PRICE_CHANGE',
    cropName: 'Green Chilli',
    title: 'Official Mandi Price Revised (+₹2/kg)',
    description: 'Official APMC buying price updated from ₹36/kg to ₹38/kg. (Rates updated strictly by Market Board; farmers cannot alter official mandi benchmark).',
    oldPrice: 36,
    newPrice: 38,
    updatedBy: 'APMC Market Board',
  },
];

// Helper to format 8-minute countdown display (e.g. 07:48)
export function formatTimerCountdown(seconds: number): {
  minutesText: string;
  secondsText: string;
  formatted: string;
  percentRemaining: number;
} {
  const clamped = Math.max(0, Math.min(MARKET_CYCLE_DURATION_SECONDS, seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  const percent = Math.round((clamped / MARKET_CYCLE_DURATION_SECONDS) * 100);

  return {
    minutesText: minsStr,
    secondsText: secsStr,
    formatted: `${minsStr}:${secsStr}`,
    percentRemaining: percent,
  };
}

// Region & vehicle pools for authentic inward crop arrivals
const IMPORT_REGIONS = [
  'Kolar & Chintamani Belts, Karnataka (NH-75)',
  'Kadapa & Rayachoty Horticulture Belt, AP',
  'Solapur & Kurnool Wholesale Transit Corridor',
  'Hassan & Malur Cold Chain Hub, Karnataka',
  'Krishnagiri & Dharmapuri Border Corridor, TN',
  'Warangal & Khammam Spice APMC Line, Telangana',
  'Anantapur & Tadipatri Groundnut Zone, AP',
  'Guntur Mirchi Yard Regional Feeder, AP',
];

const VEHICLE_PLATES = [
  'Eicher Pro 1110 (AP-04-TX-4421)',
  'Tata 407 Turbo (KA-08-E-1209)',
  'Ashok Leyland 1616 (AP-26-Y-9988)',
  'Mahindra Bolero Maxi Truck (AP-03-V-7712)',
  'BharatBenz 1217C (TN-24-H-3190)',
  'Tata Intra V50 (TS-08-UA-4411)',
];

/**
 * Executes an 8-minute Market Cycle Update:
 * 1. Market prices change (Strictly by Market Board, not by farmer)
 * 2. Crops are imported / Inward arrival unloaded at Mandi
 * 3. Crop pre-booking quota increases at Mandi
 */
export function execute8MinuteMarketCycle(
  currentMarkets: Market[],
  cycleNumber: number,
  language: 'en' | 'te' = 'en'
): {
  updatedMarkets: Market[];
  newArrivals: MarketArrivalImport[];
  newEvents: MarketCycleEvent[];
  summaryMessage: string;
  summaryMessageTelugu: string;
} {
  const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newEvents: MarketCycleEvent[] = [];
  const newArrivals: MarketArrivalImport[] = [];

  // Pick 3 target markets for live updates this cycle
  // Prioritize primary user mandis (Palamaner, Tirupati, Kuppam, Chittoor, Madanapalle)
  const targetMarkets = [...currentMarkets].sort(() => 0.5 - Math.random()).slice(0, 3);
  const targetMarketIds = new Set(targetMarkets.map(m => m.id));

  const updatedMarkets = currentMarkets.map(market => {
    if (!targetMarketIds.has(market.id)) {
      return market;
    }

    // 1. PRICE CHANGE (ONLY CHANGED BY MARKET, NOT BY FARMER)
    // Select 1 or 2 requirements to change buying prices
    const updatedRequirements: MarketRequirement[] = market.cropsRequired.map((req, idx) => {
      // Pick first crop or random crop to change price
      if (idx === 0 || (idx === 1 && Math.random() > 0.4)) {
        // Price delta: -2 to +3
        const deltas = [-2, -1, +1, +2, +3];
        const delta = deltas[Math.floor(Math.random() * deltas.length)];
        const oldPrice = req.buyingPrice;
        const newPrice = Math.max(12, oldPrice + delta);

        // Pre-booking update in the requirement
        // E.g. +600 to +1,200 kg booked by wholesale traders
        const preBookIncrement = Math.min(
          req.remainingQuantity,
          Math.floor(Math.random() * 800) + 400
        );
        const newPreBooked = req.preBookedQuantity + preBookIncrement;
        const newRemaining = Math.max(0, req.requiredQuantity - newPreBooked);

        // Update price history point
        const newHistoryPoint: PriceHistoryPoint = {
          date: new Date().toLocaleDateString('en-GB'),
          time: timestampStr,
          price: newPrice,
          arrivalsQty: (req.priceHistory?.today?.[req.priceHistory.today.length - 1]?.arrivalsQty || 2000) + 1200,
          trend: delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'STABLE',
        };

        const existingToday = req.priceHistory?.today || [];
        const updatedToday = [...existingToday, newHistoryPoint].slice(-10); // keep last 10 points

        // Record Price Change Event
        if (delta !== 0) {
          newEvents.push({
            id: `evt_price_${Date.now()}_${market.id}_${req.id}`,
            timestamp: timestampStr,
            cycleNumber,
            marketId: market.id,
            marketName: market.name,
            type: 'PRICE_CHANGE',
            cropName: req.cropName,
            title: `${market.name}: ${req.cropName} Price ${delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`}/kg`,
            description: `Official APMC auction price changed from ₹${oldPrice}/kg to ₹${newPrice}/kg. Rate updated exclusively by the APMC Market Board. Farmers cannot alter official mandi benchmark rates.`,
            oldPrice,
            newPrice,
            updatedBy: 'APMC Market Board',
          });
        }

        // Record Pre-Booking Event
        if (preBookIncrement > 0) {
          newEvents.push({
            id: `evt_prebook_${Date.now()}_${market.id}_${req.id}`,
            timestamp: timestampStr,
            cycleNumber,
            marketId: market.id,
            marketName: market.name,
            type: 'PREBOOK_UPDATE',
            cropName: req.cropName,
            title: `${market.name}: ${req.cropName} Pre-Booked +${preBookIncrement.toLocaleString('en-IN')} kg`,
            description: `Commercial traders & buyers pre-booked ${preBookIncrement.toLocaleString('en-IN')} kg from open quota. Pre-booked: ${newPreBooked.toLocaleString('en-IN')} kg / ${req.requiredQuantity.toLocaleString('en-IN')} kg.`,
            preBookedIncrementKg: preBookIncrement,
            updatedBy: 'APMC Market Board',
          });
        }

        return {
          ...req,
          buyingPrice: newPrice,
          preBookedQuantity: newPreBooked,
          remainingQuantity: newRemaining,
          updatedAt: 'Just now (8-min cycle)',
          updatedMinutesAgo: 0,
          isPriceOutdated: false,
          priceHistory: {
            today: updatedToday,
            week: req.priceHistory?.week || [],
            month: req.priceHistory?.month || [],
          },
        };
      }
      return req;
    });

    // 2. CROP IMPORT / INWARD ARRIVAL AT THIS MARKET
    // Generate an inward import delivery
    const randomReq = updatedRequirements[0] || market.cropsRequired[0];
    const importedQty = Math.floor(Math.random() * 8000) + 6000; // 6,000 - 14,000 kg
    const region = IMPORT_REGIONS[Math.floor(Math.random() * IMPORT_REGIONS.length)];
    const vehicle = VEHICLE_PLATES[Math.floor(Math.random() * VEHICLE_PLATES.length)];

    const arrivalRecord: MarketArrivalImport = {
      id: `arr_${Date.now()}_${market.id}`,
      marketId: market.id,
      marketName: market.name,
      cropName: randomReq?.cropName || 'Tomato',
      variety: randomReq?.variety || 'Hybrid',
      grade: randomReq?.grade || 'A',
      importedQuantityKg: importedQty,
      sourceRegion: region,
      arrivalVehicle: vehicle,
      timestamp: timestampStr,
      updatedInCycle: cycleNumber,
      marketBuyingPrice: randomReq?.buyingPrice || 28,
    };

    newArrivals.push(arrivalRecord);

    newEvents.push({
      id: `evt_import_${Date.now()}_${market.id}`,
      timestamp: timestampStr,
      cycleNumber,
      marketId: market.id,
      marketName: market.name,
      type: 'IMPORT_ARRIVAL',
      cropName: randomReq?.cropName || 'Tomato',
      title: `${market.name}: Inward Import Arrived (${(importedQty / 1000).toFixed(1)} MT)`,
      description: `${importedQty.toLocaleString('en-IN')} kg ${randomReq?.cropName || 'Produce'} imported from ${region} via ${vehicle} and received at auction bay.`,
      importedQuantityKg: importedQty,
      updatedBy: 'APMC Market Board',
    });

    // Add recent update post to market
    const newUpdatePost = {
      id: `post_cycle_${Date.now()}_${market.id}`,
      marketId: market.id,
      marketName: market.name,
      authorName: 'APMC Market Secretary & Auction Desk',
      title: `⏱️ 8-Min Mandi Auction Board Refresh (#${cycleNumber})`,
      content: `Fresh market rates posted, ${(importedQty / 1000).toFixed(1)} MT inward crop arrival imported from ${region}, and pre-booking quota refreshed. (All rates strictly set by Market Board).`,
      cropTag: randomReq?.cropName,
      type: 'PRICE_UPDATE' as const,
      timestamp: `${timestampStr} (Live Cycle #${cycleNumber})`,
      likes: Math.floor(Math.random() * 15) + 3,
    };

    return {
      ...market,
      lastUpdatedText: 'Just now (8-min cycle)',
      lastUpdatedMinutesAgo: 0,
      cropsRequired: updatedRequirements,
      recentUpdates: [newUpdatePost, ...(market.recentUpdates || [])].slice(0, 8),
    };
  });

  const summaryMessage = `8-Min Market Refresh: APMC Mandis updated buying rates, imported ${(newArrivals.reduce((acc, a) => acc + a.importedQuantityKg, 0) / 1000).toFixed(1)} MT inward arrivals, and updated pre-booking slots. Note: Prices updated exclusively by Market.`;
  const summaryMessageTelugu = `8 నిమిషాల మార్కెట్ సైకిల్: మార్కెట్ యార్డులు కొత్త ధరలు, దిగుమతి పంటల రాక, మరియు ప్రీ-బుకింగ్ స్లాట్లను నవీకరించాయి. (ధరలు మార్కెట్ ద్వారా మాత్రమే నిర్ణయించబడతాయి).`;

  return {
    updatedMarkets,
    newArrivals,
    newEvents,
    summaryMessage,
    summaryMessageTelugu,
  };
}

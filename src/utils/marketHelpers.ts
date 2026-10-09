import { Market, Crop, MarketRequirement, PriceHistoryPoint } from '../types';

export function getCropEmoji(cropName: string): string {
  const lower = cropName.toLowerCase();
  if (lower.includes('tomato') || lower.includes('టమాటా')) return '🍅';
  if (lower.includes('potato') || lower.includes('ఆలుగడ్డ') || lower.includes('బంగాళాదుంప')) return '🥔';
  if (lower.includes('green chilli') || lower.includes('పచ్చిమిర్చి')) return '🌶️';
  if (lower.includes('red chilli') || lower.includes('ఎండుమిర్చి') || lower.includes('తేజా')) return '🌶️';
  if (lower.includes('chilli') || lower.includes('మిర్చి')) return '🌶️';
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('వరి') || lower.includes('బియ్యం')) return '🌾';
  if (lower.includes('onion') || lower.includes('ఉల్లిపాయ')) return '🧅';
  if (lower.includes('mango') || lower.includes('మామిడి')) return '🥭';
  if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('వేరుశనగ') || lower.includes('పల్లీ')) return '🥜';
  if (lower.includes('turmeric') || lower.includes('పసుపు')) return '🌿';
  if (lower.includes('cotton') || lower.includes('పత్తి')) return '☁️';
  return '🌱';
}

/**
 * Returns specific display crop name and variety. Never returns vague "Green".
 */
export function getSpecificCropDisplay(cropName: string, variety?: string): { mainName: string; varietyText?: string } {
  // If cropName already has variety in parentheses like "Tomato (Hybrid Sahu)" or "Tomato (టమాటా)"
  const parenMatch = cropName.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const main = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    // If inside contains a recognized variety or Telugu translation
    return {
      mainName: main,
      varietyText: variety || (inside.includes('Hybrid') || inside.includes('Kufri') || inside.includes('Teja') || inside.includes('Sona') ? inside : undefined),
    };
  }
  return {
    mainName: cropName.trim(),
    varietyText: variety,
  };
}

/**
 * Calculate approximate road distance between farmer's district and market
 */
export function getMarketDistance(market: Market, farmerDistrict = 'Chittoor'): { distanceKm: number; text: string } {
  const normDistrict = farmerDistrict.toLowerCase();
  const mktDistrict = market.district.toLowerCase();

  let km = market.distanceKm || 25;

  if (normDistrict === mktDistrict) {
    km = 18;
  } else if (normDistrict.includes('chittoor')) {
    if (mktDistrict.includes('kolar')) km = 54;
    else if (mktDistrict.includes('kurnool')) km = 210;
    else if (mktDistrict.includes('guntur')) km = 365;
    else if (mktDistrict.includes('hyderabad')) km = 480;
    else if (mktDistrict.includes('warangal')) km = 520;
    else if (mktDistrict.includes('nizamabad')) km = 585;
  } else if (normDistrict.includes('warangal')) {
    if (mktDistrict.includes('warangal')) km = 12;
    else if (mktDistrict.includes('hyderabad')) km = 145;
    else if (mktDistrict.includes('nizamabad')) km = 195;
    else if (mktDistrict.includes('guntur')) km = 240;
    else if (mktDistrict.includes('kurnool')) km = 340;
    else if (mktDistrict.includes('chittoor')) km = 520;
    else if (mktDistrict.includes('kolar')) km = 560;
  }

  return {
    distanceKm: km,
    text: `${km} km from your farm`,
  };
}

export interface RelativeUpdateInfo {
  isOutdated: boolean;
  label: string;
  badgeClass: string;
}

/**
 * Requirement 2: Relative time formatting with warning for outdated prices
 */
export function formatRelativeTime(
  minutesAgo: number = 8,
  isExplicitOutdated?: boolean,
  language: string = 'en'
): RelativeUpdateInfo {
  const isOutdated = isExplicitOutdated || minutesAgo >= 60;

  if (isOutdated) {
    const hours = Math.max(1, Math.floor(minutesAgo / 60));
    const hoursText = hours === 1 ? '1 hour' : `${hours} hours`;
    return {
      isOutdated: true,
      label: language === 'te' 
        ? `⚠ ధర పాతబడి ఉండవచ్చు (${hours} గం. క్రితం)`
        : `⚠ Price may be outdated (${hoursText} ago)`,
      badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    };
  }

  // Fresh current price
  const minText = minutesAgo <= 1 ? '1 min' : `${minutesAgo} min`;
  return {
    isOutdated: false,
    label: language === 'te'
      ? `🟢 ${minutesAgo <= 1 ? '1 నిమిషం' : `${minutesAgo} నిమిషాల`} క్రితం అప్‌డేట్`
      : `🟢 Updated ${minText} ago`,
    badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  };
}

/**
 * Returns current APMC market buying price for comparison against farmer expected rate
 */
export function getMarketBuyingPriceForCrop(crop: Crop, markets: Market[]): number {
  if (crop.currentMarketBuyingPrice) return crop.currentMarketBuyingPrice;

  const targetCategory = crop.cropCategory.toLowerCase();
  for (const m of markets) {
    for (const req of m.cropsRequired) {
      if (req.cropName.toLowerCase().includes(targetCategory)) {
        return req.buyingPrice;
      }
    }
  }

  // Sensible agricultural APMC defaults
  if (targetCategory.includes('tomato')) return 28;
  if (targetCategory.includes('potato')) return 25;
  if (targetCategory.includes('chilli')) return 195;
  if (targetCategory.includes('rice')) return 23;
  if (targetCategory.includes('onion')) return 28;
  if (targetCategory.includes('mango')) return 28;
  if (targetCategory.includes('groundnut') || targetCategory.includes('peanut') || targetCategory.includes('వేరుశనగ')) return 68;
  if (targetCategory.includes('turmeric')) return 145;
  return Math.max(10, Math.round(crop.expectedPrice * 0.88));
}

export interface DemandBadgeInfo {
  label: string;
  badgeClass: string;
  emoji: string;
}

/**
 * Requirement 10: Clear Demand Indicator
 * Possible statuses:
 * 🔥 High Demand
 * 🟢 Normal Demand
 * 🟡 Low Demand
 * ⚠ Requirement Almost Filled
 */
export function getDemandBadge(
  demand?: string,
  remainingQty?: number,
  requiredQty?: number
): DemandBadgeInfo {
  // If remaining is less than 15% of required target, show requirement almost filled
  if (remainingQty !== undefined && requiredQty !== undefined && requiredQty > 0) {
    if (remainingQty <= requiredQty * 0.15 && remainingQty > 0) {
      return {
        label: '⚠ Requirement Almost Filled',
        badgeClass: 'text-amber-300 bg-amber-950/40 border-amber-500/40',
        emoji: '⚠',
      };
    }
  }

  const d = (demand || 'HIGH').toUpperCase();
  if (d === 'HIGH') {
    return {
      label: '🔥 High Demand',
      badgeClass: 'text-rose-400 bg-rose-950/40 border-rose-500/40',
      emoji: '🔥',
    };
  }
  if (d === 'LOW') {
    return {
      label: '🟡 Low Demand',
      badgeClass: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/40',
      emoji: '🟡',
    };
  }
  return {
    label: '🟢 Normal Demand',
    badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
    emoji: '🟢',
  };
}

export interface CropGradeDetail {
  grade: 'A' | 'B' | 'C';
  label: string;
  badgeLabel: string;
  pricePerKg: number;
  diffFromA: number;
  totalQuantity: number;
  preBookedQuantity: number;
  remainingQuantity: number;
  preBookedPercent: number;
  specifications: string;
  idealFor: string;
  colorClass: string;
}

export interface CropPriceTimelineSummary {
  todayOpening: number;
  todayPeak: number;
  todayCurrent: number;
  yesterdayClosing: number;
  sevenDaysAgo: number;
  weeklyGain: number;
  intradayUpdates: { time: string; price: number; status: string }[];
}

export interface CropPreBookOverview {
  totalTargetKg: number;
  preBookedKg: number;
  remainingKg: number;
  preBookedPercent: number;
  fillStatus: 'OPEN' | 'ALMOST_FULL' | 'HIGH_DEMAND';
  advanceWindow: string;
  lockInPrice: number;
  confirmedBuyersCount: number;
  benefits: string[];
}

/**
 * Returns grade-wise breakdown (Grade A, B, C) with prices and pre-booking distribution for a crop
 */
export function getCropGradeBreakdown(
  cropName: string,
  basePrice: number,
  totalRequired: number = 15000,
  totalPreBooked: number = 8500
): CropGradeDetail[] {
  const norm = cropName.toLowerCase();
  const isHighValue = basePrice > 100;

  // Grade A (100% benchmark)
  const gradeAPrice = basePrice;
  // Grade B (~85-88%)
  const gradeBPrice = isHighValue ? basePrice - 15 : Math.max(5, Math.round(basePrice * 0.86));
  // Grade C (~70-74%)
  const gradeCPrice = isHighValue ? basePrice - 35 : Math.max(4, Math.round(basePrice * 0.72));

  // Volume distributions
  const gradeATotal = Math.round(totalRequired * 0.6);
  const gradeBTotal = Math.round(totalRequired * 0.28);
  const gradeCTotal = totalRequired - gradeATotal - gradeBTotal;

  const gradeAPreBooked = Math.round(totalPreBooked * 0.65);
  const gradeBPreBooked = Math.round(totalPreBooked * 0.25);
  const gradeCPreBooked = Math.max(0, totalPreBooked - gradeAPreBooked - gradeBPreBooked);

  // Crop-specific quality specifications
  let specsA = 'Size: 55-70mm, Uniform red color, High firmness, <2% surface blemishes';
  let specsB = 'Size: 40-55mm, Standard mandi color, Medium firmness, Local retail grade';
  let specsC = 'Processing grade, Varied sizes, Suitable for sauce, paste & food processing';

  if (norm.includes('potato') || norm.includes('బంగాళాదుంప') || norm.includes('ఆలుగడ్డ')) {
    specsA = 'Large 60-80mm tubers, Smooth skin, Zero green patches, Export / Chips quality';
    specsB = 'Medium 45-60mm, Standard table consumption, Clean skin, Minor blemishes';
    specsC = 'Small / Baby potatoes <40mm, Processing / Starch extraction grade';
  } else if (norm.includes('chilli') || norm.includes('మిర్చి')) {
    specsA = 'Length: 7-9cm, Glossy deep color, High pungency (SHU 70k+), Zero moisture defect';
    specsB = 'Length: 5-7cm, Regular market spice, Intact pods, Standard mandi arrival';
    specsC = 'Broken / Crushed pods, Oil extraction / Spice powder processing grade';
  } else if (norm.includes('rice') || norm.includes('వరి') || norm.includes('బియ్యం') || norm.includes('paddy')) {
    specsA = 'Moisture <14%, Slender long grain, Zero broken grains, Premium mill grade';
    specsB = 'Moisture 14-16%, Standard whole grain, Minor chalky kernels <5%';
    specsC = 'Moisture 16%+, High brokens, Suitable for parboiled / rice bran processing';
  } else if (norm.includes('onion') || norm.includes('ఉల్లిపాయ')) {
    specsA = 'Size: 55mm+ diameter, Tight pink/red skin, High pungency, Zero sprouting';
    specsB = 'Size: 40-50mm, Regular cooking standard, Intact outer layer';
    specsC = 'Size <40mm (small onions), Pickling & food processing grade';
  } else if (norm.includes('mango') || norm.includes('మామిడి')) {
    specsA = 'Weight: 300-450g per fruit, Brix 15%+, Firm skin, 0% fruit fly or sap burn';
    specsB = 'Weight: 200-300g, Minor surface marks, Table consumption quality';
    specsC = 'Processing grade, Pulp & juice extraction factory standard';
  } else if (norm.includes('groundnut') || norm.includes('peanut') || norm.includes('వేరుశనగ') || norm.includes('పల్లీ')) {
    specsA = 'Moisture <8%, Two-seeded bold pods, Shelling turnout >72%, Zero aflatoxin';
    specsB = 'Moisture 8-10%, Regular pod size, Shelling turnout 68-70%, Oil mill standard';
    specsC = 'Immature / split pods, Industrial oil extraction grade';
  } else if (norm.includes('turmeric') || norm.includes('పసుపు')) {
    specsA = 'Nizamabad / Duggirala bold fingers, Curcumin >3.5%, Polished, Moisture <10%';
    specsB = 'Standard fingers & bulbs, Curcumin 2.8-3.2%, Dry commercial grade';
    specsC = 'Broken pieces & mother bulbs, Industrial spice powdering grade';
  }

  return [
    {
      grade: 'A',
      label: 'Grade A (Premium Quality)',
      badgeLabel: '🥇 Grade A',
      pricePerKg: gradeAPrice,
      diffFromA: 0,
      totalQuantity: gradeATotal,
      preBookedQuantity: gradeAPreBooked,
      remainingQuantity: Math.max(0, gradeATotal - gradeAPreBooked),
      preBookedPercent: Math.min(100, Math.round((gradeAPreBooked / (gradeATotal || 1)) * 100)),
      specifications: specsA,
      idealFor: 'Supermarket Chains, Export & Premium Wholesale',
      colorClass: 'emerald',
    },
    {
      grade: 'B',
      label: 'Grade B (Standard Mandi)',
      badgeLabel: '🥈 Grade B',
      pricePerKg: gradeBPrice,
      diffFromA: gradeAPrice - gradeBPrice,
      totalQuantity: gradeBTotal,
      preBookedQuantity: gradeBPreBooked,
      remainingQuantity: Math.max(0, gradeBTotal - gradeBPreBooked),
      preBookedPercent: Math.min(100, Math.round((gradeBPreBooked / (gradeBTotal || 1)) * 100)),
      specifications: specsB,
      idealFor: 'Local APMC Commission Agents & City Retailers',
      colorClass: 'amber',
    },
    {
      grade: 'C',
      label: 'Grade C (Processing Grade)',
      badgeLabel: '🥉 Grade C',
      pricePerKg: gradeCPrice,
      diffFromA: gradeAPrice - gradeCPrice,
      totalQuantity: gradeCTotal,
      preBookedQuantity: gradeCPreBooked,
      remainingQuantity: Math.max(0, gradeCTotal - gradeCPreBooked),
      preBookedPercent: Math.min(100, Math.round((gradeCPreBooked / (gradeCTotal || 1)) * 100)),
      specifications: specsC,
      idealFor: 'Food Processors, Puree Factories & Bulk Catering',
      colorClass: 'stone',
    },
  ];
}

/**
 * Returns dynamic price timeline summary for a market requirement (Today, Yesterday, 7 Days)
 */
export function getCropPriceTimeline(req: MarketRequirement): CropPriceTimelineSummary {
  const base = req.buyingPrice;
  const step = base > 100 ? 5 : 1;

  const todayOpening = Math.max(1, base - step * 2);
  const todayPeak = base;
  const yesterdayClosing = Math.max(1, base - Math.round(step * 1.5));
  const sevenDaysAgo = Math.max(1, base - step * 3);
  const weeklyGain = base - sevenDaysAgo;

  return {
    todayOpening,
    todayPeak,
    todayCurrent: base,
    yesterdayClosing,
    sevenDaysAgo,
    weeklyGain,
    intradayUpdates: [
      { time: '12:30 PM', price: base, status: 'Active Closing Bid' },
      { time: '09:30 AM', price: base, status: 'Peak Arrivals Auction' },
      { time: '08:00 AM', price: Math.max(1, base - step), status: 'Morning Open Floor' },
      { time: '06:00 AM', price: todayOpening, status: 'Early Yard Arrivals' },
    ],
  };
}

/**
 * Returns pre-booking details and explanation for a crop
 */
export function getCropPreBookOverview(req: MarketRequirement): CropPreBookOverview {
  const total = req.requiredQuantity || 10000;
  const preBooked = req.preBookedQuantity || 6000;
  const remaining = Math.max(0, total - preBooked);
  const percent = Math.min(100, Math.round((preBooked / (total || 1)) * 100));

  let fillStatus: 'OPEN' | 'ALMOST_FULL' | 'HIGH_DEMAND' = 'OPEN';
  if (percent >= 85) fillStatus = 'ALMOST_FULL';
  else if (req.demand === 'HIGH' || percent >= 50) fillStatus = 'HIGH_DEMAND';

  return {
    totalTargetKg: total,
    preBookedKg: preBooked,
    remainingKg: remaining,
    preBookedPercent: percent,
    fillStatus,
    advanceWindow: 'Immediate (Next 24 to 48 Hours)',
    lockInPrice: req.buyingPrice,
    confirmedBuyersCount: Math.max(3, Math.round(preBooked / 2000)),
    benefits: [
      'Lock in current APMC buying price prior to cutting harvest',
      'Guaranteed unloading slot at Mandi weighbridge without delay',
      'Electronic booking slip issued directly to your phone',
      'Direct payment settlement with verified mandi buyers',
    ],
  };
}

/**
 * Returns crop-specific price history points and trends for a specific market requirement
 */
export function getCropPriceHistory(
  req: MarketRequirement,
  timeRange: 'today' | 'week' | 'month'
): PriceHistoryPoint[] {
  if (req.priceHistory && req.priceHistory[timeRange]) {
    return req.priceHistory[timeRange];
  }

  const basePrice = req.buyingPrice;
  const isHighValue = basePrice > 100; // e.g. chilli
  const step = isHighValue ? 5 : 1;

  if (timeRange === 'today') {
    return [
      { date: '06:00 AM', price: Math.max(1, basePrice - step * 2), arrivalsQty: Math.round(req.requiredQuantity * 0.15), trend: 'UP' },
      { date: '08:30 AM', price: Math.max(1, basePrice - step), arrivalsQty: Math.round(req.requiredQuantity * 0.35), trend: 'UP' },
      { date: '10:30 AM', price: basePrice, arrivalsQty: Math.round(req.requiredQuantity * 0.65), trend: 'UP' },
      { date: '12:30 PM', price: basePrice, arrivalsQty: Math.round(req.requiredQuantity * 0.85), trend: 'STABLE' },
    ];
  }

  if (timeRange === 'week') {
    return [
      { date: '01 Oct', price: Math.max(1, basePrice - step * 4), arrivalsQty: Math.round(req.requiredQuantity * 0.75), trend: 'DOWN' },
      { date: '02 Oct', price: Math.max(1, basePrice - step * 3), arrivalsQty: Math.round(req.requiredQuantity * 0.7), trend: 'UP' },
      { date: '03 Oct', price: Math.max(1, basePrice - step * 2), arrivalsQty: Math.round(req.requiredQuantity * 0.65), trend: 'UP' },
      { date: '04 Oct', price: Math.max(1, basePrice - step * 2), arrivalsQty: Math.round(req.requiredQuantity * 0.6), trend: 'STABLE' },
      { date: '05 Oct', price: Math.max(1, basePrice - step), arrivalsQty: Math.round(req.requiredQuantity * 0.55), trend: 'UP' },
      { date: '06 Oct', price: basePrice, arrivalsQty: Math.round(req.requiredQuantity * 0.5), trend: 'UP' },
      { date: '07 Oct (Today)', price: basePrice, arrivalsQty: Math.round(req.requiredQuantity * 0.75), trend: 'STABLE' },
    ];
  }

  // month
  return [
    { date: 'Week 1 Sep', price: Math.max(1, basePrice - step * 6), arrivalsQty: req.requiredQuantity * 4, trend: 'DOWN' },
    { date: 'Week 2 Sep', price: Math.max(1, basePrice - step * 4), arrivalsQty: Math.round(req.requiredQuantity * 3.5), trend: 'UP' },
    { date: 'Week 3 Sep', price: Math.max(1, basePrice - step * 2), arrivalsQty: req.requiredQuantity * 3, trend: 'UP' },
    { date: 'Week 4 Sep', price: Math.max(1, basePrice - step), arrivalsQty: Math.round(req.requiredQuantity * 2.5), trend: 'UP' },
    { date: 'Current Week', price: basePrice, arrivalsQty: req.requiredQuantity * 2, trend: 'UP' },
  ];
}


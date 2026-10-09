import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriceHistoryPoint, MarketRequirement, Crop, CropGrade } from '../types';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Share2,
  Calendar,
  Layers,
  Flame,
  CheckCircle2,
  X,
  Send,
  PlusCircle,
  Lock,
  ShieldCheck,
  Award,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  HelpCircle,
} from 'lucide-react';
import {
  getCropEmoji,
  getSpecificCropDisplay,
  getMarketDistance,
  formatRelativeTime,
  getDemandBadge,
  getCropPriceHistory,
  getCropGradeBreakdown,
  getCropPriceTimeline,
  getCropPreBookOverview,
  CropGradeDetail,
} from '../utils/marketHelpers';
import { TransportNetReturnModal } from '../components/TransportNetReturnModal';
import { MarketSupplyRequestModal } from '../components/MarketSupplyRequestModal';
import { MarketCycleTimerBanner } from '../components/MarketCycleTimerBanner';

interface MarketDetailPageProps {
  marketId: string;
  onBack: () => void;
  onSendCropToMarket?: () => void;
}

export const MarketDetailPage: React.FC<MarketDetailPageProps> = ({
  marketId,
  onBack,
  onSendCropToMarket,
}) => {
  const {
    getMarketById,
    currentUser,
    toggleFollowMarket,
    crops,
    t,
    language,
  } = useApp();
  const market = getMarketById(marketId);

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [showTransportModal, setShowTransportModal] = useState(false);

  // Request modal state (Requirement: Request button & Form)
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [requestReq, setRequestReq] = useState<MarketRequirement | null>(null);

  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id && c.remainingQuantity > 0);

  if (!market) {
    return (
      <div className="p-8 text-center text-stone-400">
        <p>Market not found.</p>
        <button onClick={onBack} className="text-emerald-400 mt-2 underline">
          Back
        </button>
      </div>
    );
  }

  const [selectedHistoryCropId, setSelectedHistoryCropId] = useState<string>(
    market?.cropsRequired[0]?.id || ''
  );
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [showPreBookExplainer, setShowPreBookExplainer] = useState<boolean>(true);

  const isFollowed = currentUser?.followedMarketIds.includes(market.id);
  const distanceInfo = getMarketDistance(market, currentUser?.district || 'Chittoor');

  const activeRequirement: MarketRequirement =
    market?.cropsRequired.find(r => r.id === selectedHistoryCropId) || market?.cropsRequired[0] || {
      id: 'req_fallback',
      cropName: 'Tomato',
      requiredQuantity: 10000,
      preBookedQuantity: 6000,
      remainingQuantity: 4000,
      buyingPrice: 28,
      grade: 'A',
      demand: 'HIGH',
      updatedAt: '10 min ago',
    };

  const currentHistory: PriceHistoryPoint[] = activeRequirement
    ? getCropPriceHistory(activeRequirement, timeRange)
    : market.priceHistory[timeRange];

  // SVG Chart Calculation
  const prices = currentHistory.map(h => h.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice || 1;

  const points = currentHistory.map((item, index) => {
    const x = (index / (currentHistory.length - 1 || 1)) * 300 + 20;
    const y = 110 - ((item.price - minPrice) / priceRange) * 80;
    return `${x},${y}`;
  }).join(' ');

  const preBookedPercent = activeRequirement
    ? Math.round((activeRequirement.preBookedQuantity / activeRequirement.requiredQuantity) * 100)
    : 0;

  // Grade breakdown and price timeline for the divided crop
  const gradeBreakdown: CropGradeDetail[] = getCropGradeBreakdown(
    activeRequirement.cropName,
    activeRequirement.buyingPrice,
    activeRequirement.requiredQuantity,
    activeRequirement.preBookedQuantity
  );

  const priceTimeline = getCropPriceTimeline(activeRequirement);
  const preBookOverview = getCropPreBookOverview(activeRequirement);

  // Farmer's asking price reference (market price is less than farmer asking price)
  const matchedFarmerCrop = crops.find(
    c => c.farmerId === currentUser?.id && c.cropName.toLowerCase().includes(activeRequirement.cropName.toLowerCase().split(' ')[0])
  );
  const farmerAskingPrice = matchedFarmerCrop?.expectedPrice || Math.round(activeRequirement.buyingPrice * 1.25);
  const priceDeficit = farmerAskingPrice - activeRequirement.buyingPrice;

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'FARMER' && (
            <button
              onClick={() => {
                setRequestReq(null);
                setShowRequestModal(true);
              }}
              className="py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'సరఫరా అభ్యర్థన' : 'Request Supply'}</span>
            </button>
          )}

          <button
            onClick={() => toggleFollowMarket(market.id)}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isFollowed
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-amber-400' : ''}`} />
            <span>{isFollowed ? t('unfollowMarket') : t('followMarket')}</span>
          </button>
        </div>
      </div>

      {/* Market Hero Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="relative h-36 w-full">
          <img
            src={market.bannerImage}
            alt={market.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="bg-emerald-500/90 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              APMC Regulated Mandi
            </span>
            <h2 className="text-lg font-black text-white mt-1 leading-tight">{market.name}</h2>
            <p className="text-xs text-emerald-300 font-semibold">{market.teluguName}</p>
          </div>
        </div>

        <div className="p-4 space-y-3 text-xs text-stone-300">
          <div className="flex items-start gap-1.5 text-stone-400">
            <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <span>{market.address}</span>
          </div>

          {/* Distance Indicator (Requirement 6) */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 font-semibold text-xs">
            <span className="text-base">📏</span>
            <span>{distanceInfo.text}</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-300 text-[11px]">
              {market.district} District
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-stone-500 block text-[9px] uppercase font-bold">Hours</span>
                <span className="text-white font-medium">{market.operatingHours}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-stone-500 block text-[9px] uppercase font-bold">Yard Office</span>
                <span className="text-white font-medium">{market.contactNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE 8-MINUTE APMC MANDI BOARD TIMER & INWARD ARRIVALS (Requirement 3) */}
      <MarketCycleTimerBanner marketId={market.id} />

      {/* SECTION 11: CROP DIVISION & MARKET PRICE INTELLIGENCE */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-stone-800/80 pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📊</span>
              <h3 className="text-sm font-black text-white">
                {language === 'te' ? 'పంటల విభజన & మార్కెట్ ధరల చరిత్ర' : 'Crop-Wise Divided Market Prices & History'}
              </h3>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {language === 'te'
                ? 'ప్రత్యేక పంటలు, గ్రేడ్ల వారీగా ధరలు & ప్రీ-బుకింగ్ వివరాలు (మార్కెట్ ద్వారా మాత్రమే అప్‌డేట్)'
                : 'Divided by commodity: Separated buying prices, grade specs & pre-booking status'}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-950 text-[10px] text-amber-300 border border-amber-500/20">
              <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Prices updated exclusively by Market Committee (not by farmer)</span>
            </div>
          </div>
          
          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
            APMC Live
          </span>
        </div>

        {/* 1. DIVIDING CROPS TABS / SELECTOR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'te' ? 'పంటను ఎంచుకోండి (Dividing Crops):' : 'Select Crop (Divided Commodities):'}</span>
            </span>
            <span className="text-stone-500 text-[10px]">{market.cropsRequired.length} items</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
            {market.cropsRequired.map(req => {
              const isSelected = req.id === activeRequirement.id;
              const emoji = getCropEmoji(req.cropName);
              const cropDisplay = getSpecificCropDisplay(req.cropName, req.variety);
              const fillPct = Math.min(100, Math.round((req.preBookedQuantity / (req.requiredQuantity || 1)) * 100));

              return (
                <button
                  key={req.id}
                  onClick={() => {
                    setSelectedHistoryCropId(req.id);
                    setSelectedGradeFilter('ALL');
                  }}
                  className={`px-3 py-2 rounded-2xl border text-left shrink-0 transition cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-white">
                    <span>{emoji}</span>
                    <span className="truncate max-w-[100px]">{cropDisplay.mainName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                    <span className="font-extrabold text-emerald-400">₹{req.buyingPrice}/kg</span>
                    <span className="text-stone-600">•</span>
                    <span className="bg-stone-800 text-amber-300 font-semibold px-1 rounded text-[9px]">
                      Gr. {req.grade}
                    </span>
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-400 text-[9px]">{fillPct}% book</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ACTIVE DIVIDED CROP OVERVIEW & SEPARATED PRICES */}
        <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-855 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCropEmoji(activeRequirement.cropName)}</span>
                <div>
                  <h4 className="font-black text-base text-white leading-tight">
                    {getSpecificCropDisplay(activeRequirement.cropName, activeRequirement.variety).mainName}
                  </h4>
                  {getSpecificCropDisplay(activeRequirement.cropName, activeRequirement.variety).varietyText && (
                    <span className="text-xs text-amber-300 font-semibold block">
                      {getSpecificCropDisplay(activeRequirement.cropName, activeRequirement.variety).varietyText}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  🥇 Grade {activeRequirement.grade} Standard
                </span>
                {(() => {
                  const dInfo = getDemandBadge(activeRequirement.demand, activeRequirement.remainingQuantity, activeRequirement.requiredQuantity);
                  return (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dInfo.badgeClass}`}>
                      {dInfo.label}
                    </span>
                  );
                })()}
                <span className="text-[10px] text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-full">
                  {formatRelativeTime(activeRequirement.updatedMinutesAgo || 8, activeRequirement.isPriceOutdated, language).label}
                </span>
              </div>
            </div>

            {/* Quick Pre-Book / Request Button for this active crop */}
            {currentUser?.role === 'FARMER' && (
              <button
                onClick={() => {
                  setRequestReq(activeRequirement);
                  setShowRequestModal(true);
                }}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-xs shadow-md transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pre-Book</span>
              </button>
            )}
          </div>

          {/* PRICES SEPARATED: APMC Buying Price vs Farmer Asking Rate vs Intraday Range */}
          <div className="pt-2 border-t border-stone-850/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              {language === 'te' ? 'ధరల విభజన వివరాలు (Separated Prices):' : 'Price Separation & Market vs Asking Comparison:'}
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* APMC Buying Price */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-emerald-500/30">
                <span className="text-[9px] font-extrabold uppercase text-emerald-400 tracking-wider block">
                  APMC BUYING PRICE (MANDI)
                </span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  ₹{activeRequirement.buyingPrice}
                  <span className="text-xs font-normal text-stone-400">/kg</span>
                </p>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Official yard weighted rate
                </span>
              </div>

              {/* Farmer Reference Asking Price */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[9px] font-extrabold uppercase text-stone-400 tracking-wider block">
                  FARMER ASKING PRICE
                </span>
                <p className="text-xl font-black text-white mt-0.5">
                  ₹{farmerAskingPrice}
                  <span className="text-xs font-normal text-stone-400">/kg</span>
                </p>
                <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                  ▼ Mandi rate is ₹{priceDeficit}/kg less
                </span>
              </div>
            </div>

            {/* Intraday Peak, Avg, Low stats */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-850">
                <span className="text-[9px] text-stone-400 uppercase font-bold block">Day High (Peak)</span>
                <span className="text-xs font-black text-emerald-400">₹{priceTimeline.todayPeak}/kg</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-850">
                <span className="text-[9px] text-stone-400 uppercase font-bold block">Day Open (Low)</span>
                <span className="text-xs font-bold text-amber-400">₹{priceTimeline.todayOpening}/kg</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-850">
                <span className="text-[9px] text-stone-400 uppercase font-bold block">Weekly Trend</span>
                <span className={`text-xs font-extrabold ${priceTimeline.weeklyGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {priceTimeline.weeklyGain >= 0 ? '+' : ''}₹{priceTimeline.weeklyGain}/kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SHOW WHICH GRADE & GRADE-SEPARATED PRICES */}
        <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-855 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                {language === 'te' ? 'గ్రేడ్ల వారీగా విభజన & ధరలు' : 'Which Grade & Quality Price Breakdown'}
              </h4>
            </div>
            <span className="text-[10px] text-stone-400">3 Mandi Grades</span>
          </div>

          <p className="text-[11px] text-stone-400">
            {language === 'te'
              ? 'మార్కెట్ నాణ్యతను బట్టి ధరలు వేర్వేరుగా ఉంటాయి. మీ పంట గ్రేడ్‌ను బట్టి ధర చూడండి:'
              : 'APMC mandis divide crop prices by physical grading specs. Compare prices and pre-bookings across grades:'}
          </p>

          {/* Grade Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'A', 'B', 'C'] as const).map(g => (
              <button
                key={g}
                onClick={() => setSelectedGradeFilter(g)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  selectedGradeFilter === g
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
              </button>
            ))}
          </div>

          {/* Grade Detail Cards */}
          <div className="space-y-2">
            {gradeBreakdown
              .filter(item => selectedGradeFilter === 'ALL' || item.grade === selectedGradeFilter)
              .map(item => {
                const isPrimary = item.grade === activeRequirement.grade;
                return (
                  <div
                    key={item.grade}
                    className={`p-3 rounded-2xl border transition space-y-2 ${
                      isPrimary
                        ? 'bg-stone-900/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-stone-900/50 border-stone-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{item.badgeLabel}</span>
                          <span className="text-[11px] text-stone-300 font-medium">({item.label})</span>
                          {isPrimary && (
                            <span className="text-[9px] bg-emerald-500 text-stone-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                              Active Need
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Ideal for: {item.idealFor}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-emerald-400">
                          ₹{item.pricePerKg}
                          <span className="text-[10px] font-normal text-stone-400">/kg</span>
                        </span>
                        {item.diffFromA > 0 ? (
                          <span className="text-[10px] text-rose-400 font-semibold block">
                            -₹{item.diffFromA}/kg vs Gr. A
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold block">
                            Benchmark Rate
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quality Specs */}
                    <div className="p-2 rounded-xl bg-stone-950 border border-stone-850 text-[11px] text-stone-300 flex items-start gap-1.5">
                      <span className="text-stone-400 shrink-0 mt-0.5">🔍</span>
                      <span><strong>Specs:</strong> {item.specifications}</span>
                    </div>

                    {/* Pre-Booking in this Grade */}
                    <div className="space-y-1 pt-1 border-t border-stone-850/80">
                      <div className="flex justify-between items-center text-[10px] text-stone-400">
                        <span>
                          Pre-booked: <strong className="text-amber-400">{item.preBookedQuantity.toLocaleString('en-IN')} kg</strong> ({item.preBookedPercent}%)
                        </span>
                        <span>
                          Remaining Open: <strong className="text-emerald-400">{item.remainingQuantity.toLocaleString('en-IN')} kg</strong>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden flex">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${item.preBookedPercent}%` }}
                        ></div>
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${100 - item.preBookedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 4. SHOW HOW CROP IS PRE-BOOKED (Pre-Booking Status & Explainer) */}
        <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-855 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                {language === 'te' ? 'పంట ప్రీ-బుకింగ్ స్థితి & విధానం' : 'How This Crop is Pre-Booked & Status'}
              </h4>
            </div>
            <button
              onClick={() => setShowPreBookExplainer(!showPreBookExplainer)}
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
            >
              <span>{showPreBookExplainer ? 'Hide Guide' : 'How It Works'}</span>
              {showPreBookExplainer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Pre-Booked Volume Progress & Breakdown */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex justify-between text-xs text-stone-300">
              <span>
                Target Volume: <strong className="text-white">{preBookOverview.totalTargetKg.toLocaleString('en-IN')} kg</strong>
              </span>
              <span>
                Status:{' '}
                <strong className={preBookOverview.fillStatus === 'HIGH_DEMAND' ? 'text-rose-400' : 'text-emerald-400'}>
                  {preBookOverview.fillStatus === 'HIGH_DEMAND' ? '🔥 High Demand' : '🟢 Open for Booking'}
                </strong>
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${preBookOverview.preBookedPercent}%` }}
              ></div>
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${100 - preBookOverview.preBookedPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1 text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                <span>Pre-Booked: <strong className="text-amber-300">{preBookOverview.preBookedKg.toLocaleString('en-IN')} kg ({preBookOverview.preBookedPercent}%)</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Still Required: <strong className="text-emerald-300">{preBookOverview.remainingKg.toLocaleString('en-IN')} kg</strong></span>
              </span>
            </div>
          </div>

          {/* Explainer: How Pre-Booking Works */}
          {showPreBookExplainer && (
            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'te' ? 'ప్రీ-బుకింగ్ ఎలా పనిచేస్తుంది?' : 'How Pre-Booking Works for Farmers:'}</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-[11px] text-stone-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">1.</span>
                  <span><strong>Lock In Mandi Price:</strong> Fix ₹{activeRequirement.buyingPrice}/kg now before cutting harvest to protect against auction price drops.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">2.</span>
                  <span><strong>Priority Weighbridge Gate-Pass:</strong> Receive an instant digital token for express yard entry without standing in tractor queues.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">3.</span>
                  <span><strong>Delivery Window:</strong> Scheduled 24 to 48 hours arrival slot directly matched with verified mandi buyers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">4.</span>
                  <span><strong>Guaranteed Direct Settlement:</strong> Weighbridge slip automatically releases payment directly into your bank or cash slip.</span>
                </div>
              </div>

              {currentUser?.role === 'FARMER' && (
                <button
                  onClick={() => {
                    setRequestReq(activeRequirement);
                    setShowRequestModal(true);
                  }}
                  className="w-full py-2.5 mt-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {language === 'te'
                      ? `ఈ ${getSpecificCropDisplay(activeRequirement.cropName).mainName} స్లాట్ ప్రీ-బుక్ చేయండి (Request)`
                      : `Pre-Book Slot for ${getSpecificCropDisplay(activeRequirement.cropName).mainName} →`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. DIVIDED MARKET PRICE HISTORY (SVG Chart, Dynamic Timeline, Arrivals Table) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{getSpecificCropDisplay(activeRequirement.cropName).mainName} {t('marketPriceHistory')}</span>
              </h4>
              <span className="text-[10px] text-stone-400">APMC recorded weighted arrival bids</span>
            </div>

            {/* Time range selector: Today, 7 Days, 30 Days */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px]">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-2 py-1 rounded-lg transition font-medium cursor-pointer ${
                  timeRange === 'today' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-2 py-1 rounded-lg transition font-medium cursor-pointer ${
                  timeRange === 'week' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-2 py-1 rounded-lg transition font-medium cursor-pointer ${
                  timeRange === 'month' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Visual SVG Trend Line */}
          <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
            <div className="flex justify-between items-center text-[11px] text-stone-400 mb-2">
              <span>Peak: <strong className="text-emerald-400">₹{Math.max(...prices)}/kg</strong></span>
              <span>Avg: <strong className="text-white">₹{Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}/kg</strong></span>
              <span>Low: <strong className="text-amber-400">₹{Math.min(...prices)}/kg</strong></span>
            </div>

            <div className="w-full h-32 relative">
              <svg viewBox="0 0 340 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="20" y1="30" x2="320" y2="30" stroke="#292524" strokeDasharray="3 3" />
                <line x1="20" y1="70" x2="320" y2="70" stroke="#292524" strokeDasharray="3 3" />
                <line x1="20" y1="110" x2="320" y2="110" stroke="#292524" />

                {/* Trend Polyline */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />

                {/* Data dots */}
                {currentHistory.map((item, index) => {
                  const x = (index / (currentHistory.length - 1 || 1)) * 300 + 20;
                  const y = 110 - ((item.price - minPrice) / priceRange) * 80;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="4" fill="#34d399" stroke="#09090b" strokeWidth="2" />
                      <text
                        x={x}
                        y={y - 8}
                        fontSize="9"
                        fill="#e7e5e4"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        ₹{item.price}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Dynamic Timeline Price History for the Active Divided Crop */}
          <div className="rounded-2xl bg-stone-950 p-3.5 border border-stone-850 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block">
              Mandi Price Timeline Summary ({getSpecificCropDisplay(activeRequirement.cropName).mainName})
            </span>

            <div className="space-y-2 text-xs">
              {/* TODAY */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  TODAY'S INTRADAY AUCTIONS
                </span>
                <div className="space-y-1 text-stone-200">
                  {priceTimeline.intradayUpdates.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center py-0.5 ${
                        idx < priceTimeline.intradayUpdates.length - 1 ? 'border-b border-stone-800/60' : ''
                      }`}
                    >
                      <span className="text-stone-400 flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-mono">{item.time}</span>
                        <span className="text-[11px] text-stone-300">{item.status}</span>
                      </span>
                      <span className="font-extrabold text-white">₹{item.price}/kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* YESTERDAY & 7 DAYS AGO */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    YESTERDAY
                  </span>
                  <p className="text-base font-black text-white mt-1">₹{priceTimeline.yesterdayClosing}/kg</p>
                  <span className="text-[10px] text-stone-500">Closing benchmark</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    7 DAYS AGO
                  </span>
                  <p className="text-base font-black text-amber-400 mt-1">₹{priceTimeline.sevenDaysAgo}/kg</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {priceTimeline.weeklyGain >= 0 ? '+' : ''}₹{priceTimeline.weeklyGain}/kg this week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabular Price History (Detailed arrivals & weighted prices) */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-2.5">{t('dateCol')}</th>
                  <th className="p-2.5">{t('priceCol')}</th>
                  <th className="p-2.5">{t('quantityCol')}</th>
                  <th className="p-2.5 text-right">{t('trendCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {currentHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-800/40 transition">
                    <td className="p-2.5 font-medium text-white">{row.date}</td>
                    <td className="p-2.5 font-extrabold text-emerald-400">₹{row.price}/kg</td>
                    <td className="p-2.5 text-stone-400">{row.arrivalsQty.toLocaleString('en-IN')} kg</td>
                    <td className="p-2.5 text-right">
                      {row.trend === 'UP' && (
                        <span className="text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +₹2
                        </span>
                      )}
                      {row.trend === 'DOWN' && (
                        <span className="text-rose-400 font-bold flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3" /> -₹1
                        </span>
                      )}
                      {row.trend === 'STABLE' && (
                        <span className="text-stone-400 flex items-center justify-end gap-0.5">
                          <Minus className="w-3 h-3" /> Flat
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 10: CROPS REQUIRED & DEMAND CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Market Crop Requirements</span>
          </h3>
          <span className="text-[10px] text-stone-400">{market.cropsRequired.length} Commodities</span>
        </div>

        <div className="space-y-2.5">
          {market.cropsRequired.map(req => {
            const emoji = getCropEmoji(req.cropName);
            const cropDisplay = getSpecificCropDisplay(req.cropName, req.variety);
            const timeInfo = formatRelativeTime(
              req.updatedMinutesAgo || 8,
              req.isPriceOutdated,
              language
            );

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-sm flex items-center gap-1.5 truncate">
                      <span>{emoji}</span>
                      <span>{cropDisplay.mainName}</span>
                    </h4>
                    {cropDisplay.varietyText && (
                      <span className="text-[11px] text-amber-300 font-semibold block ml-5">
                        {cropDisplay.varietyText}
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded font-semibold border border-stone-700">
                        Grade {req.grade}
                      </span>
                      {/* Demand Badge (Requirement 10: 🔥 High, 🟢 Normal, 🟡 Low, ⚠ Almost Filled) */}
                      {(() => {
                        const demandInfo = getDemandBadge(req.demand, req.remainingQuantity, req.requiredQuantity);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-0.5 ${demandInfo.badgeClass}`}>
                            <span>{demandInfo.label}</span>
                          </span>
                        );
                      })()}
                      {/* Price Update Time (Requirement 2) */}
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${timeInfo.badgeClass}`}>
                        {timeInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-stone-400 block font-bold uppercase">
                      {language === 'te' ? 'మార్కెట్ కొనుగోలు ధర' : 'MARKET BUYING PRICE'}
                    </span>
                    <span className="text-base font-black text-emerald-400">₹{req.buyingPrice}<span className="text-xs font-normal text-stone-400">/kg</span></span>
                  </div>
                </div>

                {/* Progress Breakdown & Quantity Clarity (Requirement 3: "still required") */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Target: <strong className="text-white">{req.requiredQuantity.toLocaleString('en-IN')} kg</strong></span>
                    <span>Pre-booked: <strong className="text-amber-400">{req.preBookedQuantity.toLocaleString('en-IN')} kg</strong></span>
                    <span>
                      <strong className="text-emerald-400">{req.remainingQuantity.toLocaleString('en-IN')} kg</strong>{' '}
                      <span className="text-emerald-300 font-medium">still required</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${(req.preBookedQuantity / req.requiredQuantity) * 100}%` }}
                    ></div>
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(req.remainingQuantity / req.requiredQuantity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowTransportModal(true)}
                    className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🚛 Est. Transport & Net Return</span>
                  </button>

                  {currentUser?.role === 'FARMER' && (
                    <button
                      onClick={() => {
                        setRequestReq(req);
                        setShowRequestModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 13: MARKET FEED UPDATES */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <span>📢</span>
          <span>{t('marketUpdatesFeed')}</span>
        </h3>

        <div className="space-y-2">
          {market.recentUpdates.map(post => (
            <div
              key={post.id}
              className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span className="font-bold text-emerald-400">{post.authorName}</span>
                <span>{post.timestamp}</span>
              </div>
              <h5 className="font-bold text-white text-xs">{post.title}</h5>
              <p className="text-stone-300 leading-relaxed text-[11px]">{post.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transport & Net Return Modal (Requirements 7 & 8) */}
      {showTransportModal && (
        <TransportNetReturnModal
          onClose={() => setShowTransportModal(false)}
        />
      )}

      {/* REQUIREMENT: Direct Supply Request Modal for Market / Requirement */}
      {showRequestModal && (
        <MarketSupplyRequestModal
          market={market}
          requirement={requestReq}
          onClose={() => {
            setShowRequestModal(false);
            setRequestReq(null);
          }}
        />
      )}
    </div>
  );
};

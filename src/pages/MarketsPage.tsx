import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Market, MarketRequirement } from '../types';
import {
  Search,
  MapPin,
  Star,
  ChevronRight,
  Clock,
  Building2,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import {
  getCropEmoji,
  getSpecificCropDisplay,
  getMarketDistance,
  formatRelativeTime,
  getDemandBadge,
} from '../utils/marketHelpers';
import { formatTimerCountdown } from '../utils/marketCycleEngine';
import { TransportNetReturnModal } from '../components/TransportNetReturnModal';

interface MarketsPageProps {
  onSelectMarket: (marketId: string) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ onSelectMarket }) => {
  const { markets, currentUser, toggleFollowMarket, t, language, marketTimerSecondsLeft } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH_DEMAND' | 'NEARBY' | 'FOLLOWED'>('ALL');
  const [cropTagFilter, setCropTagFilter] = useState<string>('ALL');
  const [showTransportModal, setShowTransportModal] = useState(false);

  const timerInfo = formatTimerCountdown(marketTimerSecondsLeft);

  // Track which markets have "View All Crops" expanded
  const [expandedMarketIds, setExpandedMarketIds] = useState<Record<string, boolean>>({});

  const toggleExpandMarket = (marketId: string) => {
    setExpandedMarketIds(prev => ({
      ...prev,
      [marketId]: !prev[marketId],
    }));
  };

  const CROP_CHIPS = [
    { id: 'ALL', label: language === 'te' ? 'అన్ని పంటలు' : 'All Crops', emoji: '🌾' },
    { id: 'tomato', label: language === 'te' ? 'టమాటా' : 'Tomato', emoji: '🍅' },
    { id: 'potato', label: language === 'te' ? 'బంగాళాదుంప' : 'Potato', emoji: '🥔' },
    { id: 'red chilli', label: language === 'te' ? 'ఎండుమిర్చి' : 'Red Chilli', emoji: '🌶️' },
    { id: 'green chilli', label: language === 'te' ? 'పచ్చిమిర్చి' : 'Green Chilli', emoji: '🌶️' },
    { id: 'rice', label: language === 'te' ? 'వరి / బియ్యం' : 'Rice / Paddy', emoji: '🌾' },
    { id: 'onion', label: language === 'te' ? 'ఉల్లిపాయ' : 'Onion', emoji: '🧅' },
    { id: 'groundnut', label: language === 'te' ? 'వేరుశనగ' : 'Groundnut', emoji: '🥜' },
    { id: 'mango', label: language === 'te' ? 'మామిడి' : 'Mango', emoji: '🥭' },
    { id: 'turmeric', label: language === 'te' ? 'పసుపు' : 'Turmeric', emoji: '🌿' },
  ];

  const filteredMarkets = markets.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.teluguName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cropsRequired.some(r => r.cropName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'FOLLOWED') {
      if (!currentUser?.followedMarketIds.includes(m.id)) return false;
    }
    if (activeFilter === 'NEARBY') {
      if (m.district.toLowerCase() !== currentUser?.district.toLowerCase()) return false;
    }
    if (activeFilter === 'HIGH_DEMAND') {
      if (!m.cropsRequired.some(r => r.demand === 'HIGH')) return false;
    }

    if (cropTagFilter !== 'ALL') {
      const hasCrop = m.cropsRequired.some(r => r.cropName.toLowerCase().includes(cropTagFilter));
      if (!hasCrop) return false;
    }

    return true;
  });

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* 1. SEARCH & FILTERS HEADER */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🏛️</span>
            <span>{language === 'te' ? 'వ్యవసాయ మార్కెట్లు (APMC Mandis)' : 'Agricultural Markets'}</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {language === 'te'
              ? 'టమాటా, బంగాళాదుంప, మిర్చి, వరి కొనుగోలు చేసే లైవ్ మార్కెట్లు'
              : 'Live APMC Mandis buying Tomato, Potato, Red Chilli, Rice & more'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              language === 'te'
                ? 'మార్కెట్ పేరు, పంట (టమాటా, బంగాళాదుంప, మిరప...) వెతకండి'
                : 'Search markets or crops (Tomato, Potato, Chilli, Rice)...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-stone-900 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Commodity Chips: Tomato, Potato, Red Chilli, Rice, Onion */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {CROP_CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => setCropTagFilter(chip.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                cropTagFilter === chip.id
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-850 border border-stone-800'
              }`}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'ALL', label: t('filterAll') },
            { id: 'HIGH_DEMAND', label: t('filterHighDemand') },
            { id: 'NEARBY', label: t('filterNearby') },
            { id: 'FOLLOWED', label: t('filterFollowed') },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-850 border border-stone-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feature Banner: Best Market & Transport Net Return (Requirements 7 & 8) */}
        <div
          onClick={() => setShowTransportModal(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-amber-950/40 border border-emerald-500/40 shadow-lg cursor-pointer flex items-center justify-between gap-3 hover:border-emerald-400 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
              🚛
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider flex items-center gap-1">
                <span>⭐ BEST ESTIMATED RETURN FEATURE</span>
              </span>
              <p className="font-extrabold text-white text-xs mt-0.5">
                {language === 'te' ? 'రవాణా ఖర్చు & ఉత్తమ మార్కెట్ రాబడి పోల్చండి' : 'Compare Markets & Transport Net Return'}
              </p>
              <span className="text-[10px] text-stone-400 block">
                Calculate distance, vehicle freight & net ₹/kg for your harvest
              </span>
            </div>
          </div>
          <span className="py-1.5 px-3 rounded-xl bg-emerald-500 text-stone-950 font-extrabold text-[11px] shrink-0 shadow">
            Compare →
          </span>
        </div>
      </div>

      {/* 2. MARKETS LISTING — REDUCED OVERLOAD & CLEAR HIERARCHY */}
      <div className="space-y-4">
        {filteredMarkets.length === 0 ? (
          <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-2">
            <Building2 className="w-8 h-8 text-stone-500 mx-auto" />
            <p className="text-xs text-stone-400">No markets found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
                setCropTagFilter('ALL');
              }}
              className="text-xs text-emerald-400 font-bold underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredMarkets.map(market => {
            const isFollowed = currentUser?.followedMarketIds.includes(market.id);
            const distanceInfo = getMarketDistance(market, currentUser?.district || 'Chittoor');
            const marketTimeInfo = formatRelativeTime(
              market.lastUpdatedMinutesAgo || 8,
              false,
              language
            );

            // Determine crops to show: Top 2 most important crops on the main card (Requirement 5)
            const isExpanded = !!expandedMarketIds[market.id];
            const topCrops = market.cropsRequired.slice(0, 2);
            const remainingCrops = market.cropsRequired.slice(2);

            return (
              <div
                key={market.id}
                className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl transition hover:border-stone-750 p-4 space-y-3.5"
              >
                {/* 1. MARKET NAME & TELUGU NAME */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-800/80 pb-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => onSelectMarket(market.id)}
                      className="font-black text-white text-base hover:text-emerald-400 transition cursor-pointer leading-snug tracking-tight"
                    >
                      {market.name}
                    </h3>
                    {market.teluguName && (
                      <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                        {market.teluguName}
                      </p>
                    )}

                    {/* 📍 Location & 📏 Distance & 🟢 Updated Time (Requirements 2, 5, 6) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-400 mt-2">
                      <span className="flex items-center gap-1 font-medium text-stone-300">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{market.district}, {market.state}</span>
                      </span>

                      <span className="text-stone-600">•</span>

                      {/* Distance from farmer */}
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <span>📏</span>
                        <span>{distanceInfo.text}</span>
                      </span>

                      <span className="text-stone-600">•</span>

                      {/* Market Last Updated Time */}
                      <span
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full border ${marketTimeInfo.badgeClass}`}
                      >
                        {marketTimeInfo.label}
                      </span>

                      {/* 8-Min Mandi Cycle Tag */}
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold">
                        <span>⏱️ 8-Min Cycle: {timerInfo.formatted}</span>
                      </span>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => toggleFollowMarket(market.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                      isFollowed
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{isFollowed ? 'Following' : 'Follow'}</span>
                  </button>
                </div>

                {/* Mandi Rule: Prices only changed by market, not by farmer */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-stone-950/70 border border-stone-850 text-[10px]">
                  <span className="flex items-center gap-1 text-stone-300">
                    <span className="text-amber-400">🏛️ APMC Rates:</span>
                    <span className="text-stone-400">Prices set exclusively by Market Board (not farmer)</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold shrink-0">
                    Auto-Updates Every 8m
                  </span>
                </div>

                {/* 2. MOST IMPORTANT CROPS (Requirements 1, 2, 3, 4, 5) */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    {language === 'te' ? 'మార్కెట్ ప్రధాన కొనుగోలు పంటలు (Top Demands):' : 'Key Market Crop Requirements:'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {topCrops.map(req => {
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
                          className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 shadow-sm"
                        >
                          {/* Crop Name & Price */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0">
                              <span className="text-sm font-black text-white flex items-center gap-1.5">
                                <span className="text-base">{emoji}</span>
                                <span className="truncate">{cropDisplay.mainName}</span>
                              </span>
                              {cropDisplay.varietyText && (
                                <span className="text-[10px] text-stone-400 block truncate ml-6">
                                  {cropDisplay.varietyText}
                                </span>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">
                                {language === 'te' ? 'కొనుగోలు ధర' : 'BUYING PRICE'}
                              </span>
                              <span className="text-sm font-black text-emerald-400">
                                ₹{req.buyingPrice}<span className="text-[10px] font-normal text-stone-400">/kg</span>
                              </span>
                            </div>
                          </div>

                          {/* Grade & Quantity Required & Demand Status (Requirements 3 & 10) */}
                          <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-stone-850/80">
                            <div className="flex items-center gap-1">
                              <span className="bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                                Grade {req.grade}
                              </span>
                              {(() => {
                                const dInfo = getDemandBadge(req.demand, req.remainingQuantity, req.requiredQuantity);
                                return (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${dInfo.badgeClass}`}>
                                    {dInfo.emoji} {dInfo.label.replace(/^[^\w\s]+\s*/, '')}
                                  </span>
                                );
                              })()}
                            </div>
                            <span className="text-stone-300 font-semibold">
                              <strong className="text-white">{req.remainingQuantity.toLocaleString('en-IN')} kg</strong>{' '}
                              <span className="text-emerald-400 font-bold">{language === 'te' ? 'ఇంకా అవసరం' : 'still required'}</span>
                            </span>
                          </div>

                          {/* Pre-Booking Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-stone-400">
                              <span>Pre-booked: <strong className="text-amber-400">{req.preBookedQuantity.toLocaleString('en-IN')} kg</strong> ({Math.round((req.preBookedQuantity / req.requiredQuantity) * 100)}%)</span>
                              <span>Target: {req.requiredQuantity.toLocaleString('en-IN')} kg</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-stone-850 overflow-hidden flex">
                              <div
                                className="h-full bg-amber-500"
                                style={{ width: `${Math.round((req.preBookedQuantity / req.requiredQuantity) * 100)}%` }}
                              ></div>
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${100 - Math.round((req.preBookedQuantity / req.requiredQuantity) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Update Time (Requirement 2) */}
                          <div className="text-[10px] flex items-center justify-between pt-0.5 text-stone-500">
                            <span className={`px-2 py-0.5 rounded font-medium border text-[10px] ${timeInfo.badgeClass}`}>
                              {timeInfo.label}
                            </span>
                            <span className="text-[9px] text-amber-300 font-semibold">
                              Pre-Book Slot Open
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Additional Crops when toggled */}
                  {isExpanded && remainingCrops.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
                      {remainingCrops.map(req => {
                        const emoji = getCropEmoji(req.cropName);
                        const cropDisplay = getSpecificCropDisplay(req.cropName, req.variety);
                        const timeInfo = formatRelativeTime(
                          req.updatedMinutesAgo || 15,
                          req.isPriceOutdated,
                          language
                        );

                        return (
                          <div
                            key={req.id}
                            className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0">
                                <span className="text-sm font-black text-white flex items-center gap-1.5">
                                  <span className="text-base">{emoji}</span>
                                  <span className="truncate">{cropDisplay.mainName}</span>
                                </span>
                                {cropDisplay.varietyText && (
                                  <span className="text-[10px] text-stone-400 block truncate ml-6">
                                    {cropDisplay.varietyText}
                                  </span>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[9px] uppercase font-bold text-stone-400 block">
                                  {language === 'te' ? 'కొనుగోలు ధర' : 'BUYING PRICE'}
                                </span>
                                <span className="text-sm font-black text-emerald-400">
                                  ₹{req.buyingPrice}<span className="text-[10px] font-normal text-stone-400">/kg</span>
                                </span>
                              </div>
                            </div>

                            {/* Grade & Quantity Required & Demand Status (Requirements 3 & 10) */}
                            <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-stone-850/80">
                              <div className="flex items-center gap-1">
                                <span className="bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                                  Grade {req.grade}
                                </span>
                                {(() => {
                                  const dInfo = getDemandBadge(req.demand, req.remainingQuantity, req.requiredQuantity);
                                  return (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${dInfo.badgeClass}`}>
                                      {dInfo.emoji} {dInfo.label.replace(/^[^\w\s]+\s*/, '')}
                                    </span>
                                  );
                                })()}
                              </div>
                              <span className="text-stone-300 font-semibold">
                                <strong className="text-white">{req.remainingQuantity.toLocaleString('en-IN')} kg</strong>{' '}
                                <span className="text-emerald-400 font-bold">{language === 'te' ? 'ఇంకా అవసరం' : 'still required'}</span>
                              </span>
                            </div>

                            {/* Pre-Booking Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] text-stone-400">
                                <span>Pre-booked: <strong className="text-amber-400">{req.preBookedQuantity.toLocaleString('en-IN')} kg</strong> ({Math.round((req.preBookedQuantity / req.requiredQuantity) * 100)}%)</span>
                                <span>Target: {req.requiredQuantity.toLocaleString('en-IN')} kg</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-stone-850 overflow-hidden flex">
                                <div
                                  className="h-full bg-amber-500"
                                  style={{ width: `${Math.round((req.preBookedQuantity / req.requiredQuantity) * 100)}%` }}
                                ></div>
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${100 - Math.round((req.preBookedQuantity / req.requiredQuantity) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="text-[10px] flex items-center justify-between pt-0.5 text-stone-500">
                              <span className={`px-2 py-0.5 rounded font-medium border text-[10px] ${timeInfo.badgeClass}`}>
                                {timeInfo.label}
                              </span>
                              <span className="text-[9px] text-amber-300 font-semibold">
                                Pre-Book Slot Open
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. TWO DEDICATED ACTION BUTTONS (Requirement 5) */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
                  {/* View All Crops Button */}
                  {market.cropsRequired.length > 2 && (
                    <button
                      onClick={() => toggleExpandMarket(market.id)}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-stone-950 hover:bg-stone-850 text-stone-300 border border-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {isExpanded
                          ? (language === 'te' ? 'తక్కువ చూపించు' : 'Show Less Crops')
                          : (language === 'te'
                              ? `అన్ని ${market.cropsRequired.length} పంటలు చూడండి →`
                              : `View All ${market.cropsRequired.length} Crops →`)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* View Market Button */}
                  <button
                    onClick={() => onSelectMarket(market.id)}
                    className="flex-1 py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
                  >
                    <span>{language === 'te' ? 'మార్కెట్ చూడండి →' : 'View Market →'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transport & Best Net Return Modal (Requirements 7 & 8) */}
      {showTransportModal && (
        <TransportNetReturnModal
          onClose={() => setShowTransportModal(false)}
          onSelectMarket={(marketId) => onSelectMarket(marketId)}
        />
      )}
    </div>
  );
};


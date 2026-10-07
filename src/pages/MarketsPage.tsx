import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Market } from '../types';
import {
  Search,
  MapPin,
  Star,
  ChevronRight,
  TrendingUp,
  Clock,
  Building2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MarketsPageProps {
  onSelectMarket: (marketId: string) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ onSelectMarket }) => {
  const { markets, currentUser, toggleFollowMarket, t, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH_DEMAND' | 'NEARBY' | 'FOLLOWED'>('ALL');
  const [cropTagFilter, setCropTagFilter] = useState<string>('ALL');

  const CROP_CHIPS = [
    { id: 'ALL', label: language === 'te' ? 'అన్ని పంటలు' : 'All Crops', emoji: '🌾' },
    { id: 'tomato', label: language === 'te' ? 'టమాటా' : 'Tomato', emoji: '🍅' },
    { id: 'potato', label: language === 'te' ? 'బంగాళాదుంప' : 'Potato', emoji: '🥔' },
    { id: 'chilli', label: language === 'te' ? 'ఎర్ర మిరప' : 'Red Chilli', emoji: '🌶️' },
    { id: 'rice', label: language === 'te' ? 'వరి / బియ్యం' : 'Rice / Paddy', emoji: '🌾' },
    { id: 'onion', label: language === 'te' ? 'ఉల్లిపాయ' : 'Onion', emoji: '🧅' },
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
            placeholder={language === 'te' ? 'మార్కెట్ పేరు, పంట (టమాటా, ఆలుగడ్డ...) వెతకండి' : 'Search markets or crops (Tomato, Potato, Rice)...'}
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
      </div>

      {/* 2. MARKETS LISTING */}
      <div className="space-y-3.5">
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

            return (
              <div
                key={market.id}
                className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-lg transition hover:border-stone-750 space-y-3 p-4"
              >
                {/* Market Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => onSelectMarket(market.id)}
                      className="font-bold text-white text-sm hover:text-emerald-400 transition cursor-pointer truncate"
                    >
                      {market.name}
                    </h3>
                    <p className="text-[11px] text-emerald-300 font-medium">{market.teluguName}</p>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1">
                      <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                      <span className="truncate">{market.district}, {market.state}</span>
                      <span>•</span>
                      <span className="text-stone-500">{market.cropsRequired.length} Commodities</span>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => toggleFollowMarket(market.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                      isFollowed
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{isFollowed ? 'Following' : 'Follow'}</span>
                  </button>
                </div>

                {/* Crops Required in This Market (Tomato, Potato, Red Chilli, Rice, etc.) */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Crops Buying in this Mandi:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {market.cropsRequired.slice(0, 4).map(req => (
                      <div
                        key={req.id}
                        className="p-2.5 rounded-2xl bg-stone-950 border border-stone-850 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate max-w-[100px]">
                            {req.cropName.split(' ')[0]}
                          </span>
                          <span className="text-xs font-black text-emerald-400">
                            ₹{req.buyingPrice}/kg
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-stone-400">
                          <span>Grade {req.grade}</span>
                          <span className="text-amber-300 font-medium">
                            {req.remainingQuantity.toLocaleString('en-IN')} kg open
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Update Snapshot */}
                {market.recentUpdates.length > 0 && (
                  <div className="text-[11px] text-stone-400 bg-stone-950/70 p-2.5 rounded-xl border border-stone-850 flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <p className="line-clamp-1 text-stone-300">
                      <strong className="text-emerald-400">Bulletin: </strong>
                      {market.recentUpdates[0].title}
                    </p>
                  </div>
                )}

                {/* View Details Action */}
                <button
                  onClick={() => onSelectMarket(market.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>{t('viewDetails')} & Price History</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

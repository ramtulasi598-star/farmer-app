import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Truck,
  Lock,
  Building2,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  ArrowRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { formatTimerCountdown } from '../utils/marketCycleEngine';

interface MarketCycleTimerBannerProps {
  compact?: boolean;
  marketId?: string; // If provided, shows market-specific highlights
}

export const MarketCycleTimerBanner: React.FC<MarketCycleTimerBannerProps> = ({
  compact = false,
  marketId,
}) => {
  const {
    marketTimerSecondsLeft,
    marketTimerTotalSeconds,
    isMarketTimerActive,
    toggleMarketTimer,
    marketCycleCount,
    lastMarketCycleAt,
    marketCycleEvents,
    inwardArrivals,
    triggerMarketCycleUpdate,
    language,
    markets,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'ARRIVALS' | 'RULES'>('EVENTS');
  const [isUpdatingAnim, setIsUpdatingAnim] = useState<boolean>(false);

  const timerInfo = formatTimerCountdown(marketTimerSecondsLeft);

  const handleManualTrigger = () => {
    setIsUpdatingAnim(true);
    triggerMarketCycleUpdate();
    setTimeout(() => {
      setIsUpdatingAnim(false);
    }, 700);
  };

  // Filter events and arrivals if marketId is specified
  const filteredEvents = marketId
    ? marketCycleEvents.filter(e => e.marketId === marketId)
    : marketCycleEvents;

  const filteredArrivals = marketId
    ? inwardArrivals.filter(a => a.marketId === marketId)
    : inwardArrivals;

  const currentMarket = marketId ? markets.find(m => m.id === marketId) : null;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-925 to-stone-900 border border-emerald-500/30 shadow-xl overflow-hidden text-stone-200 transition-all duration-300">
      {/* 1. TOP HEADER / COUNTDOWN BAR */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950/40 via-stone-900 to-amber-950/30 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator & Headline */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Clock className={`w-5 h-5 ${isMarketTimerActive ? 'animate-pulse text-emerald-400' : 'text-stone-400'}`} />
            </div>
            {isMarketTimerActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {language === 'te' ? '8 నిమిషాల లైవ్ మార్కెట్ సైకిల్' : 'Live 8-Min APMC Cycle'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                Cycle #{marketCycleCount} • {lastMarketCycleAt}
              </span>
            </div>

            <h3 className="text-sm font-black text-white mt-0.5 tracking-tight flex items-center gap-1.5">
              <span>{language === 'te' ? 'మార్కెట్ ధరలు & దిగుమతులు కౌంట్‌డౌన్' : 'Market Rates, Inward Imports & Pre-Book Refresh'}</span>
            </h3>

            <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {language === 'te'
                  ? 'ధరలు మార్కెట్ బోర్డు ద్వారా మాత్రమే నవీకరించబడతాయి (రైతు ద్వారా కాదు)'
                  : 'Prices updated exclusively by APMC Mandi, not by farmer'}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Digital 8-Min Countdown + Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {/* Countdown Digital Badge */}
          <div className="bg-stone-950 px-3.5 py-1.5 rounded-2xl border border-stone-800 flex items-center gap-2 shadow-inner">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
              {language === 'te' ? 'తదుపరి అప్‌డేట్:' : 'Next update:'}
            </span>
            <div className="font-mono font-black text-lg text-emerald-400 tracking-wider">
              {timerInfo.formatted}
            </div>
          </div>

          {/* Fast-Forward / Trigger Button */}
          <button
            onClick={handleManualTrigger}
            disabled={isUpdatingAnim}
            title={language === 'te' ? '8 నిమిషాల అప్‌డేట్‌ను ఇప్పుడే రన్ చేయండి' : 'Fast-forward / Run 8-min refresh now'}
            className="px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-950 ${isUpdatingAnim ? 'animate-spin' : ''}`} />
            <span>{language === 'te' ? 'ఇప్పుడే అప్‌డేట్ ⚡' : 'Trigger 8-Min ⚡'}</span>
          </button>

          {/* Pause / Play Toggle */}
          <button
            onClick={toggleMarketTimer}
            title={isMarketTimerActive ? 'Pause 8-min timer' : 'Resume 8-min timer'}
            className="p-2 rounded-2xl bg-stone-950 hover:bg-stone-850 text-stone-400 hover:text-white border border-stone-800 transition cursor-pointer"
          >
            {isMarketTimerActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Progress Bar of 8-minute cycle */}
      <div className="w-full h-1 bg-stone-850 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-1000"
          style={{ width: `${100 - timerInfo.percentRemaining}%` }}
        />
      </div>

      {/* 2. RECENT CYCLE ACTIVITY PREVIEW (3 PILL CARDS) */}
      <div className="p-3 sm:p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* Card A: Prices (Only Changed by Market) */}
          <div className="p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Mandi Rates Updated</span>
              </span>
              <span className="text-[9px] bg-stone-850 text-stone-400 px-1.5 py-0.5 rounded font-mono">
                Market Only
              </span>
            </div>
            <p className="text-[11px] text-stone-200 font-semibold leading-tight line-clamp-1">
              {filteredEvents.find(e => e.type === 'PRICE_CHANGE')?.title || 'Official APMC price adjusted'}
            </p>
            <span className="text-[9px] text-stone-400 block truncate">
              {filteredEvents.find(e => e.type === 'PRICE_CHANGE')?.description || 'Prices set exclusively by APMC Market Board'}
            </span>
          </div>

          {/* Card B: Inward Imports Arrived */}
          <div className="p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                <Truck className="w-3 h-3 text-amber-400" />
                <span>Inward Crop Imports</span>
              </span>
              <span className="text-[9px] bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                {filteredArrivals.length} Trucks
              </span>
            </div>
            <p className="text-[11px] text-stone-200 font-semibold leading-tight line-clamp-1">
              {filteredArrivals[0]
                ? `${filteredArrivals[0].cropName} (${(filteredArrivals[0].importedQuantityKg / 1000).toFixed(1)} MT) @ ${filteredArrivals[0].marketName.split(' ')[0]}`
                : 'Inter-mandi arrivals unloaded'}
            </p>
            <span className="text-[9px] text-stone-400 block truncate">
              {filteredArrivals[0]?.sourceRegion || 'Arrived from neighboring production belts'}
            </span>
          </div>

          {/* Card C: Pre-Booking Locked */}
          <div className="p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-400" />
                <span>Pre-Book Quota</span>
              </span>
              <span className="text-[9px] bg-teal-400/10 text-teal-300 px-1.5 py-0.5 rounded font-mono">
                Live Slots
              </span>
            </div>
            <p className="text-[11px] text-stone-200 font-semibold leading-tight line-clamp-1">
              {filteredEvents.find(e => e.type === 'PREBOOK_UPDATE')?.title || 'Buyer quota locked at Mandi'}
            </p>
            <span className="text-[9px] text-stone-400 block truncate">
              {filteredEvents.find(e => e.type === 'PREBOOK_UPDATE')?.description || 'Institutional buyers locked batch quota'}
            </span>
          </div>
        </div>

        {/* Collapsible Details Drawer Button */}
        <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {language === 'te'
                ? 'ప్రతి 8 నిమిషాలకు మార్కెట్ ధరలు, దిగుమతులు, మరియు ప్రీ-బుకింగ్ అప్‌డేట్ అవుతాయి'
                : 'Every 8 minutes, the app updates market rates, inward imports & pre-bookings'}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-stone-850 transition cursor-pointer"
          >
            <span>{isExpanded ? (language === 'te' ? 'మూసివేయి' : 'Hide Live Log') : (language === 'te' ? '8 నిమిషాల లాగ్ చూడండి' : 'View 8-Min Live Feed')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 3. EXPANDED LIVE FEED / INWARD IMPORTS / RULES DRAWER */}
        {isExpanded && (
          <div className="pt-2 border-t border-stone-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-2xl border border-stone-850">
              <button
                onClick={() => setActiveTab('EVENTS')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'EVENTS'
                    ? 'bg-emerald-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>⚡ Cycle Log</span>
                <span className="text-[10px] opacity-75">({filteredEvents.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ARRIVALS')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'ARRIVALS'
                    ? 'bg-amber-400 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🚛 Inward Imports</span>
                <span className="text-[10px] opacity-75">({filteredArrivals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('RULES')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'RULES'
                    ? 'bg-stone-800 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>📜 Market Rule</span>
              </button>
            </div>

            {/* TAB CONTENT 1: CYCLE LOG */}
            {activeTab === 'EVENTS' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-2xl bg-stone-950 border border-stone-850 flex items-start gap-2.5 text-xs"
                  >
                    <div className="mt-0.5 shrink-0">
                      {evt.type === 'PRICE_CHANGE' && (
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {evt.type === 'IMPORT_ARRIVAL' && (
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {evt.type === 'PREBOOK_UPDATE' && (
                        <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-white truncate text-xs">
                          {evt.title}
                        </span>
                        <span className="text-[10px] text-stone-500 shrink-0 font-mono">
                          {evt.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                        {evt.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className="text-stone-500">🏛️ {evt.marketName.split(' ')[0]}</span>
                        <span className="text-stone-600">•</span>
                        <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {evt.updatedBy}
                        </span>
                        {evt.newPrice && evt.oldPrice && (
                          <span className="font-bold text-amber-300 ml-auto font-mono">
                            ₹{evt.oldPrice} → ₹{evt.newPrice}/kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 2: INWARD IMPORTS LIST */}
            {activeTab === 'ARRIVALS' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredArrivals.map(arr => (
                  <div
                    key={arr.id}
                    className="p-2.5 rounded-2xl bg-stone-950 border border-amber-500/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🚛</span>
                        <div>
                          <span className="font-black text-white text-xs block">
                            {arr.cropName} (Grade {arr.grade}) • {(arr.importedQuantityKg / 1000).toFixed(1)} MT Imported
                          </span>
                          <span className="text-[10px] text-amber-300 block">
                            {arr.marketName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-stone-400 block">Mandi Buying Rate</span>
                        <span className="text-xs font-black text-emerald-400">₹{arr.marketBuyingPrice}/kg</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-stone-850 text-stone-400">
                      <div>
                        <span className="text-stone-500 block uppercase font-bold text-[9px]">Source Origin:</span>
                        <span className="text-stone-300 truncate block">{arr.sourceRegion}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block uppercase font-bold text-[9px]">Transport Vehicle:</span>
                        <span className="text-stone-300 truncate block font-mono">{arr.arrivalVehicle}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 3: OFFICIAL MARKET RULE */}
            {activeTab === 'RULES' && (
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-black">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Official APMC Market Pricing Principle:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-stone-300 leading-relaxed">
                  <p>
                    • <strong>Prices are changed only by the Market:</strong> Benchmark buying prices are set and updated exclusively by the APMC Mandi Auction Committee based on inward arrivals, export contracts, and bidding.
                  </p>
                  <p>
                    • <strong>Farmer autonomy preserved:</strong> Farmers set their own asking price (expected ₹/kg) for their crops. The market timer adjusts mandi auction rates without altering any farmer's personal asking price.
                  </p>
                  <p>
                    • <strong>Automated 8-Minute Cycle:</strong> Every 8 minutes, the system recalculates rates, registers inward import truck deliveries from regional production hubs, and processes wholesale pre-booking allocations.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

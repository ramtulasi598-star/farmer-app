import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriceHistoryPoint } from '../types';
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
} from 'lucide-react';

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
  const { getMarketById, currentUser, toggleFollowMarket, t } = useApp();
  const market = getMarketById(marketId);

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

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

  const isFollowed = currentUser?.followedMarketIds.includes(market.id);
  const currentHistory: PriceHistoryPoint[] = market.priceHistory[timeRange];

  // SVG Chart Calculation
  const prices = currentHistory.map(h => h.price);
  const minPrice = Math.min(...prices) * 0.9;
  const maxPrice = Math.max(...prices) * 1.1;
  const priceRange = maxPrice - minPrice || 1;

  const points = currentHistory.map((item, index) => {
    const x = (index / (currentHistory.length - 1 || 1)) * 300 + 20;
    const y = 110 - ((item.price - minPrice) / priceRange) * 80;
    return `${x},${y}`;
  }).join(' ');

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

        <button
          onClick={() => toggleFollowMarket(market.id)}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isFollowed
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-md'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-amber-400' : ''}`} />
          <span>{isFollowed ? t('unfollowMarket') : t('followMarket')}</span>
        </button>
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

      {/* SECTION 11: MARKET PRICE HISTORY (Chart & Table) */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {t('marketPriceHistory')}
            </h3>
            <span className="text-[10px] text-stone-400">Official arrivals & weighted prices</span>
          </div>

          {/* Time range selector: Today, Last 7 Days, Last 1 Month */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px]">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                timeRange === 'today' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              {t('tabToday')}
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                timeRange === 'week' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              {t('tab7Days')}
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                timeRange === 'month' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              {t('tab1Month')}
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

        {/* Tabular Price History (Section 11 Table Example) */}
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
          {market.cropsRequired.map(req => (
            <div
              key={req.id}
              className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{req.cropName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded font-semibold">
                      Grade {req.grade}
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3" /> {req.demand} Demand
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Current Buying Rate</span>
                  <span className="text-lg font-black text-emerald-400">₹{req.buyingPrice}/kg</span>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Target: <strong className="text-white">{req.requiredQuantity.toLocaleString('en-IN')} kg</strong></span>
                  <span>Pre-booked: <strong className="text-amber-400">{req.preBookedQuantity.toLocaleString('en-IN')} kg</strong></span>
                  <span>Remaining: <strong className="text-emerald-400">{req.remainingQuantity.toLocaleString('en-IN')} kg</strong></span>
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

              {currentUser?.role === 'FARMER' && (
                <button
                  onClick={onSendCropToMarket}
                  className="w-full py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>I Have This Crop - Post Listing</span>
                </button>
              )}
            </div>
          ))}
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
    </div>
  );
};

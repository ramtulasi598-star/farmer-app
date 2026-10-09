import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crop, CropGrade, Market } from '../types';
import {
  MapPin,
  PlusCircle,
  ChevronRight,
  Video,
  Sparkles,
  TrendingUp,
  Tag,
  ArrowRight,
  Truck,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  Building2,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  Send,
} from 'lucide-react';
import {
  getCropEmoji,
  getSpecificCropDisplay,
  getMarketBuyingPriceForCrop,
  getMarketDistance,
} from '../utils/marketHelpers';
import { TransportNetReturnModal } from '../components/TransportNetReturnModal';
import { MarketSupplyRequestModal } from '../components/MarketSupplyRequestModal';
import { MarketCycleTimerBanner } from '../components/MarketCycleTimerBanner';

interface FarmerHomePageProps {
  onNavigateToCrop: (cropId: string) => void;
  onNavigateToMarket: (marketId: string) => void;
  onNavigateToAddCrop: () => void;
  onOpenVideoModal: (crop: Crop) => void;
}

export const FarmerHomePage: React.FC<FarmerHomePageProps> = ({
  onNavigateToCrop,
  onNavigateToMarket,
  onNavigateToAddCrop,
  onOpenVideoModal,
}) => {
  const {
    currentUser,
    crops,
    markets,
    requests,
    deals,
    toggleFollowMarket,
    acceptCropRequest,
    rejectCropRequest,
    resendCropRequest,
    updateCrop,
    t,
    language,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PRE-BOOKED' | 'CONFIRMED'>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_HIGH' | 'PRICE_LOW' | 'AVAILABLE_QTY'>('DEFAULT');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Tab switch between "My Crops" and "Market Rates & Mandis" to avoid overloading home screen
  const [viewSection, setViewSection] = useState<'OVERVIEW' | 'MY_CROPS' | 'MARKETS'>('OVERVIEW');

  // Transport & Net Return Modal state
  const [transportCrop, setTransportCrop] = useState<Crop | null>(null);
  const [supplyMarket, setSupplyMarket] = useState<Market | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Farmer's crops
  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id);

  // Pending and Expired requests for this farmer (both received booking requests and sent market supply offers)
  const pendingRequests = requests.filter(r => {
    const crop = crops.find(c => c.id === r.cropId);
    return ((crop && crop.farmerId === currentUser?.id) || r.farmerId === currentUser?.id) && r.status === 'PENDING';
  });

  const expiredRequests = requests.filter(r => {
    const crop = crops.find(c => c.id === r.cropId);
    return ((crop && crop.farmerId === currentUser?.id) || r.farmerId === currentUser?.id) && r.status === 'EXPIRED';
  });

  // Top trending crops based on APMC market demand
  const trendingCommodities = [
    { name: 'Tomato (టమాటా)', emoji: '🍅', price: 28, prevPrice: 25, change: '+12%', market: 'Madanapalle APMC', demand: 'HIGH' },
    { name: 'Red Chilli (ఎండుమిర్చి)', emoji: '🌶️', price: 195, prevPrice: 182, change: '+7%', market: 'Guntur Mirchi Yard', demand: 'HIGH' },
    { name: 'Green Chilli (పచ్చిమిర్చి)', emoji: '🌿', price: 52, prevPrice: 48, change: '+8%', market: 'Bowenpally APMC', demand: 'HIGH' },
    { name: 'Potato (ఆలుగడ్డ)', emoji: '🥔', price: 28, prevPrice: 26, change: '+7%', market: 'Bowenpally APMC', demand: 'NORMAL' },
    { name: 'Rice / Paddy (వరి)', emoji: '🌾', price: 24, prevPrice: 23, change: '+4%', market: 'Miryalaguda APMC', demand: 'NORMAL' },
    { name: 'Cotton (పత్తి)', emoji: '☁️', price: 76, prevPrice: 72, change: '+5%', market: 'Warangal Cotton Yard', demand: 'NORMAL' },
  ];

  // Filtered farmer crops
  const filteredFarmerCrops = farmerCrops
    .filter(crop => {
      const matchesSearch =
        crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.grade.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && crop.status === 'ACTIVE') ||
        (statusFilter === 'PRE-BOOKED' && crop.status === 'PRE-BOOKED') ||
        (statusFilter === 'CONFIRMED' && (crop.status === 'DEAL CONFIRMED' || crop.status === 'SOLD'));

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_HIGH') return b.expectedPrice - a.expectedPrice;
      if (sortBy === 'PRICE_LOW') return a.expectedPrice - b.expectedPrice;
      if (sortBy === 'AVAILABLE_QTY') return b.remainingQuantity - a.remainingQuantity;
      return 0;
    });

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* 1. TOP HEADER & GREETING */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{language === 'te' ? 'రైతు పోర్టల్' : 'Farmer Dashboard'}</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight leading-tight mt-0.5">
            {language === 'te' ? 'నమస్కారం' : 'Namaste'}, {currentUser?.name?.split(' ')[0] || 'Farmer'} 🌾
          </h2>
          <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-stone-500" />
            <span>{currentUser?.area}, {currentUser?.district}</span>
          </p>
        </div>

        <button
          onClick={onNavigateToAddCrop}
          className="py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>{t('listNewCrop')}</span>
        </button>
      </div>

      {/* 2. SECTION TABS / SEGMENTED SWITCH (To prevent screen overload) */}
      <div className="flex items-center p-1 bg-stone-900 border border-stone-800 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setViewSection('OVERVIEW')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            viewSection === 'OVERVIEW'
              ? 'bg-emerald-600 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          {language === 'te' ? 'ముఖ్య సమాచారం' : 'Overview'}
        </button>
        <button
          onClick={() => setViewSection('MY_CROPS')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
            viewSection === 'MY_CROPS'
              ? 'bg-emerald-600 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <span>{language === 'te' ? 'నా పంటలు' : 'My Crops'}</span>
          <span className="text-[10px] bg-stone-800/80 px-1.5 rounded-full text-stone-300">
            {farmerCrops.length}
          </span>
        </button>
        <button
          onClick={() => setViewSection('MARKETS')}
          className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
            viewSection === 'MARKETS'
              ? 'bg-emerald-600 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          {language === 'te' ? 'మార్కెట్ ధరలు' : 'Mandi Rates'}
        </button>
      </div>

      {/* 3. PENDING BOOKING REQUESTS ALERT BANNER (1-Hour Response Rule) */}
      {(pendingRequests.length > 0 || expiredRequests.length > 0) && (
        <div className="space-y-2.5">
          {pendingRequests.map(req => {
            const isSentSupply = req.sourceType === 'FARMER_SUPPLY_OFFER';

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-3xl bg-amber-950/40 border border-amber-500/50 shadow-lg space-y-2.5 animate-in fade-in duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isSentSupply ? '📤' : '⏱'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-amber-300 text-xs uppercase tracking-wider">
                          {isSentSupply
                            ? (language === 'te' ? 'మార్కెట్‌కు పంపిన సరఫరా అభ్యర్థన' : 'Sent Market Supply Request')
                            : (language === 'te' ? 'కొత్త కొనుగోలు అభ్యర్థన' : 'Pending Booking Request')}
                        </span>
                        <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.2 rounded-full font-bold border border-amber-400/40">
                          {isSentSupply ? '1-Hour Rule' : '24-Hours Rule'}
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm mt-0.5">
                        {req.buyerMarketName} {req.buyerName ? `(${req.buyerName})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-amber-300/80 font-mono block">
                      {isSentSupply ? '12 min ago' : 'Recent'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isSentSupply ? 'Awaiting Mandi (1h)' : '24h Response Window'}
                    </span>
                  </div>
                </div>

                {/* Response Rule Notice: 1 Hour for Farmer-to-Market, 24 Hours for Farmer-to-Buyer */}
                <div className="p-2 rounded-xl bg-amber-900/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {isSentSupply
                      ? (language === 'te'
                          ? '⏱ మార్కెట్ 1 గంటలోపు స్పందించాలి (రైతు → మార్కెట్).'
                          : '⏱ Market should respond within 1 hour.')
                      : (language === 'te'
                          ? '⏱ రైతు-కొనుగోలుదారు స్పందన గడువు: 24 గంటలు.'
                          : '⏱ Farmer to Buyer response window: 24 hours.')}
                  </span>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-stone-950 border border-stone-850 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">
                      {isSentSupply ? 'Supplying Crop & Grade' : 'Requested Crop'}
                    </span>
                    <span className="font-bold text-white text-xs">
                      {req.cropName} {req.grade ? `(Grade ${req.grade})` : ''}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {req.requestedQuantity.toLocaleString('en-IN')} kg
                      {req.farmerLocation ? ` • ${req.farmerLocation}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black text-amber-400 block">
                      {isSentSupply ? 'Offered Supply Price' : 'Offered Price'}
                    </span>
                    <span className="font-black text-amber-300 text-sm">₹{req.offeredPrice}/kg</span>
                    <span className="text-[10px] text-stone-400 block">
                      Total: ₹{(req.requestedQuantity * req.offeredPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Consistent Buttons */}
                {isSentSupply ? (
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => {
                        if (req.marketId) onNavigateToMarket(req.marketId);
                      }}
                      className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-bold text-xs transition text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>View Market</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        rejectCropRequest(req.id, 'Farmer withdrawn supply offer');
                        setToastMessage('Supply request withdrawn.');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-rose-400 border border-rose-900 font-bold text-xs transition cursor-pointer"
                    >
                      Withdraw
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      onClick={() => rejectCropRequest(req.id, 'Farmer declined offer')}
                      className="py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-rose-400 font-bold text-xs transition text-center cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        const res = acceptCropRequest(req.id);
                        if (res.success && res.deal) {
                          setToastMessage(`Deal Confirmed! Deal Slip #${res.deal.dealNumber} generated.`);
                          setTimeout(() => setToastMessage(null), 3500);
                        } else {
                          setToastMessage(res.error || 'Failed to accept booking.');
                          setTimeout(() => setToastMessage(null), 3500);
                        }
                      }}
                      className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-xs shadow-md transition text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Deal</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Expired Requests - Market 1-Hour vs Buyer 24-Hours Response Rule */}
          {expiredRequests.map(req => {
            const isSentSupply = req.sourceType === 'FARMER_SUPPLY_OFFER';

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-3xl bg-stone-900 border border-rose-900/60 shadow-lg space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <span className="font-extrabold text-rose-400 text-xs uppercase tracking-wider">
                        {isSentSupply
                          ? (language === 'te' ? 'మార్కెట్ అభ్యర్థన గడువు ముగిసింది' : 'Market Supply Expired')
                          : (language === 'te' ? 'కొనుగోలు అభ్యర్థన గడువు ముగిసింది' : 'Buyer Request Expired')}
                      </span>
                      <p className="font-bold text-white text-xs mt-0.5">
                        {req.cropName} • {req.requestedQuantity} kg @ ₹{req.offeredPrice}/kg
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-mono font-bold">
                    {isSentSupply ? '1h Market Window Elapsed' : '24h Window Elapsed'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-300 flex items-center justify-between">
                  <span>
                    {isSentSupply
                      ? '⏱ 1-hour market window ended — Send Request Again'
                      : '⏱ 24-hour buyer window ended — Send Request Again'}
                  </span>
                  <button
                    onClick={() => {
                      const res = resendCropRequest(req.id);
                      if (res.success) {
                        setToastMessage(
                          isSentSupply
                            ? 'Market supply request renewed! 1-hour window restarted.'
                            : 'Buyer booking request renewed! 24-hour window restarted.'
                        );
                        setTimeout(() => setToastMessage(null), 3500);
                      }
                    }}
                    className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Send Request Again</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. CURRENT MARKET PRICES & APMC TICKER (Directly addressing item 1 & 3) */}
      {(viewSection === 'OVERVIEW' || viewSection === 'MARKETS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white">
                {language === 'te' ? 'నేటి మార్కెట్ కొనుగోలు ధరలు' : 'Current Market Buying Prices'}
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live APMC
            </span>
          </div>

          {/* Horizontal Scroll of Current Market Buying Prices */}
          <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {trendingCommodities.map((item, idx) => (
              <div
                key={idx}
                className="w-44 shrink-0 p-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition shadow-lg space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                      {item.change}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-xs mt-1 truncate">
                    {item.name.split(' ')[0]}
                  </h4>
                  <span className="text-[10px] text-stone-400 truncate block">
                    {item.market}
                  </span>
                </div>

                <div>
                  <div className="mt-1">
                    <span className="text-[8px] uppercase font-bold text-stone-500 block">
                      Market Buying Price
                    </span>
                    <p className="text-base font-black text-emerald-400 leading-tight">
                      ₹{item.price}
                      <span className="text-xs font-normal text-stone-400">/kg</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const matchedMkt = markets.find(m => m.name.toLowerCase().includes(item.market.toLowerCase().split(' ')[0])) || markets[0];
                      onNavigateToMarket(matchedMkt.id);
                    }}
                    className="w-full mt-2 py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Market</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. NEARBY MARKETS PREVIEW (Directly addressing item 2: Nearby markets, View Market, Follow) */}
      {(viewSection === 'OVERVIEW' || viewSection === 'MARKETS') && (
        <div className="space-y-3">
          {viewSection === 'MARKETS' && (
            <MarketCycleTimerBanner />
          )}

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white">
                {language === 'te' ? 'సమీప మార్కెట్లు' : 'Nearby Markets'}
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">Verified APMC Mandis</span>
          </div>

          <div className="space-y-2.5">
            {markets.slice(0, 3).map(market => {
              const distance = getMarketDistance(market, currentUser?.district || 'Chittoor');
              const isFollowed = currentUser?.followedMarketIds.includes(market.id);
              const topReq = market.cropsRequired[0];

              return (
                <div
                  key={market.id}
                  className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition space-y-2.5 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-stone-800 overflow-hidden shrink-0">
                        <img src={market.bannerImage} alt={market.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">{market.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-500" />
                          <span>{market.district}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-semibold">{distance.text}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                      🟢 Verified
                    </span>
                  </div>

                  {/* Top buying rate preview */}
                  {topReq && (
                    <div className="p-2 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{getCropEmoji(topReq.cropName)}</span>
                        <span className="text-stone-300 font-medium">{topReq.cropName} (Grade {topReq.grade})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400 text-xs">₹{topReq.buyingPrice}/kg</span>
                        <span className="text-[10px] text-stone-500 block">{topReq.remainingQuantity} kg needed</span>
                      </div>
                    </div>
                  )}

                  {/* Consistent Buttons: View Market, Request, Follow */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => onNavigateToMarket(market.id)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Market</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setSupplyMarket(market)}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-black transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Request</span>
                    </button>

                    <button
                      onClick={() => toggleFollowMarket(market.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        isFollowed
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-amber-400' : ''}`} />
                      <span>{isFollowed ? 'Following' : 'Follow'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. FARMER'S LISTED CROPS (With Search, Filters, and Strict Price & Double-Booking Prevention) */}
      {(viewSection === 'OVERVIEW' || viewSection === 'MY_CROPS') && (
        <div className="space-y-3 pt-1">
          {/* Section Header & Count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🌾</span>
              <h3 className="text-sm font-black text-white">
                {language === 'te' ? 'నా పంటల జాబితా' : 'My Harvest Listings'}
              </h3>
              <span className="bg-stone-800 text-stone-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {filteredFarmerCrops.length}
              </span>
            </div>

            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-[11px] cursor-pointer ${
                sortBy !== 'DEFAULT' || statusFilter !== 'ALL'
                  ? 'bg-emerald-500 text-stone-950 font-bold border-emerald-400'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by crop name, location, grade..."
              className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Expanded Filter Options if Filter clicked */}
          {showFiltersModal && (
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-2.5 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-stone-400 font-bold text-[11px]">
                <span>Status Filter:</span>
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSortBy('DEFAULT');
                  }}
                  className="text-emerald-400 underline font-medium"
                >
                  Reset
                </button>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {(['ALL', 'ACTIVE', 'PRE-BOOKED', 'CONFIRMED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                      statusFilter === st
                        ? 'bg-emerald-600 text-stone-950'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-stone-800">
                <span className="text-stone-400 font-bold text-[11px] block mb-1.5">Sort by:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSortBy('PRICE_HIGH')}
                    className={`p-1.5 rounded-lg text-[10px] font-semibold text-center ${
                      sortBy === 'PRICE_HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => setSortBy('AVAILABLE_QTY')}
                    className={`p-1.5 rounded-lg text-[10px] font-semibold text-center ${
                      sortBy === 'AVAILABLE_QTY' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    Available Quantity
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Crop Cards List */}
          {filteredFarmerCrops.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                🌱
              </div>
              <h4 className="font-bold text-white text-sm">No crops match your search</h4>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Post your harvest details with field video to start receiving buyer booking requests.
              </p>
              <button
                onClick={onNavigateToAddCrop}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition"
              >
                + Post New Crop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFarmerCrops.map(crop => {
                const cropReqs = requests.filter(r => r.cropId === crop.id && r.status === 'PENDING');
                const cropDeals = deals.filter(d => d.cropId === crop.id);
                const percentBooked = Math.round((crop.preBookedQuantity / crop.totalQuantity) * 100);

                const emoji = getCropEmoji(crop.cropName);
                const cropDisplay = getSpecificCropDisplay(crop.cropName, crop.variety);
                const marketBuyingPrice = getMarketBuyingPriceForCrop(crop, markets);

                return (
                  <div
                    key={crop.id}
                    className="bg-stone-900 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3.5 relative overflow-hidden transition hover:border-stone-750"
                  >
                    {/* Header: Photo/Video, Crop Name, Grade, Location, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {/* Video/Photo Thumbnail */}
                        <div
                          onClick={() => onOpenVideoModal(crop)}
                          className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-800 shrink-0 cursor-pointer group shadow"
                        >
                          <img
                            src={crop.photos[0]}
                            alt={crop.cropName}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                              <Video className="w-3 h-3 text-emerald-400" />
                            </div>
                          </div>
                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] px-1 rounded font-mono">
                            Video
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-black text-white text-base leading-snug flex items-center gap-1.5 truncate">
                            <span>{emoji}</span>
                            <span>{cropDisplay.mainName}</span>
                          </h4>
                          {cropDisplay.varietyText && (
                            <p className="text-[11px] text-amber-300 font-semibold truncate">
                              {cropDisplay.varietyText}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1">
                            <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                            <span className="truncate">{crop.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          crop.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : crop.status === 'PRE-BOOKED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : crop.status === 'DEAL CONFIRMED' || crop.status === 'SOLD'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {crop.status}
                      </span>
                    </div>

                    {/* REQUIREMENT: CLEARLY DISTINGUISH MARKET BUYING PRICE vs FARMER'S ASKING PRICE */}
                    <div className="rounded-2xl bg-stone-950 p-3 border border-stone-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Left: FARMER'S ASKING / EXPECTED PRICE */}
                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-[9px] uppercase font-extrabold text-stone-400 tracking-wider block">
                            {language === 'te' ? 'రైతు ఆశించిన ధర' : "FARMER'S ASKING PRICE"}
                          </span>
                          <p className="text-base font-black text-emerald-400 mt-0.5">
                            ₹{crop.expectedPrice}
                            <span className="text-xs font-normal text-stone-400">/kg</span>
                          </p>
                          <span className="text-[9px] text-stone-500 block mt-0.5">
                            {language === 'te' ? 'మీరు నిర్ణయించిన ధర' : 'Set by you'}
                          </span>
                        </div>

                        {/* Right: CURRENT MARKET BUYING PRICE */}
                        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
                          <span className="text-[9px] uppercase font-extrabold text-amber-300 tracking-wider block">
                            {language === 'te' ? 'మార్కెట్ కొనుగోలు ధర' : 'MARKET BUYING PRICE'}
                          </span>
                          <p className="text-base font-black text-amber-400 mt-0.5">
                            ₹{marketBuyingPrice}
                            <span className="text-xs font-normal text-stone-400">/kg</span>
                          </p>
                          <span className="text-[9px] block mt-0.5 font-bold">
                            {marketBuyingPrice > crop.expectedPrice ? (
                              <span className="text-emerald-400">
                                ▲ +₹{marketBuyingPrice - crop.expectedPrice}/kg higher in Mandi
                              </span>
                            ) : marketBuyingPrice < crop.expectedPrice ? (
                              <span className="text-rose-400">
                                ▼ -₹{crop.expectedPrice - marketBuyingPrice}/kg lower than asking price
                              </span>
                            ) : (
                              <span className="text-sky-300">
                                ● Matches asking price
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Advisory when Market Buying Price is LESS than Farmer's Asking Price */}
                      {marketBuyingPrice < crop.expectedPrice && (
                        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs space-y-2 animate-in fade-in">
                          <div className="flex items-center gap-1.5 text-rose-300 font-extrabold text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>
                              {language === 'te'
                                ? `మార్కెట్ కొనుగోలు ధర మీ ఆశించిన ధర కంటే కిలోకు ₹${crop.expectedPrice - marketBuyingPrice} తక్కువగా ఉంది`
                                : `Market Buying Price is ₹${crop.expectedPrice - marketBuyingPrice}/kg LESS than your asking price`}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-300 leading-relaxed">
                            {language === 'te'
                              ? `స్థానిక మార్కెట్ కొనుగోలు ధర ₹${marketBuyingPrice}/కిలో ఉంది. మీ పంట త్వరగా అమ్ముడుపోవడానికి మార్కెట్ రేటుకు సవరించండి లేదా ఎక్కువ రేటు ఇచ్చే ఇతర మార్కెట్లను కనుగొనండి.`
                              : `Local APMC is buying at ₹${marketBuyingPrice}/kg. Buyers may hesitate to buy at ₹${crop.expectedPrice}/kg unless premium quality. You can match the mandi rate for instant deal confirmations or compare other mandis.`}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              onClick={() => {
                                updateCrop(crop.id, { expectedPrice: marketBuyingPrice }, currentUser?.name);
                                setToastMessage(`Updated asking price for ${crop.cropName} to match Mandi buying rate: ₹${marketBuyingPrice}/kg!`);
                                setTimeout(() => setToastMessage(null), 3500);
                              }}
                              className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] transition cursor-pointer shadow-sm"
                            >
                              Match Mandi Price (₹{marketBuyingPrice}/kg)
                            </button>
                            <button
                              onClick={() => setTransportCrop(crop)}
                              className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/40 font-bold text-[11px] transition cursor-pointer"
                            >
                              Find Better Mandi →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Active Offer Banner if buyer sent request */}
                      {cropReqs.length > 0 && (
                        <div className="p-2 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-extrabold text-sky-300 block">
                              CURRENT BUYER OFFER
                            </span>
                            <span className="text-white font-bold text-xs">{cropReqs[0].buyerName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-sky-400">
                              ₹{cropReqs[0].offeredPrice}<span className="text-[10px] text-stone-400">/kg</span>
                            </span>
                            <span className="text-[9px] text-stone-400 block font-medium">
                              for {cropReqs[0].requestedQuantity.toLocaleString('en-IN')} kg
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* REQUIREMENT: PREVENT DOUBLE BOOKING (Total, Booked, Available) */}
                    <div className="rounded-2xl bg-stone-950 p-3 border border-stone-800 space-y-2.5">
                      {/* Grade Badge */}
                      <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                        <span className="text-[11px] font-bold text-stone-400">
                          Crop + Grade:
                        </span>
                        <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-lg text-xs font-black">
                          <Sparkles className="w-3 h-3" />
                          <span>Grade {crop.grade}</span>
                          <span className="text-[10px] text-amber-200/80 font-normal">
                            ({crop.grade === 'A' ? 'Premium' : crop.grade === 'B' ? 'Good' : 'Standard'})
                          </span>
                        </div>
                      </div>

                      {/* Segmented 3-Column Division for Quantities */}
                      {crop.status === 'SOLD' ? (
                        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-300 font-extrabold flex items-center gap-1.5">
                              <span>✓</span>
                              <span>100% Sold Out ({crop.totalQuantity.toLocaleString('en-IN')} kg)</span>
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                              Payment Cleared ✓
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-900/40">
                            <div>
                              <span className="text-stone-400 block text-[10px]">Realized Revenue:</span>
                              <span className="text-emerald-400 font-black text-sm">
                                ₹{(crop.totalQuantity * (crop.currentMarketBuyingPrice || crop.expectedPrice)).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-stone-400 block text-[10px]">Mandi Settlement:</span>
                              <span className="text-white font-bold text-xs">
                                {crop.cropName.toLowerCase().includes('rice') ? 'Tirupati APMC Mill' : 'Palamaner Mandi Yard'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : crop.status === 'PRE-BOOKED' ? (
                        <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-amber-300 font-black flex items-center gap-1.5">
                              <span>🔒</span>
                              <span>100% Pre-Booked (All {crop.totalQuantity.toLocaleString('en-IN')} kg Reserved)</span>
                            </span>
                            <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                              Deposit Paid
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-900/40">
                            <div>
                              <span className="text-stone-400 block text-[10px]">Contract Value:</span>
                              <span className="text-amber-400 font-black text-sm">
                                ₹{(crop.totalQuantity * crop.expectedPrice).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-stone-400 block text-[10px]">Reserved By:</span>
                              <span className="text-white font-bold text-xs">
                                Bangalore Fresh Mart (Karthik)
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {/* 1. Total Quantity */}
                            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                                Total
                              </span>
                              <p className="text-sm font-black text-white mt-0.5">
                                {crop.totalQuantity.toLocaleString('en-IN')}
                              </p>
                              <span className="text-[9px] text-stone-500">kg</span>
                            </div>

                            {/* 2. Pre-Booked Quantity */}
                            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                              <span className="text-[9px] uppercase font-bold text-amber-300 block tracking-wider">
                                Pre-Booked
                              </span>
                              <p className="text-sm font-black text-amber-400 mt-0.5">
                                {crop.preBookedQuantity.toLocaleString('en-IN')}
                              </p>
                              <span className="text-[9px] text-amber-300/80">kg ({percentBooked}%)</span>
                            </div>

                            {/* 3. Available Quantity (Prevent Double Booking) */}
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                              <span className="text-[9px] uppercase font-bold text-emerald-300 block tracking-wider">
                                Available
                              </span>
                              <p className="text-sm font-black text-emerald-400 mt-0.5">
                                {crop.remainingQuantity.toLocaleString('en-IN')}
                              </p>
                              <span className="text-[9px] text-emerald-300/80">kg</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden flex">
                              <div
                                className="h-full bg-amber-500 transition-all duration-300"
                                style={{ width: `${(crop.preBookedQuantity / crop.totalQuantity) * 100}%` }}
                              ></div>
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${(crop.remainingQuantity / crop.totalQuantity) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-stone-400">
                              <span className="text-amber-400 font-medium">● {crop.preBookedQuantity} kg booked</span>
                              <span className="text-emerald-400 font-bold">● Available: {crop.remainingQuantity} kg</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigateToCrop(crop.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Manage & History</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onNavigateToCrop(crop.id)}
                          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            cropReqs.length > 0
                              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40 animate-pulse'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          <span>Requests</span>
                          {cropReqs.length > 0 && (
                            <span className="bg-stone-950 text-amber-300 font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                              {cropReqs.length}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Net Return Estimator Quick Trigger */}
                      <button
                        onClick={() => setTransportCrop(crop)}
                        className="w-full py-2 px-3 rounded-xl bg-stone-950 hover:bg-stone-850 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Compare Mandi Net Returns & Transport</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-emerald-950 border border-emerald-500/80 text-emerald-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Transport & Net Return Modal */}
      {transportCrop && (
        <TransportNetReturnModal
          crop={transportCrop}
          onClose={() => setTransportCrop(null)}
          onSelectMarket={(mktId) => onNavigateToMarket(mktId)}
        />
      )}

      {/* Market Supply Request Modal */}
      {supplyMarket && (
        <MarketSupplyRequestModal
          market={supplyMarket}
          onClose={() => setSupplyMarket(null)}
          onSuccess={() => {
            setToastMessage(`Supply request dispatched to ${supplyMarket.name}!`);
            setTimeout(() => setToastMessage(null), 3500);
          }}
        />
      )}
    </div>
  );
};

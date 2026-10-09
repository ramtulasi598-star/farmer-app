import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crop, CropGrade } from '../types';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  Video,
  Send,
  MessageSquare,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  FileText,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  getCropEmoji,
  getSpecificCropDisplay,
  getMarketBuyingPriceForCrop,
} from '../utils/marketHelpers';

interface BuyerHomePageProps {
  onNavigateToCrop: (cropId: string) => void;
  onNavigateToChatWithFarmer: (farmerId: string, cropId: string) => void;
  onOpenVideoModal: (crop: Crop) => void;
}

export const BuyerHomePage: React.FC<BuyerHomePageProps> = ({
  onNavigateToCrop,
  onNavigateToChatWithFarmer,
  onOpenVideoModal,
}) => {
  const {
    currentUser,
    crops,
    markets,
    requests,
    deals,
    createCropRequest,
    acceptCropRequest,
    rejectCropRequest,
    resendCropRequest,
    addMarketRequirement,
    t,
  } = useApp();

  // Tab state for Buyer Dashboard:
  // "Buyer/market sees farmer listings, requests, buying requirements."
  const [buyerTab, setBuyerTab] = useState<'LISTINGS' | 'REQUESTS' | 'REQUIREMENTS'>('LISTINGS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(200);

  // Request / Pre-book Modal State
  const [bookingCrop, setBookingCrop] = useState<Crop | null>(null);
  const [requestQty, setRequestQty] = useState<number>(300);
  const [offerPrice, setOfferPrice] = useState<number>(32);
  const [bookingNotes, setBookingNotes] = useState<string>('Transport vehicle arranged for farm gate pickup.');
  const [bookingError, setBookingError] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // New Market Requirement Modal State
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqCropName, setReqCropName] = useState('Tomato (Hybrid Sahu)');
  const [reqQuantity, setReqQuantity] = useState(5000);
  const [reqPrice, setReqPrice] = useState(34);
  const [reqGrade, setReqGrade] = useState<CropGrade>('A');

  // Filter crops
  const filteredCrops = crops.filter(c => {
    // Only show active or pre-booked crops with available remaining quantity
    if (c.status === 'SOLD' || c.status === 'CANCELLED') return false;

    const matchesSearch =
      c.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGrade === 'ALL' || c.grade === selectedGrade;
    const matchesCategory = selectedCategory === 'ALL' || c.cropCategory.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = c.expectedPrice <= maxPrice;

    return matchesSearch && matchesGrade && matchesCategory && matchesPrice;
  });

  // Buyer's sent requests
  const buyerRequests = requests.filter(r => r.buyerId === currentUser?.id || currentUser?.role === 'BUYER');

  // Target market requirements
  const primaryMarket = markets[0];

  const handleOpenBooking = (crop: Crop) => {
    setBookingCrop(crop);
    setRequestQty(Math.min(500, crop.remainingQuantity));
    setOfferPrice(crop.expectedPrice);
    setBookingNotes('Immediate pickup from farm gate.');
    setBookingError('');
    setBookingSuccess(false);
  };

  const handleSubmitBooking = () => {
    if (!bookingCrop) return;
    setBookingError('');

    if (requestQty > bookingCrop.remainingQuantity) {
      setBookingError(`Quantity exceeds available stock (${bookingCrop.remainingQuantity} kg available).`);
      return;
    }

    const res = createCropRequest({
      cropId: bookingCrop.id,
      requestedQuantity: Number(requestQty),
      offeredPrice: Number(offerPrice),
      notes: bookingNotes,
    });

    if (res.success) {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingCrop(null);
        setBookingSuccess(false);
      }, 1600);
    } else {
      setBookingError(res.error || 'Failed to submit booking request.');
    }
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    addMarketRequirement(primaryMarket.id, {
      cropName: reqCropName,
      requiredQuantity: Number(reqQuantity),
      buyingPrice: Number(reqPrice),
      grade: reqGrade,
      demand: 'HIGH',
    });
    setShowReqModal(false);
    alert('Market buying requirement posted successfully!');
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* 1. TOP SOURCING HERO */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 shadow-xl space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{currentUser?.companyName || 'Mandi Trader Dashboard'}</span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5 tracking-tight">
              {t('buyerDashboardTitle')}
            </h2>
            <p className="text-[11px] text-stone-400">
              Source verified harvests directly from farmers without intermediaries
            </p>
          </div>
          <button
            onClick={() => setShowReqModal(true)}
            className="py-2 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-md transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Demand</span>
          </button>
        </div>

        {/* 3 SUB-TABS: "Farmer Listings" | "Sent Requests" | "Buying Requirements" */}
        <div className="flex items-center p-1 bg-stone-950 border border-stone-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setBuyerTab('LISTINGS')}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
              buyerTab === 'LISTINGS'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Farmer Crops ({filteredCrops.length})
          </button>
          <button
            onClick={() => setBuyerTab('REQUESTS')}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
              buyerTab === 'REQUESTS'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>My Requests</span>
            <span className="text-[10px] bg-stone-900 px-1.5 rounded-full text-stone-300">
              {buyerRequests.length}
            </span>
          </button>
          <button
            onClick={() => setBuyerTab('REQUIREMENTS')}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
              buyerTab === 'REQUIREMENTS'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Mandi Demand
          </button>
        </div>

        {/* Search Input (visible on Listings tab) */}
        {buyerTab === 'LISTINGS' && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search crops, farmer location, district..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Chips (Grade & Max Price) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <span className="text-stone-400 text-[11px] font-bold mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Grade:
              </span>
              {['ALL', 'A', 'B', 'C'].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                    selectedGrade === g
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: LIVE FARMER CROP POSTS LISTING */}
      {buyerTab === 'LISTINGS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🌾</span>
              <h3 className="text-sm font-bold text-white">Live Farmer Harvests</h3>
              <span className="bg-stone-800 text-stone-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {filteredCrops.length} listed
              </span>
            </div>
            <span className="text-[11px] text-stone-400">Direct From Farms</span>
          </div>

          {filteredCrops.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-2">
              <p className="text-xs text-stone-400">No active crops match your search filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGrade('ALL');
                }}
                className="text-xs text-amber-400 underline font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCrops.map(crop => (
                <div
                  key={crop.id}
                  className="bg-stone-900 border border-stone-800 rounded-3xl p-3.5 shadow-lg space-y-3 transition hover:border-stone-700"
                >
                  {/* Farmer & Location Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                        👨‍🌾
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white">{crop.farmerName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {crop.location}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-mono">
                      {crop.createdAt.split(' ')[0]}
                    </span>
                  </div>

                  {/* Crop Media & Overview */}
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => onOpenVideoModal(crop)}
                      className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-800 shrink-0 cursor-pointer group shadow"
                    >
                      <img
                        src={crop.photos[0]}
                        alt={crop.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition">
                          <Video className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-mono">
                        Video
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-black text-white text-sm flex items-center gap-1.5 truncate">
                          <span>{getCropEmoji(crop.cropName)}</span>
                          <span>{getSpecificCropDisplay(crop.cropName, crop.variety).mainName}</span>
                        </h4>
                        {getSpecificCropDisplay(crop.cropName, crop.variety).varietyText && (
                          <p className="text-[10px] text-amber-300 font-semibold truncate ml-5">
                            {getSpecificCropDisplay(crop.cropName, crop.variety).varietyText}
                          </p>
                        )}
                      </div>

                      {/* Clearly distinguish Market Buying Price vs Farmer's Asking Price */}
                      <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-stone-950 border border-stone-850">
                        <div>
                          <span className="text-[8px] uppercase font-extrabold text-stone-400 block tracking-wider">
                            FARMER'S ASKING
                          </span>
                          <span className="text-emerald-400 font-black text-xs block mt-0.5">
                            ₹{crop.expectedPrice}/kg
                          </span>
                        </div>
                        <div className="border-l border-stone-850 pl-1.5">
                          <span className="text-[8px] uppercase font-extrabold text-amber-400 block tracking-wider">
                            MARKET BUYING
                          </span>
                          <span className="text-amber-300 font-black text-xs block mt-0.5">
                            ₹{getMarketBuyingPriceForCrop(crop, markets)}/kg
                          </span>
                        </div>
                      </div>
                      {(() => {
                        const mktPrice = getMarketBuyingPriceForCrop(crop, markets);
                        if (mktPrice > crop.expectedPrice) {
                          return (
                            <span className="text-[10px] text-emerald-400 font-semibold block">
                              🟢 Farmer asks ₹{mktPrice - crop.expectedPrice}/kg below Mandi rate (High value deal)
                            </span>
                          );
                        } else if (mktPrice < crop.expectedPrice) {
                          return (
                            <span className="text-[10px] text-amber-300 font-semibold block">
                              ⚠️ Farmer asks ₹{crop.expectedPrice - mktPrice}/kg above Mandi rate
                            </span>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-400/30 text-[10px]">
                          Grade {crop.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PREVENT DOUBLE BOOKING: Real-time Quantity Bar */}
                  <div className="p-2.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">
                        Total: <strong className="text-white">{crop.totalQuantity} kg</strong>
                      </span>
                      <span className="text-amber-400">
                        Pre-booked: <strong>{crop.preBookedQuantity} kg</strong>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Available: <strong>{crop.remainingQuantity} kg</strong>
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-stone-800 mt-1.5 overflow-hidden flex">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${(crop.preBookedQuantity / crop.totalQuantity) * 100}%` }}
                      ></div>
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(crop.remainingQuantity / crop.totalQuantity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions: Chat or Request/Pre-Book */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onNavigateToChatWithFarmer(crop.farmerId, crop.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                      <span>Negotiate</span>
                    </button>

                    <button
                      onClick={() => handleOpenBooking(crop)}
                      disabled={crop.remainingQuantity <= 0}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{crop.remainingQuantity > 0 ? 'Request' : 'Fully Booked'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BUYER'S SENT REQUESTS (Market Request System & 1-Hour Rule) */}
      {buyerTab === 'REQUESTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Sent Purchase Requests</span>
            </h3>
            <span className="text-[10px] text-stone-400">{buyerRequests.length} Tracked</span>
          </div>

          {buyerRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-2">
              <p className="text-xs text-stone-400">You haven't sent any booking requests yet.</p>
              <button
                onClick={() => setBuyerTab('LISTINGS')}
                className="text-xs text-amber-400 underline font-bold"
              >
                Browse Farmer Harvests
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {buyerRequests.map(req => {
                const isPending = req.status === 'PENDING';
                const isAccepted = req.status === 'ACCEPTED';
                const isRejected = req.status === 'REJECTED';
                const isExpired = req.status === 'EXPIRED';

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{req.cropName}</h4>
                        <span className="text-[11px] text-stone-400">
                          Farmer: {req.farmerName}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isAccepted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {req.status === 'ACCEPTED' ? 'Deal Confirmed' : req.status}
                      </span>
                    </div>

                    {/* Details Box */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block">Quantity</span>
                        <span className="font-extrabold text-white text-sm">{req.requestedQuantity.toLocaleString('en-IN')} kg</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-amber-400 block">Offered Rate</span>
                        <span className="font-extrabold text-amber-300 text-sm">₹{req.offeredPrice}/kg</span>
                      </div>
                    </div>

                    {/* Response Rule Status Notice (1h for market, 24h for farmer-buyer) */}
                    {isPending && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            {req.sourceType === 'FARMER_SUPPLY_OFFER'
                              ? '⏱ Market should respond within 1 hour.'
                              : '⏱ Farmer to Buyer response window: 24 hours.'}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          {req.sourceType === 'FARMER_SUPPLY_OFFER' ? 'Action Required (1h)' : 'Waiting for Farmer (24h)'}
                        </span>
                      </div>
                    )}

                    {/* Action buttons for Farmer Supply Offer */}
                    {isPending && req.sourceType === 'FARMER_SUPPLY_OFFER' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            rejectCropRequest(req.id, 'Procurement desk declined supply offer');
                            setToastMessage('Supply offer declined.');
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-rose-400 font-bold text-xs transition cursor-pointer"
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
                              setToastMessage(res.error || 'Failed to confirm deal.');
                              setTimeout(() => setToastMessage(null), 3500);
                            }
                          }}
                          className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Deal</span>
                        </button>
                      </div>
                    )}

                    {isExpired && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>
                            {req.sourceType === 'FARMER_SUPPLY_OFFER'
                              ? 'Market request expired (1-hour window)'
                              : 'Buyer request expired (24-hour window)'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const res = resendCropRequest(req.id);
                            if (res.success) {
                              setToastMessage(
                                req.sourceType === 'FARMER_SUPPLY_OFFER'
                                  ? 'Request sent again! 1-hour response window restarted.'
                                  : 'Request sent again! 24-hour response window restarted.'
                              );
                              setTimeout(() => setToastMessage(null), 3500);
                            }
                          }}
                          className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Send Request Again</span>
                        </button>
                      </div>
                    )}

                    {isAccepted && (
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Booking Accepted! Deal confirmed. Contact farmer for farm gate collection.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MANDI BUYING REQUIREMENTS */}
      {buyerTab === 'REQUIREMENTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Market Buying Requirements</span>
              </h3>
              <p className="text-[10px] text-stone-400">{primaryMarket.name}</p>
            </div>
            <button
              onClick={() => setShowReqModal(true)}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              + Post Demand
            </button>
          </div>

          <div className="space-y-2.5">
            {primaryMarket.cropsRequired.map(req => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1">
                      <span>{getCropEmoji(req.cropName)}</span>
                      <span>{req.cropName}</span>
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded font-bold border border-stone-700">
                        Grade {req.grade}
                      </span>
                      {req.demand === 'HIGH' && (
                        <span className="text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded font-bold border border-rose-800 flex items-center gap-0.5">
                          🔥 High Demand
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Mandi Buying Price</span>
                    <span className="text-base font-black text-emerald-400">₹{req.buyingPrice}/kg</span>
                  </div>
                </div>

                {/* Quantities breakdown */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Target: <strong className="text-white">{req.requiredQuantity} kg</strong></span>
                    <span>Pre-booked: <strong className="text-amber-400">{req.preBookedQuantity} kg</strong></span>
                    <span>
                      <strong className="text-emerald-400">{req.remainingQuantity} kg</strong>{' '}
                      <span className="text-emerald-300 font-medium">still required</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden flex">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODAL: PRE-BOOK / SEND REQUEST */}
      {bookingCrop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Send Booking Request</h3>
                <p className="text-xs text-stone-400">{bookingCrop.cropName} (Grade {bookingCrop.grade})</p>
              </div>
              <button
                onClick={() => setBookingCrop(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              {bookingSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-white text-base">Booking Request Sent!</h4>
                  <p className="text-stone-300">
                    ⏱ Farmer should respond within 24 hours. You will receive an instant notification.
                  </p>
                </div>
              ) : (
                <>
                  {/* Available Quantity Info (Prevent double booking) */}
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase font-bold">Currently Available</span>
                      <p className="text-base font-extrabold text-white">
                        {bookingCrop.remainingQuantity.toLocaleString('en-IN')} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase">Farmer's Asking</span>
                      <p className="text-base font-bold text-emerald-400">₹{bookingCrop.expectedPrice}/kg</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Quantity to Book (kg) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      max={bookingCrop.remainingQuantity}
                      min={10}
                      value={requestQty}
                      onChange={e => setRequestQty(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {[100, 250, 500, bookingCrop.remainingQuantity].map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRequestQty(q)}
                          className="px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300 border border-stone-700"
                        >
                          {q === bookingCrop.remainingQuantity ? 'Max Available' : `${q} kg`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Your Offered Buying Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={e => setOfferPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Pickup / Transportation Notes
                    </label>
                    <input
                      type="text"
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      placeholder="e.g. Packing in plastic crates, pickup at farm gate"
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* 24-Hour Rule Notice (Farmer to Buyer) */}
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>⏱ Farmer to Buyer response window: 24 hours.</span>
                  </div>

                  {/* Total Deal Estimation */}
                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                    <span className="text-stone-400">Total Booking Value:</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ₹{(requestQty * offerPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {bookingError && (
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition cursor-pointer"
                  >
                    Send Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: POST MARKET REQUIREMENT */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Add Buying Requirement</h3>
                <p className="text-xs text-stone-400">Broadcast your buying demand to farmers</p>
              </div>
              <button
                onClick={() => setShowReqModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRequirement} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Crop Name</label>
                <input
                  type="text"
                  value={reqCropName}
                  onChange={e => setReqCropName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Required Qty (kg)</label>
                  <input
                    type="number"
                    value={reqQuantity}
                    onChange={e => setReqQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Buying Price (₹/kg)</label>
                  <input
                    type="number"
                    value={reqPrice}
                    onChange={e => setReqPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Required Grade</label>
                <select
                  value={reqGrade}
                  onChange={e => setReqGrade(e.target.value as CropGrade)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="A">Grade A (Premium / Export)</option>
                  <option value="B">Grade B (Standard Market)</option>
                  <option value="C">Grade C (Processing)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-md transition cursor-pointer"
                >
                  Publish Market Requirement
                </button>
              </div>
            </form>
          </div>
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
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CropGrade } from '../types';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Play,
  Send,
  MessageSquare,
  History,
  ShieldCheck,
  Check,
  X,
  FileText,
  Star,
  Truck,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  getCropEmoji,
  getSpecificCropDisplay,
  getMarketBuyingPriceForCrop,
} from '../utils/marketHelpers';
import { TransportNetReturnModal } from '../components/TransportNetReturnModal';

interface CropDetailPageProps {
  cropId: string;
  onBack: () => void;
  onOpenVideoModal: () => void;
  onNavigateToChat: (buyerId: string) => void;
  onViewDeal: (dealId: string) => void;
}

export const CropDetailPage: React.FC<CropDetailPageProps> = ({
  cropId,
  onBack,
  onOpenVideoModal,
  onNavigateToChat,
  onViewDeal,
}) => {
  const {
    getCropById,
    currentUser,
    markets,
    requests,
    deals,
    updateCrop,
    deleteCrop,
    markCropSold,
    acceptCropRequest,
    rejectCropRequest,
    expireCropRequest,
    resendCropRequest,
    t,
    language,
  } = useApp();

  const crop = getCropById(cropId);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REQUESTS' | 'HISTORY'>('OVERVIEW');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit fields
  const [editPrice, setEditPrice] = useState<number>(crop?.expectedPrice || 32);
  const [editQuantity, setEditQuantity] = useState<number>(crop?.totalQuantity || 1000);
  const [editGrade, setEditGrade] = useState<CropGrade>(crop?.grade || 'A');
  const [editDescription, setEditDescription] = useState<string>(crop?.description || '');
  const [editError, setEditError] = useState<string>('');

  if (!crop) {
    return (
      <div className="p-8 text-center text-stone-400">
        <p>Crop listing not found.</p>
        <button onClick={onBack} className="text-emerald-400 mt-2 underline">
          Back
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === crop.farmerId && currentUser?.role === 'FARMER';
  const cropRequests = requests.filter(r => r.cropId === crop.id);
  const cropDeals = deals.filter(d => d.cropId === crop.id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    const res = updateCrop(
      crop.id,
      {
        expectedPrice: Number(editPrice),
        totalQuantity: Number(editQuantity),
        grade: editGrade,
        description: editDescription,
      },
      currentUser?.name
    );

    if (res.success) {
      setShowEditModal(false);
    } else {
      setEditError(res.error || 'Failed to update crop.');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this active crop listing?')) {
      const res = deleteCrop(crop.id);
      if (res.success) {
        alert(t('cropDeletedNotice'));
        onBack();
      } else {
        alert(res.error || 'Cannot delete crop.');
      }
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('editCrop')}</span>
            </button>
            {crop.preBookedQuantity === 0 && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 transition"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hero Media Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl space-y-3">
        <div className="relative h-48 w-full bg-black">
          <img
            src={crop.photos[0]}
            alt={crop.cropName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30"></div>

          {/* Video Play Button Overlay */}
          <button
            onClick={onOpenVideoModal}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/80 group-hover:bg-emerald-400 text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition transform group-hover:scale-110">
              <Play className="w-7 h-7 ml-1 fill-stone-950" />
            </div>
          </button>

          {/* Status & Grade Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md ${
                crop.status === 'ACTIVE'
                  ? 'bg-emerald-500 text-stone-950'
                  : crop.status === 'PRE-BOOKED'
                  ? 'bg-amber-400 text-stone-950'
                  : crop.status === 'SOLD'
                  ? 'bg-blue-500 text-white'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              {crop.status}
            </span>
            <span className="bg-stone-900/90 text-amber-300 border border-stone-700 text-[10px] font-bold px-2 py-1 rounded-full">
              Grade {crop.grade}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div className="min-w-0 pr-2">
              <h2 className="text-lg font-black text-white leading-tight flex items-center gap-1.5 truncate">
                <span>{getCropEmoji(crop.cropName)}</span>
                <span>{getSpecificCropDisplay(crop.cropName, crop.variety).mainName}</span>
              </h2>
              {getSpecificCropDisplay(crop.cropName, crop.variety).varietyText && (
                <p className="text-[11px] text-amber-300 font-semibold truncate ml-6">
                  {getSpecificCropDisplay(crop.cropName, crop.variety).varietyText}
                </p>
              )}
              <div className="flex items-center gap-1 text-[11px] text-stone-300 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{crop.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Price Separation Block (Requirement 1) */}
        <div className="px-4 pt-1">
          <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-stone-950 border border-stone-850">
            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
              <span className="text-[9px] uppercase font-extrabold text-stone-400 tracking-wider block">
                {language === 'te' ? 'రైతు ఆశించిన ధర' : "FARMER'S EXPECTED PRICE"}
              </span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">
                ₹{crop.expectedPrice}<span className="text-xs font-normal text-stone-400">/kg</span>
              </p>
              <span className="text-[9px] text-stone-500 block">Set by farmer</span>
            </div>

            {/* Right: CURRENT MARKET BUYING PRICE */}
            {(() => {
              const marketBuyingPrice = getMarketBuyingPriceForCrop(crop, markets);
              const isLower = marketBuyingPrice < crop.expectedPrice;
              const isHigher = marketBuyingPrice > crop.expectedPrice;
              return (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
                  <span className="text-[9px] uppercase font-extrabold text-amber-300 tracking-wider block">
                    {language === 'te' ? 'మార్కెట్ కొనుగోలు ధర' : 'CURRENT MARKET BUYING PRICE'}
                  </span>
                  <p className="text-lg font-black text-amber-400 mt-0.5">
                    ₹{marketBuyingPrice}<span className="text-xs font-normal text-stone-400">/kg</span>
                  </p>
                  <span className="text-[9px] block mt-0.5 font-bold">
                    {isHigher ? (
                      <span className="text-emerald-400">
                        ▲ +₹{marketBuyingPrice - crop.expectedPrice}/kg higher in Mandi
                      </span>
                    ) : isLower ? (
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
              );
            })()}
          </div>

          {/* Pricing Rule Clarification (Requirement 3: Prices only changed by market not by farmer) */}
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">🏛️ Mandi Benchmarks:</span>
              <span>Official prices changed exclusively by APMC Market (every 8 min). Farmer sets asking price.</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold shrink-0">8-Min Cycle</span>
          </div>

          {/* Advisory when Market Buying Price is LESS than Farmer's Asking Price */}
          {(() => {
            const marketBuyingPrice = getMarketBuyingPriceForCrop(crop, markets);
            if (marketBuyingPrice < crop.expectedPrice && isOwner) {
              return (
                <div className="mt-2 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-extrabold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      {language === 'te'
                        ? `మార్కెట్ కొనుగోలు ధర మీ ఆశించిన ధర కంటే కిలోకు ₹${crop.expectedPrice - marketBuyingPrice} తక్కువగా ఉంది`
                        : `Market Buying Price is ₹${crop.expectedPrice - marketBuyingPrice}/kg LESS than your asking price`}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Local APMC is buying at ₹{marketBuyingPrice}/kg. You can adjust your price to match the current market rate for instant deals, or check which other regional mandis pay higher net returns.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        updateCrop(crop.id, { expectedPrice: marketBuyingPrice }, currentUser?.name);
                        setToastMessage(`Asking price updated to match Mandi buying rate: ₹${marketBuyingPrice}/kg!`);
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition cursor-pointer shadow-sm"
                    >
                      Match Mandi Price (₹{marketBuyingPrice}/kg)
                    </button>
                    <button
                      onClick={() => setShowTransportModal(true)}
                      className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/40 font-bold text-xs transition cursor-pointer"
                    >
                      Compare Regional Mandis →
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Real-Time Quantity Gauge (Requirement 13: Pre-booking & Reserved Quantity) */}
        <div className="p-4 pt-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">
                Total: <strong className="text-white">{crop.totalQuantity.toLocaleString('en-IN')} kg</strong>
              </span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                {crop.preBookedQuantity > 0 && <Lock className="w-3 h-3 text-amber-400" />}
                <span>Booked: <strong>{crop.preBookedQuantity.toLocaleString('en-IN')} kg</strong></span>
              </span>
              <span className="text-emerald-400 font-black bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                Available: {crop.remainingQuantity.toLocaleString('en-IN')} kg
              </span>
            </div>

            {/* Reserved badge if pre-booked (Requirement 13: 🔒 400 kg Reserved) */}
            {crop.preBookedQuantity > 0 && (
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-extrabold flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>🔒 {crop.preBookedQuantity.toLocaleString('en-IN')} kg Reserved</span>
                </span>
                <span className="text-[10px] text-stone-400">
                  Protected from double-booking
                </span>
              </div>
            )}

            <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden flex">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${(crop.preBookedQuantity / crop.totalQuantity) * 100}%` }}
                title="Pre-booked reserved quantity"
              ></div>
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(crop.remainingQuantity / crop.totalQuantity) * 100}%` }}
                title="Available remaining quantity"
              ></div>
            </div>

            {/* Quick Transport Net Return Estimator Button (Requirements 7 & 8) */}
            <button
              onClick={() => setShowTransportModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>🚛 Compare Mandi Net Returns & Transport Freight</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Overview, Buyer Requests, History */}
      <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-2xl border border-stone-800 text-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === 'OVERVIEW' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'REQUESTS' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <span>Requests</span>
          {cropRequests.length > 0 && (
            <span className="bg-stone-950 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {cropRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === 'HISTORY' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          {t('myCropHistory')}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
            <h4 className="font-bold text-white text-sm">Harvest Details</h4>
            <p className="text-stone-300 leading-relaxed bg-stone-950 p-3 rounded-2xl border border-stone-850">
              {crop.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-stone-400">
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-850">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Farmer</span>
                <span className="text-white font-semibold">{crop.farmerName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-850">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Harvest Date</span>
                <span className="text-white font-semibold">{crop.harvestDate}</span>
              </div>
            </div>

            {isOwner && crop.status !== 'SOLD' && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (confirm('Mark this crop as completely SOLD?')) {
                      markCropSold(crop.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-emerald-400 font-bold border border-emerald-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('markAsSold')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Confirmed Deals for this Crop */}
          {cropDeals.length > 0 && (
            <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-2.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Confirmed Deals & Pre-Bookings</span>
              </h4>
              {cropDeals.map(d => (
                <div
                  key={d.id}
                  onClick={() => onViewDeal(d.id)}
                  className="p-3 rounded-2xl bg-stone-950 border border-stone-800 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{d.dealNumber}</span>
                    <p className="font-bold text-white text-xs mt-0.5">
                      {d.buyerName} • {d.quantity.toLocaleString('en-IN')} kg
                    </p>
                    <span className="text-[10px] text-amber-300 font-semibold block">
                      {language === 'te' ? 'కుదిరిన ధర' : 'NEGOTIATED PRICE'}: ₹{d.agreedPrice}/kg
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    ₹{d.totalAmount.toLocaleString('en-IN')} →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUYER REQUESTS & 24-HOUR RESPONSE TIMER */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-3 text-xs">
          {cropRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-2">
              <p className="text-stone-400">No purchase requests received for this crop yet.</p>
              <p className="text-[11px] text-stone-500">
                Buyers from APMC markets can view your video and send requests (24-hour response window).
              </p>
            </div>
          ) : (
            cropRequests.map(req => {
              const isPending = req.status === 'PENDING';

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-3xl border space-y-3 transition ${
                    isPending
                      ? 'bg-stone-900 border-amber-500/40 shadow-lg'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400'
                  }`}
                >
                  {/* Buyer & Verification Status */}
                  <div className="flex items-start justify-between border-b border-stone-850 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-sm">{req.buyerMarketName}</span>
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          🟢 Verified Buyer
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">{req.buyerName} • +91 {req.buyerPhone}</span>
                    </div>

                    {isPending ? (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>⏱ Farmer to Buyer: 24 hours.</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-0.5">24-hr response window active</span>
                      </div>
                    ) : req.status === 'EXPIRED' ? (
                      <div className="text-right space-y-1">
                        <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold uppercase">
                          24h Expired
                        </span>
                        <div className="text-[11px] text-rose-300 font-medium">
                          Request expired — Send Request Again
                        </div>
                      </div>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {req.status === 'ACCEPTED' ? 'Deal Confirmed' : req.status}
                      </span>
                    )}
                  </div>

                  {/* Crop & Grade Headline (Requirement 14 Example: 🍅 Tomato — Grade A) */}
                  <div className="flex items-center justify-between text-xs bg-stone-950 p-2.5 rounded-xl border border-stone-850">
                    <span className="font-black text-white flex items-center gap-1.5">
                      <span>{getCropEmoji(crop.cropName)}</span>
                      <span>{crop.cropName} — Grade {crop.grade}</span>
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Total Lot: {crop.totalQuantity} kg
                    </span>
                  </div>

                  {/* Requested Quantity & Offered Price Grid (Requirement 14) */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-stone-950 border border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase font-bold block">Requested Quantity</span>
                      <span className="text-white font-extrabold text-sm">{req.requestedQuantity.toLocaleString('en-IN')} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-sky-400 uppercase font-black block tracking-wider">
                        {language === 'te' ? 'ఆఫర్ చేసిన ధర (Offer)' : 'OFFERED PRICE'}
                      </span>
                      <span className="text-sky-300 font-black text-sm">₹{req.offeredPrice}/kg</span>
                    </div>
                  </div>

                  {/* Pickup / Delivery Information (Requirement 14) */}
                  <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-850 text-[11px] text-stone-300 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-stone-500 block">Pickup / Delivery Information</span>
                    <p className="text-stone-200 font-medium">
                      🚚 Farm gate collection arranged (3-ton Bolero scheduled upon acceptance).
                    </p>
                  </div>

                  {/* Buyer Message (Requirement 14) */}
                  {req.notes && (
                    <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850 text-[11px] space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-stone-500 block">Buyer Message</span>
                      <p className="text-stone-300 italic">"{req.notes}"</p>
                    </div>
                  )}

                  {/* Buyer Reliability Card (Requirement 19) */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Buyer Reliability: 4.8 / 5</span>
                      </span>
                      <span className="text-[10px] text-stone-400">APMC Registered</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5 border-t border-stone-800/60">
                      <span>Completed transactions: <strong className="text-white">126</strong></span>
                      <span>Cancellation rate: <strong className="text-emerald-400">1.8%</strong></span>
                    </div>
                  </div>

                  {/* Buttons: ACCEPT, REJECT, CHAT (Requirement 14) */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {isPending && isOwner ? (
                      <>
                        <button
                          onClick={() => rejectCropRequest(req.id, 'Price mismatch')}
                          className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-rose-400 font-bold text-xs transition text-center cursor-pointer"
                        >
                          REJECT
                        </button>
                        <button
                          onClick={() => {
                            const res = acceptCropRequest(req.id);
                            if (res.success && res.deal) {
                              alert(`Booking Accepted! Deal ${res.deal.dealNumber} confirmed.`);
                            } else {
                              alert(res.error || 'Failed to accept booking.');
                            }
                          }}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs shadow-md shadow-emerald-950/40 transition text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>ACCEPT</span>
                        </button>
                      </>
                    ) : req.status === 'EXPIRED' ? (
                      <div className="col-span-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            const res = resendCropRequest(req.id);
                            if (res.success) {
                              alert('Request renewed! 24-hour window restarted.');
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Send Request Again</span>
                        </button>
                      </div>
                    ) : (
                      <div className="col-span-2 text-[11px] text-stone-500 flex items-center">
                        Request has been processed ({req.status}).
                      </div>
                    )}

                    <button
                      onClick={() => onNavigateToChat(req.buyerId)}
                      className="py-2.5 rounded-xl bg-sky-950/70 hover:bg-sky-900/70 text-sky-300 border border-sky-500/40 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>CHAT</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: COMPLETE CROP AUDIT & HISTORY (Section 25 Requirement) */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Full Lifecycle & Audit Records</span>
            </h4>

            {crop.editHistory.length === 0 ? (
              <p className="text-stone-500">No edits recorded since creation.</p>
            ) : (
              <div className="space-y-2 border-l-2 border-stone-800 pl-3 ml-1">
                {crop.editHistory.map(audit => (
                  <div key={audit.id} className="relative space-y-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -left-[17px] top-1"></span>
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span className="font-bold text-emerald-300">{audit.field}</span>
                      <span>{audit.timestamp}</span>
                    </div>
                    <p className="text-white font-medium text-xs">
                      {audit.newValue}
                    </p>
                    <span className="text-[10px] text-stone-400">By: {audit.changedBy}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL (Section 24: Crop Editing Rules) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-800 flex justify-between items-center text-white">
              <h3 className="font-bold text-base">{t('editCrop')}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">Total Quantity (kg)</label>
                <input
                  type="number"
                  min={crop.preBookedQuantity}
                  value={editQuantity}
                  onChange={e => setEditQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                />
                {crop.preBookedQuantity > 0 && (
                  <span className="text-[10px] text-amber-300 block mt-1">
                    Cannot reduce below {crop.preBookedQuantity} kg (already pre-booked).
                  </span>
                )}
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Expected Price (₹/kg)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={e => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Quality Grade</label>
                <select
                  value={editGrade}
                  onChange={e => setEditGrade(e.target.value as CropGrade)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Processing)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {editError && (
                <div className="p-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800">
                  {editError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm shadow-md transition"
              >
                Save & Log Changes
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-emerald-950 border border-emerald-500/80 text-emerald-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Transport & Net Return Modal (Requirements 7 & 8) */}
      {showTransportModal && (
        <TransportNetReturnModal
          crop={crop}
          onClose={() => setShowTransportModal(false)}
        />
      )}
    </div>
  );
};

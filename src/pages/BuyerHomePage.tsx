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
} from 'lucide-react';

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
    createCropRequest,
    addMarketRequirement,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Request / Pre-book Modal State
  const [bookingCrop, setBookingCrop] = useState<Crop | null>(null);
  const [requestQty, setRequestQty] = useState<number>(300);
  const [offerPrice, setOfferPrice] = useState<number>(32);
  const [bookingNotes, setBookingNotes] = useState<string>('Transport vehicle arranged for pickup.');
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

    return matchesSearch && matchesGrade && matchesCategory;
  });

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
    const targetMarket = markets[0]; // Primary market for buyer
    addMarketRequirement(targetMarket.id, {
      cropName: reqCropName,
      requiredQuantity: Number(reqQuantity),
      buyingPrice: Number(reqPrice),
      grade: reqGrade,
      demand: 'HIGH',
    });
    setShowReqModal(false);
    alert('Market buying requirement updated successfully!');
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* 1. TOP SOURCING HERO & POST REQUIREMENT BANNER */}
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
            className="py-2 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-md transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Need</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchCropsPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
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

        {/* Filter Chips (Grade & Category) */}
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
                  ? 'bg-emerald-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. LIVE FARMER CROP POSTS LISTING (Section 16: Buyer View) */}
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
              className="text-xs text-emerald-400 underline font-bold"
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

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-white text-sm truncate">{crop.cropName}</h4>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-400/30 text-[11px]">
                        Grade {crop.grade}
                      </span>
                      <span className="text-emerald-400 font-extrabold text-base">
                        ₹{crop.expectedPrice}/kg
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {crop.description}
                    </p>
                  </div>
                </div>

                {/* Real-time Quantity Bar (Section 8 & 16) */}
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

                {/* Actions: Contact Farmer or Pre-Book */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigateToChatWithFarmer(crop.farmerId, crop.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Chat / Negotiate</span>
                  </button>

                  <button
                    onClick={() => handleOpenBooking(crop)}
                    disabled={crop.remainingQuantity <= 0}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{crop.remainingQuantity > 0 ? 'Pre-Book Qty' : 'Fully Booked'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. MODAL: PRE-BOOK / SEND REQUEST (Section 17 & 22) */}
      {bookingCrop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Pre-Book Crop</h3>
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
                    Farmer has 1 hour to accept. You will receive an immediate notification.
                  </p>
                </div>
              ) : (
                <>
                  {/* Available Quantity Info */}
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase font-bold">Currently Available</span>
                      <p className="text-base font-extrabold text-white">
                        {bookingCrop.remainingQuantity.toLocaleString('en-IN')} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase">Farmer Rate</span>
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
                          {q === bookingCrop.remainingQuantity ? 'Max' : `${q} kg`}
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
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition"
                  >
                    Send Booking Request (1h Window)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: POST MARKET REQUIREMENT (Section 15) */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Add Market Requirement</h3>
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
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-md transition"
                >
                  Publish Market Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

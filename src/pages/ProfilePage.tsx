import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  FileText,
  LogOut,
  ArrowLeftRight,
  Globe,
  Building2,
  ChevronRight,
  TrendingUp,
  History,
  CheckCircle,
  PackageCheck,
  Layers,
  Bell,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import {
  getCropEmoji,
  getSpecificCropDisplay,
  formatRelativeTime,
  getDemandBadge,
} from '../utils/marketHelpers';

interface ProfilePageProps {
  onSelectLanguage: () => void;
  onNavigateToCrop: (cropId: string) => void;
  onNavigateToMarket: (marketId: string) => void;
  onViewDealSlip: (dealId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectLanguage,
  onNavigateToCrop,
  onNavigateToMarket,
  onViewDealSlip,
}) => {
  const {
    currentUser,
    switchRole,
    logoutUser,
    resetDownloadOnboarding,
    hasDownloadedApp,
    crops,
    markets,
    deals,
    requests,
    language,
    t,
  } = useApp();

  const isFarmer = currentUser?.role === 'FARMER';
  const [activeSection, setActiveSection] = useState<'ACTIVE' | 'PREBOOKED' | 'SOLD' | 'HISTORY' | 'MARKETS'>('ACTIVE');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'ACTIVE'>('ALL');
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  // Filter farmer crops into distinct active, pre-booked, and sold out categories
  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id);
  const openActiveCrops = farmerCrops.filter(
    c => c.status !== 'SOLD' && c.status !== 'CANCELLED' && c.status !== 'PRE-BOOKED' && c.remainingQuantity > 0
  );
  const preBookedCrops = farmerCrops.filter(
    c => c.status === 'PRE-BOOKED' || (c.preBookedQuantity > 0 && c.remainingQuantity === 0)
  );
  const soldCrops = farmerCrops.filter(
    c => c.status === 'SOLD' || (c.soldQuantity > 0 && c.remainingQuantity === 0 && c.preBookedQuantity === 0)
  );

  // Deals
  const userDeals = deals.filter(
    d => d.farmerId === currentUser?.id || d.buyerId === currentUser?.id
  );

  // Followed markets
  const followedMarkets = markets.filter(m => currentUser?.followedMarketIds.includes(m.id));

  // Buyer requests sent
  const sentRequests = requests.filter(r => r.buyerId === currentUser?.id);

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* 1. PROFILE HEADER CARD */}
      <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-emerald-950/60 border border-emerald-500/30">
              {isFarmer ? '👨‍🌾' : '🏢'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white">{currentUser?.name}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-300 font-semibold">
                {isFarmer ? 'Verified Cultivator (ధృవీకరించబడిన రైతు)' : 'Licensed APMC Trader / Buyer'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1">
                <Phone className="w-3 h-3 text-stone-500" />
                <span>+91 {currentUser?.phone}</span>
              </div>
            </div>
          </div>

          {/* Role badge */}
          <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0 border border-stone-700">
            {currentUser?.role}
          </span>
        </div>

        {/* Location & Pincode information */}
        <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2 text-xs text-stone-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              {currentUser?.area}, {currentUser?.district}, {currentUser?.state}
            </span>
          </div>
          {currentUser?.pincode && (
            <span className="bg-stone-900 border border-stone-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg text-emerald-300 shrink-0">
              PIN: {currentUser.pincode}
            </span>
          )}
        </div>

        {/* Quick Role Switcher & Language Trigger */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <button
            onClick={() => {
              const next = isFarmer ? 'BUYER' : 'FARMER';
              switchRole(next);
            }}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-bold flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFarmer ? 'Switch to Buyer' : 'Switch to Farmer'}</span>
          </button>

          <button
            onClick={onSelectLanguage}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'te' ? 'తెలుగు (Telugu)' : 'English (ENG)'}</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW ROW (Requirement: Profile crops with sold out and pre-booked indicators) */}
      <div className={`grid ${isFarmer ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center text-xs`}>
        <div className="p-2.5 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-[9px] text-stone-400 block uppercase font-bold">Active</span>
          <span className="text-base font-extrabold text-white mt-0.5 block">
            {isFarmer ? openActiveCrops.length : sentRequests.length}
          </span>
        </div>
        {isFarmer && (
          <div className="p-2.5 rounded-2xl bg-stone-900 border border-amber-500/40 bg-amber-950/20">
            <span className="text-[9px] text-amber-300 block uppercase font-bold">🔒 Pre-Booked</span>
            <span className="text-base font-black text-amber-400 mt-0.5 block">
              {preBookedCrops.length}
            </span>
          </div>
        )}
        <div className="p-2.5 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-[9px] text-stone-400 block uppercase font-bold">
            {isFarmer ? '📦 Sold Out' : 'Deals'}
          </span>
          <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
            {isFarmer ? soldCrops.length : userDeals.length}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-[9px] text-stone-400 block uppercase font-bold">Mandis</span>
          <span className="text-base font-extrabold text-amber-400 mt-0.5 block">
            {followedMarkets.length}
          </span>
        </div>
      </div>

      {/* 3. SECTION TABS (With distinct Pre-Booked & Sold Out views) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'ACTIVE', label: isFarmer ? `🌱 Active (${openActiveCrops.length})` : 'Buying Requests' },
          ...(isFarmer ? [{ id: 'PREBOOKED', label: `🔒 Pre-Booked (${preBookedCrops.length})` }] : []),
          { id: 'SOLD', label: isFarmer ? `📦 Sold Out (${soldCrops.length})` : 'Completed' },
          { id: 'HISTORY', label: language === 'te' ? 'లావాదేవీల చరిత్ర (History)' : 'Transaction History' },
          { id: 'MARKETS', label: language === 'te' ? `ఫాలో అయిన మార్కెట్లు (${followedMarkets.length})` : `Followed Mandis (${followedMarkets.length})` },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeSection === s.id
                ? s.id === 'PREBOOKED'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                  : 'bg-emerald-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 4. ACTIVE SECTION CONTENT */}
      <div className="space-y-3">
        {/* TAB 1: ACTIVE CROPS (Open quantities) */}
        {activeSection === 'ACTIVE' && (
          <div className="space-y-2.5">
            {isFarmer ? (
              openActiveCrops.length === 0 ? (
                <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
                  No open harvest listings currently. Check Pre-Booked or Sold Out tabs.
                </div>
              ) : (
                openActiveCrops.map(crop => {
                  const percentBooked = Math.round((crop.preBookedQuantity / crop.totalQuantity) * 100);
                  return (
                    <div
                      key={crop.id}
                      onClick={() => onNavigateToCrop(crop.id)}
                      className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition cursor-pointer space-y-2 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={crop.photos[0]}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="truncate">
                            <h4 className="font-bold text-white text-xs truncate flex items-center gap-1">
                              <span>{getCropEmoji(crop.cropName)}</span>
                              <span>{getSpecificCropDisplay(crop.cropName, crop.variety).mainName}</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                              <span className="text-amber-300 font-semibold">Grade {crop.grade}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">Exp: ₹{crop.expectedPrice}/kg</span>
                              {crop.currentMarketBuyingPrice && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-300 font-medium">Mandi: ₹{crop.currentMarketBuyingPrice}/kg</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-stone-500 block">Available</span>
                          <span className="text-xs font-bold text-white">{crop.remainingQuantity.toLocaleString('en-IN')} kg</span>
                        </div>
                      </div>

                      {/* Partial Pre-Booking Progress Bar */}
                      {crop.preBookedQuantity > 0 && (
                        <div className="pt-1.5 border-t border-stone-850 space-y-1 text-[10px]">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-amber-300 font-semibold flex items-center gap-1">
                              <span>⚡</span>
                              <span>{crop.preBookedQuantity.toLocaleString('en-IN')} kg Pre-Booked ({percentBooked}%)</span>
                            </span>
                            <span className="text-emerald-400 font-bold">
                              {crop.remainingQuantity.toLocaleString('en-IN')} kg Open
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden flex">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${percentBooked}%` }}
                            ></div>
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${100 - percentBooked}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              sentRequests.map(req => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{req.cropName}</span>
                    <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-amber-300 font-bold">
                      {req.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-400 text-[11px]">
                    <span>Requested: {req.requestedQuantity} kg @ ₹{req.offeredPrice}/kg</span>
                    <span>To: {req.farmerName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: PRE-BOOKED CROPS (100% Reserved) */}
        {activeSection === 'PREBOOKED' && isFarmer && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-1">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <span>🔒</span>
                <span>Pre-Booked Harvest Guarantee</span>
              </span>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                These crop harvests are 100% pre-booked by verified buyers with locked prices and confirmed token deposits. No further booking allowed.
              </p>
            </div>

            {preBookedCrops.map(crop => {
              const emoji = getCropEmoji(crop.cropName);
              const cropDisp = getSpecificCropDisplay(crop.cropName, crop.variety);
              const bookingDeal = deals.find(d => d.cropId === crop.id) || deals[0];

              return (
                <div
                  key={crop.id}
                  onClick={() => onNavigateToCrop(crop.id)}
                  className="p-4 rounded-3xl bg-stone-900 border border-amber-500/50 hover:border-amber-400 transition cursor-pointer space-y-3 shadow-xl relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-800 shrink-0">
                        <img
                          src={crop.photos[0]}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <span className="absolute bottom-0 right-0 bg-amber-400 text-stone-950 text-[9px] font-black px-1 rounded-tl">
                          🔒 100%
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                          <span>{emoji}</span>
                          <span>{cropDisp.mainName}</span>
                        </h4>
                        {cropDisp.varietyText && (
                          <span className="text-[11px] text-amber-300 font-semibold block">
                            {cropDisp.varietyText}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          📍 {crop.location}
                        </span>
                      </div>
                    </div>

                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      🔒 100% Pre-Booked
                    </span>
                  </div>

                  {/* Pre-Booking Agreement Snapshot */}
                  <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-500 block">
                        Reserved Quantity
                      </span>
                      <p className="font-black text-white text-sm mt-0.5">
                        {crop.totalQuantity.toLocaleString('en-IN')} kg (All)
                      </p>
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                        Grade {crop.grade} Certified
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-stone-500 block">
                        Locked Contract Price
                      </span>
                      <p className="font-black text-amber-400 text-sm mt-0.5">
                        ₹{crop.expectedPrice}/kg
                      </p>
                      <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                        Total ₹{(crop.totalQuantity * crop.expectedPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Pre-Book Buyer Note */}
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <span>🤝</span>
                      <span className="font-bold text-white">Bangalore Fresh Mart (Karthik)</span>
                    </div>
                    <span className="text-amber-300 font-semibold text-[10px]">
                      Advance Token Cleared ✓
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                    <span className="text-[10px] font-mono text-stone-500">
                      Scheduled Pick-up: Tomorrow morning
                    </span>
                    <span className="text-amber-400 font-bold hover:underline">
                      View Contract Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: TRANSACTION HISTORY (Requirement 17 & 18) */}
        {activeSection === 'HISTORY' && (
          <div className="space-y-3">
            {/* Filter Chips: Completed, Cancelled, Pending, Active (Requirement 17) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'ALL', label: 'All Records' },
                { id: 'COMPLETED', label: '🟢 Completed' },
                { id: 'ACTIVE', label: '🤝 Active / Confirmed' },
                { id: 'PENDING', label: '🟡 Pending Requests' },
                { id: 'CANCELLED', label: '🔴 Cancelled' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setHistoryFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    historyFilter === f.id
                      ? 'bg-emerald-500 text-stone-950 font-black shadow-md'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List of Transaction Cards */}
            {(() => {
              // Combine deals and requests into uniform transactions
              const allTransactions = [
                ...userDeals.map(d => ({
                  type: 'DEAL' as const,
                  id: d.id,
                  refNumber: d.dealNumber,
                  cropName: d.cropName,
                  otherPartyName: isFarmer ? d.buyerName : d.farmerName,
                  otherPartyMarket: isFarmer ? d.buyerMarket : 'Direct Farm Gate',
                  otherPartyRole: isFarmer ? 'BUYER' : 'FARMER',
                  quantity: d.quantity,
                  agreedPrice: d.agreedPrice,
                  totalValue: d.totalAmount,
                  date: d.createdAt,
                  status: d.status,
                  verified: true,
                })),
                ...requests
                  .filter(r => (isFarmer ? r.farmerId === currentUser?.id : r.buyerId === currentUser?.id))
                  .map(r => ({
                    type: 'REQUEST' as const,
                    id: r.id,
                    refNumber: `REQ-${r.id.slice(-5).toUpperCase()}`,
                    cropName: r.cropName,
                    otherPartyName: isFarmer ? r.buyerName : r.farmerName,
                    otherPartyMarket: isFarmer ? r.buyerMarketName : 'Direct Farmer',
                    otherPartyRole: isFarmer ? 'BUYER' : 'FARMER',
                    quantity: r.requestedQuantity,
                    agreedPrice: r.offeredPrice,
                    totalValue: r.requestedQuantity * r.offeredPrice,
                    date: r.createdAt,
                    status: r.status,
                    verified: true,
                  })),
              ];

              const filtered = allTransactions.filter(item => {
                if (historyFilter === 'ALL') return true;
                if (historyFilter === 'COMPLETED') return item.status === 'COMPLETED';
                if (historyFilter === 'CANCELLED') return item.status === 'CANCELLED';
                if (historyFilter === 'PENDING') return item.status === 'PENDING';
                if (historyFilter === 'ACTIVE') return item.status === 'CONFIRMED' || item.status === 'DEAL_CONFIRMED' || item.status === 'ACCEPTED';
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400 space-y-1">
                    <p>No transaction history matching "{historyFilter}".</p>
                    <button
                      onClick={() => setHistoryFilter('ALL')}
                      className="text-emerald-400 font-bold underline cursor-pointer"
                    >
                      Show All Records
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map(item => {
                    const isCompleted = item.status === 'COMPLETED';
                    const isCancelled = item.status === 'CANCELLED';
                    const isConfirmed = item.status === 'CONFIRMED' || item.status === 'DEAL_CONFIRMED';
                    const emoji = getCropEmoji(item.cropName);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.type === 'DEAL') onViewDealSlip(item.id);
                        }}
                        className="p-4 rounded-3xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition cursor-pointer space-y-3 shadow-md"
                      >
                        {/* Header: Crop & Status Badge (Requirement 15 & 17) */}
                        <div className="flex items-start justify-between gap-2 border-b border-stone-850 pb-2.5">
                          <div>
                            <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                              <span>{emoji}</span>
                              <span>{item.cropName}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                              <span>{item.otherPartyName}</span>
                              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                🟢 Verified {item.otherPartyRole === 'BUYER' ? 'Buyer' : 'Farmer'}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-500 block mt-0.5">
                              🏛️ {item.otherPartyMarket}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isCancelled
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isConfirmed
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isCompleted
                              ? '🟢 Completed'
                              : isCancelled
                              ? '🔴 Cancelled'
                              : isConfirmed
                              ? '🟢 Deal Confirmed'
                              : '🟡 Pending'}
                          </span>
                        </div>

                        {/* Calculation & Total Value (Requirement 17 Example: 400 kg × ₹34/kg = Total: ₹13,600) */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-stone-950 border border-stone-850">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-stone-500 block">
                              Quantity & Agreed Rate
                            </span>
                            <p className="font-extrabold text-stone-200 text-xs mt-0.5">
                              {item.quantity.toLocaleString('en-IN')} kg × ₹{item.agreedPrice}/kg
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-stone-500 block">
                              Total Value
                            </span>
                            <p className="font-black text-emerald-400 text-sm mt-0.5">
                              ₹{item.totalValue.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Date & Deal Slip link */}
                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-stone-500" />
                            <span>{item.date}</span>
                          </span>
                          {item.type === 'DEAL' && (
                            <span className="text-emerald-400 font-bold hover:underline">
                              View Contract Slip →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: FOLLOWED MARKETS (Requirement 11) */}
        {activeSection === 'MARKETS' && (
          <div className="space-y-3">
            {/* Useful Followed Alerts Banner (Requirement 11) */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Market Alerts for Followed Mandis</span>
                </span>
                <span className="text-[10px] text-amber-400/80 font-bold">
                  Live Notifications
                </span>
              </div>

              {/* Sample Notifications per Requirement 11 */}
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">🔔</span>
                    <div>
                      <span className="font-bold text-white text-[11px]">Tomato price increased</span>
                      <p className="text-[10px] text-emerald-400 font-mono font-bold">
                        ₹31 → ₹34/kg (+₹3 at Madanapalle APMC)
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono">10m ago</span>
                </div>

                <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">🔔</span>
                    <div>
                      <span className="font-bold text-white text-[11px]">Market requirement surge</span>
                      <p className="text-[10px] text-amber-300">
                        Madanapalle Yard needs 2,000 kg more tomato for Bangalore trucks
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono">25m ago</span>
                </div>

                <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">🔔</span>
                    <div>
                      <span className="font-bold text-white text-[11px]">Red Chilli demand increased</span>
                      <p className="text-[10px] text-rose-300">
                        Guntur Mirchi Yard requires Teja export lots (₹195/kg)
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono">1h ago</span>
                </div>
              </div>
            </div>

            {/* Followed Mandis Cards (Requirement 11) */}
            {followedMarkets.length === 0 ? (
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400 space-y-2">
                <p>No markets followed yet.</p>
                <p className="text-[11px] text-stone-500">
                  Tap 'Follow' on any APMC Mandi to get real-time price change alerts!
                </p>
              </div>
            ) : (
              followedMarkets.map(m => {
                const timeInfo = formatRelativeTime(m.lastUpdatedMinutesAgo || 8, false, language);

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-3xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition space-y-3 shadow-xl"
                  >
                    {/* Header: Market Name & Telugu */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-850 pb-2.5">
                      <div>
                        <h4
                          onClick={() => onNavigateToMarket(m.id)}
                          className="font-black text-white text-sm hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>🏛️</span>
                          <span>{m.name}</span>
                        </h4>
                        <span className="text-[11px] text-emerald-300 font-semibold block mt-0.5">
                          {m.teluguName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1">
                          <MapPin className="w-3 h-3 text-stone-500" />
                          <span>{m.district}, {m.state}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-bold">📏 {m.distanceKm || 18} km away</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 block">
                          🟢 Verified APMC
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border block ${timeInfo.badgeClass}`}>
                          {timeInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Current Crop Prices Matrix & Demand Status (Requirement 11) */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Live APMC Commodity Buying Prices:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {m.cropsRequired.slice(0, 4).map(req => {
                          const emoji = getCropEmoji(req.cropName);
                          const dInfo = getDemandBadge(req.demand, req.remainingQuantity, req.requiredQuantity);
                          const cropDisp = getSpecificCropDisplay(req.cropName, req.variety);

                          return (
                            <div
                              key={req.id}
                              className="p-2.5 rounded-xl bg-stone-950 border border-stone-850 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-white text-xs truncate flex items-center gap-1">
                                  <span>{emoji}</span>
                                  <span>{cropDisp.mainName}</span>
                                </span>
                                <span className="font-black text-emerald-400 text-xs">
                                  ₹{req.buyingPrice}/kg
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[9px] pt-0.5">
                                <span className={`font-bold px-1 rounded ${dInfo.badgeClass}`}>
                                  {dInfo.emoji} {dInfo.label.replace(/^[^\w\s]+\s*/, '')}
                                </span>
                                <span className="text-stone-400">
                                  {req.remainingQuantity.toLocaleString('en-IN')} kg req.
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToMarket(m.id)}
                      className="w-full py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Full Mandi Yard Arrivals & Rates →</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 4: SOLD CROPS ARCHIVE (Requirement: Profile crops with sold out indicators) */}
        {activeSection === 'SOLD' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1">
              <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                <span>📦</span>
                <span>Completed Sales & Cleared Revenue Archive</span>
              </span>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                These harvests have been 100% sold out to licensed APMC Mandi wholesale traders with electronic NEFT/Cash payment slips cleared and weighment tokens recorded.
              </p>
            </div>

            {soldCrops.length === 0 ? (
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
                No crops marked as sold out yet.
              </div>
            ) : (
              soldCrops.map(crop => {
                const emoji = getCropEmoji(crop.cropName);
                const cropDisp = getSpecificCropDisplay(crop.cropName, crop.variety);
                const totalRevenue = crop.totalQuantity * (crop.currentMarketBuyingPrice || crop.expectedPrice);

                return (
                  <div
                    key={crop.id}
                    onClick={() => onNavigateToCrop(crop.id)}
                    className="p-4 rounded-3xl bg-stone-900 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer space-y-3 shadow-xl relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-800 shrink-0">
                          <img
                            src={crop.photos[0]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <span className="absolute bottom-0 right-0 bg-emerald-500 text-stone-950 text-[9px] font-black px-1 rounded-tl">
                            ✓ SOLD
                          </span>
                        </div>
                        <div>
                          <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                            <span>{emoji}</span>
                            <span>{cropDisp.mainName}</span>
                          </h4>
                          {cropDisp.varietyText && (
                            <span className="text-[11px] text-emerald-300 font-semibold block">
                              {cropDisp.varietyText}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            📍 {crop.location}
                          </span>
                        </div>
                      </div>

                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                        ✓ 100% Sold Out
                      </span>
                    </div>

                    {/* Sales & Financial Realization Breakdown */}
                    <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">
                          Sold Volume
                        </span>
                        <p className="font-black text-white text-sm mt-0.5">
                          {crop.totalQuantity.toLocaleString('en-IN')} kg
                        </p>
                        <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                          Grade {crop.grade} Quality Dispatched
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">
                          Total Revenue Earned
                        </span>
                        <p className="font-black text-emerald-400 text-sm mt-0.5">
                          ₹{totalRevenue.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                          @ ₹{crop.currentMarketBuyingPrice || crop.expectedPrice}/kg Mandi Rate
                        </span>
                      </div>
                    </div>

                    {/* Settlement Cleared Badge */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <span>🏛️</span>
                        <span className="font-bold text-white">
                          {crop.cropName.toLowerCase().includes('rice')
                            ? 'Tirupati APMC Central Mandi Wholesale'
                            : 'Palamaner Vegetable & Oil Mill Traders'}
                        </span>
                      </div>
                      <span className="text-emerald-300 font-bold text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                        🟢 NEFT Cleared ✓
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                      <span className="text-[10px] font-mono text-stone-500">
                        Harvest Date: {crop.harvestDate}
                      </span>
                      <span className="text-emerald-400 font-bold hover:underline">
                        View Audit & Receipt →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 5. LOGOUT & ONBOARDING ACTIONS */}
      <div className="pt-2 space-y-2">
        <button
          onClick={resetDownloadOnboarding}
          className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-850 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          title="Clear device session and experience the 1-time initial download & OTP screen"
        >
          <span>📱</span>
          <span>
            {language === 'te'
              ? 'మొబైల్ డౌన్‌లోడ్ రిజిస్ట్రేషన్ టెస్ట్ చేయండి (1-Time Setup Reset)'
              : 'Re-test 1-Time Mobile Download & OTP Setup'}
          </span>
        </button>

        <button
          onClick={logoutUser}
          className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-850 text-rose-400 border border-rose-900/40 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

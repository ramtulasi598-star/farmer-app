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
} from 'lucide-react';

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
    crops,
    markets,
    deals,
    requests,
    language,
    t,
  } = useApp();

  const isFarmer = currentUser?.role === 'FARMER';
  const [activeSection, setActiveSection] = useState<'ACTIVE' | 'SOLD' | 'DEALS' | 'MARKETS'>('ACTIVE');

  // Filter crops
  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id);
  const activeCrops = farmerCrops.filter(c => c.status !== 'SOLD' && c.status !== 'CANCELLED');
  const soldCrops = farmerCrops.filter(c => c.status === 'SOLD');

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

        {/* Location information (Section 30) */}
        <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-2 text-xs text-stone-300">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="line-clamp-1">
            {currentUser?.area}, {currentUser?.district}, {currentUser?.state}
          </span>
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

      {/* 2. STATS OVERVIEW ROW */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Active Listings</span>
          <span className="text-base font-extrabold text-white mt-0.5 block">
            {isFarmer ? activeCrops.length : sentRequests.length}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Confirmed Deals</span>
          <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
            {userDeals.length}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Followed Mandis</span>
          <span className="text-base font-extrabold text-amber-400 mt-0.5 block">
            {followedMarkets.length}
          </span>
        </div>
      </div>

      {/* 3. SECTION TABS (Section 26 & 27 Requirements) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'ACTIVE', label: isFarmer ? t('myActiveCrops') : 'Buying Requests' },
          { id: 'SOLD', label: isFarmer ? t('mySoldCrops') : 'Transactions' },
          { id: 'DEALS', label: t('myDeals') },
          { id: 'MARKETS', label: t('myFollowedMarkets') },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeSection === s.id
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 4. ACTIVE SECTION CONTENT */}
      <div className="space-y-3">
        {/* ACTIVE CROPS */}
        {activeSection === 'ACTIVE' && (
          <div className="space-y-2.5">
            {isFarmer ? (
              activeCrops.length === 0 ? (
                <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
                  No active crops listed.
                </div>
              ) : (
                activeCrops.map(crop => (
                  <div
                    key={crop.id}
                    onClick={() => onNavigateToCrop(crop.id)}
                    className="p-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={crop.photos[0]}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-white text-xs truncate">{crop.cropName}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          <span className="text-amber-300">Grade {crop.grade}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">₹{crop.expectedPrice}/kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-500 block">Available</span>
                      <span className="text-xs font-bold text-white">{crop.remainingQuantity} kg</span>
                    </div>
                  </div>
                ))
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

        {/* SOLD CROPS */}
        {activeSection === 'SOLD' && (
          <div className="space-y-2.5">
            {soldCrops.length === 0 ? (
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
                No crops marked as sold yet.
              </div>
            ) : (
              soldCrops.map(crop => (
                <div
                  key={crop.id}
                  onClick={() => onNavigateToCrop(crop.id)}
                  className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-white">{crop.cropName}</h4>
                    <span className="text-[10px] text-blue-400 font-bold block mt-0.5">
                      ✓ Completely Sold ({crop.totalQuantity} kg)
                    </span>
                  </div>
                  <span className="text-stone-400 text-xs">View Audit</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* DEALS SLIPS */}
        {activeSection === 'DEALS' && (
          <div className="space-y-2.5">
            {userDeals.length === 0 ? (
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
                No confirmed deals yet.
              </div>
            ) : (
              userDeals.map(deal => (
                <div
                  key={deal.id}
                  onClick={() => onViewDealSlip(deal.id)}
                  className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">{deal.dealNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deal.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {deal.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{deal.cropName}</p>
                      <p className="text-[11px] text-stone-400">
                        {deal.quantity} kg @ ₹{deal.agreedPrice}/kg
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">
                        ₹{deal.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-500 block">Click for Slip →</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* FOLLOWED MARKETS */}
        {activeSection === 'MARKETS' && (
          <div className="space-y-2.5">
            {followedMarkets.length === 0 ? (
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
                No markets followed yet. Visit the Markets tab to follow APMC yards!
              </div>
            ) : (
              followedMarkets.map(m => (
                <div
                  key={m.id}
                  onClick={() => onNavigateToMarket(m.id)}
                  className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs">{m.name}</h4>
                    <span className="text-[10px] text-emerald-300 font-medium block mt-0.5">
                      {m.district}, {m.state}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 5. LOGOUT BUTTON */}
      <div className="pt-2">
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

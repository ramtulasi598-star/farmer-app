import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crop, Market } from '../types';
import {
  X,
  Truck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Sliders,
  Star,
} from 'lucide-react';
import { getCropEmoji, getSpecificCropDisplay, getMarketDistance } from '../utils/marketHelpers';

interface TransportNetReturnModalProps {
  crop?: Crop | null;
  onClose: () => void;
  onSelectMarket?: (marketId: string) => void;
}

interface VehiclePreset {
  id: string;
  name: string;
  capacityKg: number;
  costPerKm: number;
}

const VEHICLE_PRESETS: VehiclePreset[] = [
  { id: 'auto', name: 'Auto / 3-Wheeler (500 kg)', capacityKg: 500, costPerKm: 14 },
  { id: 'bolero', name: 'Bolero / Pickup (1.5 Ton)', capacityKg: 1500, costPerKm: 22 },
  { id: 'small_truck', name: 'Tata 407 / Small Truck (3 Ton)', capacityKg: 3000, costPerKm: 32 },
  { id: 'tractor', name: 'Tractor Trailer (4 Ton)', capacityKg: 4000, costPerKm: 28 },
  { id: 'canter', name: 'Canter / Eicher (7 Ton)', capacityKg: 7000, costPerKm: 42 },
];

export const TransportNetReturnModal: React.FC<TransportNetReturnModalProps> = ({
  crop,
  onClose,
  onSelectMarket,
}) => {
  const { markets, crops, currentUser, language } = useApp();

  // If crop is passed, use it, else pick first farmer crop or fallback
  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id);
  const selectedCrop = crop || farmerCrops[0] || crops[0];

  const [quantityKg, setQuantityKg] = useState<number>(
    selectedCrop?.remainingQuantity || selectedCrop?.totalQuantity || 1000
  );
  const [selectedVehicle, setSelectedVehicle] = useState<string>('bolero');
  const [customTransportCost, setCustomTransportCost] = useState<string>(''); // override if entered
  const [useCustomTransport, setUseCustomTransport] = useState<boolean>(false);

  const vehicle = VEHICLE_PRESETS.find(v => v.id === selectedVehicle) || VEHICLE_PRESETS[1];
  const cropCategory = selectedCrop ? selectedCrop.cropCategory.toLowerCase() : 'tomato';
  const cropDisplay = selectedCrop ? getSpecificCropDisplay(selectedCrop.cropName, selectedCrop.variety) : { mainName: 'Tomato' };

  // Calculate comparison across markets for this crop
  const marketComparisons = markets.map(market => {
    const distInfo = getMarketDistance(market, currentUser?.district || 'Chittoor');
    const distanceKm = distInfo.distanceKm;

    // Find buying price in this market for the crop category
    let buyingPrice = 34;
    const req = market.cropsRequired.find(r => r.cropName.toLowerCase().includes(cropCategory));
    if (req) {
      buyingPrice = req.buyingPrice;
    } else {
      // Defaults based on district / category
      if (cropCategory.includes('tomato')) buyingPrice = 33 + Math.floor((distanceKm % 10) * 0.8);
      else if (cropCategory.includes('potato')) buyingPrice = 28 + Math.floor((distanceKm % 8) * 0.5);
      else if (cropCategory.includes('chilli')) buyingPrice = 190 + Math.floor((distanceKm % 15) * 1);
      else buyingPrice = Math.round((selectedCrop?.expectedPrice || 30) * 1.05);
    }

    // Transport calculation:
    // Estimate = distanceKm * vehicle.costPerKm (or custom if checked)
    let estimatedTransport = Math.round(distanceKm * vehicle.costPerKm);
    if (useCustomTransport && customTransportCost && !isNaN(Number(customTransportCost))) {
      estimatedTransport = Number(customTransportCost);
    }

    // Total gross market value
    const grossValue = quantityKg * buyingPrice;
    // Estimated net value
    const netValue = Math.max(0, grossValue - estimatedTransport);
    // Estimated net return per kg
    const netPerKg = Number((netValue / (quantityKg || 1)).toFixed(2));

    return {
      market,
      distanceKm,
      distanceText: distInfo.text,
      buyingPrice,
      estimatedTransport,
      grossValue,
      netValue,
      netPerKg,
    };
  });

  // Sort by highest estimated net per kg
  const sortedComparisons = [...marketComparisons].sort((a, b) => b.netPerKg - a.netPerKg);
  const bestMarketId = sortedComparisons[0]?.market.id;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5 text-emerald-200" />
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-200">
              {language === 'te' ? 'రవాణా వ్యయం & ఉత్తమ రాబడి అంచనా' : 'Transport Cost & Market Net Return'}
            </span>
          </div>
          <h2 className="text-lg font-black leading-tight flex items-center gap-1.5">
            <span>{getCropEmoji(selectedCrop?.cropName || 'Tomato')}</span>
            <span>{cropDisplay.mainName}</span>
            <span className="text-xs font-semibold text-emerald-200 ml-1">Grade {selectedCrop?.grade || 'A'}</span>
          </h2>
          <p className="text-[11px] text-emerald-100/90 mt-0.5">
            Compare Mandi buying prices vs transport to calculate highest net earnings.
          </p>
        </div>

        {/* Estimation Controls */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-stone-200 text-xs">
          {/* Config Box */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customise Parameters</span>
              </span>
              <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                ★ ESTIMATE ONLY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Quantity */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={quantityKg}
                  onChange={e => setQuantityKg(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-750 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={selectedVehicle}
                  onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full px-2.5 py-2 bg-stone-900 border border-stone-750 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {VEHICLE_PRESETS.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Transport Cost Toggle */}
            <div className="pt-1 border-t border-stone-850">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-stone-300 font-medium">
                  Enter manual flat transport cost instead of per-km estimate?
                </span>
                <input
                  type="checkbox"
                  checked={useCustomTransport}
                  onChange={e => setUseCustomTransport(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
              </label>

              {useCustomTransport && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-stone-400 text-xs">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 2000"
                    value={customTransportCost}
                    onChange={e => setCustomTransportCost(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-750 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <span className="text-[10px] text-stone-400">Total freight</span>
                </div>
              )}
            </div>
          </div>

          {/* Legal / Policy Disclaimer Notice (Requirement 7 & 8) */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> All transport costs and net values are <strong>ESTIMATES</strong> based on approximate road distances and standard freight rates. Actual charges depend on truck availability, diesel price, and negotiation.
              <span className="block mt-1 font-semibold text-white">
                "Best estimated return based on current price and estimated transport. The farmer makes the final decision."
              </span>
            </p>
          </div>

          {/* Comparison Cards List (Requirement 8) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Market Comparison ({sortedComparisons.length} Mandis)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                Sorted by Net Return
              </span>
            </div>

            {sortedComparisons.map((item, idx) => {
              const isBest = item.market.id === bestMarketId;

              return (
                <div
                  key={item.market.id}
                  className={`p-3.5 rounded-2xl border transition relative space-y-2.5 ${
                    isBest
                      ? 'bg-gradient-to-br from-emerald-950/50 via-stone-900 to-stone-900 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-stone-950 border-stone-850'
                  }`}
                >
                  {/* Best Return Badge (Requirement 8) */}
                  {isBest && (
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-stone-950 font-black text-[10px] px-2.5 py-0.5 rounded-full w-fit uppercase tracking-wider shadow">
                      <Star className="w-3 h-3 fill-stone-950" />
                      <span>⭐ BEST ESTIMATED RETURN</span>
                    </div>
                  )}

                  {/* Market Name & Distance */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-white text-sm leading-snug">
                        {item.market.name}
                      </h4>
                      <p className="text-[11px] text-emerald-300 font-medium">
                        {item.market.teluguName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1">
                        <MapPin className="w-3 h-3 text-stone-500" />
                        <span>{item.market.district}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-bold">📏 {item.distanceKm} km away</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">
                        Market Price
                      </span>
                      <span className="text-base font-black text-white">
                        ₹{item.buyingPrice}
                        <span className="text-xs font-normal text-stone-400">/kg</span>
                      </span>
                    </div>
                  </div>

                  {/* Net Breakdown Matrix (Requirement 7 & 8) */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-stone-900 border border-stone-800 text-center">
                    <div>
                      <span className="text-[9px] uppercase text-stone-500 font-bold block">
                        Gross Total
                      </span>
                      <span className="text-xs font-bold text-stone-300 mt-0.5 block">
                        ₹{item.grossValue.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="border-x border-stone-800">
                      <span className="text-[9px] uppercase text-rose-400 font-bold block">
                        Est. Transport
                      </span>
                      <span className="text-xs font-bold text-rose-300 mt-0.5 block">
                        -₹{item.estimatedTransport.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className={isBest ? 'bg-emerald-950/40 rounded-lg p-0.5' : ''}>
                      <span className="text-[9px] uppercase text-emerald-400 font-extrabold block">
                        Est. Net / kg
                      </span>
                      <span className="text-xs font-black text-emerald-300 mt-0.5 block">
                        ₹{item.netPerKg}
                        <span className="text-[9px] font-normal text-stone-400">/kg</span>
                      </span>
                    </div>
                  </div>

                  {/* Estimated Net Value Line */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-stone-400">
                      Estimated net value for {quantityKg.toLocaleString('en-IN')} kg:
                    </span>
                    <span className="font-extrabold text-emerald-400 text-xs">
                      ₹{item.netValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {onSelectMarket && (
                    <button
                      onClick={() => {
                        onSelectMarket(item.market.id);
                        onClose();
                      }}
                      className="w-full py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-750 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Mandi Yard Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs transition"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

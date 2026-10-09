import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Market, MarketRequirement, CropGrade } from '../types';
import {
  X,
  Send,
  Clock,
  MapPin,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { getCropEmoji } from '../utils/marketHelpers';

interface MarketSupplyRequestModalProps {
  market: Market;
  requirement?: MarketRequirement | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MarketSupplyRequestModal: React.FC<MarketSupplyRequestModalProps> = ({
  market,
  requirement,
  onClose,
  onSuccess,
}) => {
  const { currentUser, crops, submitMarketSupplyRequest, language } = useApp();

  // Farmer's active crops
  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id);

  // Form Fields as explicitly requested:
  // 1. Farmer Name
  // 2. Crop Name
  // 3. Quantity
  // 4. Grade
  // 5. Location
  const [farmerName, setFarmerName] = useState<string>(currentUser?.name || 'Ramesh Reddy');
  const [cropName, setCropName] = useState<string>(
    requirement ? requirement.cropName : (farmerCrops[0]?.cropName || 'Tomato')
  );
  const [selectedCropId, setSelectedCropId] = useState<string>(
    requirement
      ? farmerCrops.find(c => c.cropName.toLowerCase().includes(requirement.cropName.toLowerCase().split(' ')[0]))?.id || ''
      : (farmerCrops[0]?.id || '')
  );
  const [quantity, setQuantity] = useState<number>(
    requirement ? Math.min(500, requirement.remainingQuantity || 500) : 500
  );
  const [grade, setGrade] = useState<CropGrade>(requirement?.grade || 'A');
  const [location, setLocation] = useState<string>(
    currentUser?.area ? `${currentUser.area}, ${currentUser.district}` : 'Madanapalle Rural, Chittoor'
  );
  const [phone, setPhone] = useState<string>(currentUser?.phone || '9848012345');
  const [expectedPrice, setExpectedPrice] = useState<number>(
    requirement?.buyingPrice || 28
  );
  const [notes, setNotes] = useState<string>(
    'Harvest fresh from farm, graded and packed in standard crates. Ready for mandi pickup or gate dispatch.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If a requirement was selected or changed, adjust defaults
  useEffect(() => {
    if (requirement) {
      setCropName(requirement.cropName);
      setGrade(requirement.grade || 'A');
      setExpectedPrice(requirement.buyingPrice || 28);
    }
  }, [requirement]);

  // When farmer selects an existing crop, synchronize fields
  const handleSelectExistingCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    if (!cropId) return;
    const found = farmerCrops.find(c => c.id === cropId);
    if (found) {
      setCropName(found.cropName);
      setGrade(found.grade);
      setQuantity(Math.min(500, found.remainingQuantity));
      if (found.expectedPrice) setExpectedPrice(found.expectedPrice);
      if (found.location) setLocation(found.location);
    }
  };

  // Find mandi buying rate for the active crop name
  const matchedMandiReq = market.cropsRequired.find(r =>
    r.cropName.toLowerCase().includes(cropName.toLowerCase().split(' ')[0])
  );
  const mandiBuyingRate = matchedMandiReq?.buyingPrice || (requirement ? requirement.buyingPrice : 28);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!farmerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!cropName.trim()) {
      setErrorMessage('Please enter or select a crop name.');
      return;
    }
    if (!quantity || quantity <= 0) {
      setErrorMessage('Please enter a valid quantity greater than 0 kg.');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Please specify your farm gate or pickup location.');
      return;
    }
    if (!expectedPrice || expectedPrice <= 0) {
      setErrorMessage('Please specify your expected price in ₹/kg.');
      return;
    }

    setSubmitting(true);

    const res = submitMarketSupplyRequest({
      marketId: market.id,
      marketName: market.name,
      farmerName: farmerName.trim(),
      cropName: cropName.trim(),
      quantity: Number(quantity),
      grade,
      location: location.trim(),
      expectedPrice: Number(expectedPrice),
      cropId: selectedCropId || undefined,
      notes: notes.trim(),
      phone: phone.trim(),
    });

    setSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2400);
    } else {
      setErrorMessage(res.error || 'Failed to submit supply request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              {getCropEmoji(cropName)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Direct Mandi Request
                </span>
                <span className="text-[10px] text-stone-400 font-mono">1-Hour Rule</span>
              </div>
              <h3 className="font-black text-white text-base leading-tight mt-0.5 truncate">
                {language === 'te' ? 'మార్కెట్ సరఫరా అభ్యర్థన' : 'Send Supply Request'}
              </h3>
              <p className="text-[11px] text-stone-400 flex items-center gap-1">
                <span>{market.name}</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">{market.district}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-black text-white text-lg">Supply Request Sent!</h4>
              <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                Your supply offer of <strong className="text-emerald-400">{quantity} kg</strong> of{' '}
                <strong className="text-white">{cropName}</strong> (Grade {grade}) has been dispatched to{' '}
                <strong className="text-amber-300">{market.name} Procurement Desk</strong>.
              </p>
              {/* 1-Hour Response Badge */}
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>⏱ Market should respond within 1 hour.</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 pt-2 font-mono">
                <span>Pending</span>
                <span>→</span>
                <span className="text-amber-300">Accepted</span>
                <span>→</span>
                <span className="text-emerald-400">Deal Confirmed</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Target Mandi Demand Overview Banner */}
              {matchedMandiReq ? (
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                      MANDI CURRENT REQUIREMENT
                    </span>
                    <p className="text-xs font-black text-white mt-0.5">
                      {matchedMandiReq.cropName} (Grade {matchedMandiReq.grade})
                    </p>
                    <span className="text-[10px] text-stone-400">
                      {matchedMandiReq.remainingQuantity.toLocaleString('en-IN')} kg still needed
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">
                      MANDI BUYING RATE
                    </span>
                    <p className="text-base font-black text-amber-300 mt-0.5">
                      ₹{matchedMandiReq.buyingPrice}
                      <span className="text-[10px] font-normal text-stone-400">/kg</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-between text-xs">
                  <span className="text-stone-300">Target Procurement Mandi:</span>
                  <span className="font-black text-amber-300">{market.name}</span>
                </div>
              )}

              {/* Existing Crop Quick Selector (Optional Convenience) */}
              {farmerCrops.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-stone-950/80 border border-stone-850 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Select From Your Listed Crops (Optional)</span>
                    </label>
                    {selectedCropId && (
                      <button
                        type="button"
                        onClick={() => setSelectedCropId('')}
                        className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                      >
                        Enter Custom Crop
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedCropId}
                    onChange={e => handleSelectExistingCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-750 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Or enter crop details manually below --</option>
                    {farmerCrops.map(fc => (
                      <option key={fc.id} value={fc.id}>
                        {fc.cropName} (Grade {fc.grade}) • {fc.remainingQuantity} kg available @ ₹{fc.expectedPrice}/kg
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 1. FARMER NAME */}
              <div>
                <label className="block text-stone-300 font-bold mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Your Name (Farmer) <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 2. CROP NAME */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Crop Name <span className="text-rose-400">*</span></span>
                  </label>
                  <span className="text-[10px] text-stone-500">Tomato, Potato, Chilli, etc.</span>
                </div>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                  placeholder="e.g. Tomato (Hybrid Sahu)"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                />

                {/* Popular Crop Quick Chips */}
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {['Tomato', 'Potato', 'Red Chilli', 'Rice / Paddy', 'Onion', 'Totapuri Mango'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCropName(c)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] transition cursor-pointer ${
                        cropName.toLowerCase().includes(c.toLowerCase().split(' ')[0])
                          ? 'bg-emerald-500 text-stone-950 font-bold'
                          : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                      }`}
                    >
                      {getCropEmoji(c)} {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. QUANTITY (kg) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-bold">
                    Supplying Quantity (kg) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Total weight to supply</span>
                </div>
                <input
                  type="number"
                  required
                  min={10}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-black text-sm focus:outline-none focus:border-emerald-500"
                />

                {/* Quantity quick chips */}
                <div className="flex gap-1.5 mt-1.5">
                  {[250, 500, 1000, 2000].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`flex-1 py-1 rounded-lg text-[10px] border transition cursor-pointer text-center ${
                        quantity === q
                          ? 'bg-emerald-500 text-stone-950 font-bold border-emerald-400'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      {q.toLocaleString('en-IN')} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. GRADE / QUALITY SELECTION */}
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">
                  Quality Grade <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'A' as CropGrade, label: 'Grade A', desc: 'Premium / Export' },
                    { id: 'B' as CropGrade, label: 'Grade B', desc: 'Mandi Standard' },
                    { id: 'C' as CropGrade, label: 'Grade C', desc: 'Fair / Processing' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrade(g.id)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        grade === g.id
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="font-black text-xs block text-white">{g.label}</span>
                      <span className="text-[9px] block text-stone-400">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. LOCATION */}
              <div>
                <label className="block text-stone-300 font-bold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Farm Gate / Pickup Location <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Madanapalle Rural, Chittoor District"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Where mandi vehicle or transport agent can pick up your harvest
                </span>
              </div>

              {/* EXPECTED RATE & COMPARISON */}
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-stone-300 font-bold">
                    Your Expected Rate (₹/kg) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-amber-300 font-bold">
                    Mandi Benchmark: ₹{mandiBuyingRate}/kg
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  value={expectedPrice}
                  onChange={e => setExpectedPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-emerald-400 font-black text-base focus:outline-none focus:border-emerald-500"
                />

                {/* Rate Advisory Comparison */}
                <div className="text-[10px]">
                  {expectedPrice < mandiBuyingRate ? (
                    <span className="text-emerald-400 font-semibold block">
                      ▼ ₹{mandiBuyingRate - expectedPrice}/kg below Mandi rate — High chance of fast acceptance!
                    </span>
                  ) : expectedPrice > mandiBuyingRate ? (
                    <span className="text-rose-400 font-semibold block">
                      ▲ ₹{expectedPrice - mandiBuyingRate}/kg above Mandi buying rate (Mandi procurement might negotiate)
                    </span>
                  ) : (
                    <span className="text-sky-300 font-semibold block">
                      ● Matches Mandi buying rate perfectly!
                    </span>
                  )}
                </div>

                {expectedPrice !== mandiBuyingRate && (
                  <button
                    type="button"
                    onClick={() => setExpectedPrice(mandiBuyingRate)}
                    className="text-[10px] text-amber-300 hover:text-amber-200 underline font-semibold block cursor-pointer"
                  >
                    Match Mandi Benchmark Rate (₹{mandiBuyingRate}/kg)
                  </button>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9848012345"
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Logistics / Dispatch Notes */}
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  Logistics & Packing Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Packed in plastic crates, loading labor available"
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* ⏱ 1-Hour Response Rule Notice (Farmer to Market) */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {language === 'te'
                    ? '⏱ రైతు → మార్కెట్ నిబంధన: మార్కెట్ 1 గంటలోపు స్పందించాలి.'
                    : '⏱ Farmer → Market Rule: Market should respond within 1 hour.'}
                </span>
              </div>

              {/* Total Supply Value Calculation */}
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[11px] block">Estimated Supply Value</span>
                  <span className="text-[10px] text-stone-500">
                    {quantity} kg × ₹{expectedPrice}/kg
                  </span>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(quantity * expectedPrice).toLocaleString('en-IN')}
                </span>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending Request...' : 'Submit Supply Request'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

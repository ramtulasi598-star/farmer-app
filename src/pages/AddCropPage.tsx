import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CropGrade } from '../types';
import {
  Video,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  MapPin,
  HelpCircle,
  Play,
  X,
  ArrowRight,
  Upload,
} from 'lucide-react';

interface AddCropPageProps {
  onSuccess: (cropId: string) => void;
  onCancel: () => void;
}

const COMMON_CROPS = [
  { name: 'Tomato (టమాటా)', category: 'Tomato', emoji: '🍅', defaultPrice: 32 },
  { name: 'Potato (బంగాళాదుంప / ఆలుగడ్డ)', category: 'Potato', emoji: '🥔', defaultPrice: 28 },
  { name: 'Red Chilli (తేజా ఎండుమిర్చి)', category: 'Chilli', emoji: '🌶️', defaultPrice: 195 },
  { name: 'Rice / Paddy (వరి ధాన్యం - Sona Masoori)', category: 'Rice', emoji: '🌾', defaultPrice: 24 },
  { name: 'Onion (ఉల్లిపాయ)', category: 'Onion', emoji: '🧅', defaultPrice: 29 },
  { name: 'Cotton (పత్తి)', category: 'Cotton', emoji: '☁️', defaultPrice: 76 },
  { name: 'Mango (మామిడి)', category: 'Mango', emoji: '🥭', defaultPrice: 30 },
  { name: 'Green Chilli (పచ్చిమిర్చి)', category: 'Chilli', emoji: '🌿', defaultPrice: 48 },
  { name: 'Turmeric (పసుపు)', category: 'Turmeric', emoji: '🟡', defaultPrice: 145 },
  { name: 'Groundnut (వేరుశెనగ)', category: 'Groundnut', emoji: '🥜', defaultPrice: 68 },
];

export const AddCropPage: React.FC<AddCropPageProps> = ({ onSuccess, onCancel }) => {
  const { currentUser, addCrop, t, language } = useApp();

  const [cropName, setCropName] = useState('Tomato (టమాటా - Hybrid Sahu)');
  const [cropCategory, setCropCategory] = useState('Tomato');
  const [totalQuantity, setTotalQuantity] = useState<number>(1000);
  const [grade, setGrade] = useState<CropGrade>('A');
  const [expectedPrice, setExpectedPrice] = useState<number>(32);
  const [location, setLocation] = useState(
    currentUser ? `${currentUser.area}, ${currentUser.district}` : 'Madanapalle Rural, Chittoor'
  );
  const [harvestDate, setHarvestDate] = useState('2026-10-06');
  const [description, setDescription] = useState(
    'Freshly harvested Grade A crop. Uniform size, high firmness, excellent color, pesticide compliant.'
  );

  // Video & Photos selection
  const [hasVideo, setHasVideo] = useState<boolean>(true);
  const [videoUrl, setVideoUrl] = useState<string>(
    'https://assets.mixkit.co/videos/preview/mixkit-fresh-tomatoes-in-a-wooden-box-42998-large.mp4'
  );
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  const handleSelectCropTag = (item: typeof COMMON_CROPS[0]) => {
    setCropName(item.name);
    setCropCategory(item.category);
    setExpectedPrice(item.defaultPrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || totalQuantity <= 0 || expectedPrice <= 0) {
      alert('Please fill all mandatory fields properly.');
      return;
    }

    setIsSubmitting(true);
    const newCrop = addCrop({
      farmerId: currentUser?.id || 'user_farmer_1',
      farmerName: currentUser?.name || 'Ramesh Reddy',
      farmerPhone: currentUser?.phone || '9848012345',
      cropName,
      cropCategory,
      totalQuantity: Number(totalQuantity),
      unit: 'kg',
      grade,
      expectedPrice: Number(expectedPrice),
      location,
      district: currentUser?.district || 'Chittoor',
      state: currentUser?.state || 'Andhra Pradesh',
      photos,
      videoUrl: hasVideo ? videoUrl : undefined,
      description,
      harvestDate,
      status: 'ACTIVE',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(newCrop.id);
    }, 600);
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>➕</span>
            <span>{t('listNewCrop')}</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Post your harvested crop with field video for verified buyers
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. QUICK POPULAR CROPS SELECTOR */}
        <div className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            Popular Crops in Andhra / Telangana
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {COMMON_CROPS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectCropTag(item)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  cropName.includes(item.category)
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border border-stone-700/60'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] text-stone-400 mb-1 font-medium">{t('cropName')} *</label>
            <input
              type="text"
              required
              value={cropName}
              onChange={e => setCropName(e.target.value)}
              placeholder="e.g. Tomato (Hybrid Sahu)"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 2. QUANTITY & EXPECTED PRICE */}
        <div className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              {t('cropQuantity')} (kg) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={totalQuantity}
              onChange={e => setTotalQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1 mt-1.5">
              {[500, 1000, 2500, 5000].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setTotalQuantity(q)}
                  className="px-1.5 py-0.5 rounded bg-stone-800 text-[10px] text-stone-400 hover:text-white"
                >
                  {q >= 1000 ? `${q / 1000}T` : `${q}kg`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              {t('expectedPrice')} (₹/kg) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={expectedPrice}
              onChange={e => setExpectedPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-2xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-stone-400 block mt-1.5">
              Total: ≈ ₹{(totalQuantity * expectedPrice).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 3. QUALITY / GRADE SELECTION (Section 5 Requirement) */}
        <div className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            {t('grade')} (Crop Quality) *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'A', title: 'Grade A', desc: 'Premium / Export', color: 'border-emerald-500/60' },
              { id: 'B', title: 'Grade B', desc: 'Good Quality', color: 'border-amber-500/60' },
              { id: 'C', title: 'Grade C', desc: 'Processing / Standard', color: 'border-stone-500/60' },
            ].map(g => (
              <div
                key={g.id}
                onClick={() => setGrade(g.id as CropGrade)}
                className={`p-3 rounded-2xl border cursor-pointer transition text-center ${
                  grade === g.id
                    ? 'bg-emerald-950/60 border-emerald-400 text-white font-bold shadow-md'
                    : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <span className="text-sm font-black text-amber-300 block">{g.title}</span>
                <span className="text-[10px] text-stone-300 block mt-0.5 leading-tight">{g.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CROP VIDEO & PHOTOS (Section 4 Requirement) */}
        <div className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-emerald-400" />
              <span>{t('uploadCropVideo')} & Photos</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
              Increases buyer pre-booking by 80%
            </span>
          </div>

          {/* Video Attachment Card */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                onClick={() => setShowVideoPreview(true)}
                className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 cursor-pointer hover:scale-105 transition"
              >
                <Play className="w-5 h-5 ml-0.5 fill-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">harvest_sample_01.mp4</p>
                <p className="text-[10px] text-stone-400">0:24s recorded • Clear field video</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Camera recorder opened: 20-second crop sample recorded successfully.');
                setHasVideo(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700"
            >
              Re-record
            </button>
          </div>

          {/* Photo Thumbnails */}
          <div className="flex items-center gap-2">
            {photos.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-800 border border-stone-700">
                <img src={src} alt="Sample" className="w-full h-full object-cover" />
                <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/70 text-white px-1 rounded font-mono">
                  #{i + 1}
                </span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => alert('Photo gallery / Camera simulator: Added photo.')}
              className="w-16 h-16 rounded-xl border border-dashed border-stone-700 hover:border-emerald-500 flex flex-col items-center justify-center text-stone-400 hover:text-white transition text-[10px]"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>+ Add</span>
            </button>
          </div>
        </div>

        {/* 5. LOCATION & DETAILS */}
        <div className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 text-xs">
          <div>
            <label className="block text-stone-300 font-bold mb-1">
              Field Location / Farm Gate *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-stone-300 font-bold mb-1">Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={e => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-bold mb-1">Listing Status</label>
              <div className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-emerald-400 font-bold">
                ACTIVE (యాక్టివ్)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-bold mb-1">
              Additional Details (Variety, Packaging, Moisture)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Publish Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Listing Crop...' : t('publishCrop')}</span>
          </button>
        </div>
      </form>

      {/* Video Preview Modal */}
      {showVideoPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full overflow-hidden">
            <div className="p-3 border-b border-stone-800 flex justify-between items-center text-xs text-white font-bold">
              <span>Attached Crop Video</span>
              <button onClick={() => setShowVideoPreview(false)} className="text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video src={videoUrl} autoPlay controls playsInline className="w-full h-full object-cover" />
            </div>
            <div className="p-3 text-center">
              <button
                onClick={() => setShowVideoPreview(false)}
                className="py-2 px-4 rounded-xl bg-emerald-600 text-stone-950 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

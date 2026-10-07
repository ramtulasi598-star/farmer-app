import React from 'react';
import { useApp } from '../context/AppContext';
import { Crop } from '../types';
import {
  MapPin,
  PlusCircle,
  ChevronRight,
  Video,
  Sparkles,
} from 'lucide-react';

interface FarmerHomePageProps {
  onNavigateToCrop: (cropId: string) => void;
  onNavigateToMarket: (marketId: string) => void;
  onNavigateToAddCrop: () => void;
  onOpenVideoModal: (crop: Crop) => void;
}

export const FarmerHomePage: React.FC<FarmerHomePageProps> = ({
  onNavigateToCrop,
  onNavigateToAddCrop,
  onOpenVideoModal,
}) => {
  const {
    currentUser,
    crops,
    requests,
    t,
    language,
  } = useApp();

  // Filter crops owned by current farmer
  const farmerCrops = crops.filter(c => c.farmerId === currentUser?.id);

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-4">
      {/* Clean Top Bar: Only Crop Header & Add Crop Action */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌾</span>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight leading-none">
              {language === 'te' ? 'నా పంట వివరాలు' : 'Crop Details'}
            </h2>
            <span className="text-[11px] text-stone-400">
              {farmerCrops.length} {language === 'te' ? 'నమోదైన పంటలు' : 'Listed Crops'}
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateToAddCrop}
          className="py-2 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>{t('listNewCrop')}</span>
        </button>
      </div>

      {/* Only Crop Details Cards */}
      {farmerCrops.length === 0 ? (
        <div className="p-10 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-800 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            🌱
          </div>
          <h3 className="font-bold text-white text-sm">
            {language === 'te' ? 'ఇంకా పంటలేవీ నమోదు కాలేదు' : 'No Crops Uploaded Yet'}
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            {language === 'te'
              ? 'మీ పంటను నమోదు చేసి, కొనుగోలుదారుల నుండి ముందస్తు బుకింగ్‌లు పొందండి.'
              : 'Post your harvest details with field video to start receiving buyer booking requests.'}
          </p>
          <button
            onClick={onNavigateToAddCrop}
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            {t('listNewCrop')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {farmerCrops.map(crop => {
            const cropReqs = requests.filter(r => r.cropId === crop.id && r.status === 'PENDING');
            const percentBooked = Math.round((crop.preBookedQuantity / crop.totalQuantity) * 100);

            return (
              <div
                key={crop.id}
                className="bg-stone-900 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3.5 relative overflow-hidden transition hover:border-stone-750"
              >
                {/* Header: Photo/Video, Crop Name, Location, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {/* Video/Photo Thumbnail */}
                    <div
                      onClick={() => onOpenVideoModal(crop)}
                      className="relative w-18 h-18 rounded-2xl overflow-hidden bg-stone-800 shrink-0 cursor-pointer group shadow"
                    >
                      <img
                        src={crop.photos[0]}
                        alt={crop.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                          <Video className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] px-1 rounded font-mono">
                        0:24
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base leading-snug">{crop.cropName}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                        <span className="truncate">{crop.location}</span>
                      </div>
                      <span className="text-emerald-400 font-black text-base block mt-1">
                        ₹{crop.expectedPrice} <span className="text-xs font-normal text-stone-400">/ kg</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      crop.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : crop.status === 'PRE-BOOKED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : crop.status === 'SOLD'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {crop.status}
                  </span>
                </div>

                {/* Divided Quantities & Grade Box */}
                <div className="rounded-2xl bg-stone-950 p-3 border border-stone-800 space-y-2.5">
                  {/* Grade Badge */}
                  <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                    <span className="text-[11px] font-bold text-stone-400">
                      {language === 'te' ? 'నాణ్యత గ్రేడ్ (Quality Grade):' : 'Quality Grade:'}
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
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* 1. Total Quantity */}
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                        {language === 'te' ? 'మొత్తం నిల్వ' : 'Total Qty'}
                      </span>
                      <p className="text-sm font-black text-white mt-0.5">
                        {crop.totalQuantity.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[9px] text-stone-500">kg</span>
                    </div>

                    {/* 2. Pre-Booked Quantity */}
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                      <span className="text-[9px] uppercase font-bold text-amber-300 block tracking-wider">
                        {language === 'te' ? 'ముందస్తు బుకింగ్' : 'Pre-Booked'}
                      </span>
                      <p className="text-sm font-black text-amber-400 mt-0.5">
                        {crop.preBookedQuantity.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[9px] text-amber-300/80">kg ({percentBooked}%)</span>
                    </div>

                    {/* 3. Remaining / Available Quantity */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                      <span className="text-[9px] uppercase font-bold text-emerald-300 block tracking-wider">
                        {language === 'te' ? 'మిగిలిన నిల్వ' : 'Remaining'}
                      </span>
                      <p className="text-sm font-black text-emerald-400 mt-0.5">
                        {crop.remainingQuantity.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[9px] text-emerald-300/80">kg ({100 - percentBooked}%)</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden flex">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${(crop.preBookedQuantity / crop.totalQuantity) * 100}%` }}
                        title={`Pre-booked: ${crop.preBookedQuantity} kg`}
                      ></div>
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(crop.remainingQuantity / crop.totalQuantity) * 100}%` }}
                        title={`Available: ${crop.remainingQuantity} kg`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-stone-500">
                      <span className="text-amber-400 font-medium">● {crop.preBookedQuantity} kg Booked</span>
                      <span className="text-emerald-400 font-medium">● {crop.remainingQuantity} kg Available</span>
                    </div>
                  </div>
                </div>

                {/* Description Snippet */}
                {crop.description && (
                  <p className="text-[11px] text-stone-400 bg-stone-950/50 p-2.5 rounded-xl border border-stone-800/80 line-clamp-2 leading-relaxed">
                    {crop.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigateToCrop(crop.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'te' ? 'పంట నిర్వహణ & చరిత్ర' : 'Manage & History'}</span>
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
                    <span>{language === 'te' ? 'బుకింగ్ అభ్యర్థనలు' : 'Buyer Requests'}</span>
                    {cropReqs.length > 0 && (
                      <span className="bg-stone-950 text-amber-300 font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {cropReqs.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

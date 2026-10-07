import React from 'react';
import { Crop } from '../types';
import { X, Play, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface CropVideoModalProps {
  crop: Crop | null;
  onClose: () => void;
  onRequestClick?: (crop: Crop) => void;
}

export const CropVideoModal: React.FC<CropVideoModalProps> = ({ crop, onClose, onRequestClick }) => {
  if (!crop) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Field Video Inspection
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {crop.videoUrl ? (
            <video
              src={crop.videoUrl}
              autoPlay
              controls
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={crop.photos[0]}
                alt={crop.cropName}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/80 text-stone-950 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/30">
                    <Play className="w-7 h-7 ml-1 fill-stone-950" />
                  </div>
                  <p className="text-xs font-semibold text-white">Live Field Recording Attached</p>
                  <span className="text-[10px] text-stone-300">0:24s • High Definition 1080p</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Grade Pill */}
          <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md border border-stone-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Grade {crop.grade}</span>
          </div>
        </div>

        {/* Details & Actions */}
        <div className="p-4 space-y-3 text-stone-200 text-xs">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{crop.cropName}</h3>
              <span className="text-emerald-400 font-extrabold text-base">
                ₹{crop.expectedPrice}/kg
              </span>
            </div>
            <div className="flex items-center gap-1 text-stone-400 text-[11px] mt-0.5">
              <MapPin className="w-3 h-3 text-stone-500" />
              <span>{crop.location}</span>
              <span>•</span>
              <span>Farmer: {crop.farmerName}</span>
            </div>
          </div>

          <p className="text-stone-300 leading-relaxed bg-stone-850 p-2.5 rounded-xl border border-stone-800">
            {crop.description}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 block">Total Qty</span>
              <span className="font-bold text-white text-xs">{crop.totalQuantity} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-700/60">
              <span className="text-[10px] text-stone-400 block">Pre-booked</span>
              <span className="font-bold text-amber-400 text-xs">{crop.preBookedQuantity} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-300 block">Available</span>
              <span className="font-bold text-emerald-400 text-xs">{crop.remainingQuantity} kg</span>
            </div>
          </div>

          {onRequestClick && (
            <button
              onClick={() => {
                onClose();
                onRequestClick(crop);
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pre-Book Available Quantity</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

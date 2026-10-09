import React from 'react';
import { Deal } from '../types';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, QrCode, Share2, Printer, MapPin, Phone, Building2, Calendar, FileText } from 'lucide-react';

interface DealSlipModalProps {
  deal: Deal | null;
  onClose: () => void;
  onRequestCancellation?: (dealId: string) => void;
}

export const DealSlipModal: React.FC<DealSlipModalProps> = ({
  deal,
  onClose,
  onRequestCancellation,
}) => {
  const { t, language } = useApp();

  if (!deal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
              Verified Marketplace Contract
            </span>
          </div>
          <h2 className="text-xl font-bold">{t('dealConfirmationTitle')}</h2>
          <p className="text-xs text-emerald-100/80 font-mono mt-0.5">
            {t('dealNumber')}: <span className="font-bold text-white">{deal.dealNumber}</span>
          </p>
        </div>

        {/* Slip Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-stone-200 text-sm">
          {/* Status Badge & 9-Step Transaction Workflow (Requirement 15) */}
          <div className="p-3.5 rounded-2xl bg-stone-850/80 border border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Transaction Workflow Status
                </span>
                <p className={`font-black text-sm mt-0.5 ${deal.status === 'CANCELLED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {deal.status === 'CANCELLED' ? '🔴 Cancelled' : '🟢 Deal Confirmed (Stage 5 of 9)'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block font-mono">{deal.createdAt}</span>
                <span className="text-[9px] bg-stone-900 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  🔒 {deal.quantity} kg Reserved
                </span>
              </div>
            </div>

            {/* 9-Step Deal Status Timeline Visualizer (Requirement 15) */}
            <div className="pt-2 border-t border-stone-750 space-y-1.5">
              <span className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block">
                9-Step Fulfillment Roadmap:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[9px] text-center font-semibold">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  1. Sent ✓
                </span>
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  2. Received ✓
                </span>
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  3. Accepted ✓
                </span>
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  4. Reserved ✓
                </span>
                <span className="p-1 rounded bg-emerald-500 text-stone-950 font-black shadow">
                  5. Confirmed ★
                </span>
                <span className="p-1 rounded bg-stone-900 text-stone-400 border border-stone-800">
                  6. Pickup
                </span>
                <span className="p-1 rounded bg-stone-900 text-stone-400 border border-stone-800">
                  7. Handover
                </span>
                <span className="p-1 rounded bg-stone-900 text-stone-400 border border-stone-800">
                  8. Payment
                </span>
                <span className="p-1 rounded bg-stone-900 text-stone-400 border border-stone-800">
                  9. Complete
                </span>
              </div>
            </div>
          </div>

          {/* Commodity Details Card */}
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {t('cropBooked')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-400">Crop Name:</span>
                <p className="font-semibold text-white text-sm">{deal.cropName}</p>
              </div>
              <div>
                <span className="text-stone-400">Quality Grade:</span>
                <p className="font-semibold text-amber-300 text-sm">Grade {deal.grade}</p>
              </div>
              <div className="mt-1">
                <span className="text-stone-400">Confirmed Quantity:</span>
                <p className="font-bold text-white text-base">{deal.quantity.toLocaleString('en-IN')} kg</p>
              </div>
              <div className="mt-1">
                <span className="text-stone-400">{t('agreedPriceLabel')}:</span>
                <p className="font-bold text-emerald-400 text-base">₹{deal.agreedPrice}/kg</p>
              </div>
            </div>

            {/* Total Calculation Highlight */}
            <div className="mt-3 pt-2.5 border-t border-stone-700 flex items-center justify-between bg-stone-900/50 p-2.5 rounded-xl">
              <div>
                <span className="text-xs text-stone-400">{t('totalDealAmount')}</span>
                <p className="text-lg font-extrabold text-emerald-400">
                  ₹{deal.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-[11px] text-stone-400 text-right">
                <span>Direct Payment</span>
                <p className="font-medium text-stone-300">Bank Transfer / Cash at Mandi</p>
              </div>
            </div>
          </div>

          {/* Farmer & Buyer Cards (Requirement 18: Trust Indicators) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Farmer Card */}
            <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-700/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  👨‍🌾 {t('farmerDetails')}
                </span>
                <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  🟢 Verified Farmer
                </span>
              </div>
              <p className="font-bold text-white mt-0.5">{deal.farmerName}</p>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <Phone className="w-3 h-3 text-stone-500" />
                <span>+91 {deal.farmerPhone}</span>
              </div>
              <div className="flex items-start gap-1 text-[11px] text-stone-400">
                <MapPin className="w-3 h-3 text-stone-500 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{deal.farmerLocation}</span>
              </div>
            </div>

            {/* Buyer Card */}
            <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-700/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  🏢 {t('buyerDetails')}
                </span>
                <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  🟢 Verified Buyer
                </span>
              </div>
              <p className="font-bold text-white mt-0.5">{deal.buyerName}</p>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <Building2 className="w-3 h-3 text-stone-500" />
                <span className="truncate">{deal.buyerMarket}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <Phone className="w-3 h-3 text-stone-500" />
                <span>+91 {deal.buyerPhone}</span>
              </div>
            </div>
          </div>

          {/* QR Code and Disclaimer */}
          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
              <QrCode className="w-12 h-12 text-stone-900" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-300">
                RythuSetu Direct Deal Contract
              </p>
              <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5">
                {t('dealConfirmedNotice')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                alert('Deal slip link copied to clipboard. You can share this via WhatsApp with the buyer/transporter!');
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('printOrDownloadSlip')}</span>
            </button>

            {deal.status === 'CONFIRMED' && onRequestCancellation && (
              <button
                onClick={() => onRequestCancellation(deal.id)}
                className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              >
                {t('cancelBookingOrDeal')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

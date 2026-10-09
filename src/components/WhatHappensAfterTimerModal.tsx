import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  ShieldCheck,
  Truck,
  Lock,
  TrendingUp,
  X,
  Sparkles,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { formatTimerCountdown } from '../utils/marketCycleEngine';

interface WhatHappensAfterTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatHappensAfterTimerModal: React.FC<WhatHappensAfterTimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    marketTimerSecondsLeft,
    marketTimerTotalSeconds,
    marketCycleCount,
    lastMarketCycleAt,
    marketCycleEvents,
    inwardArrivals,
    language,
    markets,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'EXPLANATION' | 'RECENT_UPDATES'>('EXPLANATION');

  if (!isOpen) return null;

  const timerInfo = formatTimerCountdown(marketTimerSecondsLeft);
  const percentElapsed = Math.round(
    ((marketTimerTotalSeconds - marketTimerSecondsLeft) / marketTimerTotalSeconds) * 100
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-stone-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 border-b border-stone-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {language === 'te' ? '8 నిమిషాల ఆటోమేటిక్ సైకిల్' : 'Automatic 8-Min APMC Cycle'}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Cycle #{marketCycleCount}
                </span>
              </div>
              <h2
                id="timer-modal-title"
                className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight"
              >
                {language === 'te'
                  ? 'టైమర్ ముగిసిన తర్వాత ఏమి జరుగుతుంది?'
                  : 'What Happens After The Timer?'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Timer Status Card */}
        <div className="p-4 bg-stone-950 border-b border-stone-850">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                {language === 'te' ? 'తదుపరి అప్‌డేట్ కౌంట్‌డౌన్' : 'Next Auto-Refresh Countdown'}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-400 tracking-wider">
                  {timerInfo.formatted}
                </span>
                <span className="text-xs text-stone-400">
                  {language === 'te' ? 'నిమిషాలు మిగిలి ఉన్నాయి' : 'remaining'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-600/40 px-2 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{language === 'te' ? 'ఆటోమేటిక్ నవీకరణ' : 'Runs Automatically'}</span>
              </span>
              <p className="text-[10px] text-stone-400 mt-1">
                {language === 'te'
                  ? `గత అప్‌డేట్: ${lastMarketCycleAt}`
                  : `Last completed: ${lastMarketCycleAt}`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-850 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full transition-all duration-1000"
              style={{ width: `${percentElapsed}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
            <span>08:00</span>
            <span>{percentElapsed}% completed</span>
            <span>00:00 (Auto-Refresh)</span>
          </div>
        </div>

        {/* Tabs for Navigation inside Modal */}
        <div className="flex items-center border-b border-stone-800 bg-stone-900/60 px-4 pt-2">
          <button
            onClick={() => setActiveTab('EXPLANATION')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'EXPLANATION'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {language === 'te' ? '📖 అప్‌డేట్ ప్రక్రియ వివరణ' : '📖 What Happens (3 Key Events)'}
          </button>
          <button
            onClick={() => setActiveTab('RECENT_UPDATES')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RECENT_UPDATES'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>{language === 'te' ? '⚡ ప్రత్యక్ష అప్‌డేట్‌ల ఫీడ్' : '⚡ Live Updates Feed'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded-full">
              {marketCycleEvents.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'EXPLANATION' ? (
            <>
              {/* Mandatory Mandi Pricing Rule Badge */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="font-extrabold text-xs text-amber-300 uppercase tracking-wide">
                    {language === 'te'
                      ? 'అధికారిక నిబంధన: ధరలు మార్కెట్ బోర్డు ద్వారా మాత్రమే మారతాయి'
                      : 'Mandatory Rule: Prices Only Changed by APMC Market Board'}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {language === 'te'
                    ? 'మార్కెట్ కొనుగోలు ధరలను APMC మార్కెట్ కమిటీ మాత్రమే నిర్ణయిస్తుంది. ఏ ఒక్క రైతు లేదా దళారీ ఈ ధరలను ఏకపక్షంగా మార్చలేరు. రైతు నిర్దేశించిన ఆశించిన ధర ఎప్పుడూ రక్షించబడుతుంది.'
                    : 'Benchmark Mandi buying prices are regulated solely by the official APMC Market Committee, never by individual farmers. Farmers retain full autonomy over their produce asking price.'}
                </p>
              </div>

              {/* 3 Step Cards Explaining What Happens Every 8 Minutes */}
              <div className="space-y-3">
                {/* Event 1: Market Rate Refresh */}
                <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                        {language === 'te' ? 'ఈవెంట్ 1' : 'Event 1 • Market Buying Rates'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {language === 'te'
                          ? 'మార్కెట్ ధరల తాజా నవీకరణ (మార్కెట్ ద్వారా మాత్రమే)'
                          : 'APMC Market Buying Price Recalibration'}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        {language === 'te'
                          ? 'ప్రతి 8 నిమిషాలకు మార్కెట్ యార్డులో జరుగుతున్న వేలం పాటలు, సరఫరా మరియు డిమాండ్ ఆధారంగా గ్రేడ్ A, గ్రేడ్ B, గ్రేడ్ C పంటల కొనుగోలు ధరలు అప్‌డేట్ అవుతాయి.'
                          : 'Every 8 minutes, the APMC Committee recalculates crop benchmark buying prices for Grade A, B, and C based on live yard trading and demand trends.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Event 2: Inward Crop Imports */}
                <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                        {language === 'te' ? 'ఈవెంట్ 2' : 'Event 2 • Inward Imports'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {language === 'te'
                          ? 'కొత్త పంటల లారీల రాక & యార్డులోకి దిగుమతులు'
                          : 'Inward Crop Arrivals & Inter-Mandi Imports'}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        {language === 'te'
                          ? 'మదనపల్లె, పలమనేరు, చిత్తూరు, తిరుపతి, కుప్పం మరియు పొరుగు ప్రాంతాల నుండి సరికొత్త పంట లారీలు యార్డులోకి ప్రవేశిస్తాయి. వాటి బరువు మరియు గ్రేడ్ వివరాలు ఆటోమేటిక్‌గా నమోదు చేయబడతాయి.'
                          : 'Fresh truckloads of produce from regional agricultural belts (Tomato, Onion, Chilli, Rice, Potato) arrive at the Mandi yard, updating total daily arrivals and market quotas.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Event 3: Pre-Booking & Quotas */}
                <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">
                        {language === 'te' ? 'ఈవెంట్ 3' : 'Event 3 • Pre-Booking Quotas'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {language === 'te'
                          ? 'ప్రీ-బుకింగ్ కోటాలు మరియు రిజర్వ్‌డ్ లాట్‌లు అప్‌డేట్'
                          : 'Pre-Booking Allocations & Buyer Quotas'}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        {language === 'te'
                          ? 'సంస్థాగత కొనుగోలుదారులు మరియు రిటైల్ చైన్లు (రిలయన్స్, బిగ్‌బాస్కెట్) మార్కెట్ డిమాండ్ కోటా నుండి పంటలను ముందస్తుగా బుక్ చేసుకుంటారు. మిగిలిన నిల్వ కోటా వెంటనే సర్దుబాటు అవుతుంది.'
                          : 'Institutional buyers and licensed commission agents lock pre-booked crop allocations before arrival, updating remaining open quota and pre-booking percentages.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Note */}
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 flex items-center gap-2.5 text-xs text-stone-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'te'
                    ? 'ఈ మార్పులన్నీ టైమర్ 0:00 కు చేరుకోగానే ఆటోమేటిక్‌గా నవీకరించబడతాయి. ఎలాంటి మాన్యువల్ బటన్ అవసరం లేదు.'
                    : 'All updates take place automatically when the timer reaches 00:00. No manual action is required.'}
                </span>
              </div>
            </>
          ) : (
            /* Live Updates Feed Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                <span className="font-semibold text-stone-300">
                  {language === 'te' ? 'ఇటీవలి ఆటోమేటిక్ అప్‌డేట్‌లు' : 'Recent Automatic Updates'}
                </span>
                <span>{marketCycleEvents.length} records</span>
              </div>

              {marketCycleEvents.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs">
                  {language === 'te'
                    ? 'తదుపరి 8 నిమిషాల సైకిల్ కోసం వేచి ఉంది...'
                    : 'Awaiting next 8-minute cycle refresh...'}
                </div>
              ) : (
                marketCycleEvents.slice(0, 10).map(evt => {
                  const isPrice = evt.type === 'PRICE_CHANGE';
                  const isImport = evt.type === 'IMPORT_ARRIVAL';

                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isPrice
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isImport
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {isPrice ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : isImport ? (
                            <Truck className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>{evt.type.replace('_', ' ')}</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {evt.timestamp}
                        </span>
                      </div>

                      <div className="font-bold text-white text-xs mt-1">
                        {evt.marketName}: {evt.title}
                      </div>

                      <p className="text-[11px] text-stone-400 leading-snug">
                        {language === 'te' && (evt.descriptionTelugu || evt.titleTelugu)
                          ? (evt.descriptionTelugu || evt.titleTelugu)
                          : evt.description}
                      </p>

                      {evt.updatedBy && (
                        <div className="pt-1 text-[10px] text-amber-400/90 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{evt.updatedBy}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-400 font-bold">{timerInfo.formatted}</span>
            <span className="text-[11px] hidden sm:inline">•</span>
            <span className="text-[11px] hidden sm:inline">
              {language === 'te' ? 'ఆటోమేటిక్ సైకిల్ కొనసాగుతోంది' : 'Automatic cycle running'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            {language === 'te' ? 'అర్థమైంది ✓' : 'Got it ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

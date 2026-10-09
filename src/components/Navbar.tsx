import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Volume2, VolumeX, Globe, ArrowLeftRight, UserCheck, Clock } from 'lucide-react';
import { formatTimerCountdown } from '../utils/marketCycleEngine';

interface NavbarProps {
  onOpenNotifications: () => void;
  onSelectLanguage: () => void;
  onOpenTimerDetails: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onSelectLanguage,
  onOpenTimerDetails,
}) => {
  const {
    currentUser,
    switchRole,
    language,
    t,
    unreadNotificationsCount,
    isAudioSpeaking,
    speakText,
    stopSpeaking,
    crops,
    markets,
    marketTimerSecondsLeft,
  } = useApp();

  const timerInfo = formatTimerCountdown(marketTimerSecondsLeft);

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleAudioPricing = () => {
    if (isAudioSpeaking) {
      stopSpeaking();
    } else {
      if (language === 'te') {
        speakText('నమస్కారం రైతు సోదరులారా. మదనపల్లె టమాటా గ్రేడ్ A ధర కిలో 34 రూపాయలు. గుంటూరు తేజా ఎండుమిర్చి కిలో 195 రూపాయలు. వరంగల్ పత్తి కిలో 76 రూపాయలు. కొనుగోలుదారులు సిద్ధంగా ఉన్నారు.');
      } else {
        speakText('Namaste farmers! Madanapalle Tomato Grade A is ₹34 per kg. Guntur Teja Chilli is ₹195 per kg. Warangal Cotton is ₹76 per kg. High buyer demand today.');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      {/* Top Banner / Role Switcher Header */}
      <div className="bg-emerald-950/70 border-b border-emerald-800/40 px-3 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300 font-medium truncate">
            {currentUser?.role === 'FARMER' ? '👨‍🌾 ' + (language === 'te' ? 'రైతు పోర్టల్' : 'Farmer Portal') : '🏢 ' + (language === 'te' ? 'కొనుగోలుదారు పోర్టల్' : 'Buyer Mandi Portal')}
          </span>
          <span className="text-stone-400 hidden sm:inline">•</span>
          <span className="text-stone-300 truncate text-[11px] hidden sm:inline">
            {currentUser?.name} ({currentUser?.district})
          </span>
        </div>

        {/* Quick Demo Switch Role Button */}
        <button
          onClick={() => {
            const nextRole = currentUser?.role === 'FARMER' ? 'BUYER' : 'FARMER';
            switchRole(nextRole);
          }}
          className="flex items-center gap-1 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
          title="Switch view between Farmer and Buyer"
        >
          <ArrowLeftRight className="w-3 h-3" />
          <span>{currentUser?.role === 'FARMER' ? 'Switch to Buyer' : 'Switch to Farmer'}</span>
        </button>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* Logo & District Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-emerald-900/50">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                {t('appName')}
              </h1>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium leading-none mt-1">
              {currentUser ? `${currentUser.district}, ${currentUser.state}` : 'National APMC Network'}
            </p>
          </div>
        </div>

        {/* Upside Corner Actions Bar */}
        <div className="flex items-center gap-1.5">
          {/* Upside Corner Timer: Shows TIMER ONLY (no other details), click opens details modal */}
          <button
            onClick={onOpenTimerDetails}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-emerald-300 hover:text-emerald-200 text-xs font-mono font-bold transition shadow-sm cursor-pointer active:scale-95"
            title={language === 'te' ? '8 నిమిషాల టైమర్ - వివరాల కోసం క్లిక్ చేయండి' : '8-Minute Timer - Click to see what happens after timer'}
            aria-label="8-minute market countdown timer"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="tracking-wider">{timerInfo.formatted}</span>
          </button>

          {/* Read Aloud Voice Button (crucial for farmers) */}
          <button
            onClick={handleAudioPricing}
            className={`p-2 rounded-xl transition flex items-center justify-center ${
              isAudioSpeaking
                ? 'bg-amber-500 text-stone-950 font-bold animate-bounce'
                : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
            }`}
            title={t('listenAudio')}
            aria-label="Listen to prices aloud"
          >
            {isAudioSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onSelectLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-200 text-xs font-semibold transition border border-stone-700"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'te' ? 'తెలుగు' : 'ENG'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300 transition border border-stone-700 cursor-pointer"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

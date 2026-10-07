import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Store, PlusCircle, MessageSquareText, UserCheck, Layers } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, t, conversations } = useApp();
  const isFarmer = currentUser?.role === 'FARMER';

  // Total unread messages
  const unreadMessages = conversations.reduce((acc, c) => {
    return acc + (isFarmer ? c.unreadCountFarmer : c.unreadCountBuyer);
  }, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 text-stone-300 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {/* 1. HOME */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t('navHome')}</span>
        </button>

        {/* 2. MARKETS */}
        <button
          onClick={() => setActiveTab('markets')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'markets'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t('navMarkets')}</span>
        </button>

        {/* 3. CENTER ACTION BUTTON: + Add Crop (Farmer) or + Requirements (Buyer) */}
        <div className="flex items-center justify-center -mt-4">
          <button
            onClick={() => setActiveTab(isFarmer ? 'add_crop' : 'requirements')}
            className={`flex flex-col items-center justify-center w-13 h-13 rounded-full shadow-lg transition-transform active:scale-95 ${
              activeTab === (isFarmer ? 'add_crop' : 'requirements')
                ? 'bg-emerald-500 text-stone-950 shadow-emerald-500/30 ring-3 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-black/50'
            }`}
          >
            {isFarmer ? (
              <PlusCircle className="w-7 h-7 text-white stroke-[2.5]" />
            ) : (
              <Layers className="w-6 h-6 text-white stroke-[2.5]" />
            )}
            <span className="text-[9px] font-extrabold text-white leading-none mt-0.5">
              {isFarmer ? 'Add Crop' : 'Need'}
            </span>
          </button>
        </div>

        {/* 4. COMMUNICATION / CHAT */}
        <button
          onClick={() => setActiveTab('communication')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'communication'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <MessageSquareText className="w-5 h-5 mb-0.5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-500 text-stone-950 font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t('navCommunication')}</span>
        </button>

        {/* 5. PROFILE */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'profile'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t('navProfile')}</span>
        </button>
      </div>
    </nav>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { X, Check, Globe } from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useApp();

  if (!isOpen) return null;

  const languages: { code: Language; name: string; localName: string; active: boolean }[] = [
    { code: 'en', name: 'English', localName: 'English (Indian Mandi Standard)', active: true },
    { code: 'te', name: 'Telugu', localName: 'తెలుగు (ఆంధ్రప్రదేశ్ & తెలంగాణ)', active: true },
  ];

  const upcomingLanguages = [
    { name: 'Hindi', localName: 'हिंदी (उत्तर भारत)' },
    { name: 'Kannada', localName: 'ಕನ್ನಡ (ಕರ್ನಾಟಕ)' },
    { name: 'Tamil', localName: 'தமிழ் (தமிழ்நாடு)' },
    { name: 'Marathi', localName: 'मराठी (महाराष्ट्र)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t('selectLanguage')}</h3>
              <p className="text-[11px] text-stone-400">Select preferred language for farmers & buyers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Active languages */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Available Languages
            </span>
            {languages.map(lang => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                      : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-white">{lang.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{lang.localName}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scalable Indian Languages Architecture Note */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">
              Coming Soon Across India (Architecture Ready)
            </span>
            <div className="grid grid-cols-2 gap-2 text-stone-400">
              {upcomingLanguages.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-stone-850/40 border border-stone-800 text-[11px] opacity-60 flex items-center justify-between"
                >
                  <span>{item.localName}</span>
                  <span className="text-[9px] bg-stone-800 px-1 py-0.5 rounded text-stone-400">v2</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

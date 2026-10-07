import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Phone, ShieldCheck, MapPin, User, Building2, CheckCircle2, ArrowRight, Sparkles, Sprout, KeyRound } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { loginUser, switchRole, language, setLanguage, t } = useApp();

  // Updated flow: DETAILS (Name, Location, Phone, Role) -> OTP -> Enter App
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');

  const [name, setName] = useState<string>('Ramesh Reddy');
  const [phone, setPhone] = useState<string>('9848012345');
  const [stateName, setStateName] = useState<string>('Andhra Pradesh');
  const [district, setDistrict] = useState<string>('Chittoor');
  const [area, setArea] = useState<string>('Madanapalle Rural');
  const [role, setRole] = useState<Role>('FARMER');

  const [otp, setOtp] = useState<string>('1234');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!area.trim()) {
      setErrorMsg('Please enter your village / area location.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Move to OTP step
    setStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234' && otp.length !== 4) {
      setErrorMsg('Invalid OTP. Use demo verification code: 1234');
      return;
    }

    setErrorMsg('');
    loginUser(phone, role, name, stateName, district, area);
    onLoginSuccess();
  };

  const handleQuickDemo = (targetRole: Role) => {
    switchRole(targetRole);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-3">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header / Language Bar */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-800/60 bg-stone-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              🌱
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight leading-none block">
                {t('appName')}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Direct Farmer-Market Network</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-lg transition font-medium ${
                language === 'en' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 rounded-lg transition font-medium ${
                language === 'te' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>

        {/* =========================================================================
            STEP 1: USER DETAILS (Name, Location, Phone, Role)
            (User Request: "first ask the name location phone number then ask the otp")
            ========================================================================= */}
        {step === 'DETAILS' && (
          <form onSubmit={handleProceedToOtp} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Step 1 of 2: Registration & Details</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {language === 'te' ? 'మీ వివరాలు & ఫోన్ నంబర్' : 'Your Details & Phone Number'}
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {language === 'te'
                  ? 'ముందుగా మీ పేరు, గ్రామం, ఫోన్ నంబర్ నమోదు చేసి OTP పొందండి'
                  : 'Enter your name, farm location, and mobile number to receive OTP'}
              </p>
            </div>

            {/* 1. Full Name */}
            <div>
              <label className="block text-stone-300 font-bold mb-1">
                {t('fullName')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 2. Mobile Phone Number */}
            <div>
              <label className="block text-stone-300 font-bold mb-1">
                {t('mobileNumber')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 font-bold text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98480 12345"
                  className="w-full pl-12 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 3. Location (State & District) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-300 font-bold mb-1">{t('state')} *</label>
                <select
                  value={stateName}
                  onChange={e => setStateName(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">{t('district')} *</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Chittoor">Chittoor</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Warangal">Warangal</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolar">Kolar</option>
                  <option value="Kurnool">Kurnool</option>
                  <option value="Anantapur">Anantapur</option>
                </select>
              </div>
            </div>

            {/* 4. Area / Village / Mandalam */}
            <div>
              <label className="block text-stone-300 font-bold mb-1">
                {t('areaVillage')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Madanapalle Rural / Gatlammapalli"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 5. Role Selection (Farmer vs Buyer) */}
            <div>
              <label className="block text-stone-300 font-bold mb-1.5">{t('selectRole')} *</label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setRole('FARMER')}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    role === 'FARMER'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">👨‍🌾</span>
                    {role === 'FARMER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="font-bold text-white text-xs">{t('iAmFarmer')}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">Sell harvest directly</p>
                </div>

                <div
                  onClick={() => setRole('BUYER')}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    role === 'BUYER'
                      ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">🏢</span>
                    {role === 'BUYER' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="font-bold text-white text-xs">{t('iAmBuyer')}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">Source & pre-book crops</p>
                </div>
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

            {/* Submit to Send OTP */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition cursor-pointer"
              >
                <span>{language === 'te' ? 'OTP పంపండి' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Tap Demo Shortcuts */}
            <div className="pt-3 border-t border-stone-800 text-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                ⚡ {t('quickDemoLogin')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('FARMER')}
                  className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500 text-[11px] text-stone-300 transition"
                >
                  <span className="font-bold text-emerald-400 block">👨‍🌾 Farmer Demo</span>
                  <span className="text-[10px] text-stone-500">Ramesh Reddy (Chittoor)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('BUYER')}
                  className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-[11px] text-stone-300 transition"
                >
                  <span className="font-bold text-amber-400 block">🏢 Buyer Demo</span>
                  <span className="text-[10px] text-stone-500">Venkateswara Traders</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            STEP 2: OTP VERIFICATION -> DIRECTLY ENTER APP
            (User Request: "then ask the otpthen he enter the app")
            ========================================================================= */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-5 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Step 2 of 2: OTP Verification</span>
              </div>
              <h3 className="text-xl font-bold text-white">{t('enterOtp')}</h3>
              <p className="text-xs text-stone-400">
                {t('otpSentTo')} <strong className="text-white">{phone}</strong>
              </p>
            </div>

            {/* Auto-fill Hint Banner */}
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Demo Verification Code
              </span>
              <p className="text-2xl font-mono font-black text-amber-400 tracking-widest">
                1234
              </p>
              <button
                type="button"
                onClick={() => setOtp('1234')}
                className="text-[11px] text-amber-300 hover:text-white underline font-medium cursor-pointer"
              >
                Click to Auto-fill 1234
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={4}
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="1234"
                className="w-full py-3.5 bg-stone-950 border border-stone-800 rounded-2xl text-center text-2xl font-mono tracking-widest text-white font-black focus:outline-none focus:border-emerald-500"
              />

              {errorMsg && <p className="text-xs text-rose-400 text-center">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition cursor-pointer"
              >
                {language === 'te' ? 'ధృవీకరించి ప్రవేశించండి (Enter App) →' : 'Verify OTP & Enter App →'}
              </button>

              <div className="flex justify-between items-center text-xs text-stone-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="hover:text-stone-200"
                >
                  ← Edit Details & Phone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtp('1234');
                    alert('OTP resent to ' + phone + ': 1234');
                  }}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  {t('resendOtp')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

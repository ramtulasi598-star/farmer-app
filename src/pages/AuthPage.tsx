import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  Phone,
  ShieldCheck,
  MapPin,
  User,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Download,
  Smartphone,
  Hash,
  Building2,
  Check,
  RefreshCw,
  BellRing,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Volume2,
  Shield,
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const STATE_DISTRICTS: Record<string, { districts: string[]; defaultPincode: string }> = {
  'Andhra Pradesh': {
    districts: [
      'Chittoor',
      'Guntur',
      'Kurnool',
      'Anantapur',
      'Tirupati',
      'YSR Kadapa',
      'Krishna',
      'Visakhapatnam',
      'Nellore',
      'Prakasam',
      'East Godavari',
      'West Godavari',
      'Vizianagaram',
      'Srikakulam',
    ],
    defaultPincode: '517325',
  },
  'Telangana': {
    districts: [
      'Warangal',
      'Hyderabad',
      'Nizamabad',
      'Khammam',
      'Karimnagar',
      'Mahabubnagar',
      'Nalgonda',
      'Rangareddy',
      'Medak',
      'Siddipet',
      'Adilabad',
    ],
    defaultPincode: '506001',
  },
  'Karnataka': {
    districts: [
      'Kolar',
      'Chikkaballapur',
      'Bengaluru Rural',
      'Belagavi',
      'Mysuru',
      'Tumakuru',
      'Ballari',
      'Raichur',
    ],
    defaultPincode: '563101',
  },
  'Tamil Nadu': {
    districts: [
      'Dharmapuri',
      'Krishnagiri',
      'Salem',
      'Coimbatore',
      'Vellore',
      'Erode',
      'Tirupathur',
    ],
    defaultPincode: '636701',
  },
};

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { loginUser, switchRole, language, setLanguage, t } = useApp();

  // User Journey requested:
  // 1. Mobile download asks: first name, state, district, area, pincode, mobile number -> Generate OTP
  // 2. Ask OTP to login
  // 3. Finally ask: Are you a Buyer or Farmer?
  const [step, setStep] = useState<'DETAILS' | 'OTP' | 'ROLE_SELECTION'>('DETAILS');

  // Input states
  const [firstName, setFirstName] = useState<string>('Ramesh');
  const [lastName, setLastName] = useState<string>('Reddy');
  const [stateName, setStateName] = useState<string>('Andhra Pradesh');
  const [district, setDistrict] = useState<string>('Chittoor');
  const [area, setArea] = useState<string>('Madanapalle Rural (Gatlammapalli)');
  const [pincode, setPincode] = useState<string>('517325');
  const [phone, setPhone] = useState<string>('9848012345');

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState<string>('4821');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Step 3: Final role selection
  const [selectedRole, setSelectedRole] = useState<Role>('FARMER');

  // Handle state change updating districts and default pincode
  const handleStateChange = (newState: string) => {
    setStateName(newState);
    const data = STATE_DISTRICTS[newState];
    if (data && data.districts.length > 0) {
      setDistrict(data.districts[0]);
      if (!pincode || pincode === '517325' || pincode === '506001' || pincode === '563101' || pincode === '636701') {
        setPincode(data.defaultPincode);
      }
    }
  };

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Generate OTP Action (Step 1 -> Step 2)
  const handleGenerateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim()) {
      setErrorMsg(language === 'te' ? 'దయచేసి మీ మొదటి పేరు నమోదు చేయండి' : 'Please enter your first name.');
      return;
    }
    if (!stateName.trim()) {
      setErrorMsg(language === 'te' ? 'దయచేసి మీ రాష్ట్రం ఎంచుకోండి' : 'Please select your state.');
      return;
    }
    if (!district.trim()) {
      setErrorMsg(language === 'te' ? 'దయచేసి మీ జిల్లా ఎంచుకోండి' : 'Please select your district.');
      return;
    }
    if (!area.trim()) {
      setErrorMsg(language === 'te' ? 'దయచేసి మీ ప్రాంతం / గ్రామం నమోదు చేయండి' : 'Please enter your area or village location.');
      return;
    }
    const cleanPincode = pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setErrorMsg(language === 'te' ? 'దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి' : 'Please enter a valid 6-digit PIN code.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(language === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Generate random 4-digit code
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newCode);
    setEnteredOtp('');
    setResendTimer(30);

    // Play subtle SMS ding tone and vibration (if supported by device)
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {}

    // Show simulated instant Mobile Carrier SMS push notification
    const smsText = `Your RythuSetu Mobile App verification code is ${newCode}. Do not share this OTP with anyone. Valid for 5 mins.`;
    setSmsNotification(smsText);

    // Keep SMS visible for 15 seconds or until dismissed
    setTimeout(() => {
      setSmsNotification(null);
    }, 15000);

    // Move to Step 2
    setStep('OTP');
  };

  // Re-send OTP
  const handleResendOtp = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newCode);
    setResendTimer(30);
    setErrorMsg('');
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
    const smsText = `Resent OTP: Your RythuSetu login code is ${newCode}.`;
    setSmsNotification(smsText);
    setTimeout(() => {
      setSmsNotification(null);
    }, 15000);
  };

  // Verify OTP Action (Step 2 -> Step 3)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Accept generated OTP or demo 1234
    if (enteredOtp !== generatedOtp && enteredOtp !== '1234') {
      setErrorMsg(
        language === 'te'
          ? `చెల్లని OTP. దయచేసి ${generatedOtp} లేదా 1234 నమోదు చేయండి.`
          : `Invalid OTP. Please enter code ${generatedOtp} (or demo code 1234).`
      );
      return;
    }

    // Move to final step: Ask "Are you a Buyer or Farmer?"
    setStep('ROLE_SELECTION');
  };

  // Final Action: Complete Registration and Enter App
  const handleFinalizeRegistration = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || firstName.trim();
    loginUser(
      phone.replace(/\D/g, ''),
      selectedRole,
      fullName,
      stateName,
      district,
      area,
      pincode.replace(/\D/g, ''),
      firstName.trim()
    );
    onLoginSuccess();
  };

  // Quick 1-tap demo shortcuts
  const handleQuickDemo = (targetRole: Role) => {
    switchRole(targetRole);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-3 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Realistic Mobile Text Message (Carrier SMS Push Notification) */}
      {smsNotification && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-stone-900/95 backdrop-blur-md border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950 rounded-2xl p-3.5 flex items-start gap-3 animate-in slide-in-from-top-6 duration-300">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
            <MessageSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-xs tracking-wide">MESSAGES • TX-RYTHU</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/40">
                  SMS
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse" />
                Just Now
              </span>
            </div>
            <p className="text-stone-200 text-xs mt-1 leading-snug font-medium">
              {smsNotification}
            </p>
            {step === 'OTP' && (
              <div className="mt-2 pt-1.5 border-t border-stone-800 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  OTP Code: <strong className="text-emerald-400 font-black text-xs">{generatedOtp}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[10px] rounded-lg shadow cursor-pointer transition active:scale-95"
                >
                  ⚡ Auto-Fill Code
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setSmsNotification(null)}
            className="text-stone-400 hover:text-white text-sm p-1"
            title="Dismiss SMS notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header / Language & Download Badge Bar */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-800/60 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight leading-none block">
                  {t('appName')}
                </span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Mobile App
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium">Direct Farmer-Market Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-lg transition font-medium ${
                language === 'en' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 rounded-lg transition font-medium ${
                language === 'te' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="px-5 pt-3 pb-1 bg-stone-950/30 flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800/30">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'DETAILS'
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-emerald-900/80 text-emerald-300'
              }`}
            >
              1
            </span>
            <span className={step === 'DETAILS' ? 'text-white font-bold' : 'text-stone-400'}>
              {language === 'te' ? 'వివరాలు' : 'Details'}
            </span>
          </div>
          <div className="w-6 h-0.5 bg-stone-800"></div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'OTP'
                  ? 'bg-emerald-500 text-stone-950'
                  : step === 'ROLE_SELECTION'
                  ? 'bg-emerald-900/80 text-emerald-300'
                  : 'bg-stone-800 text-stone-500'
              }`}
            >
              2
            </span>
            <span className={step === 'OTP' ? 'text-white font-bold' : 'text-stone-400'}>
              {language === 'te' ? 'OTP' : 'OTP Login'}
            </span>
          </div>
          <div className="w-6 h-0.5 bg-stone-800"></div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'ROLE_SELECTION'
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-stone-800 text-stone-500'
              }`}
            >
              3
            </span>
            <span className={step === 'ROLE_SELECTION' ? 'text-white font-bold' : 'text-stone-400'}>
              {language === 'te' ? 'రైతు / వ్యాపారి' : 'Role'}
            </span>
          </div>
        </div>

        {/* =========================================================================
            STEP 1: USER DETAILS (First Name, State, District, Area, Pincode, Mobile)
            -> Action: "Generate OTP"
            ========================================================================= */}
        {step === 'DETAILS' && (
          <form onSubmit={handleGenerateOtp} className="p-5 space-y-3.5 max-h-[82vh] overflow-y-auto text-xs no-scrollbar">
            <div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'యాప్ డౌన్‌లోడ్ వన్-టైమ్ సెటప్' : 'Mobile Download • 1-Time Setup'}</span>
                </div>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {language === 'te' ? 'ఒక్కసారే వస్తుంది' : 'Appears Once'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                {language === 'te' ? 'మీ వివరాలు నమోదు చేసి SMS OTP పొందండి' : 'Enter Details & Get SMS OTP'}
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {language === 'te'
                  ? 'మొదటిసారి యాప్ డౌన్‌లోడ్ చేసినప్పుడు మాత్రమే ఈ లాగిన్ పేజీ వస్తుంది. వివరాలు ఇచ్చి టెక్స్ట్ మెసేజ్ ద్వారా OTP పొందండి.'
                  : 'This setup screen appears only once upon downloading the app. Enter your details to receive the verification OTP via mobile text message.'}
              </p>
            </div>

            {/* 1. First Name & Last Name */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t('firstName')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full pl-8 pr-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {language === 'te' ? 'ఇంటి పేరు (Last Name)' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Reddy"
                  className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 2. State & District (dynamically populated) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t('state')} <span className="text-rose-400">*</span>
                </label>
                <select
                  value={stateName}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(STATE_DISTRICTS).map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t('district')} <span className="text-rose-400">*</span>
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {(STATE_DISTRICTS[stateName]?.districts || ['Chittoor', 'Guntur', 'Warangal']).map(dst => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Area / Village / Mandalam */}
            <div>
              <label className="block text-stone-300 font-bold mb-1">
                {t('areaVillage')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Madanapalle Rural (Gatlammapalli)"
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 4. Pincode & Mobile Number */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t('pincode')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 517325"
                    className="w-full pl-8 pr-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono font-semibold text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t('mobileNumber')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400 font-bold text-[11px]">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98480 12345"
                    className="w-full pl-10 pr-2.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono font-semibold text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* SUBMIT BUTTON: GENERATE OTP */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition cursor-pointer active:scale-98"
              >
                <KeyRound className="w-4 h-4" />
                <span>{language === 'te' ? 'OTP జనరేట్ చేయండి (Generate OTP)' : 'Generate OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="pt-3 border-t border-stone-800/80 text-center">
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
            STEP 2: ASK THE OTP TO LOGIN
            ========================================================================= */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30 shadow-md shadow-emerald-950/40">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{language === 'te' ? 'స్టెప్ 2: OTP తో లాగిన్' : 'Step 2: Login with OTP'}</span>
              </div>
              <h3 className="text-xl font-black text-white">{t('enterOtp')}</h3>
              <p className="text-xs text-stone-400">
                {t('otpSentTo')} <strong className="text-white">+91 {phone}</strong>
              </p>
            </div>

            {/* Mobile Text Message (SMS) Delivery Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === 'te'
                    ? 'మొబైల్ టెక్స్ట్ మెసేజ్ (SMS) ద్వారా వచ్చిన OTP'
                    : 'OTP Sent via Mobile Text Message (SMS)'}
                </span>
              </div>
              <p className="text-3xl font-mono font-black text-emerald-400 tracking-widest py-1">
                {generatedOtp}
              </p>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 flex items-center gap-1.5 mx-auto"
                >
                  <span>⚡</span>
                  <span>
                    {language === 'te'
                      ? `SMS కోడ్ ${generatedOtp} ఆటో-ఫిల్ చేయండి`
                      : `Auto-Fill SMS Code (${generatedOtp})`}
                  </span>
                </button>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-stone-300 text-center font-bold mb-1.5">
                  {language === 'te' ? '4 అంకెల OTP ని నమోదు చేయండి' : 'Enter 4-Digit OTP Code'}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder={generatedOtp}
                  className="w-full py-3.5 bg-stone-950 border border-stone-800 rounded-2xl text-center text-3xl font-mono tracking-widest text-white font-black focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-400 text-center">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition cursor-pointer active:scale-98"
              >
                {language === 'te' ? 'OTP ధృవీకరించి కొనసాగించండి →' : 'Verify OTP & Continue →'}
              </button>

              <div className="flex justify-between items-center text-xs text-stone-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="hover:text-stone-200 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'వివరాలు సవరించండి' : 'Edit Details'}</span>
                </button>

                {resendTimer > 0 ? (
                  <span className="text-[11px] text-stone-500 font-mono">
                    {language === 'te' ? `మళ్ళీ పంపండి (${resendTimer}s)` : `Resend in ${resendTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('resendOtp')}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            STEP 3: FINALLY ASK "ARE YOU BUYER OR FARMER?"
            ========================================================================= */}
        {step === 'ROLE_SELECTION' && (
          <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto text-xs no-scrollbar">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'చివరి దశ: మీ పాత్రను ఎంచుకోండి' : 'Final Step: Select Your Role'}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-2">
                {language === 'te' ? 'మీరు రైతు లేదా కొనుగోలుదారుడా?' : 'Are you a Buyer or Farmer?'}
              </h2>
              <p className="text-[11px] text-stone-400">
                {language === 'te'
                  ? 'మీ వ్యాపార అవసరాలకు అనుగుణంగా సరైన అనుభవాన్ని పొందండి'
                  : 'Choose whether you want to sell agricultural produce or buy from farmers'}
              </p>
            </div>

            {/* Selection Cards */}
            <div className="space-y-3 pt-1">
              {/* Option A: FARMER (రైతు) */}
              <div
                onClick={() => setSelectedRole('FARMER')}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition relative overflow-hidden ${
                  selectedRole === 'FARMER'
                    ? 'bg-emerald-950/70 border-emerald-500 shadow-xl shadow-emerald-950/80'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/40">
                      👨‍🌾
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                        {language === 'te' ? 'పంట సాగుదారు' : 'Cultivator / Producer'}
                      </span>
                      <h3 className="text-base font-black text-white mt-0.5">
                        {language === 'te' ? 'నేను రైతును (Farmer)' : 'I am a Farmer (రైతు)'}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedRole === 'FARMER' ? 'bg-emerald-500 text-stone-950 font-bold' : 'border border-stone-700'
                    }`}
                  >
                    {selectedRole === 'FARMER' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-stone-300 text-[11px] leading-relaxed mb-3">
                  {language === 'te'
                    ? 'పంటలను నేరుగా APMC మార్కెట్లు & హోల్‌సేల్ కొనుగోలుదారులకు విక్రయించండి. దళారులు లేకుండా నిజమైన ధర పొందండి.'
                    : 'Sell harvest directly to verified APMC mandis and wholesale buyers with zero middleman commissions.'}
                </p>

                {/* Farmer Highlights */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-emerald-300">
                    ⏱ <strong>1-Hour Rule:</strong> Direct supply to APMC mandis
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-emerald-300">
                    🤝 <strong>24-Hour Deals:</strong> Direct pre-bookings from buyers
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-stone-300">
                    📈 Live APMC price updates & voice reading
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-stone-300">
                    🔒 Guaranteed deal slips & digital pickup
                  </div>
                </div>
              </div>

              {/* Option B: BUYER (కొనుగోలుదారు) */}
              <div
                onClick={() => setSelectedRole('BUYER')}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition relative overflow-hidden ${
                  selectedRole === 'BUYER'
                    ? 'bg-amber-950/70 border-amber-500 shadow-xl shadow-amber-950/80'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600/30 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/40">
                      🏢
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-500/30">
                        {language === 'te' ? 'హోల్‌సేల్ వ్యాపారి' : 'Trader / Merchant'}
                      </span>
                      <h3 className="text-base font-black text-white mt-0.5">
                        {language === 'te' ? 'నేను కొనుగోలుదారుని (Buyer)' : 'I am a Buyer (కొనుగోలుదారు)'}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedRole === 'BUYER' ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-700'
                    }`}
                  >
                    {selectedRole === 'BUYER' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-stone-300 text-[11px] leading-relaxed mb-3">
                  {language === 'te'
                    ? 'రైతుల నుండి నేరుగా తాజా పంటలను ముందస్తు బుకింగ్ చేసుకోండి. నాణ్యత గ్రేడింగ్ & పారదర్శక ఒప్పందాలు.'
                    : 'Discover fresh harvests directly from verified cultivators. Send booking requests and manage APMC procurement.'}
                </p>

                {/* Buyer Highlights */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-amber-300">
                    ⏱ <strong>24-Hour Window:</strong> Response guarantee on farm bookings
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-amber-300">
                    🚚 Farmgate sourcing & quality audits
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-stone-300">
                    📋 Direct verified deal slips & gate passes
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 text-stone-300">
                    0% Hidden brokerage & commission
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Summary Pill */}
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 space-y-1">
              <div className="flex items-center justify-between text-stone-300 font-semibold">
                <span>
                  👤 {firstName} {lastName}
                </span>
                <span className="font-mono text-emerald-400">+91 {phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-400 text-[10px]">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {area}, {district}, {stateName} - PIN: <strong>{pincode}</strong>
                </span>
              </div>
            </div>

            {/* FINAL CONFIRMATION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinalizeRegistration}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-2xl transition cursor-pointer active:scale-98 ${
                  selectedRole === 'FARMER'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 shadow-emerald-950/60'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-amber-950/60'
                }`}
              >
                <span>
                  {selectedRole === 'FARMER'
                    ? language === 'te'
                      ? 'రైతుగా మార్కెట్‌లోకి ప్రవేశించండి 👨‍🌾 →'
                      : 'Enter RythuSetu as Farmer 👨‍🌾 →'
                    : language === 'te'
                    ? 'కొనుగోలుదారుగా ప్రవేశించండి 🏢 →'
                    : 'Enter RythuSetu as Buyer 🏢 →'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

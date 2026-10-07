import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, KeyRound, CheckCircle, X, ShieldAlert, ArrowRight } from 'lucide-react';

interface CancellationModalProps {
  dealId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({ dealId, onClose, onSuccess }) => {
  const { t, getDealById, initiateCancellation, verifyCancellationOtp } = useApp();
  const deal = getDealById(dealId);

  const [step, setStep] = useState<'REASON' | 'CONFIRM' | 'OTP' | 'SUCCESS'>('REASON');
  const [reason, setReason] = useState<string>('Quality did not match sample');
  const [customReason, setCustomReason] = useState<string>('');
  const [cancellationId, setCancellationId] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!deal) return null;

  const handleStartCancellation = () => {
    const finalReason = customReason ? `${reason}: ${customReason}` : reason;
    const res = initiateCancellation(dealId, finalReason);
    if (res.success && res.cancellationId) {
      setCancellationId(res.cancellationId);
      setOtpCode(res.otp);
      setStep('OTP');
    }
  };

  const handleVerifyOtp = () => {
    setErrorMessage('');
    const res = verifyCancellationOtp(cancellationId, enteredOtp);
    if (res.success) {
      setStep('SUCCESS');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-rose-950/80 border-b border-rose-800/40 p-4 relative flex items-center gap-3">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/30 hover:bg-black/50 text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{t('cancelBookingOrDeal')}</h3>
            <p className="text-xs text-rose-200/70 font-mono">Deal: {deal.dealNumber}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-stone-200 text-sm">
          {step === 'REASON' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{t('cancelNotice')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  {t('cancelReason')}
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    t('reasonMismatch'),
                    t('reasonLogistics'),
                    t('reasonPrice'),
                    t('reasonOther'),
                  ].map((r, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        reason === r
                          ? 'bg-rose-950/40 border-rose-500/60 text-white font-medium'
                          : 'bg-stone-800/50 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="text-rose-500 focus:ring-rose-400"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  Additional Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Specify notes regarding this cancellation..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStartCancellation}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/40"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">{t('enterCancellationOtp')}</h4>
                <p className="text-xs text-stone-400">
                  A mutual security code has been generated to verify cancellation and restore {deal.quantity} kg back to the farmer.
                </p>
              </div>

              {/* Security OTP Simulation Banner */}
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  Verification OTP Code
                </span>
                <p className="text-2xl font-mono font-extrabold text-amber-400 tracking-widest mt-0.5">
                  {otpCode}
                </p>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(otpCode)}
                  className="mt-1 text-[11px] text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer"
                >
                  Click to Auto-fill OTP
                </button>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit OTP"
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-mono bg-stone-800 border border-stone-700 focus:border-amber-400 rounded-2xl py-3 text-white focus:outline-none"
                />
                {errorMessage && (
                  <p className="text-xs text-rose-400 text-center mt-1.5">{errorMessage}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REASON')}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={enteredOtp.length !== 4}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-900/40"
                >
                  {t('confirmCancellation')}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center space-y-3 py-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-lg">Cancellation Finalized</h4>
              <p className="text-xs text-stone-300 leading-relaxed max-w-xs mx-auto">
                {t('dealCancelledSuccess')}
              </p>
              <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700 text-left text-xs space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>Crop:</span>
                  <span className="text-white font-medium">{deal.cropName}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Restored Quantity:</span>
                  <span className="text-emerald-400 font-bold">+{deal.quantity} kg</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>New Crop Status:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE (Available)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

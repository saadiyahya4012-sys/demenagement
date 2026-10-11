import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { UserRole } from '../../types';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Truck,
  Edit2
} from 'lucide-react';
import truckDriverImg from '../../assets/images/moving_truck_driver_1790639256718.jpg';

export const VerifyEmail: React.FC = () => {
  const {
    navigate,
    pendingEmail,
    pendingRole,
    authMessage,
    updateClientProfile,
    updateDriverProfile,
    setRole
  } = useAppStore();

  const [email, setEmail] = useState<string>(pendingEmail || 'client@moovvert.com');
  const role: UserRole = pendingRole || 'client';

  // 6 digit code inputs
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCodeExpired, setIsCodeExpired] = useState<boolean>(false);

  // Email editing inline state
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [newEmailInput, setNewEmailInput] = useState<string>(email);

  // 60-second resend cooldown timer
  const [cooldown, setCooldown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // 10-minute code expiration timer (600 seconds)
  const [expirationSeconds, setExpirationSeconds] = useState<number>(600);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);

  // Expiration countdown effect
  useEffect(() => {
    if (expirationSeconds > 0) {
      const timer = setTimeout(() => setExpirationSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCodeExpired(true);
      setErrorMessage('Ce code a expiré.');
    }
  }, [expirationSeconds]);

  // Format expiration seconds as MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    setErrorMessage('');
    const char = val.slice(-1); // take last typed character

    if (!/^\d*$/.test(char)) return; // numbers only

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-focus next input if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (char && index === 5 && newDigits.every(d => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasted.length >= 6) {
      const pasteDigits = pasted.slice(0, 6).split('');
      setDigits(pasteDigits);
      inputRefs.current[5]?.focus();
      verifyCode(pasteDigits.join(''));
    }
  };

  const verifyCode = async (codeToVerify?: string) => {
    const fullCode = (codeToVerify || digits.join('')).trim();
    setErrorMessage('');

    if (fullCode.length !== 6) {
      setErrorMessage('Veuillez renseigner les 6 chiffres du code.');
      return;
    }

    if (isCodeExpired) {
      setErrorMessage('Ce code a expiré.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.expired) {
          setIsCodeExpired(true);
          setErrorMessage('Ce code a expiré.');
        } else {
          setErrorMessage(data.error || 'Code incorrect. Veuillez réessayer.');
        }
        setIsLoading(false);
        return;
      }

      // Success: verified!
      setSuccessMessage('Votre adresse email a été vérifiée avec succès.');

      // Update store user state
      if (role === 'client') {
        updateClientProfile({
          isEmailVerified: true,
          email_verified_at: data.email_verified_at || new Date().toISOString(),
          email: email.trim(),
        });
      } else {
        updateDriverProfile({
          isEmailVerified: true,
          email_verified_at: data.email_verified_at || new Date().toISOString(),
          email: email.trim(),
        });
      }

      // Automatically redirect to the appropriate dashboard
      setTimeout(() => {
        setRole(role);
        if (role === 'client') {
          navigate('client-dashboard');
        } else {
          navigate('driver-dashboard');
        }
      }, 1400);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setErrorMessage(err?.message || 'Erreur lors de la vérification du code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Erreur lors du renvoi du code.');
        if (data.retryAfterSeconds) {
          setCooldown(data.retryAfterSeconds);
          setCanResend(false);
        }
        setIsResending(false);
        return;
      }

      // Reset timers and inputs on successful resend
      setCooldown(60);
      setCanResend(false);
      setExpirationSeconds(600);
      setIsCodeExpired(false);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      setSuccessMessage('Un nouveau code de vérification a été envoyé à votre adresse email.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error resending OTP:', err);
      setErrorMessage('Erreur réseau lors du renvoi du code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSaveEditedEmail = async () => {
    const trimmed = newEmailInput.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMessage('Veuillez renseigner une adresse email valide.');
      return;
    }

    setEmail(trimmed);
    setIsEditingEmail(false);
    setDigits(['', '', '', '', '', '']);
    setCooldown(60);
    setCanResend(false);
    setExpirationSeconds(600);
    setIsCodeExpired(false);
    setErrorMessage('');

    try {
      const response = await fetch('/api/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, role }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Un code de vérification a été envoyé à ${trimmed}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.error || "Impossible d'envoyer l'email.");
      }
    } catch {
      // Non-blocking
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background soft ambient gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-emerald-100/50 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      {/* Main Single Large Rounded Card matching AuthPage */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]"
      >
        {/* LEFT VISUAL SECTION */}
        <div className="lg:col-span-5 relative bg-slate-900 min-h-[240px] sm:min-h-[280px] lg:min-h-full overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-white">
          <div className="absolute inset-0">
            <img
              src={truckDriverImg}
              alt="Sécurité MoovVert"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-emerald-950/30" />
            <div className="absolute inset-0 bg-[#00A86B]/10 mix-blend-overlay" />
          </div>

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Sécurité MoovVert</span>
            </div>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 mt-auto pt-8">
            <div className="inline-flex items-center gap-1.5 text-[#00A86B] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vérification d'identité</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Protégeons vos déménagements et livraisons.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed">
              La vérification par email protège votre compte contre les accès non autorisés et garantit des échanges fiables entre clients et chauffeurs.
            </p>
          </div>
        </div>

        {/* RIGHT INTERACTIVE FORM SECTION */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          {/* Brand Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-[#111111]">
                    Moov<span className="text-[#00A86B]">Vert</span>
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider -mt-1">
                    Transport & Déménagement
                  </span>
                </div>
              </div>

              {/* Account role pill */}
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] border border-emerald-200">
                Compte {role === 'driver' ? 'Chauffeur' : 'Client'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mt-4">
              Vérifiez votre adresse email
            </h1>

            {!isEditingEmail ? (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Un code de vérification a été envoyé à votre adresse email :{' '}
                  <strong className="text-slate-900 font-bold">{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput(email);
                    setIsEditingEmail(true);
                  }}
                  className="text-xs text-[#00A86B] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modifier</span>
                </button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-[#00A86B] focus:outline-hidden w-60"
                  placeholder="nouvel-email@gmail.com"
                />
                <button
                  type="button"
                  onClick={handleSaveEditedEmail}
                  className="px-3 py-1.5 text-xs font-bold bg-[#00A86B] text-white rounded-xl hover:bg-[#008f5a] cursor-pointer"
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Banner Notifications */}
          <AnimatePresence>
            {authMessage && !errorMessage && !successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{authMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2.5 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6-Digit Code Input Group */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyCode();
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2.5">
                Saisissez le code à 6 chiffres reçu par email :
              </label>

              <div className="flex items-center justify-between gap-2 sm:gap-3">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    disabled={isLoading || !!successMessage}
                    className={`w-11 sm:w-13 h-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 transition-all outline-hidden ${
                      digit
                        ? 'border-[#00A86B] bg-emerald-50/40 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 focus:border-[#00A86B] focus:bg-white'
                    } ${errorMessage ? 'border-rose-400 bg-rose-50/30' : ''}`}
                  />
                ))}
              </div>

              {/* Expiration Timer display */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {isCodeExpired ? (
                    <span className="text-rose-600 font-bold">Ce code a expiré.</span>
                  ) : (
                    <span>Expire dans : <strong className="font-mono text-slate-700 font-bold">{formatTime(expirationSeconds)}</strong></span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">Valable 10 minutes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || digits.some(d => d === '') || !!successMessage}
                className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.01]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Vérifier</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                {/* Resend button with 60s cooldown */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isResending || !!successMessage}
                  className="text-xs font-bold text-[#00A86B] hover:text-[#008f5a] disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {canResend ? 'Renvoyer le code' : `Renvoyer le code (${cooldown}s)`}
                  </span>
                </button>

                {/* Change email button */}
                <button
                  type="button"
                  onClick={() => navigate('auth')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Modifier mon adresse email
                </button>
              </div>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Vérifiez votre boîte de réception Gmail (et le dossier spams). Entrez les 6 chiffres reçus pour valider votre compte.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

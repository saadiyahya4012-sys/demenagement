import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import {
  generateTotpSecret,
  generateOtpAuthUri,
  verifyTotpCode,
  generateTotpCode
} from '../../services/totpService';
import {
  ShieldCheck,
  X,
  Copy,
  Check,
  Smartphone,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

interface Enable2FAModalProps {
  isOpen: boolean;
  userEmail: string;
  userName: string;
  onClose: () => void;
  onSuccess: (secret: string) => void;
}

export const Enable2FAModal: React.FC<Enable2FAModalProps> = ({
  isOpen,
  userEmail,
  userName,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [demoCode, setDemoCode] = useState('');

  // Generate secret & QR code on open
  useEffect(() => {
    if (isOpen) {
      const newSecret = generateTotpSecret(16);
      setSecret(newSecret);
      setStep('setup');
      setCode('');
      setErrorMsg('');
      setSuccessMsg('');
      setCopied(false);

      const otpauthUri = generateOtpAuthUri('MoovVert', userEmail || 'user@moovvert.com', newSecret);
      QRCode.toDataURL(otpauthUri, {
        width: 220,
        margin: 2,
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code error', err));

      // Optional helper to inspect current code in demo environment
      generateTotpCode(newSecret).then((c) => setDemoCode(c));
    }
  }, [isOpen, userEmail]);

  // Update live demo code if user needs preview
  useEffect(() => {
    if (secret) {
      const interval = setInterval(() => {
        generateTotpCode(secret).then((c) => setDemoCode(c));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [secret]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMsg('Veuillez entrer un code valide à 6 chiffres.');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyTotpCode(secret, code);
      if (isValid) {
        setSuccessMsg('✓ Authentification à deux facteurs activée.');
        setTimeout(() => {
          setIsVerifying(false);
          onSuccess(secret);
          onClose();
        }, 1200);
      } else {
        setIsVerifying(false);
        setErrorMsg('Code incorrect. Vérifiez Google Authenticator et réessayez.');
      }
    } catch (err) {
      setIsVerifying(false);
      setErrorMsg('Une erreur est survenue lors de la vérification. Réessayez.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {step === 'setup' ? 'Activer la 2FA' : 'Vérification'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'setup' ? 'Étape 1 sur 2' : 'Étape 2 sur 2'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'setup' ? (
              <motion.div
                key="step-setup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Configurez Google Authenticator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scannez ce QR code avec Google Authenticator ou une application TOTP compatible.
                  </p>
                </div>

                {/* QR Code display */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code 2FA"
                        className="w-44 h-44 rounded-xl"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center bg-slate-50 rounded-xl">
                        <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual entry fallback */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Impossible de scanner ?</span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-[#00A86B] hover:text-emerald-700 flex items-center gap-1 cursor-pointer text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier la clé</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono break-all bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Compte : MOOVVERT ({userEmail})</span>
                    <span className="font-bold tracking-wider text-slate-800">{secret}</span>
                  </div>
                </div>

                {/* Step 1 CTA button */}
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="step-verify"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerify}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Vérification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Entrez le code à 6 chiffres affiché dans Google Authenticator.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00A86B]" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* 6-digit input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                    Code de vérification (6 chiffres)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCode(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                  />
                </div>

                {/* Live Demo TOTP Helper badge */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Info className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                    <span>Code actuel de test :</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCode(demoCode)}
                    className="font-mono font-bold text-[#00A86B] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-emerald-200"
                    title="Cliquer pour insérer le code actuel"
                  >
                    {demoCode || '...'}
                  </button>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={code.length !== 6 || isVerifying || !!successMsg}
                    className={`w-full h-12 font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      code.length === 6 && !isVerifying && !successMsg
                        ? 'bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white shadow-emerald-600/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isVerifying ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Vérifier et activer</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('setup')}
                    disabled={isVerifying}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    ← Revoir le QR code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyTotpCode, generateTotpCode } from '../../services/totpService';
import {
  Lock,
  X,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  twoFactorEnabled,
  twoFactorSecret,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'passwords' | '2fa_verify'>('passwords');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // 2FA code step
  const [totpCode, setTotpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset states on open
  React.useEffect(() => {
    if (isOpen) {
      setStep('passwords');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTotpCode('');
      setErrorMsg('');
      setSuccessMsg('');
      setShowPasswords(false);

      if (twoFactorSecret) {
        generateTotpCode(twoFactorSecret).then((c) => setDemoCode(c));
      }
    }
  }, [isOpen, twoFactorSecret]);

  if (!isOpen) return null;

  // Step 1: Validate passwords
  const handlePasswordsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }

    // If 2FA is enabled, user MUST verify Google Authenticator code
    if (twoFactorEnabled && twoFactorSecret) {
      setStep('2fa_verify');
      setErrorMsg('');
    } else {
      // Complete change immediately if 2FA is not enabled
      completePasswordChange();
    }
  };

  // Step 2: Validate 2FA TOTP code
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (totpCode.length !== 6 || !/^\d{6}$/.test(totpCode)) {
      setErrorMsg('Veuillez entrer un code valide à 6 chiffres.');
      return;
    }

    if (!twoFactorSecret) {
      setErrorMsg('Erreur de configuration 2FA. Veuillez réactiver la 2FA.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isValid = await verifyTotpCode(twoFactorSecret, totpCode);
      if (isValid) {
        completePasswordChange();
      } else {
        setIsSubmitting(false);
        setErrorMsg('Code incorrect. Vérifiez Google Authenticator et réessayez.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Erreur de vérification. Veuillez réessayer.');
    }
  };

  const completePasswordChange = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('✓ Mot de passe modifié avec succès.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    }, 600);
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
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Modifier le mot de passe
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'passwords'
                  ? twoFactorEnabled
                    ? 'Étape 1 sur 2'
                    : 'Sécurité du compte'
                  : 'Étape 2 sur 2 : Vérification 2FA'}
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

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'passwords' ? (
              <motion.form
                key="step-passwords"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePasswordsSubmit}
                className="space-y-4"
              >
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mot de passe actuel <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00A86B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nouveau mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00A86B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmer le nouveau mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le nouveau mot de passe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00A86B]"
                  />
                </div>

                {twoFactorEnabled && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00A86B] shrink-0" />
                    <span>
                      La 2FA est activée sur votre compte : votre code Google Authenticator vous sera demandé à l'étape suivante.
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{twoFactorEnabled ? 'Continuer' : 'Modifier le mot de passe'}</span>
                    {twoFactorEnabled && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step-2fa"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handle2FASubmit}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-bold border border-emerald-200 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>2FA requise</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Code de vérification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Entrez le code à 6 chiffres de votre application d'authentification.
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

                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setTotpCode(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                  />
                </div>

                {/* Helper demo code */}
                {demoCode && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Info className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                      <span>Code actuel de test :</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTotpCode(demoCode)}
                      className="font-mono font-bold text-[#00A86B] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-emerald-200"
                      title="Cliquer pour insérer le code actuel"
                    >
                      {demoCode}
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={totpCode.length !== 6 || isSubmitting || !!successMsg}
                    className={`w-full h-12 font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      totpCode.length === 6 && !isSubmitting && !successMsg
                        ? 'bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white shadow-emerald-600/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Confirmer</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('passwords')}
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    ← Retour
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

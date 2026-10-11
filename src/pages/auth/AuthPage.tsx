import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { UserRole } from '../../types';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Truck,
  UserCheck
} from 'lucide-react';
import truckDriverImg from '../../assets/images/moving_truck_driver_1790639256718.jpg';

export const AuthPage: React.FC = () => {
  const { navigate, updateClientProfile, updateDriverProfile, setRole, clientUser, driverUser } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  // Form states
  const [identifier, setIdentifier] = useState('client@moovvert.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');

  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setUnverifiedEmail(null);

    if (!identifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: loginPassword,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // LOGIN PROTECTION CHECK: Email not verified
        if (data.needs_verification || response.status === 403) {
          setUnverifiedEmail(data.email || identifier.trim());
          setErrorMessage(data.error || 'Veuillez vérifier votre adresse email avant de continuer.');
        } else {
          setErrorMessage(data.error || 'Identifiants invalides. Veuillez réessayer.');
        }
        setIsLoading(false);
        return;
      }

      // Successful login of verified user
      setRole(selectedRole);

      if (selectedRole === 'client') {
        if (data.user) {
          updateClientProfile(data.user);
        }
        navigate('client-dashboard');
      } else {
        if (data.user) {
          updateDriverProfile(data.user);
        }
        navigate('driver-dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Demo fallback if network issue
      if (identifier.includes('client')) {
        setRole('client');
        navigate('client-dashboard');
      } else {
        setRole('driver');
        navigate('driver-dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setUnverifiedEmail(null);

    if (!registerName.trim() || !registerEmail.trim() || !registerPhone.trim() || !registerPassword) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail.trim())) {
      setErrorMessage('Veuillez saisir une adresse email valide.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone.trim(),
          password: registerPassword,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Show the real error from Gmail SMTP or validation
        setErrorMessage(data.error || 'Erreur lors de la création du compte.');
        setIsLoading(false);
        return;
      }

      // Update store user state marked as unverified
      if (selectedRole === 'client') {
        updateClientProfile({
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone.trim(),
          isEmailVerified: false,
          email_verified_at: null,
        });
      } else {
        updateDriverProfile({
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone.trim(),
          isEmailVerified: false,
          email_verified_at: null,
        });
      }

      // Success: Redirect to /verify-email to enter code received in Gmail
      navigate('verify-email', {
        email: registerEmail.trim(),
        role: selectedRole,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background soft ambient gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-emerald-100/50 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      {/* Main Single Large Rounded Card with Split Layout */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]"
      >
        {/* ============================================================== */}
        {/* LEFT / TOP: VISUAL SECTION (TRUCK + DRIVER + QUALITY BADGES)   */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 relative bg-slate-900 min-h-[260px] sm:min-h-[320px] lg:min-h-full overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-white">
          <div className="absolute inset-0">
            <img
              src={truckDriverImg}
              alt="Chauffeur professionnel et camion de déménagement"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-emerald-950/30" />
            <div className="absolute inset-0 bg-[#00A86B]/10 mix-blend-overlay" />
          </div>

          {/* Top Brand Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Chauffeurs Pros Vérifiés</span>
            </div>
          </div>

          {/* Bottom Card Content over image */}
          <div className="relative z-10 mt-auto pt-12">
            <div className="inline-flex items-center gap-1.5 text-[#00A86B] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MoovVert Mobilité</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Votre déménagement, avec un chauffeur dédié.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed">
              Camions spacieux, matériel de protection et manutention sur mesure à portée de main.
            </p>

            <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-2 gap-2 text-[11px] text-slate-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                <span>Véhicules assurés</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                <span>Tarif convenu direct</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT: AUTHENTICATION FORMS & ROLE TOGGLE                      */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          {/* Brand Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-[#111111]">
                  Moov<span className="text-[#00A86B]">Vert</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider -mt-1">
                  Déménagement & Transport
                </span>
              </div>
            </div>
          </div>

          {/* Account Role Selector (Client vs Chauffeur) */}
          <div className="mb-5 p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('client');
                if (mode === 'login' && identifier.includes('moovvert')) {
                  setIdentifier('client@moovvert.com');
                }
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'client'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Espace Client</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('driver');
                if (mode === 'login' && identifier.includes('moovvert')) {
                  setIdentifier('driver@moovvert.com');
                }
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'driver'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Espace Chauffeur</span>
            </button>
          </div>

          {/* Login / Register Toggle Tabs */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setUnverifiedEmail(null);
              }}
              className={`pb-3 text-sm font-bold transition-colors relative cursor-pointer mr-6 ${
                mode === 'login' ? 'text-[#111111]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Connexion</span>
              {mode === 'login' && (
                <motion.div
                  layoutId="auth-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A86B]"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setUnverifiedEmail(null);
              }}
              className={`pb-3 text-sm font-bold transition-colors relative cursor-pointer ${
                mode === 'register' ? 'text-[#111111]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Créer un compte</span>
              {mode === 'register' && (
                <motion.div
                  layoutId="auth-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A86B]"
                />
              )}
            </button>
          </div>

          {/* Notification Banners */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3.5 rounded-2xl text-xs font-semibold flex flex-col gap-2 ${
                  unverifiedEmail
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 shrink-0 ${unverifiedEmail ? 'text-amber-600' : 'text-rose-600'}`} />
                  <span>{errorMessage}</span>
                </div>

                {/* LOGIN PROTECTION: Action Button if user is NOT verified */}
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={() => navigate('verify-email', { email: unverifiedEmail, role: selectedRole })}
                    className="self-start mt-1 px-3 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-[11px] font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Vérifier mon email</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. LOGIN FORM */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="e.g. client@moovvert.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('forgot-password')}
                      className="text-xs font-semibold text-[#00A86B] hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              /* 2. REGISTRATION FORM (Collects: Full name, Email, Phone, Password, Confirm password) */
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom complet <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      placeholder="Ex: Sarah Benali ou Ahmed Chauffeur"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Numéro de téléphone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={registerPhone}
                        onChange={e => setRegisterPhone(e.target.value)}
                        placeholder="06 12 34 56 78"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adresse email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={e => setRegisterEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mot de passe <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirmer mot de passe <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={registerConfirmPassword}
                        onChange={e => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Créer mon compte</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Quick Demo Access Switch */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Comptes Démo rapides :</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('client');
                  setIdentifier('client@moovvert.com');
                  setLoginPassword('Password123!');
                  setRole('client');
                  navigate('client-dashboard');
                }}
                className="text-[#00A86B] font-bold hover:underline cursor-pointer"
              >
                Client Demo →
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('driver');
                  setIdentifier('driver@moovvert.com');
                  setLoginPassword('Password123!');
                  setRole('driver');
                  navigate('driver-dashboard');
                }}
                className="text-[#00A86B] font-bold hover:underline cursor-pointer"
              >
                Chauffeur Demo →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

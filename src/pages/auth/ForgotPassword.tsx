import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import truckDriverImg from '../../assets/images/moving_truck_driver_1790639256718.jpg';

export const ForgotPassword: React.FC = () => {
  const { navigate } = useAppStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email format validation helper
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }

    setIsLoading(true);

    try {
      await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
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
        className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]"
      >
        {/* ============================================================== */}
        {/* LEFT / TOP: HIGH QUALITY VISUAL SECTION (CONSISTENT IDENTITY) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 relative bg-slate-900 min-h-[220px] sm:min-h-[260px] lg:min-h-full overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-white">
          <div className="absolute inset-0">
            <img
              src={truckDriverImg}
              alt="Professional mover and modern truck"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-emerald-950/30" />
            <div className="absolute inset-0 bg-[#00A86B]/10 mix-blend-overlay" />
          </div>

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A86B]" />
              <span>MoovVert Security</span>
            </div>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 mt-auto pt-8">
            <div className="inline-flex items-center gap-1.5 text-[#00A86B] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Account Recovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Secure & quick password recovery.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed">
              We help you safely get back into your account in just a few clicks.
            </p>
            <div className="mt-4 pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#00A86B] shrink-0" />
              <span>Encrypted reset link sent directly to your inbox</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT / BOTTOM: FORGOT PASSWORD FORM / SUCCESS STATE          */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          {/* Brand Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18.5" r="2.5" />
                  <circle cx="7" cy="18.5" r="2.5" />
                </svg>
              </div>
              <span className="text-2xl font-black text-[#111111] tracking-tight">
                Moov<span className="text-[#00A86B]">Vert</span>
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              /* INPUT FORM STATE */
              <motion.div
                key="request-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                    Forgot your password?
                  </h1>
                  <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                    Enter your email address and we'll send you a password reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => navigate('auth')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#00A86B] transition-colors cursor-pointer py-1 px-2 rounded-lg"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* SUCCESS STATE */
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="py-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00A86B] flex items-center justify-center mb-5 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                  Check your email
                </h1>

                <p className="text-sm font-medium text-slate-600 mt-2.5 leading-relaxed">
                  We've sent a password reset link to your email address.
                </p>

                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Mail className="w-4 h-4 text-[#00A86B] shrink-0" />
                  <span className="truncate">{email}</span>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('auth')}
                    className="w-full h-12 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

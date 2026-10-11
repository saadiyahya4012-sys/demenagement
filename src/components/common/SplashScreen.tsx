import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';

export const SplashScreen: React.FC = () => {
  const { navigate } = useAppStore();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // After 2.6s, start the smooth full-screen fade out
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2600);

    // After fade-out completes (~3.0s total), navigate to auth
    const navTimer = setTimeout(() => {
      navigate('auth');
    }, 3050);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          className="relative w-screen h-screen bg-[#FFFFFF] overflow-hidden flex flex-col items-center justify-center select-none font-sans"
        >
          {/* Subtle minimal green top ambient backlight */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Central Hero Block: Logo + Name + Moving Truck + Road Accent */}
          <div className="relative flex flex-col items-center justify-center px-4 max-w-sm sm:max-w-md w-full">
            
            {/* BRAND LOGO EMBLEM (Smooth fade + scale when truck reaches center) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 1.25,
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1], // Natural elegant spring-like ease
              }}
              className="mb-3 flex items-center justify-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#00A86B] text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-50">
                {/* Modern Geometric Truck/Mobility SVG Emblem */}
                <svg
                  className="w-9 h-9 sm:w-11 sm:h-11 text-white"
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
            </motion.div>

            {/* APPLICATION NAME & SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.45,
                duration: 0.55,
                ease: 'easeOut',
              }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] flex items-center justify-center gap-0.5">
                Moov<span className="text-[#00A86B]">Vert</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">
                Move Easy. Move Smart.
              </p>
            </motion.div>

            {/* TRUCK HERO SECTION */}
            <div className="relative w-full flex flex-col items-center justify-center overflow-visible py-4">
              
              {/* TRUCK CONTAINER (Drives from left to center and stops naturally) */}
              <motion.div
                initial={{ x: -280, opacity: 0.7 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 1.5,
                  ease: [0.25, 1, 0.5, 1], // Smooth deceleration stopping right at center
                }}
                className="relative flex items-center justify-center"
              >
                {/* Subtle Motion Trail / Dust effect behind the truck */}
                <motion.div
                  initial={{ opacity: 0.7, scaleX: 1 }}
                  animate={{ opacity: 0, scaleX: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  className="absolute -left-12 bottom-3 flex flex-col gap-1 items-end pointer-events-none"
                >
                  <span className="w-10 h-[2px] bg-slate-200 rounded-full" />
                  <span className="w-6 h-[2px] bg-[#00A86B]/40 rounded-full" />
                  <span className="w-12 h-[2px] bg-slate-300 rounded-full" />
                  {/* Subtle dust puffs */}
                  <div className="flex gap-1 -mt-1 opacity-40">
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  </div>
                </motion.div>

                {/* Subtly animated vehicle body (slight driving vibration that settles) */}
                <motion.div
                  animate={{ y: [0, -1.5, 0] }}
                  transition={{
                    repeat: 5,
                    duration: 0.28,
                    ease: 'easeInOut',
                  }}
                  className="relative z-10"
                >
                  {/* PREMIUM MODERN MOVING TRUCK VECTOR SVG */}
                  <svg
                    className="w-52 sm:w-60 h-28 sm:h-32 drop-shadow-md"
                    viewBox="0 0 240 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="cargoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00A86B" />
                        <stop offset="100%" stopColor="#008f5a" />
                      </linearGradient>
                      <linearGradient id="cabinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#F8FAFC" />
                      </linearGradient>
                      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E0F2FE" />
                        <stop offset="100%" stopColor="#BAE6FD" />
                      </linearGradient>
                    </defs>

                    {/* Cargo Body - Clean Pro Moving Box */}
                    <rect
                      x="10"
                      y="18"
                      width="135"
                      height="68"
                      rx="7"
                      fill="url(#cargoGrad)"
                      stroke="#008f5a"
                      strokeWidth="2"
                    />

                    {/* Cargo Graphic Accent Strip (White modern stripe) */}
                    <rect x="10" y="44" width="135" height="15" fill="#FFFFFF" fillOpacity="0.95" />
                    {/* Brand wordmark on truck cargo */}
                    <text
                      x="34"
                      y="55"
                      fill="#00A86B"
                      fontSize="9.5"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontWeight="800"
                      letterSpacing="0.8"
                    >
                      MoovVert
                    </text>
                    {/* Furniture icon badge hint on cargo */}
                    <circle cx="24" cy="51.5" r="4.5" fill="#00A86B" />
                    <rect x="22" y="49.5" width="4" height="4" rx="0.5" fill="#FFFFFF" />

                    {/* Cabin Body - Sleek European Van/Truck Cabin */}
                    <path
                      d="M145 32H182L206 58V86H145V32Z"
                      fill="url(#cabinGrad)"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                    />

                    {/* Aerodynamic Windshield */}
                    <path
                      d="M178 37L200 58H152V37H178Z"
                      fill="url(#glassGrad)"
                      stroke="#93C5FD"
                      strokeWidth="1.5"
                    />

                    {/* Side Mirror */}
                    <rect x="176" y="52" width="4" height="8" rx="1.5" fill="#334155" />

                    {/* Pro Headlight (Crisp LED style) */}
                    <rect x="203" y="66" width="4" height="9" rx="2" fill="#FACC15" />

                    {/* Front Bumper */}
                    <rect x="198" y="77" width="12" height="9" rx="2.5" fill="#334155" />

                    {/* Under-chassis frame & side safety guard */}
                    <rect x="16" y="82" width="180" height="5" rx="1.5" fill="#1E293B" />
                    <rect x="75" y="77" width="42" height="3" rx="1" fill="#64748B" />

                    {/* REAR WHEEL (Animated Rotation with Motion) */}
                    <g transform="translate(48, 90)">
                      <motion.g
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 1080 }}
                        transition={{
                          duration: 1.5,
                          ease: [0.25, 1, 0.5, 1], // Smoothly decelerates to 0
                        }}
                      >
                        {/* Outer Tire */}
                        <circle cx="0" cy="0" r="17" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
                        {/* Metallic Rim */}
                        <circle cx="0" cy="0" r="10" fill="#E2E8F0" />
                        {/* Inner Green Cap */}
                        <circle cx="0" cy="0" r="4" fill="#00A86B" />
                        {/* Rim Spokes */}
                        <line x1="0" y1="-10" x2="0" y2="10" stroke="#94A3B8" strokeWidth="2" />
                        <line x1="-10" y1="0" x2="10" y2="0" stroke="#94A3B8" strokeWidth="2" />
                      </motion.g>
                    </g>

                    {/* FRONT WHEEL (Animated Rotation with Motion) */}
                    <g transform="translate(172, 90)">
                      <motion.g
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 1080 }}
                        transition={{
                          duration: 1.5,
                          ease: [0.25, 1, 0.5, 1], // Smoothly decelerates to 0
                        }}
                      >
                        {/* Outer Tire */}
                        <circle cx="0" cy="0" r="17" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
                        {/* Metallic Rim */}
                        <circle cx="0" cy="0" r="10" fill="#E2E8F0" />
                        {/* Inner Green Cap */}
                        <circle cx="0" cy="0" r="4" fill="#00A86B" />
                        {/* Rim Spokes */}
                        <line x1="0" y1="-10" x2="0" y2="10" stroke="#94A3B8" strokeWidth="2" />
                        <line x1="-10" y1="0" x2="10" y2="0" stroke="#94A3B8" strokeWidth="2" />
                      </motion.g>
                    </g>
                  </svg>
                </motion.div>
              </motion.div>

              {/* REINFORCING GREEN ANIMATED ROAD LINE UNDERNEATH */}
              <div className="relative w-full max-w-[280px] sm:max-w-xs h-1 mt-1 flex items-center justify-center">
                {/* Static light base track */}
                <div className="absolute w-full h-[1.5px] bg-[#F3F4F6] rounded-full" />
                
                {/* Subtle expanding vibrant green line */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  transition={{
                    delay: 0.35,
                    duration: 1.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute h-[2.5px] bg-gradient-to-r from-transparent via-[#00A86B] to-transparent rounded-full shadow-xs shadow-emerald-500/30"
                />

                {/* Subtle moving light pulse along the line */}
                <motion.div
                  initial={{ x: -120, opacity: 0 }}
                  animate={{ x: 120, opacity: [0, 1, 0] }}
                  transition={{
                    delay: 1.4,
                    duration: 1.1,
                    repeat: 1,
                    ease: 'easeInOut',
                  }}
                  className="w-12 h-[3px] bg-emerald-300 rounded-full blur-[1px]"
                />
              </div>
            </div>
          </div>

          {/* Quick Skip button for accessibility */}
          <button
            type="button"
            onClick={() => navigate('auth')}
            className="absolute bottom-8 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors py-1.5 px-3 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            Passer →
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

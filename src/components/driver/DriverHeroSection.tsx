import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { ArrowRight, Search, ShieldCheck, ShieldAlert } from 'lucide-react';
import heroTruckImg from '../../assets/images/hero_moving_truck_1790714079439.jpg';

interface DriverHeroSectionProps {
  displayName?: string;
  availableCount: number;
}

export const DriverHeroSection: React.FC<DriverHeroSectionProps> = ({
  displayName = 'Chauffeur Demo',
  availableCount = 0,
}) => {
  const { navigate, isDriverVerified, driverVerification } = useAppStore();

  const verifStatus = driverVerification?.verificationStatus || 'incomplete';

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 border border-slate-200/80 shadow-sm overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[420px] lg:min-h-[460px]">
        
        {/* LEFT COLUMN: Texts and CTA */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          
          {/* Small green label & Verification badge */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#00A86B] text-xs font-bold w-fit shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Espace Chauffeur Professionnel</span>
            </div>

            {isDriverVerified ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Chauffeur vérifié</span>
              </div>
            ) : verifStatus === 'pending' ? (
              <button
                type="button"
                onClick={() => {
                  navigate('driver-profile');
                  setTimeout(() => {
                    const el = document.getElementById('verification');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <span>🟡 Vérification en attente</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  navigate('driver-profile');
                  setTimeout(() => {
                    const el = document.getElementById('verification');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold shadow-2xs hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>🔴 Vérification incomplète</span>
              </button>
            )}
          </div>

          {/* Large headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.15]">
            Bonjour, {displayName} 👋<br />
            <span className="text-[#00A86B]">Prêt pour votre prochaine mission ?</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
            Découvrez les demandes de déménagement disponibles près de vous et proposez votre tarif.
          </p>

          {/* Primary green button: "Voir les demandes disponibles" with arrow icon */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('demandes-disponibles-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('available-requests');
                }
              }}
              className="h-13 px-7 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:shadow-xl hover:shadow-emerald-600/35 hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
              <span>Voir les demandes {availableCount > 0 ? `(${availableCount})` : ''}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 py-2 sm:py-0 sm:px-3">
              <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
              <span>0% commission d'entrée</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Realistic modern moving truck / MoovVert truck image */}
        <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full w-full overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-inner group">
            <img
              src={heroTruckImg}
              alt="Camion de déménagement MoovVert"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            {/* Subtle soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />

            {/* Floating Live Badge on image */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-black">
                🚛
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Camion vérifié & disponible</p>
                <p className="text-[11px] text-slate-500 font-medium">Prêt pour les trajets Ville à ville et Courses</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.section>
  );
};

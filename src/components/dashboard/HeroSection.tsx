import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { ArrowRight, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import heroTruckImg from '../../assets/images/hero_moving_truck_1790714079439.jpg';

export const HeroSection: React.FC = () => {
  const { navigate, clientUser } = useAppStore();
  const clientPhoto = clientUser.profileImage || clientUser.avatar;

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
          
          {/* Small green label + Client avatar snippet */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
              <img
                src={clientPhoto}
                alt={clientUser.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <span>Bonjour, {clientUser.name.split(' ')[0]} 👋</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#00A86B] text-xs font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Espace Client Particulier</span>
            </div>
          </div>

          {/* Large headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.15]">
            Votre déménagement,<br />
            <span className="text-[#00A86B]">simplement.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
            Trouvez un camion disponible et choisissez votre chauffeur au meilleur prix.
          </p>

          {/* Primary green button: "+ Créer une demande" with arrow icon */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('create-request')}
              className="h-13 px-7 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:shadow-xl hover:shadow-emerald-600/35 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Créer une demande</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 py-2 sm:py-0 sm:px-3">
              <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
              <span>Chauffeurs vérifiés</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Realistic modern moving truck + moving boxes */}
        <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full w-full overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-inner group">
            <img
              src={heroTruckImg}
              alt="Camion de déménagement moderne et professionnel"
              className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
            />
            {/* Subtle soft gradient edge overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Floating verification chip on image */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-2.5 text-xs text-slate-800 font-bold">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00A86B]" />
              <span>Camions 8m³ à 20m³ avec hayon & couvertures</span>
            </div>
          </div>
        </div>

      </div>
    </motion.section>
  );
};

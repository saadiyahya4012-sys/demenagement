import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { Star, Truck, Award, ShieldCheck, MapPin, MessageSquare } from 'lucide-react';

export interface DriverItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  truckType: string;
  truckCapacity: string;
  experienceYears: number;
  completedMoves: number;
  city: string;
}

interface DriverCardProps {
  driver: DriverItem;
  index: number;
}

export const DriverCard: React.FC<DriverCardProps> = ({ driver, index }) => {
  const { navigate } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top: Avatar + Name + Available Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={driver.avatar}
                alt={driver.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00A86B] rounded-full ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-[#111111]">{driver.name}</h3>
                <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{driver.city}</span>
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00A86B] text-[11px] font-bold shrink-0">
            Disponible
          </span>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-2xl bg-[#F8FAFC]">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="ml-1 text-xs font-bold text-slate-800">{driver.rating}</span>
          </div>
          <span className="text-xs text-slate-400">({driver.reviewCount} avis)</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
            Vérifié
          </span>
        </div>

        {/* Specs List */}
        <div className="space-y-2 text-xs text-slate-600 mb-6">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#00A86B]" />
              Type de camion
            </span>
            <span className="font-bold text-slate-800">{driver.truckType} ({driver.truckCapacity})</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#00A86B]" />
              Expérience
            </span>
            <span className="font-bold text-slate-800">{driver.experienceYears} ans</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Courses effectuées</span>
            <span className="font-bold text-[#00A86B]">{driver.completedMoves} déménagements</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button: Green "Contacter" */}
      <button
        type="button"
        onClick={() => navigate('chat')}
        className="w-full h-11 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-md hover:shadow-emerald-600/20"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Contacter</span>
      </button>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import {
  Calendar,
  Clock,
  Box,
  Banknote,
  ArrowRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import defaultThumbImg from '../../assets/images/furniture_box_items_1790714091954.jpg';

export interface RecentRequestItem {
  id: string;
  image?: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  volume: string;
  price: string;
  status: string;
  statusType: 'waiting' | 'offers' | 'confirmed';
}

interface RequestCardProps {
  request: RecentRequestItem;
  index: number;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, index }) => {
  const { navigate } = useAppStore();

  const getStatusBadge = () => {
    switch (request.statusType) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#00A86B] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {request.status}
          </span>
        );
      case 'offers':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {request.status}
          </span>
        );
      case 'waiting':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            {request.status}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Thumbnail + Route + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <img
              src={request.image || defaultThumbImg}
              alt="Mobilier déménagement"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#111111]">
                <span>{request.departure}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{request.destination}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>Trajet direct interurbain</span>
              </div>
            </div>
          </div>

          <div className="self-start sm:self-center">
            {getStatusBadge()}
          </div>
        </div>

        {/* Details Grid: Date, Time, Volume, Price */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F8FAFC]">
            <Calendar className="w-4 h-4 text-[#00A86B] shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
              <p className="font-bold text-slate-800">{request.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F8FAFC]">
            <Clock className="w-4 h-4 text-[#00A86B] shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Heure</p>
              <p className="font-bold text-slate-800">{request.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F8FAFC]">
            <Box className="w-4 h-4 text-[#00A86B] shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Volume</p>
              <p className="font-bold text-slate-800">{request.volume}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <Banknote className="w-4 h-4 text-[#00A86B] shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-700">Prix proposé</p>
              <p className="font-extrabold text-[#00A86B]">{request.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => navigate('my-requests')}
          className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Voir détails
        </button>

        {request.statusType === 'confirmed' ? (
          <button
            type="button"
            onClick={() => navigate('chat')}
            className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Contacter le chauffeur</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('offers')}
            className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Voir les offres</span>
            {request.statusType === 'offers' && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

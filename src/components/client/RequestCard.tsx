import React from 'react';
import { MovingRequest } from '../../types';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice, formatDate, formatVolume, getStatusBadge } from '../../utils/formatters';
import { MapPin, Calendar, Box, MessageCircle, ChevronRight, Users } from 'lucide-react';

interface RequestCardProps {
  request: MovingRequest;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const { navigate } = useAppStore();
  const statusInfo = getStatusBadge(request.status);
  const offersCount = request.offers.length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <div className="p-5 sm:p-6">
        {/* Top Header: Title & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">
              {request.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(request.scheduledDate)}</span>
              <span>·</span>
              <span>{request.scheduledTimeSlot}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0">
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
            <span className="text-slate-800">{statusInfo.label}</span>
          </div>
        </div>

        {/* Departure & Arrival visual path */}
        <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400">Départ</p>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {request.pickup.address}, {request.pickup.city}
              </p>
              <p className="text-[11px] text-slate-500">
                {request.pickup.floor === 0 ? 'RDC' : `${request.pickup.floor}e étage`}
                {request.pickup.hasElevator ? ' (avec ascenseur)' : ' (sans ascenseur)'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
              B
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400">Arrivée</p>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {request.dropoff.address}, {request.dropoff.city}
              </p>
              <p className="text-[11px] text-slate-500">
                {request.dropoff.floor === 0 ? 'RDC' : `${request.dropoff.floor}e étage`}
                {request.dropoff.hasElevator ? ' (avec ascenseur)' : ' (sans ascenseur)'}
              </p>
            </div>
          </div>
        </div>

        {/* Volume & Helpers stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block">Volume</span>
            <span className="font-bold text-slate-800 font-mono flex items-center justify-center gap-1">
              <Box className="w-3.5 h-3.5 text-emerald-600" />
              {formatVolume(request.totalVolumeM3)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block">Distance</span>
            <span className="font-bold text-slate-800 font-mono flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {request.distanceKm} km
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block">Aide portée</span>
            <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              {request.needHelpers === 0 ? 'Chauffeur seul' : `${request.needHelpers} aide(s)`}
            </span>
          </div>
        </div>

        {/* Price & Offers summary */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 block">Votre prix proposé</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {formatPrice(request.clientProposedPrice)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Propositions</span>
            {offersCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {offersCount} offre{offersCount > 1 ? 's' : ''} reçue{offersCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">En attente d'offres</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('request-details', { requestId: request.id })}
          className="text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          Voir détails complets
        </button>

        <div className="flex items-center gap-2">
          {request.status === 'accepted' && (
            <button
              type="button"
              onClick={() => navigate('chat', { requestId: request.id })}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Discuter</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (offersCount > 0) {
                navigate('offers', { requestId: request.id });
              } else {
                navigate('request-details', { requestId: request.id });
              }
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>{offersCount > 0 ? `Voir les offres (${offersCount})` : 'Détails'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

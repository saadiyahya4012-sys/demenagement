import React, { useState } from 'react';
import { MovingRequest } from '../../types';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice, formatDate, formatVolume } from '../../utils/formatters';
import { MakeOfferModal } from './MakeOfferModal';
import { VerificationRequiredModal } from './VerificationRequiredModal';
import { MapPin, Calendar, Box, Truck, CheckCircle2, ChevronRight, MessageSquare, Check } from 'lucide-react';

interface DriverRequestCardProps {
  request: MovingRequest;
}

export const DriverRequestCard: React.FC<DriverRequestCardProps> = ({ request }) => {
  const { driverUser, navigate, isDriverVerified } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  // Check if current driver already submitted an offer
  const myExistingOffer = request.offers.find(o => o.driverId === driverUser.id);
  const isAssignedToMe = request.assignedDriver?.id === driverUser.id;

  const handleOfferSuccess = () => {
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 3000);
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">
                Posté par {request.client.name} ({request.client.rating} ★)
              </span>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                {request.title}
              </h3>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block">Budget client</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {formatPrice(request.clientProposedPrice)}
              </span>
            </div>
          </div>

          {/* Route details */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                A
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {request.pickup.city}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({request.pickup.floor === 0 ? 'RDC' : `${request.pickup.floor}e`} {request.pickup.hasElevator ? 'asc.' : 'sans asc.'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                B
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {request.dropoff.city}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({request.dropoff.floor === 0 ? 'RDC' : `${request.dropoff.floor}e`} {request.dropoff.hasElevator ? 'asc.' : 'sans asc.'})
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Volume</span>
              <span className="font-bold text-slate-800 font-mono">
                {formatVolume(request.totalVolumeM3)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Distance</span>
              <span className="font-bold text-slate-800 font-mono">
                {request.distanceKm} km
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Date</span>
              <span className="font-bold text-slate-800">
                {formatDate(request.scheduledDate).split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Vehicle match indicator */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              Compatible avec votre {driverUser.vehicle?.model}
            </span>
          </div>

          {/* My existing offer indicator */}
          {myExistingOffer && (
            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900">
              <span>Votre offre déposée :</span>
              <span className="font-bold font-mono text-emerald-800">
                {formatPrice(myExistingOffer.offeredPrice)}
              </span>
            </div>
          )}

          {successBanner && (
            <div className="mt-2.5 p-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Proposition transmise au client !</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('driver-request-details', { requestId: request.id })}
            className="text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Consulter les détails
          </button>

          {isAssignedToMe ? (
            <button
              type="button"
              onClick={() => navigate('driver-chat', { requestId: request.id })}
              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Mission validée (Chat)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!isDriverVerified) {
                  setIsVerificationModalOpen(true);
                  return;
                }
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>{myExistingOffer ? 'Modifier mon offre' : 'Faire une offre'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      <MakeOfferModal
        request={request}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleOfferSuccess}
      />

      <VerificationRequiredModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </>
  );
};

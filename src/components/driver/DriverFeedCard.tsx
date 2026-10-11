import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { MovingRequest } from '../../types';
import { MakeOfferModal } from './MakeOfferModal';
import { VerificationRequiredModal } from './VerificationRequiredModal';
import {
  Calendar,
  Clock,
  Box,
  Banknote,
  ArrowRight,
  MapPin,
  Truck,
  Building,
  Navigation,
  CheckCircle2,
  Check
} from 'lucide-react';
import defaultThumbImg from '../../assets/images/furniture_box_items_1790714091954.jpg';

interface DriverFeedCardProps {
  request: MovingRequest;
  index: number;
}

export const DriverFeedCard: React.FC<DriverFeedCardProps> = ({ request, index }) => {
  const { navigate, driverUser, addDriverOffer, isDriverVerified } = useAppStore();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [offerSentBanner, setOfferSentBanner] = useState(false);

  // Check if current driver already submitted an offer or is assigned
  const myExistingOffer = request.offers.find(o => o.driverId === driverUser.id);
  const isAssignedToMe = request.assignedDriver?.id === driverUser.id;

  // Format date display
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Determine trip type label & icon
  const isCityToCity =
    request.tripType === 'city_to_city' ||
    (request.distanceKm && request.distanceKm > 30) ||
    request.pickup.city.toLowerCase() !== request.dropoff.city.toLowerCase();

  const handleOpenDetails = () => {
    navigate('driver-request-details', { requestId: request.id });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
      >
        <div>
          {/* Top Header: Thumbnail + Trip Type + Route + Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <img
                src={defaultThumbImg}
                alt="Mobilier déménagement"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
              />
              <div>
                {/* Trip Type Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-[#00A86B] border border-emerald-200/80">
                    {isCityToCity ? (
                      <>
                        <Truck className="w-3 h-3" />
                        <span>🚚 Ville à ville</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span>📍 Course</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    par {request.client.name}
                  </span>
                </div>

                {/* Departure → Destination */}
                <div className="flex items-center gap-2 text-base sm:text-lg font-black text-[#111111]">
                  <span>{request.pickup.city}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{request.dropoff.city}</span>
                </div>

                {/* Distance & Duration */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Navigation className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>
                    {request.distanceKm ? `${request.distanceKm} km` : 'Trajet direct'} •{' '}
                    {request.estimatedDriveDurationMinutes
                      ? Math.floor(request.estimatedDriveDurationMinutes / 60) > 0
                        ? `${Math.floor(request.estimatedDriveDurationMinutes / 60)} h ${request.estimatedDriveDurationMinutes % 60} min`
                        : `${request.estimatedDriveDurationMinutes} min`
                      : '1 h 10 min'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Badge / Status */}
            <div className="self-start sm:self-center flex flex-col items-start sm:items-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Prix proposé
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#00A86B] font-mono">
                {request.clientProposedPrice} DH
              </span>
            </div>
          </div>

          {/* Details Grid: Date & Time, Housing & Floors, Volume */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs sm:text-sm">
            {/* Date & Heure */}
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Date</p>
                <p className="font-bold text-[#111111] truncate">{formatDateLabel(request.scheduledDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Heure</p>
                <p className="font-bold text-[#111111] truncate">
                  {request.scheduledTimeSlot ? request.scheduledTimeSlot.split('(')[0] : '10:00'}
                </p>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Box className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Volume</p>
                <p className="font-bold text-[#111111]">{request.totalVolumeM3 || 10} m³</p>
              </div>
            </div>

            {/* Floors */}
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Étages</p>
                <p className="font-bold text-[#111111] truncate">
                  {request.pickup.floor === 0 ? 'RDC' : `Étage ${request.pickup.floor}`} → {request.dropoff.floor === 0 ? 'RDC' : `Étage ${request.dropoff.floor}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Offer Banner */}
        {offerSentBanner && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00A86B]" />
            <span>Offre envoyée avec succès au client !</span>
          </div>
        )}

        {/* Existing Offer / Assigned indicator */}
        {myExistingOffer && !isAssignedToMe && (
          <div className="mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center justify-between">
            <span>Votre offre : {myExistingOffer.offeredPrice} DH</span>
            <span className="text-[10px] font-bold text-amber-600 uppercase">En attente de réponse</span>
          </div>
        )}

        {isAssignedToMe && (
          <div className="mb-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
            <span>Vous avez été choisi pour cette mission !</span>
          </div>
        )}

        {/* Bottom Actions: "Voir détails →" & Quick Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenDetails}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Détails complets</span>
          </button>

          <div className="flex items-center gap-2">
            {!myExistingOffer && !isAssignedToMe && (
              <button
                type="button"
                onClick={() => {
                  if (!isDriverVerified) {
                    setIsVerificationModalOpen(true);
                    return;
                  }
                  addDriverOffer(
                    request.id,
                    request.clientProposedPrice,
                    `J'accepte votre tarif de ${request.clientProposedPrice} DH. Camion prêt et disponible pour ce trajet.`,
                    1
                  );
                  setOfferSentBanner(true);
                  setTimeout(() => setOfferSentBanner(false), 4000);
                }}
                className="h-9 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00A86B] text-xs font-bold transition-all cursor-pointer border border-emerald-200"
              >
                Accepter {request.clientProposedPrice} DH
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isDriverVerified) {
                  setIsVerificationModalOpen(true);
                  return;
                }
                setIsOfferModalOpen(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Faire une offre
            </button>

            <button
              type="button"
              onClick={handleOpenDetails}
              className="h-9 px-4 rounded-xl bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md"
            >
              <span>Voir détails</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Make Offer Modal */}
      <MakeOfferModal
        request={request}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={() => {
          setOfferSentBanner(true);
          setTimeout(() => setOfferSentBanner(false), 4000);
        }}
      />

      {/* Verification Required Modal */}
      <VerificationRequiredModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </>
  );
};

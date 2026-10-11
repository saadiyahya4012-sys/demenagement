import React, { useState } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice, formatDate, formatVolume, getStatusBadge } from '../../utils/formatters';
import { MakeOfferModal } from '../../components/driver/MakeOfferModal';
import { VerificationRequiredModal } from '../../components/driver/VerificationRequiredModal';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Box,
  Users,
  ShieldCheck,
  Star,
  Truck,
  MessageCircle,
  Check
} from 'lucide-react';

export const DriverRequestDetails: React.FC = () => {
  const { requests, selectedRequestId, driverUser, navigate, addDriverOffer, isDriverVerified } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [offerSentBanner, setOfferSentBanner] = useState(false);

  const request = requests.find(r => r.id === selectedRequestId) || requests[0];

  if (!request) {
    return (
      <DriverLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-sm text-slate-500">Demande introuvable.</p>
          <button
            type="button"
            onClick={() => navigate('available-requests')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Retour aux demandes
          </button>
        </div>
      </DriverLayout>
    );
  }

  const myOffer = request.offers.find(o => o.driverId === driverUser.id);
  const isAssignedToMe = request.assignedDriver?.id === driverUser.id;
  const statusInfo = getStatusBadge(request.status);

  return (
    <DriverLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('available-requests')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour aux demandes disponibles</span>
          </button>

          <span className="text-xs font-bold text-slate-800">
            Réf. #{request.id}
          </span>
        </div>

        {offerSentBanner && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg">
            <Check className="w-5 h-5 shrink-0" />
            <span>Votre proposition a bien été soumise au client !</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Demande de transport
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {request.title}
              </h1>

              {/* Client mini snippet */}
              <div className="flex items-center gap-3 mt-3">
                <img
                  src={request.client.avatar}
                  alt={request.client.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{request.client.name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{request.client.rating} ({request.client.reviewCount} avis)</span>
                    <span>·</span>
                    <span>{request.client.city}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Price Box & Action */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-left sm:text-right shrink-0 space-y-2">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  Budget proposé par le client
                </span>
                <span className="text-3xl font-black text-emerald-700 font-mono">
                  {formatPrice(request.clientProposedPrice)}
                </span>
              </div>

              {isAssignedToMe ? (
                <button
                  type="button"
                  onClick={() => navigate('driver-chat', { requestId: request.id })}
                  className="w-full px-4 py-2.5 bg-[#00A86B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ouvrir le Chat direct</span>
                </button>
              ) : (
                <div className="space-y-2">
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
                    }}
                    className="w-full px-4 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Accepter {request.clientProposedPrice} DH
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDriverVerified) {
                        setIsVerificationModalOpen(true);
                        return;
                      }
                      setIsModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    {myOffer ? 'Modifier mon offre' : 'Faire une contre-offre'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Current offer state */}
          {myOffer && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Vous avez proposé : {formatPrice(myOffer.offeredPrice)}</span>
                <p className="text-[11px] text-amber-700 mt-0.5">"{myOffer.message}"</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200 font-bold text-[10px] uppercase">
                {myOffer.status === 'accepted' ? 'Validé par le client' : 'En attente'}
              </span>
            </div>
          )}
        </div>

        {/* Route Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Itinéraire ({request.distanceKm} km · ~{request.estimatedDriveDurationMinutes} min)</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatDate(request.scheduledDate)}</span>
              <span>·</span>
              <span>{request.scheduledTimeSlot}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <span className="font-bold text-slate-900 uppercase text-[11px] block text-emerald-700">
                Point A - Chargement
              </span>
              <p className="font-bold text-slate-800 text-sm">{request.pickup.address}</p>
              <p className="text-slate-600">{request.pickup.postalCode} {request.pickup.city}</p>
              <p className="pt-2 text-slate-600">
                Étage {request.pickup.floor === 0 ? 'RDC' : request.pickup.floor} · Ascenseur :{' '}
                {request.pickup.hasElevator ? 'Oui' : 'Non'}
              </p>
              {request.pickup.accessNotes && (
                <p className="italic text-slate-500">"{request.pickup.accessNotes}"</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <span className="font-bold text-slate-900 uppercase text-[11px] block text-slate-700">
                Point B - Livraison
              </span>
              <p className="font-bold text-slate-800 text-sm">{request.dropoff.address}</p>
              <p className="text-slate-600">{request.dropoff.postalCode} {request.dropoff.city}</p>
              <p className="pt-2 text-slate-600">
                Étage {request.dropoff.floor === 0 ? 'RDC' : request.dropoff.floor} · Ascenseur :{' '}
                {request.dropoff.hasElevator ? 'Oui' : 'Non'}
              </p>
              {request.dropoff.accessNotes && (
                <p className="italic text-slate-500">"{request.dropoff.accessNotes}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Furniture Cargo List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-600" />
              <span>Inventaire du mobilier à charger</span>
            </h2>
            <span className="text-base font-black text-emerald-700 font-mono">
              Total : {formatVolume(request.totalVolumeM3)}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {request.items.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                    <span className="capitalize">{item.category}</span>
                    <span>·</span>
                    <span className="font-mono">~{item.volumeM3} m³</span>
                    {item.isHeavy && <span className="text-amber-700 font-semibold">· Lourd</span>}
                    {item.isFragile && <span className="text-rose-600 font-semibold">· Fragile</span>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900">Quantité : {item.quantity}</span>
                  <p className="text-emerald-700 font-mono text-[11px]">
                    {(item.quantity * item.volumeM3).toFixed(1)} m³
                  </p>
                </div>
              </div>
            ))}
          </div>

          {request.notes && (
            <div className="mt-3 p-3 bg-slate-50 rounded-2xl text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Remarques du client : </span>
              {request.notes}
            </div>
          )}
        </div>
      </div>

      <MakeOfferModal
        request={request}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setOfferSentBanner(true)}
      />

      <VerificationRequiredModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </DriverLayout>
  );
};

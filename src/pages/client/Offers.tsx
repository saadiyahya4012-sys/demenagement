import React, { useState } from 'react';
import { ClientLayout } from '../../layouts/ClientLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice, formatVolume } from '../../utils/formatters';
import {
  ChevronLeft,
  Truck,
  Star,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Offers: React.FC = () => {
  const { requests, selectedRequestId, acceptOffer, navigate } = useAppStore();
  const [acceptedNotice, setAcceptedNotice] = useState<string | null>(null);

  const request = requests.find(r => r.id === selectedRequestId) || requests[0];

  if (!request) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-sm text-slate-500">Demande introuvable.</p>
          <button
            type="button"
            onClick={() => navigate('my-requests')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Retour à mes demandes
          </button>
        </div>
      </ClientLayout>
    );
  }

  const handleAccept = (offerId: string, driverName: string) => {
    acceptOffer(request.id, offerId);
    setAcceptedNotice(`Félicitations ! Vous avez validé la proposition de ${driverName}.`);
    setTimeout(() => {
      navigate('chat', { requestId: request.id });
    }, 1200);
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('request-details', { requestId: request.id })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour aux détails de la demande</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            {request.offers.length} proposition{request.offers.length > 1 ? 's' : ''} reçue{request.offers.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Accepted Flash Banner */}
        {acceptedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{acceptedNotice} Redirection vers le chat...</span>
          </div>
        )}

        {/* Request Brief Summary Banner */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Votre demande
            </span>
            <h1 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {request.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              De {request.pickup.city} à {request.dropoff.city} · {formatVolume(request.totalVolumeM3)} · {request.scheduledDate}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-right shrink-0">
            <span className="text-[11px] text-emerald-800 font-medium block">
              Votre prix initial proposé
            </span>
            <span className="text-xl font-black text-emerald-700 font-mono">
              {formatPrice(request.clientProposedPrice)}
            </span>
          </div>
        </div>

        {/* Offers Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Propositions des chauffeurs disponibles
            </h2>
            <span className="text-xs text-slate-500">
              Choisissez le chauffeur qui vous convient le mieux
            </span>
          </div>

          {request.offers.length > 0 ? (
            <div className="space-y-4">
              {request.offers.map((offer, index) => {
                const isClientPrice = offer.offeredPrice === request.clientProposedPrice;
                const priceDiff = offer.offeredPrice - request.clientProposedPrice;
                const isAccepted = offer.status === 'accepted';

                return (
                  <div
                    key={offer.id}
                    className={`bg-white rounded-3xl border-2 transition-all p-5 sm:p-6 flex flex-col justify-between ${
                      isAccepted
                        ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                        : isClientPrice
                        ? 'border-emerald-300 hover:border-emerald-500 hover:shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Driver profile row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-start gap-4">
                          <img
                            src={offer.driver.avatar}
                            alt={offer.driver.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">
                                {offer.driver.name}
                              </h3>
                              {offer.driver.isVerified && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Vérifié
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                              <span className="flex items-center gap-1 font-bold text-amber-700">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {offer.driver.rating}
                              </span>
                              <span>({offer.driver.reviewCount} avis)</span>
                              <span>·</span>
                              <span>{offer.driver.completedMoves} courses</span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{offer.driver.vehicle?.typeName}</span>
                            </p>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left sm:text-right shrink-0">
                          <span className="text-[11px] text-slate-500 block">
                            Prix proposé par le chauffeur
                          </span>
                          <div className="flex sm:justify-end items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 font-mono">
                              {formatPrice(offer.offeredPrice)}
                            </span>
                            {isClientPrice ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Accepte votre prix
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                {priceDiff > 0 ? `+${priceDiff} €` : `${priceDiff} €`}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Durée estimée : ~{offer.estimatedDurationHours}h
                          </span>
                        </div>
                      </div>

                      {/* Equipment and helpers */}
                      <div className="py-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {offer.helpersCount === 0
                              ? 'Transport seul'
                              : `${offer.helpersCount} manutentionnaire(s) inclus`}
                          </span>
                        </span>

                        {offer.driver.vehicle?.hasTailgate && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hayon élévateur hydraulique</span>
                          </span>
                        )}

                        {offer.driver.vehicle?.equipment.slice(0, 2).map((eq, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-50 text-slate-600 border border-slate-200"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>

                      {/* Driver's Message */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-700 mb-4 border border-slate-100">
                        <span className="font-bold text-slate-900 block mb-1">
                          Message de {offer.driver.name} :
                        </span>
                        <p className="leading-relaxed italic">"{offer.message}"</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => navigate('chat', { requestId: request.id })}
                        className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Poser une question</span>
                      </button>

                      {isAccepted ? (
                        <div className="px-5 py-2.5 bg-[#00A86B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Chauffeur sélectionné</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAccept(offer.id, offer.driver.name)}
                          className="px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Choisir ce chauffeur ({offer.offeredPrice} DH)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">
                Aucune proposition pour le moment
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Les chauffeurs proches de votre trajet examinent actuellement votre demande. Vous recevrez une alerte dès qu'une offre est déposée.
              </p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

import React from 'react';
import { ClientLayout } from '../../layouts/ClientLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice, formatDate, formatVolume, getStatusBadge } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  Box,
  Users,
  ChevronLeft,
  Truck,
  MessageCircle,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const RequestDetails: React.FC = () => {
  const { requests, selectedRequestId, navigate } = useAppStore();

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

  const statusInfo = getStatusBadge(request.status);
  const offersCount = request.offers.length;

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('my-requests')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour à la liste</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`} />
            <span className="text-xs font-bold text-slate-800">{statusInfo.label}</span>
          </div>
        </div>

        {/* Main Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Réf. #{request.id}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {request.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {formatDate(request.scheduledDate)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {request.scheduledTimeSlot}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-right shrink-0">
              <span className="text-[11px] font-semibold text-emerald-800 block">
                Votre prix proposé
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {formatPrice(request.clientProposedPrice)}
              </span>
            </div>
          </div>

          {/* Quick Action Banner for Offers */}
          {offersCount > 0 && request.status !== 'completed' && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {offersCount} chauffeur{offersCount > 1 ? 's ont' : ' a'} répondu à votre proposition !
                </p>
                <p className="text-[11px] text-amber-700">
                  Comparez les tarifs, les équipements du camion et les avis clients.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('offers', { requestId: request.id })}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Examiner les propositions ({offersCount})
              </button>
            </div>
          )}

          {/* Assigned Driver Card if accepted */}
          {request.assignedDriver && (
            <div className="mt-4 p-5 rounded-2xl bg-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={request.assignedDriver.avatar}
                  alt={request.assignedDriver.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-400"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{request.assignedDriver.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-200 text-[10px] font-bold">
                      Chauffeur Attitré
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    {request.assignedDriver.vehicle?.typeName} · {request.assignedDriver.vehicle?.model}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-emerald-300 mt-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {request.assignedDriver.rating}
                    </span>
                    <span>({request.assignedDriver.reviewCount} avis)</span>
                    <span>·</span>
                    <span>{request.assignedDriver.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('chat', { requestId: request.id })}
                  className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Ouvrir le Chat direct</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Route Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Itinéraire & Conditions d'accès</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  A
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase">
                  Chargement (Départ)
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {request.pickup.address}
              </p>
              <p className="text-xs text-slate-600">
                {request.pickup.postalCode} {request.pickup.city}
              </p>
              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-semibold">Étage :</span>{' '}
                  {request.pickup.floor === 0 ? 'RDC' : `${request.pickup.floor}e étage`}
                </p>
                <p>
                  <span className="font-semibold">Ascenseur :</span>{' '}
                  {request.pickup.hasElevator ? 'Oui' : 'Non (escalier)'}
                </p>
                {request.pickup.accessNotes && (
                  <p className="text-[11px] text-slate-500 italic">
                    Note : "{request.pickup.accessNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Dropoff */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  B
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase">
                  Déchargement (Arrivée)
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {request.dropoff.address}
              </p>
              <p className="text-xs text-slate-600">
                {request.dropoff.postalCode} {request.dropoff.city}
              </p>
              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-semibold">Étage :</span>{' '}
                  {request.dropoff.floor === 0 ? 'RDC' : `${request.dropoff.floor}e étage`}
                </p>
                <p>
                  <span className="font-semibold">Ascenseur :</span>{' '}
                  {request.dropoff.hasElevator ? 'Oui' : 'Non (escalier)'}
                </p>
                {request.dropoff.accessNotes && (
                  <p className="text-[11px] text-slate-500 italic">
                    Note : "{request.dropoff.accessNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Furniture Items Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-600" />
              <span>Inventaire des meubles ({request.items.length} types)</span>
            </h2>

            <span className="text-sm font-black text-emerald-700 font-mono">
              Volume total : {formatVolume(request.totalVolumeM3)}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {request.items.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="capitalize">{item.category}</span>
                    <span>·</span>
                    <span className="font-mono">~{item.volumeM3} m³ unitaire</span>
                    {item.isHeavy && <span className="text-amber-700 font-semibold">· Lourd</span>}
                    {item.isFragile && <span className="text-rose-600 font-semibold">· Fragile</span>}
                    {item.needsDisassembly && <span className="text-blue-600 font-semibold">· À démonter</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    Quantité : {item.quantity}
                  </span>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    {(item.quantity * item.volumeM3).toFixed(1)} m³
                  </p>
                </div>
              </div>
            ))}
          </div>

          {request.notes && (
            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Consignes client : </span>
              {request.notes}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

import React, { useState } from 'react';
import { MovingRequest } from '../../types';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice } from '../../utils/formatters';
import { X, Sparkles, Check, Users, Truck } from 'lucide-react';

interface MakeOfferModalProps {
  request: MovingRequest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addDriverOffer, driverUser } = useAppStore();
  const [offeredPrice, setOfferedPrice] = useState<number>(request.clientProposedPrice);
  const [helpersCount, setHelpersCount] = useState<number>(request.needHelpers || 1);
  const [message, setMessage] = useState(
    `Bonjour ! Camion ${driverUser.vehicle?.capacityM3 || 20}m³ disponible. Je viens avec diable professionnel, sangles et couvertures de protection.`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDriverOffer(request.id, Number(offeredPrice), message, helpersCount);
    onSuccess();
    onClose();
  };

  const isClientPrice = Number(offeredPrice) === request.clientProposedPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-scale-up space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Négociation inDrive
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Faire une proposition de transport
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Brief */}
        <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-slate-900">{request.title}</p>
          <p className="text-slate-600">
            Trajet : {request.pickup.city} → {request.dropoff.city} ({request.distanceKm} km)
          </p>
          <div className="flex items-center justify-between pt-1 font-semibold text-slate-800">
            <span>Prix proposé par le client :</span>
            <span className="text-emerald-700 font-mono text-sm">
              {formatPrice(request.clientProposedPrice)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Votre proposition (DH)</span>
              {isClientPrice ? (
                <span className="text-[11px] font-bold text-[#00A86B]">
                  Prix proposé par le client
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700">
                  Contre-proposition ({Number(offeredPrice) > request.clientProposedPrice ? `+${Number(offeredPrice) - request.clientProposedPrice} DH` : `${Number(offeredPrice) - request.clientProposedPrice} DH`})
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="number"
                min="50"
                max="10000"
                step="10"
                required
                value={offeredPrice}
                onChange={e => setOfferedPrice(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-[#00A86B] rounded-2xl text-2xl font-black font-mono text-slate-900 focus:bg-white focus:outline-hidden"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                DH
              </span>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setOfferedPrice(request.clientProposedPrice)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isClientPrice
                    ? 'bg-[#00A86B] text-white border-[#00A86B] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Accepter à {request.clientProposedPrice} DH
              </button>

              <button
                type="button"
                onClick={() => setOfferedPrice(request.clientProposedPrice + 50)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                +50 DH
              </button>

              <button
                type="button"
                onClick={() => setOfferedPrice(request.clientProposedPrice + 100)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                +100 DH
              </button>
            </div>
          </div>

          {/* Helpers count */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Nombre de manutentionnaires inclus avec vous</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 0, label: '0 aide (Transport seul)' },
                { count: 1, label: '1 porteur (Vous)' },
                { count: 2, label: '2 porteurs (Vous + coéquipier)' },
              ].map(opt => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setHelpersCount(opt.count)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    helpersCount === opt.count
                      ? 'bg-emerald-50 border-[#00A86B] text-emerald-900 ring-1 ring-[#00A86B]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message au client */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message au client
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00A86B]"
              placeholder="Votre message au client..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Envoyer mon offre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

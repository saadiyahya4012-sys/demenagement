import React, { useState } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice, formatDate, formatVolume, getStatusBadge } from '../../utils/formatters';
import {
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight
} from 'lucide-react';

export const MyJobs: React.FC = () => {
  const { driverUser, requests, updateRequestStatus, navigate } = useAppStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const myJobs = requests.filter(r => r.assignedDriver?.id === driverUser.id);
  const activeJobs = myJobs.filter(r => r.status === 'accepted' || r.status === 'driver_confirmed' || r.status === 'in_progress');
  const completedJobs = myJobs.filter(r => r.status === 'completed');

  const displayedJobs = activeTab === 'active' ? activeJobs : completedJobs;

  const handleAdvanceStatus = (requestId: string, currentStatus: string) => {
    if (currentStatus === 'accepted' || currentStatus === 'driver_confirmed') {
      updateRequestStatus(requestId, 'in_progress');
    } else if (currentStatus === 'in_progress') {
      updateRequestStatus(requestId, 'completed');
    }
  };

  return (
    <DriverLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mes Missions de Déménagement
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gérez vos courses attribuées, contactez les clients et mettez à jour l'état du transport.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Missions à réaliser ({activeJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historique terminé ({completedJobs.length})
          </button>
        </div>

        {/* Jobs Feed */}
        {displayedJobs.length > 0 ? (
          <div className="space-y-4">
            {displayedJobs.map(job => {
              const statusInfo = getStatusBadge(job.status);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">#{job.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {job.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Tarif convenu</span>
                      <span className="text-xl font-black text-emerald-700 font-mono">
                        {formatPrice(job.clientProposedPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Route & Timing summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-800">Chargement :</p>
                      <p className="font-medium text-slate-900">{job.pickup.address}, {job.pickup.city}</p>
                      <p className="text-slate-500">
                        Étage {job.pickup.floor} · {job.pickup.hasElevator ? 'Ascenseur' : 'Escalier'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">Livraison :</p>
                      <p className="font-medium text-slate-900">{job.dropoff.address}, {job.dropoff.city}</p>
                      <p className="text-slate-500">
                        Étage {job.dropoff.floor} · {job.dropoff.hasElevator ? 'Ascenseur' : 'Escalier'}
                      </p>
                    </div>
                  </div>

                  {/* Client profile + communication */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={job.client.avatar}
                        alt={job.client.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{job.client.name}</p>
                        <p className="text-[11px] text-slate-500">{job.client.phone}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${job.client.phone}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Appeler</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => navigate('driver-chat', { requestId: job.id })}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Chat Client</span>
                      </button>

                      {(job.status === 'accepted' || job.status === 'driver_confirmed') && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(job.id, job.status)}
                          className="px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Commencer la mission</span>
                        </button>
                      )}

                      {job.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(job.id, 'in_progress')}
                          className="px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terminer la mission</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              {activeTab === 'active'
                ? 'Aucune mission en cours pour le moment'
                : 'Aucune mission terminée dans l\'historique'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Explorez les demandes de transport disponibles pour décrocher de nouvelles missions.
            </p>
            <button
              type="button"
              onClick={() => navigate('available-requests')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Voir les demandes disponibles
            </button>
          </div>
        )}
      </div>
    </DriverLayout>
  );
};

import React, { useState } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { DriverRequestCard } from '../../components/driver/DriverRequestCard';
import { Search, Filter, Box, MapPin, Truck } from 'lucide-react';

export const AvailableRequests: React.FC = () => {
  const { requests } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [volumeFilter, setVolumeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [helperFilter, setHelperFilter] = useState<'all' | 'solo' | 'helpers'>('all');

  const availableRequests = requests.filter(r => r.status === 'open' || r.status === 'offers_received');

  const filteredRequests = availableRequests.filter(req => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCity = req.pickup.city.toLowerCase().includes(q) || req.dropoff.city.toLowerCase().includes(q);
      const matchTitle = req.title.toLowerCase().includes(q);
      if (!matchCity && !matchTitle) return false;
    }

    // Volume
    if (volumeFilter === 'small' && req.totalVolumeM3 > 5) return false;
    if (volumeFilter === 'medium' && (req.totalVolumeM3 <= 5 || req.totalVolumeM3 > 12)) return false;
    if (volumeFilter === 'large' && req.totalVolumeM3 <= 12) return false;

    // Helpers
    if (helperFilter === 'solo' && req.needHelpers > 0) return false;
    if (helperFilter === 'helpers' && req.needHelpers === 0) return false;

    return true;
  });

  return (
    <DriverLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Demandes de Déménagement Disponibles
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {availableRequests.length} annonces de transport publiées dans votre région. Proposez votre tarif librement.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrer par ville ou quartier (ex: Lyon 3, Villeurbanne...)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Volume segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setVolumeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  volumeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tous volumes
              </button>
              <button
                type="button"
                onClick={() => setVolumeFilter('small')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  volumeFilter === 'small' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                &lt; 5 m³ (Meuble seul)
              </button>
              <button
                type="button"
                onClick={() => setVolumeFilter('medium')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  volumeFilter === 'medium' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                5 à 12 m³ (T1 / T2)
              </button>
              <button
                type="button"
                onClick={() => setVolumeFilter('large')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  volumeFilter === 'large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                &gt; 12 m³ (Grand volume)
              </button>
            </div>
          </div>
        </div>

        {/* Requests Feed */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map(req => (
              <DriverRequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : availableRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Aucune demande disponible pour le moment.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Dès qu'un client publie une nouvelle demande de transport ou déménagement, elle apparaîtra ici en temps réel.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Aucune course ne correspond à vos filtres
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Modifiez vos critères de recherche ou réinitialisez les filtres.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setVolumeFilter('all');
                setHelperFilter('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </DriverLayout>
  );
};

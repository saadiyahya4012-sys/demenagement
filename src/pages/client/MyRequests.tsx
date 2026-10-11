import React, { useState } from 'react';
import { ClientLayout } from '../../layouts/ClientLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { RequestCard } from '../../components/client/RequestCard';
import { PlusCircle, Search, Filter } from 'lucide-react';

type FilterTab = 'all' | 'open' | 'accepted' | 'completed';

export const MyRequests: React.FC = () => {
  const { clientUser, requests, navigate } = useAppStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const clientRequests = requests.filter(r => r.clientId === clientUser.id);

  const filteredRequests = clientRequests.filter(req => {
    // Tab filter
    if (activeTab === 'open' && req.status !== 'open' && req.status !== 'offers_received') return false;
    if (activeTab === 'accepted' && req.status !== 'accepted' && req.status !== 'in_progress') return false;
    if (activeTab === 'completed' && req.status !== 'completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchPickup = req.pickup.city.toLowerCase().includes(q) || req.pickup.address.toLowerCase().includes(q);
      const matchDropoff = req.dropoff.city.toLowerCase().includes(q) || req.dropoff.address.toLowerCase().includes(q);
      return matchTitle || matchPickup || matchDropoff;
    }

    return true;
  });

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Title + Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mes Déménagements
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Retrouvez l'historique complet de vos demandes de transport et négociation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('create-request')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle demande</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Tab Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes ({clientRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('open')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'open'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En attente d'offres (
              {clientRequests.filter(r => r.status === 'open' || r.status === 'offers_received').length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('accepted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'accepted'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chauffeur validé (
              {clientRequests.filter(r => r.status === 'accepted' || r.status === 'in_progress').length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terminées ({clientRequests.filter(r => r.status === 'completed').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une adresse..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Requests Feed */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map(req => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : clientRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
              <PlusCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Vous n'avez encore aucune demande.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Publiez votre première demande de déménagement en quelques étapes faciles.
            </p>
            <button
              type="button"
              onClick={() => navigate('create-request')}
              className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>+ Nouvelle demande</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Aucun déménagement correspondant
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Essayez de changer les filtres ou publiez une nouvelle annonce de transport.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

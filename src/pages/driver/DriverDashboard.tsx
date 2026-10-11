import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { DriverNavbar } from '../../components/driver/DriverNavbar';
import { DriverHeroSection } from '../../components/driver/DriverHeroSection';
import { DriverStatCard } from '../../components/driver/DriverStatCard';
import { DriverFeedCard } from '../../components/driver/DriverFeedCard';
import { Footer } from '../../components/dashboard/Footer';
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Star,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  User,
  Radio,
  AlertTriangle
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { driverUser, requests, navigate, isDriverVerified, driverVerification } = useAppStore();

  // Status toggle: Disponible / Indisponible
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Filter: 'all' | 'city_to_city' | 'local'
  const [filterType, setFilterType] = useState<'all' | 'city_to_city' | 'local'>('all');

  // Sorting
  const [sortBy, setSortBy] = useState<'recent' | 'price_desc' | 'volume_desc'>('recent');

  const displayName = driverUser?.name || 'Chauffeur Demo';

  // 1. Available requests calculation (status 'open' or 'offers_received')
  const openRequests = requests.filter(
    r => r.status === 'open' || r.status === 'offers_received'
  );

  // Filtered requests according to selected filter
  const filteredRequests = openRequests.filter(r => {
    if (filterType === 'all') return true;
    const isInterCity =
      r.tripType === 'city_to_city' ||
      (r.distanceKm && r.distanceKm > 30) ||
      r.pickup.city.toLowerCase() !== r.dropoff.city.toLowerCase();

    if (filterType === 'city_to_city') return isInterCity;
    if (filterType === 'local') return !isInterCity;
    return true;
  });

  // Sorted requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'price_desc') return b.clientProposedPrice - a.clientProposedPrice;
    if (sortBy === 'volume_desc') return b.totalVolumeM3 - a.totalVolumeM3;
    // Default recent
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 2. Assigned / Missions in progress
  const myAssignedMissions = requests.filter(
    r => r.assignedDriver?.id === driverUser.id || (r.status === 'driver_confirmed' || r.status === 'accepted' || r.status === 'in_progress')
  );

  // 4 Driver statistics dynamic or clean:
  const stats = [
    {
      icon: Search,
      title: 'Demandes disponibles',
      number: String(openRequests.length),
      badgeText: openRequests.length > 0 ? `+${openRequests.length} disponible${openRequests.length > 1 ? 's' : ''}` : 'À jour',
      badgeType: 'green' as const,
    },
    {
      icon: Truck,
      title: 'Missions en cours',
      number: String(myAssignedMissions.length),
      badgeText: myAssignedMissions.length > 0 ? `${myAssignedMissions.length} active${myAssignedMissions.length > 1 ? 's' : ''}` : 'Aucune mission',
      badgeType: 'blue' as const,
    },
    {
      icon: TrendingUp,
      title: 'Revenus du mois',
      number: `${myAssignedMissions.reduce((acc, m) => acc + (m.clientProposedPrice || 0), 0)} DH`,
      badgeText: myAssignedMissions.length > 0 ? 'Missions confirmées' : '0 DH',
      badgeType: 'green' as const,
    },
    {
      icon: Star,
      title: 'Note moyenne',
      number: `${driverUser.rating || 4.9} ⭐`,
      badgeText: `${driverUser.reviewCount || 124} avis`,
      badgeType: 'neutral' as const,
    },
  ];

  // Prochaines missions from real shared store
  const upcomingMissions = myAssignedMissions.map((m) => {
    let statusLabel = 'À venir';
    let statusType: 'active' | 'upcoming' = 'upcoming';
    if (m.status === 'in_progress') {
      statusLabel = 'En cours';
      statusType = 'active';
    } else if (m.status === 'driver_confirmed' || m.status === 'accepted') {
      statusLabel = 'Confirmée';
      statusType = 'active';
    }

    return {
      id: m.id,
      route: `${m.pickup?.city || 'Départ'} → ${m.dropoff?.city || 'Arrivée'}`,
      timeSlot: m.scheduledTimeSlot || '10:00',
      status: statusLabel,
      statusType,
      client: m.client?.name || 'Client',
      volume: `${m.totalVolumeM3 || 10} m³`,
    };
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* TOP NAVIGATION */}
      <DriverNavbar activeTab="Tableau de bord" />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        
        {/* WARNING BANNER: If profile is not verified */}
        {!isDriverVerified && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-400/80 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <span>⚠️ Votre profil chauffeur n'est pas encore vérifié.</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                    {driverVerification?.verificationStatus === 'pending' ? 'Dossier en attente' : 'Action requise'}
                  </span>
                </h4>
                <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl font-medium">
                  Pour garantir la sécurité des clients, vous devez renseigner votre CIN, permis de conduire et carte grise avant de pouvoir accepter des demandes ou faire des offres.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate('driver-profile');
                setTimeout(() => {
                  const section = document.getElementById('verification');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>Compléter la vérification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WELCOME HERO */}
        <DriverHeroSection displayName={displayName} availableCount={openRequests.length} />

        {/* 4 DRIVER STATISTICS CARDS */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <DriverStatCard
                key={stat.title}
                index={idx}
                icon={stat.icon}
                title={stat.title}
                number={stat.number}
                badgeText={stat.badgeText}
                badgeType={stat.badgeType}
              />
            ))}
          </div>
        </section>

        {/* MAIN TWO-COLUMN SECTION: Feed on left (8 cols) + Driver status & Missions on right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: DEMANDES DISPONIBLES (8 cols)                 */}
          {/* ========================================================= */}
          <section id="demandes-disponibles-section" className="lg:col-span-8 space-y-6">
            
            {/* Section Header & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  Demandes disponibles
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Nouvelles demandes de déménagement près de vous.
                </p>
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-400">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="price_desc">Prix le plus élevé</option>
                  <option value="volume_desc">Volume (m³)</option>
                </select>
              </div>
            </div>

            {/* Filter Pills: Toutes / Ville à ville / Course */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#00A86B] text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Toutes ({openRequests.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('city_to_city')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'city_to_city'
                    ? 'bg-[#00A86B] text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>🚚 Ville à ville</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('local')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'local'
                    ? 'bg-[#00A86B] text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>📍 Course</span>
              </button>
            </div>

            {/* Request Cards Feed */}
            {sortedRequests.length > 0 ? (
              <div className="space-y-4">
                {sortedRequests.map((req, idx) => (
                  <DriverFeedCard key={req.id} request={req} index={idx} />
                ))}
              </div>
            ) : openRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
                  <Truck className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Aucune demande disponible pour le moment.
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dès qu'un client publie une nouvelle demande, elle apparaîtra ici avec son trajet, volume et budget proposé.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Aucune demande dans cette catégorie
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Toutes les demandes ont été pourvues ou n'ont pas encore été publiées.
                </p>
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className="px-4 py-2 bg-[#00A86B] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Voir toutes les demandes
                </button>
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: SIDEBAR CARDS (4 cols)                       */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* 1. DRIVER STATUS CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mon statut
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    isAvailable
                      ? 'bg-emerald-50 text-[#00A86B] border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAvailable ? 'bg-[#00A86B] animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span>{isAvailable ? '🟢 Disponible' : '🔴 Indisponible'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {isAvailable
                  ? 'Vous recevez les nouvelles demandes de déménagement.'
                  : 'Vous ne recevrez plus de nouvelles demandes.'}
              </p>

              {/* Toggle switch button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-full h-11 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isAvailable
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-[#00A86B] hover:bg-[#008f5a] text-white shadow-emerald-600/20'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>
                    {isAvailable ? 'Passer en Indisponible' : 'Passer en Disponible'}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* 2. PROCHAINES MISSIONS CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#111111]">
                    Prochaines missions
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-black flex items-center justify-center">
                    {upcomingMissions.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('my-jobs')}
                  className="text-xs font-bold text-[#00A86B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Tout voir</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Missions list */}
              <div className="space-y-3">
                {upcomingMissions.length > 0 ? (
                  upcomingMissions.map((mission) => (
                    <div
                      key={mission.id}
                      onClick={() => navigate('my-jobs')}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-black text-slate-900 group-hover:text-[#00A86B] transition-colors">
                          {mission.route}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mission.statusType === 'active'
                              ? 'bg-emerald-100 text-[#00A86B]'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              mission.statusType === 'active' ? 'bg-[#00A86B]' : 'bg-sky-600'
                            }`}
                          />
                          <span>{mission.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{mission.timeSlot}</span>
                        </span>
                        <span>{mission.volume}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-700">Aucune mission confirmée</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Faites des offres sur les demandes pour obtenir vos premières courses.
                    </p>
                  </div>
                )}
              </div>

              {/* View missions button */}
              <button
                type="button"
                onClick={() => navigate('my-jobs')}
                className="w-full h-11 mt-1 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Voir mes missions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* 3. QUICK ACTIONS CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Mes actions rapides
              </h3>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => navigate('my-jobs')}
                  className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#00A86B]" />
                    <span>Voir mes missions</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#00A86B] transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('driver-chat')}
                  className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-[#00A86B]" />
                    <span>Messages</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#00A86B] transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('driver-profile')}
                  className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#00A86B]" />
                    <span>Modifier mon profil</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#00A86B] transition-all" />
                </button>
              </div>
            </motion.div>

          </aside>
        </div>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

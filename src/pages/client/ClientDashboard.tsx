import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../hooks/useAppStore';
import { Navbar } from '../../components/dashboard/Navbar';
import { HeroSection } from '../../components/dashboard/HeroSection';
import { StatCard } from '../../components/dashboard/StatCard';
import { RequestCard, RecentRequestItem } from '../../components/dashboard/RequestCard';
import { DriverCard, DriverItem } from '../../components/dashboard/DriverCard';
import { Footer } from '../../components/dashboard/Footer';
import {
  FileText,
  BadgePercent,
  CheckCircle2,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import furnitureImg from '../../assets/images/furniture_box_items_1790714091954.jpg';

export const ClientDashboard: React.FC = () => {
  const { navigate, requests, clientUser, messages } = useAppStore();

  // Filter requests belonging to this client (or all created requests)
  const clientRequests = requests.filter(r => r.clientId === clientUser.id || !r.clientId);

  const pendingRequestsCount = clientRequests.filter(
    r => r.status === 'open' || r.status === 'offers_received'
  ).length;

  const totalOffersCount = clientRequests.reduce((sum, r) => sum + (r.offers?.length || 0), 0);

  const completedCount = clientRequests.filter(r => r.status === 'completed').length;

  const totalMessagesCount = Object.values(messages).reduce((sum, list) => sum + list.length, 0);

  // Dynamic statistics:
  const stats = [
    {
      icon: FileText,
      title: 'Demandes en cours',
      number: String(pendingRequestsCount),
    },
    {
      icon: BadgePercent,
      title: 'Offres reçues',
      number: String(totalOffersCount),
    },
    {
      icon: CheckCircle2,
      title: 'Déménagements terminés',
      number: String(completedCount),
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      number: String(totalMessagesCount),
    },
  ];

  // Map real requests to RecentRequestItem
  const recentRequests: RecentRequestItem[] = clientRequests.slice(0, 5).map(req => {
    let statusText = "En attente d'offres";
    let statusType: 'waiting' | 'offers' | 'confirmed' = 'waiting';

    if (req.status === 'accepted' || req.status === 'driver_confirmed') {
      statusText = 'Chauffeur confirmé';
      statusType = 'confirmed';
    } else if (req.offers && req.offers.length > 0) {
      statusText = `${req.offers.length} offre${req.offers.length > 1 ? 's' : ''} reçue${req.offers.length > 1 ? 's' : ''}`;
      statusType = 'offers';
    } else if (req.status === 'in_progress') {
      statusText = 'En cours';
      statusType = 'confirmed';
    } else if (req.status === 'completed') {
      statusText = 'Terminé';
      statusType = 'confirmed';
    }

    return {
      id: req.id,
      departure: req.pickup?.city || 'Départ',
      destination: req.dropoff?.city || 'Arrivée',
      date: req.scheduledDate || 'Date à convenir',
      time: req.scheduledTimeSlot || '10:00',
      volume: `${req.totalVolumeM3 || 10} m³`,
      price: `${req.clientProposedPrice} DH`,
      status: statusText,
      statusType,
      image: furnitureImg,
    };
  });

  // 3 Available Drivers requested:
  const availableDrivers: DriverItem[] = [
    {
      id: 'driver-omar',
      name: 'Omar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      rating: 4.8,
      reviewCount: 124,
      truckType: 'Camion',
      truckCapacity: '20m³',
      experienceYears: 5,
      completedMoves: 120,
      city: 'Rabat',
    },
    {
      id: 'driver-karim',
      name: 'Karim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      rating: 4.6,
      reviewCount: 89,
      truckType: 'Camion',
      truckCapacity: '12m³',
      experienceYears: 3,
      completedMoves: 85,
      city: 'Casablanca',
    },
    {
      id: 'driver-ahmed',
      name: 'Ahmed',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
      rating: 4.9,
      reviewCount: 156,
      truckType: 'Camion',
      truckCapacity: '8m³',
      experienceYears: 6,
      completedMoves: 200,
      city: 'Tanger',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* TOP NAVBAR */}
      <Navbar activeTab="Accueil" />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        
        {/* HERO SECTION */}
        <HeroSection />

        {/* STATISTICS SECTION */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((stat, idx) => (
              <StatCard
                key={stat.title}
                icon={stat.icon}
                title={stat.title}
                number={stat.number}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* RECENT REQUESTS SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                Mes demandes récentes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Suivez l'avancement de vos demandes de déménagement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('my-requests')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#00A86B] hover:text-[#008f5a] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Voir toutes mes demandes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Large Request Cards or Empty State */}
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request, idx) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Vous n'avez encore aucune demande
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Publiez votre premier déménagement en quelques clics pour recevoir les offres des chauffeurs.
              </p>
              <button
                type="button"
                onClick={() => navigate('create-request')}
                className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>+ Nouvelle demande</span>
              </button>
            </div>
          )}
        </section>

        {/* AVAILABLE DRIVERS SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                Chauffeurs disponibles
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Des chauffeurs fiables et vérifiés, prêts à vous aider.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('offers')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#00A86B] hover:text-[#008f5a] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Voir tous les chauffeurs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Driver Cards in 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableDrivers.map((driver, idx) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                index={idx}
              />
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

import React from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  User,
  Truck,
  Briefcase,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { role, currentRoute, navigate } = useAppStore();

  if (role === 'client') {
    const tabs = [
      {
        id: 'client-dashboard',
        label: 'Accueil',
        icon: LayoutDashboard,
        route: 'client-dashboard' as const,
        isActive: currentRoute === 'client-dashboard',
      },
      {
        id: 'create-request',
        label: 'Créer',
        icon: PlusCircle,
        route: 'create-request' as const,
        isActive: currentRoute === 'create-request',
        highlight: true,
      },
      {
        id: 'my-requests',
        label: 'Demandes',
        icon: Package,
        route: 'my-requests' as const,
        isActive:
          currentRoute === 'my-requests' ||
          currentRoute === 'request-details' ||
          currentRoute === 'offers' ||
          currentRoute === 'chat',
      },
      {
        id: 'client-profile',
        label: 'Profil',
        icon: User,
        route: 'client-profile' as const,
        isActive: currentRoute === 'client-profile',
      },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.route)}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                  tab.isActive
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      tab.isActive ? 'scale-110 text-emerald-600' : 'text-slate-600'
                    }`}
                  />
                  {tab.highlight && !tab.isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  )}
                </div>
                <span className="text-[11px] font-medium tracking-tight mt-1">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Driver tabs
  const driverTabs = [
    {
      id: 'driver-dashboard',
      label: 'Accueil',
      icon: LayoutDashboard,
      route: 'driver-dashboard' as const,
      isActive: currentRoute === 'driver-dashboard',
    },
    {
      id: 'available-requests',
      label: 'Disponibles',
      icon: Truck,
      route: 'available-requests' as const,
      isActive: currentRoute === 'available-requests' || currentRoute === 'driver-request-details',
      highlight: true,
    },
    {
      id: 'my-jobs',
      label: 'Missions',
      icon: Briefcase,
      route: 'my-jobs' as const,
      isActive: currentRoute === 'my-jobs' || currentRoute === 'driver-chat',
    },
    {
      id: 'driver-profile',
      label: 'Mon Camion',
      icon: User,
      route: 'driver-profile' as const,
      isActive: currentRoute === 'driver-profile',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
        {driverTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.route)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                tab.isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    tab.isActive ? 'scale-110 text-emerald-600' : 'text-slate-600'
                  }`}
                />
                {tab.highlight && !tab.isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
              <span className="text-[11px] font-medium tracking-tight mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

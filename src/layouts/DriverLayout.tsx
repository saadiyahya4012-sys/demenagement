import React, { ReactNode } from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { useAppStore } from '../hooks/useAppStore';
import { ShieldCheck, Truck } from 'lucide-react';

interface DriverLayoutProps {
  children: ReactNode;
}

export const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  const { driverUser } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header />
      
      {/* Top Driver Status Banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Chauffeur Actif en ligne</span>
            <span className="hidden sm:inline text-emerald-300">· Prêt à recevoir des courses à Lyon & alentours</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline font-mono">{driverUser.vehicle?.typeName}</span>
            <span className="flex items-center gap-1 text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assuré Pro</span>
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-20 md:pb-12">
        {children}
      </main>
      
      <BottomNav />
      
      {/* Quiet desktop footer */}
      <footer className="hidden md:block py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MoovVert Chauffeurs</span>
            <span>·</span>
            <span>0% de commission d'entrée · Négociation 100% libre</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Paiement direct sécurisé
            </span>
            <span>·</span>
            <span>Assistance logistique</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

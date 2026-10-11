import React, { ReactNode } from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header />
      <main className="flex-1 pb-20 md:pb-12">
        {children}
      </main>
      <BottomNav />
      
      {/* Quiet desktop footer */}
      <footer className="hidden md:block py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MoovVert</span>
            <span>·</span>
            <span>Transport & déménagement de meubles direct</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <span>Tarification transparente</span>
            <span>·</span>
            <span>Assurance transport incluse</span>
            <span>·</span>
            <span>Support réactif 7j/7</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

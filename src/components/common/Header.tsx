import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { Truck, PlusCircle, LogOut, User as UserIcon, ChevronDown, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { role, currentRoute, navigate, clientUser, driverUser, switchMode, resetAllData, signOut } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Strictly separated profile photo resolution
  const activeUserPhoto = role === 'client'
    ? (clientUser.profileImage || clientUser.avatar)
    : (driverUser.profileImage || driverUser.avatar);
  const activeUserName = role === 'client' ? clientUser.name : driverUser.name;
  const activeUserEmail = role === 'client' ? clientUser.email : driverUser.email;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(role === 'client' ? 'client-dashboard' : 'driver-dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500 transition-colors">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Moov<span className="text-emerald-600">Vert</span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-slate-600 -mt-1">
                Meubles & Déménagement
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {role === 'client' ? (
            <>
              <button
                type="button"
                onClick={() => navigate('client-dashboard')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentRoute === 'client-dashboard'
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Tableau de bord
              </button>
              <button
                type="button"
                onClick={() => navigate('create-request')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentRoute === 'create-request'
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Nouvelle demande
              </button>
              <button
                type="button"
                onClick={() => navigate('my-requests')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentRoute === 'my-requests' || currentRoute === 'request-details' || currentRoute === 'offers'
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Mes déménagements
              </button>
              <button
                type="button"
                onClick={() => navigate('client-profile')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentRoute === 'client-profile'
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Mon profil
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('driver-dashboard')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  currentRoute === 'driver-dashboard'
                    ? 'text-[#00A86B] bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🚚 Tableau de bord
              </button>
              <button
                type="button"
                onClick={() => navigate('available-requests')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  currentRoute === 'available-requests' || currentRoute === 'driver-request-details'
                    ? 'text-[#00A86B] bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                📋 Demandes disponibles
              </button>
              <button
                type="button"
                onClick={() => navigate('my-jobs')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  currentRoute === 'my-jobs'
                    ? 'text-[#00A86B] bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🚛 Mes missions
              </button>
              <button
                type="button"
                onClick={() => navigate('driver-chat')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  currentRoute === 'driver-chat'
                    ? 'text-[#00A86B] bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                💬 Messages
              </button>
              <button
                type="button"
                onClick={() => navigate('driver-profile')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  currentRoute === 'driver-profile'
                    ? 'text-[#00A86B] bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                👤 Mon profil
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Profile Avatar Dropdown */}
        <div className="flex items-center gap-3">
          {role === 'client' && (
            <button
              type="button"
              onClick={() => navigate('create-request')}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publier une demande</span>
            </button>
          )}

          {role === 'driver' && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#00A86B] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Chauffeur</span>
            </div>
          )}

          {/* Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Menu du compte"
            >
              <img
                src={activeUserPhoto}
                alt={activeUserName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <span className="hidden sm:inline text-xs font-bold text-slate-800 truncate max-w-[110px]">
                {activeUserName}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-[#00A86B]' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 overflow-hidden"
                >
                  {/* User info banner */}
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                    <img
                      src={activeUserPhoto}
                      alt={activeUserName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-[#111111] truncate">{activeUserName}</p>
                      <p className="text-xs text-slate-500 truncate">{activeUserEmail}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Item 1: Mon profil */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(role === 'client' ? 'client-profile' : 'driver-profile');
                      }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#00A86B] hover:bg-emerald-50/50 flex items-center gap-3 transition-colors cursor-pointer text-left"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Mon profil</span>
                    </button>

                    {/* Item 2: Switch Mode (Passer en mode chauffeur / Passer en mode client) */}
                    {role === 'client' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          switchMode('driver');
                        }}
                        className="w-full px-4 py-2.5 text-xs font-extrabold text-[#00A86B] hover:bg-emerald-50 flex items-center gap-3 transition-colors cursor-pointer text-left"
                      >
                        <Truck className="w-4 h-4 text-[#00A86B]" />
                        <span>Passer en mode chauffeur</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          switchMode('client');
                        }}
                        className="w-full px-4 py-2.5 text-xs font-extrabold text-[#00A86B] hover:bg-emerald-50 flex items-center gap-3 transition-colors cursor-pointer text-left"
                      >
                        <UserIcon className="w-4 h-4 text-[#00A86B]" />
                        <span>Passer en mode client</span>
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-1" />

                  {/* Item: Réinitialiser les données (Dev/Demo test flow) */}
                  <div className="px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        resetAllData();
                      }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-left"
                      title="Efface toutes les demandes créées, offres et messages"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Réinitialiser les données</span>
                    </button>
                  </div>

                  {/* Item 3: Se déconnecter */}
                  <div className="px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

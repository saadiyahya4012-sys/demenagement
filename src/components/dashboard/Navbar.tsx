import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, AppRoute } from '../../hooks/useAppStore';
import {
  Plus,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Truck,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'Accueil' }) => {
  const { navigate, clientUser, role, switchMode, resetAllData, signOut } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Client-specific photo resolution
  const clientPhoto = clientUser.profileImage || clientUser.avatar;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { label: string; route: AppRoute }[] = [
    { label: 'Accueil', route: 'client-dashboard' },
    { label: 'Mes déménagements', route: 'my-requests' },
    { label: 'Messages', route: 'chat' },
    { label: 'Mon profil', route: 'client-profile' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Moving truck logo icon + Application name: "Moov" + Subtitle: "Déménagement" */}
          <div
            onClick={() => navigate('client-dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                <circle cx="17" cy="18.5" r="2.5" />
                <circle cx="7" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-2xl font-black tracking-tight text-[#111111]">
                  Moov
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00A86B]" />
              </div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5">
                Déménagement
              </p>
            </div>
          </div>

          {/* CENTER NAVIGATION: Active item has green underline and green text */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(item => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={`relative py-2 text-sm font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00A86B]'
                      : 'text-slate-600 hover:text-[#111111]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00A86B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT SIDE: Green button: "+ Nouvelle demande", User avatar, User name, Dropdown arrow */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('create-request')}
              className="h-11 px-4 sm:px-5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nouvelle demande</span>
            </button>

            {/* Profile Dropdown container */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/80"
              >
                <img
                  src={clientPhoto}
                  alt={clientUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <span className="text-xs sm:text-sm font-bold text-[#111111] max-w-[120px] truncate">
                  {clientUser.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180 text-[#00A86B]' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 overflow-hidden"
                  >
                    {/* User info header */}
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                      <img
                        src={clientPhoto}
                        alt={clientUser.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#111111] truncate">{clientUser.name}</p>
                        <p className="text-xs text-slate-500 truncate">{clientUser.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Mon profil */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate(role === 'client' ? 'client-profile' : 'driver-profile');
                        }}
                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#00A86B] hover:bg-emerald-50/50 flex items-center gap-3 transition-colors cursor-pointer text-left"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Mon profil</span>
                      </button>

                      {/* Mode switch */}
                      {role === 'client' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
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
                            setProfileDropdownOpen(false);
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

                    {/* Réinitialiser les données (Dev/Demo test flow) */}
                    <div className="px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          resetAllData();
                        }}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-left"
                        title="Efface toutes les demandes, offres et messages"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        <span>Réinitialiser les données</span>
                      </button>
                    </div>

                    {/* Se déconnecter */}
                    <div className="px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
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

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('create-request')}
              className="p-2 bg-[#00A86B] text-white rounded-xl shadow-xs"
              title="Nouvelle demande"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {navItems.map(item => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(item.route);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-[#00A86B]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          
          {/* Mobile mode switch button */}
          <div className="pt-2">
            {role === 'client' ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  switchMode('driver');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-[#00A86B] bg-emerald-50 flex items-center gap-2.5"
              >
                <Truck className="w-4 h-4 text-[#00A86B]" />
                <span>Passer en mode chauffeur</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  switchMode('client');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-[#00A86B] bg-emerald-50 flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-[#00A86B]" />
                <span>Passer en mode client</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={clientPhoto}
                alt={clientUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-slate-800">{clientUser.name}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

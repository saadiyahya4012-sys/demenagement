import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, AppRoute } from '../../hooks/useAppStore';
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Truck,
  MessageSquare,
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DriverNavbarProps {
  activeTab?: string;
}

export const DriverNavbar: React.FC<DriverNavbarProps> = ({ activeTab = 'Tableau de bord' }) => {
  const { navigate, currentUser, role, switchMode, driverUser, resetAllData, signOut } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Strictly separated Chauffeur photo resolution
  const driverPhoto = driverUser.profileImage || driverUser.avatar;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { label: string; icon: string; route: AppRoute }[] = [
    { label: 'Tableau de bord', icon: '🚚', route: 'driver-dashboard' },
    { label: 'Demandes disponibles', icon: '📋', route: 'available-requests' },
    { label: 'Mes missions', icon: '🚛', route: 'my-jobs' },
    { label: 'Messages', icon: '💬', route: 'driver-chat' },
    { label: 'Mon profil', icon: '👤', route: 'driver-profile' },
  ];

  const displayName = driverUser?.name || 'Chauffeur Demo';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Moving truck logo icon + Application name: "Moov" + Subtitle: "Espace Chauffeur" */}
          <div
            onClick={() => navigate('driver-dashboard')}
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
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-2xl font-black tracking-tight text-[#111111]">
                  Moov
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00A86B]" />
              </div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5">
                Espace Chauffeur
              </p>
            </div>
          </div>

          {/* CENTER NAVIGATION: Driver links with emoji icon */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map(item => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={`relative py-2 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00A86B]'
                      : 'text-slate-600 hover:text-[#111111]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00A86B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT SIDE: 🟢 Chauffeur Badge + Profile avatar + "yahya" + Dropdown arrow */}
          <div className="hidden sm:flex items-center gap-4">
            
            {/* Status indicator badge: 🟢 Chauffeur */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#00A86B] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
              <span>Chauffeur</span>
            </div>

            {/* Profile Dropdown container */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/80"
              >
                <img
                  src={driverPhoto}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <span className="text-xs sm:text-sm font-bold text-[#111111] max-w-[120px] truncate">
                  {displayName}
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
                        src={driverPhoto}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#111111] truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{driverUser.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* 👤 Mon profil */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('driver-profile');
                        }}
                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#00A86B] hover:bg-emerald-50/50 flex items-center gap-3 transition-colors cursor-pointer text-left"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Mon profil</span>
                      </button>

                      {/* 👤 Passer en mode client (keep same user/account without logging out) */}
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
                        className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                        title="Efface toutes les demandes, offres et messages créés"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        <span>Réinitialiser les données</span>
                      </button>
                    </div>

                    {/* 🚪 Se déconnecter */}
                    <div className="px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
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
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]" />
              <span>Chauffeur</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU ACCORDION */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg"
          >
            {/* User header */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-2">
              <img
                src={driverPhoto}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#111111]">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{driverUser.email}</p>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1">
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
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-emerald-50 text-[#00A86B]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  switchMode('client');
                }}
                className="w-full h-11 px-4 rounded-xl bg-emerald-50 text-[#00A86B] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Passer en mode client</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full h-10 px-4 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

import React from 'react';
import { useAppStore } from '../../hooks/useAppStore';

export const Footer: React.FC = () => {
  const { navigate } = useAppStore();

  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Brand info */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00A86B] text-white flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              <span className="text-xl font-black tracking-tight text-[#111111]">
                Moov
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Move Easy. Move Smart.
            </p>
          </div>

          {/* Links: Aide, Confidentialité, Conditions d'utilisation */}
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => alert("Centre d'aide Moov : contactez support@moov.app")}
              className="hover:text-[#00A86B] transition-colors cursor-pointer"
            >
              Aide
            </button>
            <button
              type="button"
              onClick={() => alert('Politique de confidentialité Moov.')}
              className="hover:text-[#00A86B] transition-colors cursor-pointer"
            >
              Confidentialité
            </button>
            <button
              type="button"
              onClick={() => alert("Conditions générales d'utilisation.")}
              className="hover:text-[#00A86B] transition-colors cursor-pointer"
            >
              Conditions d'utilisation
            </button>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Moov Déménagement. Tous droits réservés.
          </p>

        </div>
      </div>
    </footer>
  );
};

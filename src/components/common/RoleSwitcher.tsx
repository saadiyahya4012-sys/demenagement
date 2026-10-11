import React from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { UserRole } from '../../types';
import { Truck, UserCheck, ArrowRightLeft } from 'lucide-react';

interface RoleSwitcherProps {
  compact?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ compact = false }) => {
  const { role, setRole } = useAppStore();

  const handleToggle = (newRole: UserRole) => {
    if (newRole !== role) {
      setRole(newRole);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => handleToggle('client')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            role === 'client'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Client</span>
        </button>
        <button
          type="button"
          onClick={() => handleToggle('driver')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            role === 'driver'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Chauffeur</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Mode actif</p>
          <p className="text-sm font-bold text-slate-900 capitalize">
            {role === 'client' ? 'Espace Client (Expéditeur)' : 'Espace Chauffeur (Transporteur)'}
          </p>
        </div>
      </div>

      <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => handleToggle('client')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            role === 'client'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Client
        </button>
        <button
          type="button"
          onClick={() => handleToggle('driver')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            role === 'driver'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Chauffeur
        </button>
      </div>
    </div>
  );
};

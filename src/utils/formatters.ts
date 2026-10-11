import { RequestStatus } from '../types';

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} DH`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatVolume(m3: number): string {
  return `${m3.toFixed(1).replace('.0', '')} m³`;
}

export function formatDistance(km: number): string {
  return `${km} km`;
}

export function getStatusBadge(status: RequestStatus): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  switch (status) {
    case 'open':
      return {
        label: 'Recherche chauffeur',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'offers_received':
      return {
        label: 'Offres reçues',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
      };
    case 'accepted':
    case 'driver_confirmed':
      return {
        label: 'Chauffeur confirmé',
        badgeClass: 'bg-emerald-50 text-[#00A86B] border-emerald-200',
        dotColor: 'bg-[#00A86B]',
      };
    case 'in_progress':
      return {
        label: 'En transit',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dotColor: 'bg-indigo-500 animate-pulse',
      };
    case 'completed':
      return {
        label: 'Livré & Terminé',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        dotColor: 'bg-emerald-600',
      };
    case 'cancelled':
      return {
        label: 'Annulé',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotColor: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotColor: 'bg-slate-400',
      };
  }
}

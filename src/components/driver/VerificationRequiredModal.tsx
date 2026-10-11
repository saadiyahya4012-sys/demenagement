import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ArrowRight, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

interface VerificationRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationRequiredModal: React.FC<VerificationRequiredModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { navigate, driverVerification } = useAppStore();

  if (!isOpen) return null;

  const handleGoToVerification = () => {
    onClose();
    navigate('driver-profile');
    setTimeout(() => {
      const section = document.getElementById('verification');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const hasCIN = !!driverVerification?.personalInfo.cinNumber;
  const hasLicence = !!(driverVerification?.drivingLicence.number && driverVerification?.drivingLicence.documentUrl);
  const hasTruckDocs = !!(driverVerification?.truck.registrationNumber && driverVerification?.truck.registrationDocumentUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Title & Message */}
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Vérification requise
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
          Vous devez compléter et vérifier votre profil chauffeur avant de pouvoir accepter des demandes de déménagement.
        </p>

        {/* Mini Checklist */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Documents obligatoires à fournir :
          </span>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Carte Nationale d'Identité (CIN)
            </span>
            {hasCIN ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Renseignée
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Manquante
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Permis de conduire & Scan
            </span>
            {hasLicence ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Téléversé
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Manquant
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Carte grise du camion
            </span>
            {hasTruckDocs ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Téléversée
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Manquante
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer text-center order-2 sm:order-1"
          >
            Plus tard
          </button>

          <button
            type="button"
            onClick={handleGoToVerification}
            className="w-full sm:flex-1 h-11 px-5 rounded-xl bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white text-xs font-black shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-lg order-1 sm:order-2"
          >
            <span>Compléter mon profil</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

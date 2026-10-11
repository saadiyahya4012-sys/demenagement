import React, { useState, useRef } from 'react';
import { ClientLayout } from '../../layouts/ClientLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { Enable2FAModal } from '../../components/security/Enable2FAModal';
import { ChangePasswordModal } from '../../components/security/ChangePasswordModal';
import { EditClientPhotoModal } from '../../components/client/EditClientPhotoModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Camera,
  Lock,
  Smartphone,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ClientProfile: React.FC = () => {
  const {
    clientUser,
    updateClientProfile,
    updateClientProfilePhoto,
    deleteClientProfilePhoto,
    resetAllData
  } = useAppStore();
  const [name, setName] = useState(clientUser.name);
  const [email, setEmail] = useState(clientUser.email);
  const [phone, setPhone] = useState(clientUser.phone);
  const [city, setCity] = useState(clientUser.city);
  const [isSaved, setIsSaved] = useState(false);

  // Client Photo modal state (strictly separated from Chauffeur photo)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState('');

  // Security modals state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState('');

  // Client-specific photo resolution
  const currentClientPhoto = clientUser.profileImage || clientUser.avatar;

  const handleSavePhoto = (newPhotoUrl: string) => {
    updateClientProfilePhoto(newPhotoUrl);
    setPhotoSuccessMsg('✓ Photo de profil Client mise à jour avec succès.');
    setTimeout(() => setPhotoSuccessMsg(''), 4000);
  };

  const handleDeletePhoto = () => {
    deleteClientProfilePhoto();
    setPhotoSuccessMsg('✓ Photo de profil réinitialisée à l’image par défaut.');
    setTimeout(() => setPhotoSuccessMsg(''), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientProfile({ name, email, phone, city });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handle2FASuccess = (secret: string) => {
    updateClientProfile({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    });
    setSecuritySuccessMsg('✓ Authentification à deux facteurs activée avec succès.');
    setTimeout(() => setSecuritySuccessMsg(''), 4000);
  };

  const handleDisable2FA = () => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver l’authentification à deux facteurs ?')) {
      updateClientProfile({
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
      });
      setSecuritySuccessMsg('Authentification à deux facteurs désactivée.');
      setTimeout(() => setSecuritySuccessMsg(''), 4000);
    }
  };

  const handlePasswordSuccess = () => {
    setSecuritySuccessMsg('✓ Mot de passe modifié avec succès.');
    setTimeout(() => setSecuritySuccessMsg(''), 4000);
  };

  const is2FAActive = !!clientUser.twoFactorEnabled;

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Photo success notification banner */}
        {photoSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{photoSuccessMsg}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={() => setIsPhotoModalOpen(true)}>
            <img
              src={currentClientPhoto}
              alt={clientUser.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md transition-transform group-hover:scale-102"
            />
            {clientUser.isVerified && (
              <span className="absolute -top-1 -right-1 p-1 bg-emerald-600 text-white rounded-full shadow-xs" title="Profil vérifié">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Modifier la photo / camera button badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoModalOpen(true);
              }}
              className="absolute -bottom-2 -right-2 px-2.5 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white rounded-xl shadow-md flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer hover:shadow-lg hover:scale-105"
              title="Modifier la photo de profil Client"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">{clientUser.name}</h1>
                <p className="text-xs text-slate-500 mt-0.5">{clientUser.city} · Client MoovVert</p>
                
                {/* Dedicated Action Button: "Modifier la photo de profil" */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00A86B] border border-emerald-200/80 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Modifier la photo de profil</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold self-center sm:self-auto">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{clientUser.rating} ({clientUser.reviewCount} avis)</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Membre depuis {clientUser.memberSince}
              </span>
              <span>·</span>
              <span className="font-semibold text-slate-800">
                {clientUser.completedMoves} déménagements réalisés
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile form: Coordonnées du compte */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Coordonnées du compte</h2>
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Modifications enregistrées
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ville de résidence
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Mettre à jour le profil
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* 🔐 SÉCURITÉ SECTION                                       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔐</span>
              <h2 className="text-base font-bold text-slate-900">Sécurité</h2>
            </div>
            {securitySuccessMsg && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                {securitySuccessMsg}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* Authentification à deux facteurs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Authentification à deux facteurs
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      is2FAActive
                        ? 'bg-emerald-50 text-[#00A86B] border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>{is2FAActive ? '🟢 Activée' : '⚪ Désactivée'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Protégez votre compte avec une vérification supplémentaire via Google Authenticator.
                </p>
              </div>

              <div>
                {is2FAActive ? (
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Désactiver la 2FA
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIs2FAModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer hover:shadow-md"
                  >
                    Activer la 2FA
                  </button>
                )}
              </div>
            </div>

            {/* Modifier le mot de passe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Modifier le mot de passe
                  </h3>
                  {is2FAActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00A86B] border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Protégé par 2FA</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mettez à jour votre mot de passe pour garantir la confidentialité de vos échanges et commandes.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Modifier le mot de passe</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Mock Data Box */}
        <div className="p-4 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900">Données de démonstration</p>
            <p className="text-[11px] text-slate-500">
              Réinitialiser l'application avec les annonces et propositions initiales.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAllData}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Edit Client Profile Photo Modal (Isolated from Driver) */}
      <EditClientPhotoModal
        isOpen={isPhotoModalOpen}
        currentPhoto={currentClientPhoto}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={handleSavePhoto}
        onDelete={handleDeletePhoto}
      />

      {/* 2FA Enable Modal */}
      <Enable2FAModal
        isOpen={is2FAModalOpen}
        userEmail={clientUser.email}
        userName={clientUser.name}
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={handle2FASuccess}
      />

      {/* Change Password Modal (Enforces 2FA verification when enabled) */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        twoFactorEnabled={is2FAActive}
        twoFactorSecret={clientUser.twoFactorSecret}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </ClientLayout>
  );
};

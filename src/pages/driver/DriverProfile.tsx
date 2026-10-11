import React, { useState, useRef, useEffect } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { DocumentUploadCard } from '../../components/driver/DocumentUploadCard';
import {
  User as UserIcon,
  Mail,
  Phone,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Star,
  RotateCcw,
  Camera,
  FileText,
  Calendar,
  CreditCard,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DriverVerificationData, DriverVerificationStatus } from '../../types';
import { INITIAL_DRIVER_VERIFICATION } from '../../data/mockData';

export const DriverProfile: React.FC = () => {
  const {
    driverUser,
    updateDriverProfile,
    driverVerification,
    updateDriverVerification,
    setDriverVerificationStatus,
    isDriverVerified,
    resetAllData
  } = useAppStore();

  const [name, setName] = useState(driverUser.name);
  const [email, setEmail] = useState(driverUser.email);
  const [phone, setPhone] = useState(driverUser.phone);
  const [city, setCity] = useState(driverUser.city);
  const [avatarPreview, setAvatarPreview] = useState(driverUser.profileImage || driverUser.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verification Form State (initialized from driverVerification or defaults)
  const verifData = driverVerification || INITIAL_DRIVER_VERIFICATION;

  // Personal Info
  const [fullName, setFullName] = useState(verifData.personalInfo?.fullName || driverUser.name || '');
  const [verifPhone, setVerifPhone] = useState(verifData.personalInfo?.phone || driverUser.phone || '');
  const [cinNumber, setCinNumber] = useState(verifData.personalInfo?.cinNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(verifData.personalInfo?.dateOfBirth || '');
  const [cinDocUrl, setCinDocUrl] = useState<string | undefined>(verifData.personalInfo?.cinDocumentUrl);
  const [cinDocName, setCinDocName] = useState<string | undefined>(verifData.personalInfo?.cinDocumentName);

  // Driving Licence
  const [licenceNumber, setLicenceNumber] = useState(verifData.drivingLicence?.number || '');
  const [licenceCategory, setLicenceCategory] = useState(verifData.drivingLicence?.category || 'Permis B (Véhicules utilitaires légers)');
  const [licenceExpiration, setLicenceExpiration] = useState(verifData.drivingLicence?.expirationDate || '');
  const [licenceDocUrl, setLicenceDocUrl] = useState<string | undefined>(verifData.drivingLicence?.documentUrl);
  const [licenceDocName, setLicenceDocName] = useState<string | undefined>(verifData.drivingLicence?.documentName);

  // Truck Info
  const [truckBrand, setTruckBrand] = useState(verifData.truck?.brand || 'Renault');
  const [truckModel, setTruckModel] = useState(verifData.truck?.model || driverUser.vehicle?.model || 'Master Grand Volume');
  const [truckReg, setTruckReg] = useState(verifData.truck?.registrationNumber || driverUser.vehicle?.licensePlate || 'EK-492-LM');
  const [truckYear, setTruckYear] = useState(verifData.truck?.year || '2022');
  const [truckType, setTruckType] = useState(verifData.truck?.type || driverUser.vehicle?.typeName || 'Camion 20m³ avec Hayon élévateur');
  const [truckCapacity, setTruckCapacity] = useState(verifData.truck?.capacity || String(driverUser.vehicle?.capacityM3 || 20));
  const [carteGriseDocUrl, setCarteGriseDocUrl] = useState<string | undefined>(verifData.truck?.registrationDocumentUrl);
  const [carteGriseDocName, setCarteGriseDocName] = useState<string | undefined>(verifData.truck?.registrationDocumentName);

  // Validation & status UI states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sync avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        updateDriverProfile({ avatar: result, profileImage: result });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Checklist status calculations
  const isPersonalComplete = !!(fullName.trim() && verifPhone.trim() && cinNumber.trim() && dateOfBirth);
  const isCinComplete = !!(cinNumber.trim());
  const isLicenceComplete = !!(licenceNumber.trim() && licenceCategory && licenceExpiration && licenceDocUrl);
  const isTruckComplete = !!(truckBrand.trim() && truckModel.trim() && truckReg.trim() && truckYear.trim() && truckType.trim() && truckCapacity.trim());
  const isCarteGriseComplete = !!carteGriseDocUrl;

  const currentStatus = verifData.verificationStatus;

  // Handle Save Verification Form
  const handleSaveVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setSaveSuccessMsg('');

    const errors: string[] = [];

    // Personal checks
    if (!fullName.trim()) errors.push('Nom complet obligatoire');
    if (!verifPhone.trim()) errors.push('Numéro de téléphone obligatoire');
    if (!cinNumber.trim()) errors.push('Numéro de carte nationale (CIN) obligatoire');
    if (!dateOfBirth) errors.push('Date de naissance obligatoire');

    // Licence checks
    if (!licenceNumber.trim()) errors.push('Numéro du permis de conduire obligatoire');
    if (!licenceCategory) errors.push('Catégorie du permis obligatoire');
    if (!licenceExpiration) errors.push('Date d’expiration du permis obligatoire');
    if (!licenceDocUrl) errors.push('Scan ou photo du permis de conduire obligatoire');

    // Truck checks
    if (!truckBrand.trim()) errors.push('Marque du camion obligatoire');
    if (!truckModel.trim()) errors.push('Modèle du camion obligatoire');
    if (!truckReg.trim()) errors.push('Numéro d’immatriculation du camion obligatoire');
    if (!truckYear.trim()) errors.push('Année du camion obligatoire');
    if (!truckType.trim()) errors.push('Type de camion obligatoire');
    if (!truckCapacity.trim()) errors.push('Capacité / volume du camion obligatoire');
    if (!carteGriseDocUrl) errors.push('Document Carte grise du camion obligatoire');

    const updatedData: DriverVerificationData = {
      personalInfo: {
        fullName: fullName.trim(),
        phone: verifPhone.trim(),
        cinNumber: cinNumber.trim().toUpperCase(),
        dateOfBirth,
        cinDocumentUrl: cinDocUrl,
        cinDocumentName: cinDocName,
      },
      drivingLicence: {
        number: licenceNumber.trim(),
        category: licenceCategory,
        expirationDate: licenceExpiration,
        documentUrl: licenceDocUrl,
        documentName: licenceDocName,
      },
      truck: {
        brand: truckBrand.trim(),
        model: truckModel.trim(),
        registrationNumber: truckReg.trim().toUpperCase(),
        year: truckYear.trim(),
        type: truckType.trim(),
        capacity: truckCapacity.trim(),
        registrationDocumentUrl: carteGriseDocUrl,
        registrationDocumentName: carteGriseDocName,
      },
      verificationStatus: errors.length === 0 ? 'pending' : 'incomplete',
      submittedAt: new Date().toISOString(),
    };

    updateDriverVerification(updatedData);

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: document.getElementById('verification')?.offsetTop || 0, behavior: 'smooth' });
    } else {
      setSaveSuccessMsg('Votre dossier est complet et en attente de vérification.');
      setTimeout(() => setSaveSuccessMsg(''), 6000);
      window.scrollTo({ top: document.getElementById('verification')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  return (
    <DriverLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* DRIVER HEADER CARD                                       */}
        {/* ========================================================= */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative group">
            <img
              src={avatarPreview || driverUser.profileImage || driverUser.avatar}
              alt={driverUser.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-400 shadow-md transition-transform group-hover:scale-102"
            />
            {/* Modifier la photo / camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 px-2.5 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white rounded-xl shadow-md flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer hover:shadow-lg hover:scale-105"
              title="Modifier la photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modifier</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-extrabold">{driverUser.name}</h1>
                  {isDriverVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-black">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      ✓ Chauffeur vérifié
                    </span>
                  ) : currentStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[11px] font-bold">
                      🟡 En attente de vérification
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-[11px] font-bold">
                      🔴 Non vérifié
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">{driverUser.city} · Chauffeur Professionnel</p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 text-xs font-bold self-center sm:self-auto">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{driverUser.rating} ({driverUser.reviewCount} avis)</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Truck className="w-4 h-4" />
                {truckModel} ({truckCapacity} m³)
              </span>
              <span>·</span>
              <span>{driverUser.completedMoves} courses réalisées</span>
              <span>·</span>
              <span>Membre depuis {driverUser.memberSince}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: VÉRIFICATION DU CHAUFFEUR                      */}
        {/* ========================================================= */}
        <section id="verification" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Header & Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Sécurité & Conformité MoovVert</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Vérification de votre profil
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Pour garantir la sécurité des clients, veuillez renseigner et téléverser vos documents officiels.
              </p>
            </div>

            {/* Current Status Badge */}
            <div className="shrink-0">
              {currentStatus === 'verified' ? (
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 shadow-2xs">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black">🟢 Profil vérifié</span>
                </div>
              ) : currentStatus === 'pending' ? (
                <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 flex items-center gap-2 shadow-2xs">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-black">🟡 Vérification en attente</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2 shadow-2xs">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs font-black">🔴 Vérification incomplète</span>
                </div>
              )}
            </div>
          </div>

          {/* Banner Notifications */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2.5 shadow-md animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5 text-xs animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Veuillez compléter les informations obligatoires suivantes ({validationErrors.length}) :</span>
              </div>
              <ul className="list-disc pl-6 space-y-0.5 text-[11px] text-rose-700">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 5: CHECKLIST DE VÉRIFICATION                      */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Checklist de validation du dossier :
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Carte nationale (CIN) */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Carte nationale (CIN)</span>
                {isCinComplete ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 Renseignée</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <span>🔴 Manquante</span>
                  </span>
                )}
              </div>

              {/* Permis de conduire */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Permis de conduire</span>
                {isLicenceComplete ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 Téléversé</span>
                  </span>
                ) : licenceNumber ? (
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <span>🟡 Document manquant</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <span>🔴 Incomplet</span>
                  </span>
                )}
              </div>

              {/* Carte grise du camion */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Carte grise du camion</span>
                {isCarteGriseComplete ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 Téléversée</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <span>🔴 Document manquant</span>
                  </span>
                )}
              </div>

              {/* Informations du camion */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Informations du camion</span>
                {isTruckComplete ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 Complètes</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <span>🔴 Informations manquantes</span>
                  </span>
                )}
              </div>

              {/* Informations personnelles */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                <span className="font-semibold text-slate-800">Informations personnelles & CIN</span>
                {isPersonalComplete ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 Informations renseignées</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <span>🔴 Renseignements incomplets</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveVerification} className="space-y-8 pt-2">
            
            {/* ========================================================= */}
            {/* SECTION 2: INFORMATIONS PERSONNELLES                      */}
            {/* ========================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-100 pb-2">
                <UserIcon className="w-4 h-4 text-[#00A86B]" />
                <span>1. Informations personnelles du chauffeur</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom complet <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ex: Yahya Benani"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de téléphone direct <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={verifPhone}
                    onChange={e => setVerifPhone(e.target.value)}
                    placeholder="Ex: 06 82 14 77 90"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* CIN Number (Required) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de carte nationale (CIN) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cinNumber}
                      onChange={e => setCinNumber(e.target.value.toUpperCase())}
                      placeholder="Ex: AB123456"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de naissance <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* CIN Document Upload */}
              <DocumentUploadCard
                title="Photo ou scan de la Carte Nationale d'Identité (CIN)"
                description="Scan recto/verso ou photo nette de votre CIN marocaine."
                required={false}
                fileUrl={cinDocUrl}
                fileName={cinDocName}
                onUpload={(url, filename) => {
                  setCinDocUrl(url);
                  setCinDocName(filename);
                }}
                onDelete={() => {
                  setCinDocUrl(undefined);
                  setCinDocName(undefined);
                }}
              />
            </div>

            {/* ========================================================= */}
            {/* SECTION 3: PERMIS DE CONDUIRE                             */}
            {/* ========================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-[#00A86B]" />
                <span>2. Permis de conduire</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro du permis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={licenceNumber}
                    onChange={e => setLicenceNumber(e.target.value)}
                    placeholder="Ex: 12/345678"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catégorie du permis <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={licenceCategory}
                    onChange={e => setLicenceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Permis B (Véhicules utilitaires légers)">Permis B (Véhicules utilitaires ≤ 3,5t)</option>
                    <option value="Permis C (Poids lourds de transport)">Permis C (Poids lourds de transport)</option>
                    <option value="Permis EC (Poids lourds avec remorque)">Permis EC (Ensemble articulé)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date d'expiration <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={licenceExpiration}
                    onChange={e => setLicenceExpiration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Licence Document Upload */}
              <DocumentUploadCard
                title="Photo / scan du permis de conduire"
                description="Scan lisible ou photo nette du permis de conduire en cours de validité (JPG, PNG ou PDF)."
                required={true}
                fileUrl={licenceDocUrl}
                fileName={licenceDocName}
                onUpload={(url, filename) => {
                  setLicenceDocUrl(url);
                  setLicenceDocName(filename);
                }}
                onDelete={() => {
                  setLicenceDocUrl(undefined);
                  setLicenceDocName(undefined);
                }}
              />
            </div>

            {/* ========================================================= */}
            {/* SECTION 4: INFORMATIONS DU CAMION                         */}
            {/* ========================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-100 pb-2">
                <Truck className="w-4 h-4 text-[#00A86B]" />
                <span>3. Informations du camion & Carte grise</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Marque <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={truckBrand}
                    onChange={e => setTruckBrand(e.target.value)}
                    placeholder="Ex: Renault, Mercedes, Iveco"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modèle <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={truckModel}
                    onChange={e => setTruckModel(e.target.value)}
                    placeholder="Ex: Master Grand Volume"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Immatriculation / Matricule <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={truckReg}
                    onChange={e => setTruckReg(e.target.value.toUpperCase())}
                    placeholder="Ex: 12345-A-1 ou EK-492-LM"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Année de mise en circulation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2027"
                    required
                    value={truckYear}
                    onChange={e => setTruckYear(e.target.value)}
                    placeholder="Ex: 2022"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type de camion <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={truckType}
                    onChange={e => setTruckType(e.target.value)}
                    placeholder="Ex: Fourgonnette 12m³, Caisse 20m³..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacité / Volume (m³) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    required
                    value={truckCapacity}
                    onChange={e => setTruckCapacity(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Carte Grise Document Upload */}
              <DocumentUploadCard
                title="Carte grise du camion"
                description="Scan ou photo lisible de la carte grise officielle du véhicule utilitaire (JPG, PNG ou PDF)."
                required={true}
                fileUrl={carteGriseDocUrl}
                fileName={carteGriseDocName}
                onUpload={(url, filename) => {
                  setCarteGriseDocUrl(url);
                  setCarteGriseDocName(filename);
                }}
                onDelete={() => {
                  setCarteGriseDocUrl(undefined);
                  setCarteGriseDocName(undefined);
                }}
              />
            </div>

            {/* ========================================================= */}
            {/* SAVE & SUBMISSION ACTION                                  */}
            {/* ========================================================= */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-[#00A86B] shrink-0" />
                <span>Tous les documents sont protégés et chiffrés conformément aux normes de sécurité.</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto h-12 px-8 bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.01]"
              >
                <span>Enregistrer les informations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* ========================================================= */}
          {/* DEMO / SIMULATE ADMIN VALIDATION PANEL                    */}
          {/* ========================================================= */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulateur d'approbation administrative MoovVert (Mode Démo)</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Testez le comportement immédiat : « Profil vérifié » (autorise les offres) vs « Non vérifié » (bloque les offres avec modale).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentStatus !== 'verified' ? (
                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill valid dummy documents for test if not yet entered
                    setCinNumber(prev => prev || 'AB847291');
                    setDateOfBirth(prev => prev || '1990-05-14');
                    setLicenceNumber(prev => prev || '08/94821');
                    setLicenceExpiration(prev => prev || '2030-10-15');
                    setLicenceDocUrl(prev => prev || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600');
                    setCarteGriseDocUrl(prev => prev || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600');
                    setDriverVerificationStatus('verified');
                    setSaveSuccessMsg('✓ Profil validé avec succès par l’administrateur ! Vous pouvez désormais accepter les courses.');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simuler : Valider le profil (🟢 Vérifié)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDriverVerificationStatus('incomplete');
                    setSaveSuccessMsg('Profil réinitialisé en mode « Non vérifié » pour tester le blocage des offres.');
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Simuler : Rendre incomplet (🔴 Bloqué)</span>
                </button>
              )}
            </div>
          </div>
        </section>

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
    </DriverLayout>
  );
};

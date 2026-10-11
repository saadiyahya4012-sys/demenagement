import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../../components/dashboard/Navbar';
import { Footer } from '../../components/dashboard/Footer';
import { useAppStore } from '../../hooks/useAppStore';
import { InteractiveMap } from '../../components/map/InteractiveMap';
import { LocationAutocomplete } from '../../components/map/LocationAutocomplete';
import {
  calculateRoute,
  RouteGeometry,
  formatTripDuration,
  PlaceSuggestion
} from '../../services/mapService';
import { TripType } from '../../types';
import {
  MapPin,
  Calendar,
  Clock,
  Home,
  Box,
  Truck,
  Building,
  Building2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  Check,
  ArrowRight,
  RotateCcw,
  Navigation
} from 'lucide-react';

export const CreateMovingRequest: React.FC = () => {
  const { createRequest, navigate } = useAppStore();

  // 0. Trip Type Selection Modal / Screen
  // Options: 'city_to_city' (🚚 Ville à ville) | 'local' (📍 Course)
  const [selectedTripType, setSelectedTripType] = useState<TripType | null>('city_to_city');

  // 1. Départ & Arrivée & Real Map States
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lon: number; label: string } | null>(null);

  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lon: number; label: string } | null>(null);

  const [routeData, setRouteData] = useState<RouteGeometry | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const [pickupFloor, setPickupFloor] = useState('0');
  const [dropoffFloor, setDropoffFloor] = useState('0');
  const [hasElevator, setHasElevator] = useState<boolean | null>(null);

  // 2. Date & Heure
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // 3. Informations sur le déménagement
  const [housingType, setHousingType] = useState<string>('');
  const [estimatedVolume, setEstimatedVolume] = useState<string>('');
  const [roomsCount, setRoomsCount] = useState<string>('2');

  // 4. Meubles à transporter (Multi-select)
  const furnitureOptions = [
    'Canapé',
    'Lit',
    'Armoire',
    'Table',
    'Chaises',
    'Réfrigérateur',
    'Machine à laver',
    'TV',
    'Cartons',
    'Autre',
  ];
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [photoNames, setPhotoNames] = useState<string[]>([]);

  // 5. Prix proposé
  const [proposedPrice, setProposedPrice] = useState<string>('');

  // 6. Description
  const [description, setDescription] = useState('');

  // Submit Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Min date for input (cannot be in the past)
  const todayStr = new Date().toISOString().split('T')[0];

  // Recalculate route whenever both locations are valid
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      let isCurrent = true;
      setIsCalculatingRoute(true);

      calculateRoute(
        pickupLocation.lat,
        pickupLocation.lon,
        dropoffLocation.lat,
        dropoffLocation.lon
      ).then((res) => {
        if (isCurrent) {
          setRouteData(res);
          setIsCalculatingRoute(false);
        }
      });

      return () => {
        isCurrent = false;
      };
    } else {
      setRouteData(null);
    }
  }, [pickupLocation, dropoffLocation]);

  const toggleFurniture = (item: string) => {
    if (selectedFurniture.includes(item)) {
      setSelectedFurniture(selectedFurniture.filter((i) => i !== item));
    } else {
      setSelectedFurniture([...selectedFurniture, item]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setPhotoNames((prev) => [...prev, ...names]);
    }
  };

  const handleSelectPickup = (suggestion: PlaceSuggestion) => {
    setPickupAddress(suggestion.shortAddress);
    setPickupLocation({
      lat: suggestion.lat,
      lon: suggestion.lon,
      label: suggestion.shortAddress,
    });
  };

  const handleSelectDropoff = (suggestion: PlaceSuggestion) => {
    setDropoffAddress(suggestion.shortAddress);
    setDropoffLocation({
      lat: suggestion.lat,
      lon: suggestion.lon,
      label: suggestion.shortAddress,
    });
  };

  // Validation
  const numPrice = Number(proposedPrice);
  const isDateValid = date ? date >= todayStr : false;
  const isPriceValid = !isNaN(numPrice) && numPrice > 0;

  const isFormValid =
    pickupAddress.trim().length > 0 &&
    dropoffAddress.trim().length > 0 &&
    date.length > 0 &&
    isDateValid &&
    time.length > 0 &&
    housingType.length > 0 &&
    estimatedVolume.length > 0 &&
    isPriceValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      setErrorMsg('Veuillez renseigner les adresses de départ et d’arrivée.');
      return;
    }
    if (!date) {
      setErrorMsg('Veuillez choisir une date.');
      return;
    }
    if (date < todayStr) {
      setErrorMsg('La date ne peut pas être dans le passé.');
      return;
    }
    if (!time) {
      setErrorMsg('Veuillez indiquer une heure souhaitée.');
      return;
    }
    if (!housingType) {
      setErrorMsg('Veuillez sélectionner un type de logement.');
      return;
    }
    if (!estimatedVolume) {
      setErrorMsg('Veuillez sélectionner un volume estimé.');
      return;
    }
    if (!isPriceValid) {
      setErrorMsg('Le prix proposé doit être supérieur à 0 DH.');
      return;
    }

    setIsSubmitting(true);

    const volumeInM3 =
      estimatedVolume === 'Petit'
        ? 6
        : estimatedVolume === 'Moyen'
        ? 12
        : 20;

    const calcDistance = routeData?.distanceKm || (selectedTripType === 'city_to_city' ? 85 : 12);
    const calcDuration = routeData?.durationMinutes || 45;

    const newRequestId = createRequest({
      title: `${selectedTripType === 'city_to_city' ? '🚚 Ville à ville' : '📍 Course locale'} : ${housingType} - ${estimatedVolume}`,
      pickup: {
        address: pickupAddress,
        city: pickupAddress.split(',')[1]?.trim() || pickupAddress.split(' ')[0] || 'Départ',
        postalCode: '00000',
        floor: Number(pickupFloor) || 0,
        hasElevator: hasElevator === true,
        hasParking: true,
        latitude: pickupLocation?.lat,
        longitude: pickupLocation?.lon,
      },
      dropoff: {
        address: dropoffAddress,
        city: dropoffAddress.split(',')[1]?.trim() || dropoffAddress.split(' ')[0] || 'Arrivée',
        postalCode: '00000',
        floor: Number(dropoffFloor) || 0,
        hasElevator: hasElevator === true,
        hasParking: true,
        latitude: dropoffLocation?.lat,
        longitude: dropoffLocation?.lon,
      },
      scheduledDate: date,
      scheduledTimeSlot: time,
      items: selectedFurniture.map((item, idx) => ({
        id: `item_${idx}_${Date.now()}`,
        name: item,
        category: 'divers',
        quantity: 1,
        volumeM3: 1,
      })),
      totalVolumeM3: volumeInM3,
      clientProposedPrice: numPrice,
      needHelpers: 1,
      notes: `${selectedTripType === 'city_to_city' ? 'Déménagement interurbain (Ville à ville)' : 'Course de déménagement locale'}. ${housingType} (${roomsCount} pièces) - Meubles : ${
        selectedFurniture.join(', ') || 'Non spécifié'
      }. ${description}`,
      distanceKm: calcDistance,
      estimatedDriveDurationMinutes: calcDuration,
      tripType: selectedTripType || 'city_to_city',
    });

    setIsSubmitting(false);
    navigate('request-details', { requestId: newRequestId });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ========================================================= */}
        {/* 1. CHOOSE TRIP TYPE SCREEN (If not yet chosen)            */}
        {/* ========================================================= */}
        <AnimatePresence mode="wait">
          {!selectedTripType ? (
            <motion.div
              key="trip-type-selector"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="py-6 sm:py-12"
            >
              <div className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-bold border border-emerald-200/80 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                  <span>Nouvelle demande de transport</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
                  Quel type de déménagement ?
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
                  Choisissez la formule adaptée à votre trajet pour un calcul précis de l'itinéraire et des devis de nos transporteurs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Option 1: Ville à ville */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSelectedTripType('city_to_city')}
                  className="bg-white rounded-3xl p-7 text-left border-2 border-slate-200/90 hover:border-[#00A86B] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mb-5 group-hover:bg-[#00A86B] group-hover:text-white transition-colors shadow-xs">
                      <Truck className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-[#111111]">
                        🚚 Ville à ville
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                      Déplacez vos meubles d'une ville à une autre (ex: Rabat → Casablanca, Marrakech → Tanger).
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A86B]">
                    <span>Choisir cette option</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                {/* Option 2: Course Locale */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSelectedTripType('local')}
                  className="bg-white rounded-3xl p-7 text-left border-2 border-slate-200/90 hover:border-[#00A86B] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mb-5 group-hover:bg-[#00A86B] group-hover:text-white transition-colors shadow-xs">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-[#111111]">
                        📍 Course
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                      Déménagement local ou livraison de meubles dans la même ville d'un quartier à un autre.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A86B]">
                    <span>Choisir cette option</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ========================================================= */
            /* FULL NOUVELLE DEMANDE FORM WITH REAL INTERACTIVE MAP     */
            /* ========================================================= */
            <motion.div
              key="main-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Header Breadcrumb & Title */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-bold border border-emerald-200/80 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                    <span>
                      {selectedTripType === 'city_to_city' ? '🚚 Trajet Ville à ville' : '📍 Trajet Course locale'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
                    Publiez votre déménagement
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
                    Remplissez les détails et recevez des propositions directes de chauffeurs disponibles.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTripType(null)}
                  className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Changer de type</span>
                </button>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* ========================================================= */}
                {/* 1. DÉPART & ARRIVÉE + REAL INTERACTIVE MAP                 */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                          Départ & Arrivée
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">
                          {selectedTripType === 'city_to_city'
                            ? 'Recherchez une ville ou adresse de départ et d’arrivée'
                            : 'Recherchez les adresses de votre course locale'}
                        </p>
                      </div>
                    </div>

                    {routeData && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-black border border-emerald-200">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Itinéraire calculé</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Departure Autocomplete */}
                    <LocationAutocomplete
                      label={selectedTripType === 'city_to_city' ? 'Ville / adresse de départ' : 'Adresse de départ'}
                      placeholder={selectedTripType === 'city_to_city' ? 'Ex: Rabat, Agdal ou Casablanca...' : 'Ex: 14 Boulevard d\'Anfa, Casablanca...'}
                      value={pickupAddress}
                      tripType={selectedTripType}
                      pinColor="#00A86B"
                      required
                      onSelect={handleSelectPickup}
                      onChangeText={(txt) => {
                        setPickupAddress(txt);
                        if (!txt) setPickupLocation(null);
                      }}
                    />

                    {/* Destination Autocomplete */}
                    <LocationAutocomplete
                      label={selectedTripType === 'city_to_city' ? 'Ville / adresse d\'arrivée' : 'Adresse d\'arrivée'}
                      placeholder={selectedTripType === 'city_to_city' ? 'Ex: Casablanca, Marrakech ou Tanger...' : 'Ex: Quartier Maârif, Casablanca...'}
                      value={dropoffAddress}
                      tripType={selectedTripType}
                      pinColor="#E11D48"
                      required
                      onSelect={handleSelectDropoff}
                      onChangeText={(txt) => {
                        setDropoffAddress(txt);
                        if (!txt) setDropoffLocation(null);
                      }}
                    />
                  </div>

                  {/* REAL INTERACTIVE MAP */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Carte interactive & Itinéraire routier réel</span>
                      {isCalculatingRoute && (
                        <span className="text-emerald-600 font-bold animate-pulse">
                          Calcul de la route en cours...
                        </span>
                      )}
                    </div>

                    <InteractiveMap
                      pickupLocation={pickupLocation}
                      dropoffLocation={dropoffLocation}
                      routeData={routeData}
                      className="w-full"
                    />

                    {/* Route Details Card */}
                    {routeData && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#00A86B] text-white flex items-center justify-center font-black">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">
                              {pickupLocation?.label} → {dropoffLocation?.label}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Itinéraire optimisé pour véhicule utilitaire
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <span className="block text-[11px] text-slate-500">Distance réelle</span>
                            <span className="text-base font-black text-slate-900">
                              {routeData.distanceKm} km
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-500">Temps estimé</span>
                            <span className="text-base font-black text-[#00A86B]">
                              {formatTripDuration(routeData.durationMinutes)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Étages & Ascenseur */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Étage au départ
                      </label>
                      <select
                        value={pickupFloor}
                        onChange={(e) => setPickupFloor(e.target.value)}
                        className="w-full px-3.5 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      >
                        <option value="0">Rez-de-chaussée</option>
                        <option value="1">1er étage</option>
                        <option value="2">2ème étage</option>
                        <option value="3">3ème étage</option>
                        <option value="4">4ème étage</option>
                        <option value="5">5ème étage ou +</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Étage à l'arrivée
                      </label>
                      <select
                        value={dropoffFloor}
                        onChange={(e) => setDropoffFloor(e.target.value)}
                        className="w-full px-3.5 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      >
                        <option value="0">Rez-de-chaussée</option>
                        <option value="1">1er étage</option>
                        <option value="2">2ème étage</option>
                        <option value="3">3ème étage</option>
                        <option value="4">4ème étage</option>
                        <option value="5">5ème étage ou +</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ascenseur disponible ?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setHasElevator(true)}
                          className={`py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                            hasElevator === true
                              ? 'bg-emerald-50 border-[#00A86B] text-[#00A86B]'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          Oui
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasElevator(false)}
                          className={`py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                            hasElevator === false
                              ? 'bg-emerald-50 border-[#00A86B] text-[#00A86B]'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          Non
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 2. DATE & HEURE                                            */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                        Date & Heure
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Planification de l'intervention
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Date du déménagement <span className="text-[#00A86B]">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          required
                          min={todayStr}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Heure souhaitée <span className="text-[#00A86B]">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="time"
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 3. INFORMATIONS SUR LE DÉMÉNAGEMENT                        */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                        Informations sur le déménagement
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Type de logement et volume global estimé
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Type de logement <span className="text-[#00A86B]">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Studio', icon: Building },
                        { label: 'Appartement', icon: Building2 },
                        { label: 'Maison', icon: Home },
                        { label: 'Bureau', icon: Briefcase },
                      ].map((item) => {
                        const isSelected = housingType === item.label;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setHousingType(item.label)}
                            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'border-[#00A86B] bg-emerald-50/70 text-[#00A86B] shadow-2xs'
                                : 'border-slate-200 bg-[#F8FAFC] text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                isSelected ? 'text-[#00A86B]' : 'text-slate-500'
                              }`}
                            />
                            <span className="text-xs font-bold">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Volume estimé <span className="text-[#00A86B]">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Petit', desc: '≤ 6 m³ · Quelques meubles' },
                        { label: 'Moyen', desc: '7 - 14 m³ · Studio / T2' },
                        { label: 'Grand', desc: '15 - 25 m³ · T3 / Maison' },
                      ].map((vol) => {
                        const isSelected = estimatedVolume === vol.label;
                        return (
                          <button
                            key={vol.label}
                            type="button"
                            onClick={() => setEstimatedVolume(vol.label)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#00A86B] bg-emerald-50/70 text-[#00A86B] shadow-2xs'
                                : 'border-slate-200 bg-[#F8FAFC] text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="block text-xs sm:text-sm font-extrabold">{vol.label}</span>
                            <span className="block text-[11px] text-slate-500 mt-0.5">{vol.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nombre de pièces
                    </label>
                    <select
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                    >
                      <option value="1">1 pièce (Studio)</option>
                      <option value="2">2 pièces</option>
                      <option value="3">3 pièces</option>
                      <option value="4">4 pièces</option>
                      <option value="5+">5 pièces ou plus</option>
                    </select>
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 4. MEUBLES À TRANSPORTER                                   */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                        Meubles à transporter
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Sélectionnez les principaux éléments à déplacer
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {furnitureOptions.map((item) => {
                      const isSelected = selectedFurniture.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleFurniture(item)}
                          className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'border-[#00A86B] bg-emerald-50/80 text-[#00A86B] shadow-2xs'
                              : 'border-slate-200 bg-[#F8FAFC] text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />}
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ajouter des photos <span className="text-slate-400 font-normal">(Optionnel)</span>
                    </label>
                    <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] hover:bg-emerald-50/20 hover:border-[#00A86B]/40 transition-colors cursor-pointer group">
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-[#00A86B] transition-colors" />
                      <span className="text-xs font-bold text-slate-700 mt-2">
                        Cliquez pour ajouter des photos de vos meubles
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        PNG, JPG ou WEBP jusqu'à 10 Mo
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {photoNames.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {photoNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#00A86B] border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 5. PRIX PROPOSÉ                                            */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-bold text-sm">
                      5
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                        Prix proposé
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Indiquez le montant que vous souhaitez allouer au transport
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Votre prix proposé <span className="text-[#00A86B]">*</span>
                    </label>
                    <div className="relative max-w-sm">
                      <input
                        type="number"
                        min="1"
                        required
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        placeholder="Ex: 600"
                        className="w-full pl-5 pr-16 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xl sm:text-2xl font-black text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                        DH
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-2">
                      Les chauffeurs peuvent accepter votre prix ou proposer un autre montant.
                    </p>
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 6. DESCRIPTION                                             */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-bold text-sm">
                      6
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                        Description
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Précisions utiles pour les chauffeurs
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Informations supplémentaires
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez votre déménagement..."
                      className="w-full p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all leading-relaxed resize-none"
                    />
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 7. RÉSUMÉ COMPACT                                          */}
                {/* ========================================================= */}
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 }}
                  className="bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#00A86B]" />
                      <h2 className="text-base sm:text-lg font-extrabold text-[#111111]">
                        Résumé de votre demande
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-[#00A86B]">
                      {selectedTripType === 'city_to_city' ? '🚚 Ville à ville' : '📍 Course'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70">
                      <p className="text-slate-400 font-medium">Départ</p>
                      <p className="font-bold text-slate-800 truncate mt-0.5">
                        {pickupAddress || '—'}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70">
                      <p className="text-slate-400 font-medium">Arrivée</p>
                      <p className="font-bold text-slate-800 truncate mt-0.5">
                        {dropoffAddress || '—'}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70">
                      <p className="text-slate-400 font-medium">Date</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {date || '—'}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70">
                      <p className="text-slate-400 font-medium">Heure</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {time || '—'}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70">
                      <p className="text-slate-400 font-medium">Type de logement</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {housingType || '—'}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/70">
                      <p className="text-slate-400 font-medium">Volume</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {estimatedVolume || '—'}
                      </p>
                    </div>

                    {routeData && (
                      <>
                        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80">
                          <p className="text-emerald-700 font-medium">Distance routière</p>
                          <p className="font-black text-[#00A86B] mt-0.5">
                            {routeData.distanceKm} km
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80">
                          <p className="text-emerald-700 font-medium">Temps de trajet</p>
                          <p className="font-black text-[#00A86B] mt-0.5">
                            {formatTripDuration(routeData.durationMinutes)}
                          </p>
                        </div>
                      </>
                    )}

                    <div className="col-span-2 sm:col-span-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <p className="text-emerald-700 font-medium">Prix proposé</p>
                      <p className="text-base font-black text-[#00A86B] mt-0.5">
                        {proposedPrice ? `${proposedPrice} DH` : '—'}
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* ========================================================= */}
                {/* 8. MAIN BUTTON: "Publier ma demande →"                    */}
                {/* ========================================================= */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full h-14 font-extrabold text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFormValid && !isSubmitting
                        ? 'bg-[#00A86B] hover:bg-[#008f5a] active:bg-[#007a4d] text-white shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Publier ma demande →</span>
                      </>
                    )}
                  </button>
                  {!isFormValid && (
                    <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                      Veuillez renseigner tous les champs obligatoires (*) pour publier votre demande.
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

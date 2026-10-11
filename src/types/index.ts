export type UserRole = 'client' | 'driver';

export type DriverVerificationStatus = 'incomplete' | 'pending' | 'verified';

export interface DriverVerificationData {
  personalInfo: {
    fullName: string;
    phone: string;
    cinNumber: string;
    dateOfBirth: string;
    cinDocumentUrl?: string;
    cinDocumentName?: string;
  };
  drivingLicence: {
    number: string;
    category: string;
    expirationDate: string;
    documentUrl?: string;
    documentName?: string;
  };
  truck: {
    brand: string;
    model: string;
    registrationNumber: string;
    year: string;
    type: string;
    capacity: string;
    registrationDocumentUrl?: string;
    registrationDocumentName?: string;
  };
  verificationStatus: DriverVerificationStatus;
  submittedAt?: string;
}

export interface DriverVehicle {
  id: string;
  type: 'fourgonnette' | 'camion_12m3' | 'camion_20m3' | 'camion_hayon';
  typeName: string;
  model: string;
  licensePlate: string;
  capacityM3: number;
  payloadKg: number;
  hasTailgate: boolean;
  equipment: string[]; // e.g. ['Diable professionnel', 'Sangles d\'arrimage', 'Couvertures de protection', 'Chariot roulant']
  photoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  profileImage?: string;
  city: string;
  rating: number;
  reviewCount: number;
  completedMoves: number;
  memberSince: string;
  isVerified?: boolean;
  email_verified_at?: string | null;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  vehicle?: DriverVehicle;
  driverVerification?: DriverVerificationData;
}

export type FurnitureCategory = 
  | 'salon' 
  | 'chambre' 
  | 'cuisine' 
  | 'electromenager' 
  | 'cartons' 
  | 'divers';

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  quantity: number;
  volumeM3: number; // Volume unitaire en m3
  isFragile?: boolean;
  isHeavy?: boolean;
  needsDisassembly?: boolean;
}

export interface LocationDetails {
  address: string;
  city: string;
  postalCode: string;
  floor: number;
  hasElevator: boolean;
  hasParking: boolean;
  latitude?: number;
  longitude?: number;
  parkingDistanceMeters?: number;
  accessNotes?: string;
}

export type TripType = 'city_to_city' | 'local';

export type RequestStatus = 
  | 'open'            // En attente de propositions
  | 'offers_received' // Propositions reçues, client en train de choisir
  | 'accepted'        // Offre acceptée par le client
  | 'driver_confirmed' // Chauffeur confirmé
  | 'in_progress'     // En cours de transport
  | 'completed'       // Déménagement terminé avec succès
  | 'cancelled';      // Annulé

export interface DriverOffer {
  id: string;
  requestId: string;
  driverId: string;
  driver: User;
  offeredPrice: number;
  clientOriginalPrice: number;
  helpersCount: number; // Nombre de manutentionnaires inclus
  estimatedDurationHours: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface MovingRequest {
  id: string;
  clientId: string;
  client: User;
  title: string;
  pickup: LocationDetails;
  dropoff: LocationDetails;
  scheduledDate: string;
  scheduledTimeSlot: string;
  items: FurnitureItem[];
  totalVolumeM3: number;
  clientProposedPrice: number;
  needHelpers: number; // 0 = transport seul, 1 = 1 aide, 2 = 2 aides
  notes?: string;
  tripType?: TripType;
  createdAt: string;
  distanceKm: number;
  estimatedDriveDurationMinutes: number;
  status: RequestStatus;
  offers: DriverOffer[];
  acceptedOfferId?: string;
  assignedDriver?: User;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  conversationId?: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  createdAt?: string;
  isSystem?: boolean;
  priceOffer?: number;
}

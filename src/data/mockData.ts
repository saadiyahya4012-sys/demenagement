import { User, MovingRequest, FurnitureItem, ChatMessage, DriverVerificationData } from '../types';

export const INITIAL_DRIVER_VERIFICATION: DriverVerificationData = {
  personalInfo: {
    fullName: 'Chauffeur Demo',
    phone: '06 82 14 77 90',
    cinNumber: '',
    dateOfBirth: '',
  },
  drivingLicence: {
    number: '',
    category: 'Permis B (Véhicules utilitaires)',
    expirationDate: '',
  },
  truck: {
    brand: 'Renault',
    model: 'Master Grand Volume',
    registrationNumber: 'EK-492-LM',
    year: '2022',
    type: 'Camion 20m³ avec Hayon élévateur',
    capacity: '20',
  },
  verificationStatus: 'incomplete',
};

export const FURNITURE_CATALOG: Omit<FurnitureItem, 'id' | 'quantity'>[] = [
  { name: 'Canapé 3 places', category: 'salon', volumeM3: 2.2, isHeavy: true },
  { name: 'Canapé d\'angle modulable', category: 'salon', volumeM3: 3.5, isHeavy: true, needsDisassembly: true },
  { name: 'Fauteuil club', category: 'salon', volumeM3: 0.8 },
  { name: 'Table basse en verre', category: 'salon', volumeM3: 0.4, isFragile: true },
  { name: 'Meuble TV & console', category: 'salon', volumeM3: 0.9 },
  { name: 'Bibliothèque 5 étagères', category: 'salon', volumeM3: 1.2, needsDisassembly: true },
  
  { name: 'Lit Queen Size (160x200) + Matelas', category: 'chambre', volumeM3: 2.0, needsDisassembly: true },
  { name: 'Lit simple 90x190', category: 'chambre', volumeM3: 1.1, needsDisassembly: true },
  { name: 'Armoire dressing 2 portes', category: 'chambre', volumeM3: 2.5, isHeavy: true, needsDisassembly: true },
  { name: 'Commode 4 tiroirs', category: 'chambre', volumeM3: 0.7, isHeavy: true },
  { name: 'Table de chevet (x2)', category: 'chambre', volumeM3: 0.3 },
  
  { name: 'Table à manger 6 personnes', category: 'cuisine', volumeM3: 1.4, needsDisassembly: true },
  { name: 'Chaises de salle à manger (lot de 4)', category: 'cuisine', volumeM3: 0.8 },
  { name: 'Buffet bas enfilade', category: 'cuisine', volumeM3: 1.6, isHeavy: true },
  
  { name: 'Réfrigérateur américain', category: 'electromenager', volumeM3: 1.8, isHeavy: true },
  { name: 'Réfrigérateur combiné', category: 'electromenager', volumeM3: 1.1, isHeavy: true },
  { name: 'Lave-linge hublot', category: 'electromenager', volumeM3: 0.5, isHeavy: true },
  { name: 'Lave-vaisselle', category: 'electromenager', volumeM3: 0.5 },
  
  { name: 'Lot de 10 cartons standards', category: 'cartons', volumeM3: 1.0 },
  { name: 'Lot de 20 cartons standards', category: 'cartons', volumeM3: 2.0 },
  { name: 'Carton penderie vêtements', category: 'cartons', volumeM3: 0.5 },
  
  { name: 'Bureau d\'angle en L', category: 'divers', volumeM3: 1.2, needsDisassembly: true },
  { name: 'Vélo électrique', category: 'divers', volumeM3: 0.6 },
  { name: 'Miroir baroque grand format', category: 'divers', volumeM3: 0.3, isFragile: true },
  { name: 'Plantes volumineuses d\'intérieur', category: 'divers', volumeM3: 0.5, isFragile: true }
];

export const MOCK_CLIENT: User = {
  id: 'client_001',
  name: 'Client Demo',
  email: 'client@moovvert.com',
  phone: '06 45 28 91 03',
  role: 'client',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
  profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
  city: 'Lyon (69003)',
  rating: 4.9,
  reviewCount: 14,
  completedMoves: 3,
  memberSince: 'Mars 2024',
  isVerified: true,
  email_verified_at: '2024-03-01T00:00:00Z',
  isEmailVerified: true
};

export const MOCK_DRIVER: User = {
  id: 'driver_001',
  name: 'Chauffeur Demo',
  email: 'driver@moovvert.com',
  phone: '06 82 14 77 90',
  role: 'driver',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  city: 'Rabat & Casablanca (Maroc)',
  rating: 4.9,
  reviewCount: 124,
  completedMoves: 142,
  memberSince: 'Janvier 2023',
  isVerified: false,
  email_verified_at: '2023-01-15T00:00:00Z',
  isEmailVerified: true,
  driverVerification: INITIAL_DRIVER_VERIFICATION,
  vehicle: {
    id: 'veh_01',
    type: 'camion_20m3',
    typeName: 'Camion 20m³ avec Hayon élévateur',
    model: 'Renault Master Grand Volume',
    licensePlate: 'EK-492-LM',
    capacityM3: 20,
    payloadKg: 1100,
    hasTailgate: true,
    equipment: [
      'Hayon élévateur hydraulique 750kg',
      'Diable professionnel tous terrains',
      'Chariot 4 roues capitonné',
      '12 couvertures de protection épaisses',
      '8 sangles d\'arrimage professionnelles',
      'Kit démontage tournevis / cliquet'
    ]
  }
};

export const MOCK_OTHER_DRIVERS: User[] = [
  {
    id: 'driver_02',
    name: 'Antoine Morel',
    email: 'antoine.morel@moov.fr',
    phone: '06 12 33 44 55',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    city: 'Lyon et banlieue',
    rating: 4.8,
    reviewCount: 42,
    completedMoves: 67,
    memberSince: 'Septembre 2023',
    isVerified: true,
    vehicle: {
      id: 'veh_02',
      type: 'camion_12m3',
      typeName: 'Fourgon 12m³',
      model: 'Peugeot Boxer L3H2',
      licensePlate: 'GF-318-PX',
      capacityM3: 12,
      payloadKg: 1350,
      hasTailgate: false,
      equipment: [
        'Diable renforcé',
        '6 couvertures de protection',
        '6 sangles à cliquet',
        'Plateau roulant'
      ]
    }
  },
  {
    id: 'driver_03',
    name: 'Sarah & Thomas Express',
    email: 'sarah.thomas.dem@moov.fr',
    phone: '06 99 88 77 66',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    city: 'Région Rhône-Alpes',
    rating: 5.0,
    reviewCount: 112,
    completedMoves: 198,
    memberSince: 'Novembre 2022',
    isVerified: true,
    vehicle: {
      id: 'veh_03',
      type: 'camion_hayon',
      typeName: 'Camion 22m³ avec Hayon + Équipe 2 personnes',
      model: 'Iveco Daily Caisson Hayon',
      licensePlate: 'HN-802-TR',
      capacityM3: 22,
      payloadKg: 950,
      hasTailgate: true,
      equipment: [
        '2 manutentionnaires expérimentés',
        'Hayon électrique',
        'Matériel d\'emballage et housses matelas',
        'Sangles et cales de blocage'
      ]
    }
  }
];

export const INITIAL_REQUESTS: MovingRequest[] = [];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

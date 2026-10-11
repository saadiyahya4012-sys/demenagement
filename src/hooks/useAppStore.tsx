import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, MovingRequest, ChatMessage, DriverOffer, DriverVehicle, DriverVerificationData, DriverVerificationStatus } from '../types';
import { MOCK_CLIENT, MOCK_DRIVER, INITIAL_REQUESTS, INITIAL_MESSAGES, INITIAL_DRIVER_VERIFICATION } from '../data/mockData';

export type AppRoute =
  | 'splash'
  | 'auth'
  | 'verify-email'
  | 'forgot-password'
  | 'client-dashboard'
  | 'create-request'
  | 'my-requests'
  | 'request-details'
  | 'offers'
  | 'chat'
  | 'client-profile'
  | 'driver-dashboard'
  | 'available-requests'
  | 'driver-request-details'
  | 'my-jobs'
  | 'driver-chat'
  | 'driver-profile';

export interface NavigationParams {
  requestId?: string;
  offerId?: string;
  email?: string;
  role?: UserRole;
  message?: string;
}

interface NavigationState {
  currentRoute: AppRoute;
  selectedRequestId?: string;
  selectedOfferId?: string;
  pendingEmail?: string;
  pendingRole?: UserRole;
  authMessage?: string;
}

interface AppContextType {
  role: UserRole;
  clientUser: User;
  driverUser: User;
  currentUser: User;
  requests: MovingRequest[];
  messages: Record<string, ChatMessage[]>;
  currentRoute: AppRoute;
  selectedRequestId?: string;
  selectedOfferId?: string;
  pendingEmail?: string;
  pendingRole?: UserRole;
  authMessage?: string;
  setRole: (role: UserRole) => void;
  switchMode: (newRole: UserRole) => void;
  navigate: (route: AppRoute, params?: NavigationParams) => void;
  signOut: () => Promise<void>;
  createRequest: (newReq: Omit<MovingRequest, 'id' | 'clientId' | 'client' | 'createdAt' | 'status' | 'offers'>) => string;
  addDriverOffer: (requestId: string, offeredPrice: number, message: string, helpersCount: number) => void;
  acceptOffer: (requestId: string, offerId: string) => void;
  sendMessage: (requestId: string, text: string) => void;
  updateClientProfile: (updates: Partial<User>) => void;
  updateClientProfilePhoto: (photoUrl: string | null) => void;
  deleteClientProfilePhoto: () => void;
  updateDriverProfile: (updates: Partial<User>, vehicleUpdates?: Partial<DriverVehicle>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updateRequestStatus: (requestId: string, status: MovingRequest['status']) => void;
  isDriverVerified: boolean;
  driverVerification: DriverVerificationData;
  updateDriverVerification: (data: Partial<DriverVerificationData>) => void;
  setDriverVerificationStatus: (status: DriverVerificationStatus) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'moovvert_v3_';

const CLIENT_PROFILE_STORAGE_KEY = 'moovvert_client_profile';
const CHAUFFEUR_PROFILE_STORAGE_KEY = 'moovvert_chauffeur_profile';

// Clean legacy localStorage keys from prior sessions if present
try {
  [
    'moovvert_v1_requests', 'moovvert_v1_messages', 'moovvert_v2_requests', 'moovvert_v2_messages',
    'moovvert_v1_client', 'moovvert_v2_client', 'moovvert_v3_client',
    'moovvert_v1_driver', 'moovvert_v2_driver', 'moovvert_v3_driver'
  ].forEach(k => {
    localStorage.removeItem(k);
  });
} catch {
  // Ignore in sandboxed environment
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'role');
    return (saved as UserRole) || 'client';
  });

  // Dedicated Client Profile State (strictly isolated from Chauffeur)
  const [clientUser, setClientUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(CLIENT_PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...MOCK_CLIENT,
          ...parsed,
          id: 'client_001',
          role: 'client' as const,
        };
      }
    } catch {
      // ignore
    }
    return MOCK_CLIENT;
  });

  // Dedicated Chauffeur Profile State (strictly isolated from Client)
  const [driverUser, setDriverUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(CHAUFFEUR_PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...MOCK_DRIVER,
          ...parsed,
          id: 'driver_001',
          role: 'driver' as const,
        };
      }
    } catch {
      // ignore
    }
    return MOCK_DRIVER;
  });

  const [requests, setRequests] = useState<MovingRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [navState, setNavState] = useState<NavigationState>(() => {
    return { currentRoute: 'splash' };
  });

  // Sync to separate localStorage keys
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(CLIENT_PROFILE_STORAGE_KEY, JSON.stringify(clientUser));
  }, [clientUser]);

  useEffect(() => {
    localStorage.setItem(CHAUFFEUR_PROFILE_STORAGE_KEY, JSON.stringify(driverUser));
  }, [driverUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'messages', JSON.stringify(messages));
  }, [messages]);

  const currentUser = role === 'client' ? clientUser : driverUser;

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'client') {
      setNavState({ currentRoute: 'client-dashboard' });
    } else {
      setNavState({ currentRoute: 'driver-dashboard' });
    }
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'active_user');
    navigate('auth');
  };

  const navigate = (route: AppRoute, params?: NavigationParams) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNavState(prev => ({
      currentRoute: route,
      selectedRequestId: params?.requestId ?? (route === 'client-dashboard' || route === 'driver-dashboard' ? undefined : prev.selectedRequestId),
      selectedOfferId: params?.offerId,
      pendingEmail: params?.email ?? (route === 'verify-email' ? prev.pendingEmail : undefined),
      pendingRole: params?.role ?? (route === 'verify-email' ? prev.pendingRole : undefined),
      authMessage: params?.message,
    }));
  };

  const createRequest = (newReq: Omit<MovingRequest, 'id' | 'clientId' | 'client' | 'createdAt' | 'status' | 'offers'>): string => {
    const id = `req_${Date.now()}`;
    const fullRequest: MovingRequest = {
      ...newReq,
      id,
      clientId: clientUser.id,
      client: clientUser,
      createdAt: new Date().toISOString(),
      status: 'open',
      offers: [],
    };

    setRequests(prev => [fullRequest, ...prev]);
    return id;
  };

  const addDriverOffer = (requestId: string, offeredPrice: number, message: string, helpersCount: number) => {
    const isVerified = (driverUser.driverVerification?.verificationStatus || 'incomplete') === 'verified';
    if (!isVerified) {
      console.warn('Action blocked: Chauffeur must complete verification before making an offer.');
      return;
    }
    const offerId = `off_${Date.now()}`;
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        const newOffer: DriverOffer = {
          id: offerId,
          requestId,
          driverId: driverUser.id,
          driver: driverUser,
          offeredPrice,
          clientOriginalPrice: req.clientProposedPrice,
          helpersCount,
          estimatedDurationHours: Math.max(1.5, Math.round((req.totalVolumeM3 / 3 + 1) * 10) / 10),
          message,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };

        const updatedOffers = [...req.offers.filter(o => o.driverId !== driverUser.id), newOffer];
        return {
          ...req,
          status: req.status === 'open' ? 'offers_received' : req.status,
          offers: updatedOffers,
        };
      })
    );
  };

  const acceptOffer = (requestId: string, offerId: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        const targetOffer = req.offers.find(o => o.id === offerId);
        if (!targetOffer) return req;

        const updatedOffers = req.offers.map(o => ({
          ...o,
          status: (o.id === offerId ? 'accepted' : 'declined') as DriverOffer['status'],
        }));

        // Send system welcome message
        const welcomeMsg: ChatMessage = {
          id: `msg_sys_${Date.now()}`,
          requestId,
          senderId: 'system',
          senderName: 'MoovVert',
          senderRole: 'client',
          text: `Proposition de ${targetOffer.driver.name} acceptée au tarif de ${targetOffer.offeredPrice} DH. La mission est confirmée ! Vous pouvez désormais échanger directement pour caler les derniers détails logistiques.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        };

        setMessages(m => ({
          ...m,
          [requestId]: [...(m[requestId] || []), welcomeMsg],
        }));

        return {
          ...req,
          status: 'driver_confirmed',
          acceptedOfferId: offerId,
          assignedDriver: targetOffer.driver,
          offers: updatedOffers,
        };
      })
    );
  };

  const sendMessage = (requestId: string, text: string) => {
    if (!text.trim()) return;
    const req = requests.find(r => r.id === requestId);
    const activeSender = role === 'client' ? clientUser : driverUser;
    const receiver = role === 'client'
      ? (req?.assignedDriver || driverUser)
      : (req?.client || clientUser);

    const now = new Date();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      requestId,
      conversationId: requestId,
      senderId: activeSender.id,
      receiverId: receiver.id,
      senderName: activeSender.name,
      senderRole: role,
      text: text.trim(),
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), newMsg],
    }));
  };

  const switchMode = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'client') {
      navigate('client-dashboard');
    } else {
      navigate('driver-dashboard');
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    // Only update the active role user - NEVER both!
    if (role === 'client') {
      updateClientProfile(updates);
    } else {
      updateDriverProfile(updates);
    }
  };

  const updateClientProfile = (updates: Partial<User>) => {
    setClientUser(prev => ({
      ...prev,
      ...updates,
      id: 'client_001',
      role: 'client',
    }));
    // ABSOLUTE SEPARATION: NEVER modify driverUser under any circumstances!
  };

  // Dedicated Client photo updater - strictly updates Client photo only
  const updateClientProfilePhoto = (photoUrl: string | null) => {
    const finalPhoto = photoUrl || MOCK_CLIENT.avatar;
    setClientUser(prev => ({
      ...prev,
      profileImage: photoUrl || undefined,
      avatar: finalPhoto,
    }));
    // ABSOLUTE SEPARATION: NEVER modify driverUser under any circumstances!
  };

  // Dedicated Client photo reset - resets Client photo back to default
  const deleteClientProfilePhoto = () => {
    setClientUser(prev => ({
      ...prev,
      profileImage: undefined,
      avatar: MOCK_CLIENT.avatar,
    }));
    // ABSOLUTE SEPARATION: NEVER modify driverUser under any circumstances!
  };

  const updateDriverProfile = (updates: Partial<User>, vehicleUpdates?: Partial<DriverVehicle>) => {
    setDriverUser(prev => {
      const updatedVehicle = vehicleUpdates && prev.vehicle
        ? { ...prev.vehicle, ...vehicleUpdates }
        : prev.vehicle;
      return {
        ...prev,
        ...updates,
        id: 'driver_001',
        role: 'driver',
        vehicle: updatedVehicle,
      };
    });
    // ABSOLUTE SEPARATION: NEVER modify clientUser under any circumstances!
  };

  const updateRequestStatus = (requestId: string, status: MovingRequest['status']) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const driverVerification: DriverVerificationData = driverUser.driverVerification || INITIAL_DRIVER_VERIFICATION;
  const isDriverVerified = driverVerification.verificationStatus === 'verified';

  const updateDriverVerification = (data: Partial<DriverVerificationData>) => {
    setDriverUser(prev => {
      const currentVerif = prev.driverVerification || INITIAL_DRIVER_VERIFICATION;
      const updatedVerif: DriverVerificationData = {
        ...currentVerif,
        ...data,
        personalInfo: {
          ...currentVerif.personalInfo,
          ...(data.personalInfo || {}),
        },
        drivingLicence: {
          ...currentVerif.drivingLicence,
          ...(data.drivingLicence || {}),
        },
        truck: {
          ...currentVerif.truck,
          ...(data.truck || {}),
        },
      };

      const newStatus = data.verificationStatus !== undefined ? data.verificationStatus : updatedVerif.verificationStatus;
      updatedVerif.verificationStatus = newStatus;

      return {
        ...prev,
        isVerified: newStatus === 'verified',
        driverVerification: updatedVerif,
      };
    });
  };

  const setDriverVerificationStatus = (status: DriverVerificationStatus) => {
    setDriverUser(prev => {
      const currentVerif = prev.driverVerification || INITIAL_DRIVER_VERIFICATION;
      return {
        ...prev,
        isVerified: status === 'verified',
        driverVerification: {
          ...currentVerif,
          verificationStatus: status,
        },
      };
    });
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'requests');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'messages');
    localStorage.removeItem(CLIENT_PROFILE_STORAGE_KEY);
    localStorage.removeItem(CHAUFFEUR_PROFILE_STORAGE_KEY);
    setClientUser(MOCK_CLIENT);
    setDriverUser(MOCK_DRIVER);
    setRequests([]);
    setMessages({});
  };

  return (
    <AppContext.Provider
      value={{
        role,
        clientUser,
        driverUser,
        currentUser,
        requests,
        messages,
        currentRoute: navState.currentRoute,
        selectedRequestId: navState.selectedRequestId,
        selectedOfferId: navState.selectedOfferId,
        pendingEmail: navState.pendingEmail,
        pendingRole: navState.pendingRole,
        authMessage: navState.authMessage,
        setRole,
        switchMode,
        navigate,
        signOut,
        createRequest,
        addDriverOffer,
        acceptOffer,
        sendMessage,
        updateClientProfile,
        updateClientProfilePhoto,
        deleteClientProfilePhoto,
        updateDriverProfile,
        updateUserProfile,
        updateRequestStatus,
        isDriverVerified,
        driverVerification,
        updateDriverVerification,
        setDriverVerificationStatus,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

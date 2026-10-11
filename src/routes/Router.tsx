import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../hooks/useAppStore';

// Splash Screen
import { SplashScreen } from '../components/common/SplashScreen';

// Unified Authentication Page
import { AuthPage } from '../pages/auth/AuthPage';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// Client pages
import { ClientDashboard } from '../pages/client/ClientDashboard';
import { CreateMovingRequest } from '../pages/client/CreateMovingRequest';
import { MyRequests } from '../pages/client/MyRequests';
import { RequestDetails } from '../pages/client/RequestDetails';
import { Offers } from '../pages/client/Offers';
import { Chat } from '../pages/client/Chat';
import { ClientProfile } from '../pages/client/ClientProfile';

// Driver pages
import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { AvailableRequests } from '../pages/driver/AvailableRequests';
import { DriverRequestDetails } from '../pages/driver/DriverRequestDetails';
import { MyJobs } from '../pages/driver/MyJobs';
import { DriverChat } from '../pages/driver/DriverChat';
import { DriverProfile } from '../pages/driver/DriverProfile';

export const Router: React.FC = () => {
  const { currentRoute } = useAppStore();

  const renderRoute = () => {
    switch (currentRoute) {
      // Splash Intro
      case 'splash':
        return <SplashScreen />;

      // Auth route
      case 'auth':
        return <AuthPage />;
      case 'verify-email':
        return <VerifyEmail />;
      case 'forgot-password':
        return <ForgotPassword />;

      // Client routes
      case 'client-dashboard':
        return <ClientDashboard />;
      case 'create-request':
        return <CreateMovingRequest />;
      case 'my-requests':
        return <MyRequests />;
      case 'request-details':
        return <RequestDetails />;
      case 'offers':
        return <Offers />;
      case 'chat':
        return <Chat />;
      case 'client-profile':
        return <ClientProfile />;

      // Driver routes
      case 'driver-dashboard':
        return <DriverDashboard />;
      case 'available-requests':
        return <AvailableRequests />;
      case 'driver-request-details':
        return <DriverRequestDetails />;
      case 'my-jobs':
        return <MyJobs />;
      case 'driver-chat':
        return <DriverChat />;
      case 'driver-profile':
        return <DriverProfile />;

      default:
        return <SplashScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRoute}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="min-h-screen"
      >
        {renderRoute()}
      </motion.div>
    </AnimatePresence>
  );
};


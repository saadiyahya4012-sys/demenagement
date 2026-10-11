/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './hooks/useAppStore';
import { Router } from './routes/Router';

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

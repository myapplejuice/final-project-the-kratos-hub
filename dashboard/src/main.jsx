import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Gate from './screens/gate';
import Dashboard from './screens/dashboard';
import { routes } from './utils/constants';
import { AppProvider } from './utils/app-context';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path={routes.main} element={<App />} />
          <Route path={routes.gate} element={<Gate />} />
          <Route path={routes.dashboard} element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
);
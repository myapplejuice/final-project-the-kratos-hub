import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './utils/constants';
import { PopupsProvider } from './utils/popups.provider';
import App from './App';
import Gate from './screens/gate';
import Dashboard from './screens/dashboard';
import UserProfile from './screens/user-profile';
import VerificationApplication from './screens/verification-application';
import UserReport from './screens/report';
import FoodProfile from './screens/food-profile';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PopupsProvider>
            <BrowserRouter>
                <Routes>
                    <Route path={routes.main} element={<App />} />
                    <Route path={routes.gate} element={<Gate />} />
                    <Route path={routes.dashboard} element={<Dashboard />} />
                    <Route path={routes.user_profile} element={<UserProfile />} />
                    <Route path={routes.verification_application} element={<VerificationApplication />} />
                    <Route path={routes.report} element={<UserReport />} />
                    <Route path={routes.food_profile} element={<FoodProfile />} />
                </Routes>
            </BrowserRouter>
        </PopupsProvider>
    </StrictMode>
);
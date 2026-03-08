import { createBrowserRouter } from 'react-router-dom';
import { PATHS } from './paths';

import LandingPage from "../pages/LandingPage.tsx";
import AdminPanel from "../pages/AdminPanel.tsx";
import Offers from "../pages/Offers.tsx";
import UserDashboard from "../pages/UserDashboard.tsx";
import PhotographerDashboard from "../pages/PhotographerDashboard.tsx";
import LoginPage from '../pages/LoginPage.tsx';
import SignUpPage from '../pages/SignUpPage.tsx';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthGuard } from '../guards/AuthGuard';

const NotFound = () => <div className="text-center text-red-500 text-2xl mt-10">404 - Page Not Found</div>;

export const router = createBrowserRouter([
    { path: PATHS.HOME, element: <LandingPage /> },
    { path: PATHS.LOGIN, element: <LoginPage /> },
    { path: PATHS.SIGN_UP, element: <SignUpPage /> },
    { path: PATHS.OFFERS, element: <Offers /> },

    {
        element: <AuthGuard allowedRoles={['user']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [{ path: PATHS.USER_DASHBOARD, element: <UserDashboard /> }],
            },
        ],
    },

    {
        element: <AuthGuard allowedRoles={['photographer']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [{ path: PATHS.PHOTOGRAPHER_DASHBOARD, element: <PhotographerDashboard /> }],
            },
        ],
    },

    {
        element: <AuthGuard allowedRoles={['admin']} />,
        children: [
            {
                element: <DashboardLayout />, // Or a specific AdminLayout
                children: [{ path: PATHS.ADMIN_PANEL, element: <AdminPanel /> }],
            },
        ],
    },
    
    { path: PATHS.NOT_FOUND, element: <NotFound /> },
]);
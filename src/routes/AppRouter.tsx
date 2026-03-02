import { createBrowserRouter } from 'react-router-dom';
import { PATHS } from './paths';

import LandingPage from "../pages/LandingPage.tsx";
import AdminPanel from "../pages/AdminPanel.tsx";
import Offers from "../pages/Offers.tsx";
import UserDashboard from "../pages/UserDashboard.tsx";

import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthGuard } from '../guards/AuthGuard';


const Login = () => <div>Login</div>;
const SignUp = () => <div>Sign Up (Choose Role)</div>;
const PhotographerDashboard = () => <div>Photographer Dashboard</div>;
const NotFound = () => <div className="text-center text-red-500 text-2xl mt-10">404 - Page Not Found</div>;

export const router = createBrowserRouter([
    { path: PATHS.HOME, element: <LandingPage /> },
    { path: PATHS.LOGIN, element: <Login /> },
    { path: PATHS.SIGN_UP, element: <SignUp /> },
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
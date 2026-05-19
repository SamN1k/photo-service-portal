import { createBrowserRouter } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import Offers from '../pages/Offers';
import PhotographerDashboard from '../pages/PhotographerDashboard';
import SignUpPage from '../pages/SignUpPage';
import UserDashboard from '../pages/UserDashboard';
import HttpErrorPage from '../pages/errors/HttpErrorPage';
import { AuthGuard } from '../guards/AuthGuard';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PATHS } from './paths';

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
                element: <DashboardLayout />,
                children: [{ path: PATHS.ADMIN_PANEL, element: <AdminPanel /> }],
            },
        ],
    },
    {
        path: PATHS.UNAUTHORIZED,
        element: (
            <HttpErrorPage
                statusCode={401}
                title="Unauthorized"
                description="Trebuie sa fii autentificat pentru a accesa aceasta pagina."
            />
        ),
    },
    {
        path: PATHS.FORBIDDEN,
        element: (
            <HttpErrorPage
                statusCode={403}
                title="Forbidden"
                description="Contul curent nu are rolul necesar pentru aceasta zona."
            />
        ),
    },
    {
        path: PATHS.SERVER_ERROR,
        element: (
            <HttpErrorPage
                statusCode={500}
                title="Internal Server Error"
                description="API-ul a returnat o eroare de serviciu. Datele pot fi reincarcate dupa revenirea serverului."
            />
        ),
    },
    {
        path: PATHS.NOT_FOUND,
        element: <HttpErrorPage statusCode={404} title="Not Found" description="Ruta accesata nu exista in aplicatia demo." />,
    },
]);

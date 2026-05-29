import { createBrowserRouter } from 'react-router-dom';
import AccountSettingsPage from '../pages/AccountSettingsPage';
import AdminReportsPage from '../pages/AdminReportsPage';
import AdminPanel from '../pages/AdminPanel';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import Offers from '../pages/Offers';
import PaymentPage from '../pages/PaymentPage';
import PhotographerDashboard from '../pages/PhotographerDashboard';
import PhotographerPortfolioPage from '../pages/PhotographerPortfolioPage';
import PhotographerPortfolioSettingsPage from '../pages/PhotographerPortfolioSettingsPage';
import PhotographerResultsPage from '../pages/PhotographerResultsPage';
import ProblemReportPage from '../pages/ProblemReportPage';
import SignUpPage from '../pages/SignUpPage';
import UserDashboard from '../pages/UserDashboard';
import UserResultsPage from '../pages/UserResultsPage';
import HttpErrorPage from '../pages/errors/HttpErrorPage';
import { AuthGuard } from '../guards/AuthGuard';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PATHS } from './paths';

export const router = createBrowserRouter([
    { path: PATHS.HOME, element: <LandingPage /> },
    { path: PATHS.LOGIN, element: <LoginPage /> },
    { path: PATHS.SIGN_UP, element: <SignUpPage /> },
    { path: PATHS.OFFERS, element: <Offers /> },
    { path: PATHS.PHOTOGRAPHER_PUBLIC_PORTFOLIO, element: <PhotographerPortfolioPage /> },
    {
        element: <AuthGuard allowedRoles={['user']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: PATHS.USER_DASHBOARD, element: <UserDashboard /> },
                    { path: PATHS.USER_PAYMENT, element: <PaymentPage /> },
                    { path: PATHS.USER_RESULTS, element: <UserResultsPage /> },
                ],
            },
        ],
    },
    {
        element: <AuthGuard allowedRoles={['user', 'photographer', 'admin']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [{ path: PATHS.ACCOUNT_SETTINGS, element: <AccountSettingsPage /> }],
            },
        ],
    },
    {
        element: <AuthGuard allowedRoles={['user', 'photographer']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [{ path: PATHS.REPORT_PROBLEM, element: <ProblemReportPage /> }],
            },
        ],
    },
    {
        element: <AuthGuard allowedRoles={['photographer']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: PATHS.PHOTOGRAPHER_DASHBOARD, element: <PhotographerDashboard /> },
                    { path: PATHS.PHOTOGRAPHER_PORTFOLIO_SETTINGS, element: <PhotographerPortfolioSettingsPage /> },
                    { path: PATHS.PHOTOGRAPHER_RESULTS, element: <PhotographerResultsPage /> },
                ],
            },
        ],
    },
    {
        element: <AuthGuard allowedRoles={['admin']} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: PATHS.ADMIN_PANEL, element: <AdminPanel /> },
                    { path: PATHS.ADMIN_REPORTS, element: <AdminReportsPage /> },
                ],
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

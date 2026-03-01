import { Navigate, Outlet } from 'react-router-dom';
import { PATHS, type UserRole } from '../routes/paths';

interface AuthGuardProps {
    allowedRoles: UserRole[];
}

export const AuthGuard = ({ allowedRoles }: AuthGuardProps) => {
    const isAuthenticated = true; // e.g., !!localStorage.getItem('token');
    const userRole: UserRole = 'user'; // e.g., fetch from your auth store

    if (!isAuthenticated) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={PATHS.HOME} replace />;
    }

    return <Outlet />;
};
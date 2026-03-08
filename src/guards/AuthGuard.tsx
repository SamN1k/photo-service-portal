import { Navigate, Outlet } from 'react-router-dom';
import { PATHS, type UserRole } from '../routes/paths';

interface AuthGuardProps {
    allowedRoles: UserRole[];
}

const isUserRole = (value: string | null): value is UserRole => {
    return value === 'user' || value === 'photographer' || value === 'admin' || value === 'guest';
};

export const AuthGuard = ({ allowedRoles }: AuthGuardProps) => {
    const isAuthenticated = true; // e.g., !!localStorage.getItem('token');

    const storedRole = typeof window !== 'undefined' ? window.localStorage.getItem('mockRole') : null;
    const userRole: UserRole = isUserRole(storedRole) ? storedRole : 'user';

    if (!isAuthenticated) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={PATHS.HOME} replace />;
    }

    return <Outlet />;
};

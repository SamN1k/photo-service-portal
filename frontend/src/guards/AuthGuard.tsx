import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PATHS, type UserRole } from '../routes/paths';

interface AuthGuardProps {
    allowedRoles?: UserRole[];
}

export const AuthGuard = ({ allowedRoles }: AuthGuardProps) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={PATHS.LOGIN} replace state={{ from: location.pathname }} />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to={PATHS.FORBIDDEN} replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
};

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PATHS } from '../routes/paths';
import { ThemeToggle } from './ThemeToggle';

const dashboardPathByRole = {
    user: PATHS.USER_DASHBOARD,
    photographer: PATHS.PHOTOGRAPHER_DASHBOARD,
    admin: PATHS.ADMIN_PANEL,
} as const;

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(PATHS.LOGIN, { replace: true });
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
                <Link to={PATHS.HOME} className="text-lg font-bold text-slate-950">
                    Photo<span className="text-teal-700">Portal</span>
                </Link>

                <nav className="flex flex-wrap items-center gap-2 text-sm">
                    <Link to={PATHS.OFFERS} className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                        Oferte
                    </Link>
                    {isAuthenticated && user ? (
                        <>
                            <Link
                                to={dashboardPathByRole[user.role]}
                                className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                            >
                                Dashboard
                            </Link>
                            <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-slate-700 sm:inline-flex">
                                {user.fullName} · {user.role}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to={PATHS.LOGIN} className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                                Login
                            </Link>
                            <Link to={PATHS.SIGN_UP} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700">
                                Cont nou
                            </Link>
                        </>
                    )}
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
};

export default Header;

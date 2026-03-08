import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 px-6 py-4 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
                <Link to={PATHS.HOME} className="text-lg font-bold text-slate-900">
                    Photo<span className="text-blue-600">Portal</span>
                </Link>

                <nav className="flex items-center gap-3 text-sm">
                    <Link to={PATHS.OFFERS} className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                        Oferte
                    </Link>
                    <Link to={PATHS.LOGIN} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700">
                        Login
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;

import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';

const Header = () => {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-50">
            <div className="flex items-center justify-between w-full">
                <Link to={PATHS.HOME} className="text-xl font-bold text-blue-600">
                    PhotoPortal
                </Link>

                <nav className="flex items-center gap-6">
                    <Link to={PATHS.OFFERS} className="text-gray-600 hover:text-blue-600 transition">
                        Browse Offers
                    </Link>
                    <Link
                        to={PATHS.LOGIN}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Login
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
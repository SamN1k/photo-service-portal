import { NavLink } from 'react-router-dom';
import { PATHS, type UserRole } from '../routes/paths';

const Sidebar = () => {
    // In a real app, you would get this from your Auth context/state
    const userRole: UserRole = 'user';

    const navItems = [
        { name: 'User Dashboard', path: PATHS.USER_DASHBOARD, role: 'user' },
        { name: 'My Portfolio', path: PATHS.PHOTOGRAPHER_DASHBOARD, role: 'photographer' },
        { name: 'Admin Panel', path: PATHS.ADMIN_PANEL, role: 'admin' },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-[calc(100vh-64px)] p-4 flex flex-col">
            <div className="mb-8">
                <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Navigation</p>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.filter(item => item.role === userRole).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `p-3 rounded-lg transition ${
                                isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="pt-4 border-t border-gray-800">
                <button className="w-full text-left p-3 text-red-400 hover:bg-gray-800 rounded-lg transition">
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
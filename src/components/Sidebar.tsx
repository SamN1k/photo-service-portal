import { NavLink } from 'react-router-dom';
import { PATHS, type UserRole } from '../routes/paths';

const Sidebar = () => {
    const userRole: UserRole = 'user';

    const navItems = [
        { name: 'User Dashboard', path: PATHS.USER_DASHBOARD, role: 'user', emoji: '📊' },
        { name: 'My Portfolio', path: PATHS.PHOTOGRAPHER_DASHBOARD, role: 'photographer', emoji: '🖼️' },
        { name: 'Admin Panel', path: PATHS.ADMIN_PANEL, role: 'admin', emoji: '🛡️' },
    ];

    return (
        <aside className="hidden w-72 border-r border-slate-200 bg-white/80 p-5 backdrop-blur lg:block">
            <div className="mb-6 soft-panel p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">workspace</p>
                <p className="mt-1 font-semibold text-slate-800">Minimal Dashboard UI</p>
            </div>

            <nav className="flex flex-col gap-2">
                {navItems
                    .filter((item) => item.role === userRole)
                    .map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                        >
                            <span>{item.emoji}</span>
                            {item.name}
                        </NavLink>
                    ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

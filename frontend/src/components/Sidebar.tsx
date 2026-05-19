import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PATHS, type UserRole } from '../routes/paths';

interface NavItem {
    name: string;
    path: string;
    roles: UserRole[];
}

const navItems: NavItem[] = [
    { name: 'Rezervarile mele', path: PATHS.USER_DASHBOARD, roles: ['user'] },
    { name: 'Ofertele mele', path: PATHS.PHOTOGRAPHER_DASHBOARD, roles: ['photographer'] },
    { name: 'Administrare', path: PATHS.ADMIN_PANEL, roles: ['admin'] },
    { name: 'Catalog oferte', path: PATHS.OFFERS, roles: ['user', 'photographer', 'admin'] },
    { name: 'Setari cont', path: PATHS.ACCOUNT_SETTINGS, roles: ['user', 'photographer', 'admin'] },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
        isActive ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`;

const Sidebar = () => {
    const { user } = useAuth();
    const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

    return (
        <aside className="border-r border-slate-200 bg-white p-4 lg:w-72">
            <div className="hidden lg:block">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Workspace</p>
                    <p className="mt-1 font-semibold text-slate-950">{user?.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                </div>
            </div>

            <nav className="mt-0 flex gap-2 overflow-x-auto lg:mt-5 lg:flex-col lg:overflow-visible">
                {visibleItems.map((item) => (
                    <NavLink key={item.path} to={item.path} className={linkClassName}>
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

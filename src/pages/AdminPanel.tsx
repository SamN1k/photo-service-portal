import { useMemo, useState } from 'react';
import {
    mockAdminUser,
    mockBookingEvents,
    mockUsers,
    processAdminMetrics,
    type AdminRole,
    type MockUser,
} from '../mocks/adminMockData';

const roleFilters: Array<{ label: string; value: 'all' | AdminRole }> = [
    { label: 'Toate rolurile', value: 'all' },
    { label: 'User', value: 'user' },
    { label: 'Fotograf', value: 'photographer' },
    { label: 'Admin', value: 'admin' },
];

const statusBadge: Record<MockUser['status'], string> = {
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    suspended: 'bg-rose-100 text-rose-700',
};

const AdminPanel = () => {
    const [users, setUsers] = useState<MockUser[]>(mockUsers);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');

    const metrics = useMemo(() => processAdminMetrics(users, mockBookingEvents), [users]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const roleMatches = roleFilter === 'all' || user.role === roleFilter;
            const queryMatches =
                user.fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase());
            return roleMatches && queryMatches;
        });
    }, [users, roleFilter, query]);

    const toggleSuspended = (userId: string) => {
        setUsers((prev) =>
            prev.map((user) => {
                if (user.id !== userId) {
                    return user;
                }

                if (user.status === 'suspended') {
                    return { ...user, status: 'active' };
                }

                return { ...user, status: 'suspended' };
            }),
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>

            <section className="soft-panel p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">Mock current user</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{mockAdminUser.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{mockAdminUser.email}</p>
                <p className="mt-2 text-xs text-slate-500">Permisiuni: {mockAdminUser.permissions.join(', ')}</p>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
                <article className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Total users (mock)</p>
                    <p className="mt-2 text-3xl font-bold">{metrics.totalUsers}</p>
                </article>
                <article className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Active users</p>
                    <p className="mt-2 text-3xl font-bold">{metrics.activeUsers}</p>
                </article>
                <article className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Active photographers</p>
                    <p className="mt-2 text-3xl font-bold">{metrics.activePhotographers}</p>
                </article>
                <article className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Net revenue (processed)</p>
                    <p className="mt-2 text-3xl font-bold">€{metrics.netRevenue}</p>
                </article>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <article className="soft-panel p-5">
                    <h3 className="text-lg font-bold">Simulare procesare date</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Datele de mai jos sunt mock și sunt procesate local: plăți totale, refund total și scor de sănătate operațională.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                        <li>Payments total: €{metrics.paymentTotal}</li>
                        <li>Refund total: €{metrics.refundTotal}</li>
                        <li>Processing health score: {metrics.processingHealthScore}%</li>
                    </ul>
                </article>

                <article className="soft-panel p-5">
                    <h3 className="text-lg font-bold">Filtrare mock users</h3>
                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Caută după nume sau email"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value as 'all' | AdminRole)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            {roleFilters.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </article>
            </section>

            <section className="soft-panel overflow-x-auto p-5">
                <h3 className="text-lg font-bold">Mock users table ({filteredUsers.length})</h3>
                <table className="mt-4 w-full min-w-[680px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-2">User</th>
                            <th className="pb-2">Role</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Bookings</th>
                            <th className="pb-2">Revenue</th>
                            <th className="pb-2">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-slate-100 last:border-0">
                                <td className="py-3">
                                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </td>
                                <td className="py-3 capitalize">{user.role}</td>
                                <td className="py-3">
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge[user.status]}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="py-3">{user.totalBookings}</td>
                                <td className="py-3">€{user.revenueEur}</td>
                                <td className="py-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleSuspended(user.id)}
                                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-100"
                                    >
                                        {user.status === 'suspended' ? 'Reactivare' : 'Suspendă'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AdminPanel;

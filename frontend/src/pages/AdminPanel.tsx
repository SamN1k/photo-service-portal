import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { isMockHttpError } from '../services/mockHttp';
import { userService, type UserInput, type UserSort } from '../services/userService';
import { PATHS } from '../routes/paths';
import type { PaginatedResult, SelectOption, UserRecord, UserRole, UserStatus } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

interface UserFormState {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
}

interface UserFormErrors {
    fullName?: string;
    email?: string;
    password?: string;
}

const initialForm: UserFormState = {
    fullName: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
};

const roleOptions: Array<SelectOption<'all' | UserRole>> = [
    { value: 'all', label: 'Toate rolurile' },
    { value: 'user', label: 'User' },
    { value: 'photographer', label: 'Fotograf' },
    { value: 'admin', label: 'Admin' },
];

const statusOptions: Array<SelectOption<'all' | UserStatus>> = [
    { value: 'all', label: 'Toate statusurile' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspendate' },
];

const userSortOptions: Array<SelectOption<UserSort>> = [
    { value: 'newest', label: 'Cele mai noi' },
    { value: 'nameAsc', label: 'Nume A-Z' },
    { value: 'bookingsDesc', label: 'Rezervari desc' },
    { value: 'revenueDesc', label: 'Venit desc' },
];

const statusTone: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
    active: 'success',
    pending: 'warning',
    suspended: 'danger',
};

const AdminPanel = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [result, setResult] = useState<PaginatedResult<UserRecord> | null>(null);
    const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
    const [query, setQuery] = useState('');
    const [role, setRole] = useState<'all' | UserRole>('all');
    const [status, setStatus] = useState<'all' | UserStatus>('all');
    const [sortBy, setSortBy] = useState<UserSort>('newest');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<UserFormState>(initialForm);
    const [formErrors, setFormErrors] = useState<UserFormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(
        async (forceError = false) => {
            setIsLoading(true);
            setError(null);

            try {
                const [nextResult, metricsResult] = await Promise.all([
                    userService.listUsers({
                        query,
                        role,
                        status,
                        sortBy,
                        page,
                        pageSize: 6,
                        forceError,
                    }),
                    userService.listUsers({ page: 1, pageSize: 100, sortBy: 'newest' }),
                ]);
                setResult(nextResult);
                setAllUsers(metricsResult.items);
            } catch (loadError) {
                const message = isMockHttpError(loadError) ? loadError.message : 'Utilizatorii nu au putut fi incarcati.';
                setError(message);

                if (isMockHttpError(loadError) && loadError.status === 500) {
                    navigate(PATHS.SERVER_ERROR, { state: { message } });
                }
            } finally {
                setIsLoading(false);
            }
        },
        [navigate, page, query, role, sortBy, status],
    );

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const metrics = useMemo(() => {
        const activeUsers = allUsers.filter((candidate) => candidate.status === 'active').length;
        const photographers = allUsers.filter((candidate) => candidate.role === 'photographer').length;
        const revenue = allUsers.reduce((sum, candidate) => sum + candidate.revenueEur, 0);

        return { activeUsers, photographers, revenue };
    }, [allUsers]);

    const validateForm = () => {
        const nextErrors: UserFormErrors = {};

        if (form.fullName.trim().length < 3) {
            nextErrors.fullName = 'Numele trebuie sa aiba minimum 3 caractere.';
        }

        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            nextErrors.email = 'Introdu un email valid.';
        }

        if (!editingId && form.password.length < 6) {
            nextErrors.password = 'Parola trebuie sa aiba minimum 6 caractere.';
        }

        if (editingId && form.password && form.password.length < 6) {
            nextErrors.password = 'Parola noua trebuie sa aiba minimum 6 caractere.';
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setFormErrors({});
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload: UserInput = {
            fullName: form.fullName,
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            status: form.status,
        };

        setIsSubmitting(true);

        try {
            if (editingId) {
                const updatedUser = await userService.updateUser(editingId, payload);
                if (user?.id === updatedUser.id) {
                    refreshUser(updatedUser);
                }
                toast.success('Utilizatorul a fost actualizat.');
            } else {
                await userService.createUser(payload);
                toast.success('Utilizatorul a fost creat.');
            }

            resetForm();
            await loadData();
        } catch (submitError) {
            const message = isMockHttpError(submitError) ? submitError.message : 'Salvarea utilizatorului nu a reusit.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (selectedUser: UserRecord) => {
        setEditingId(selectedUser.id);
        setForm({
            fullName: selectedUser.fullName,
            email: selectedUser.email,
            password: '',
            role: selectedUser.role,
            status: selectedUser.status,
        });
        setFormErrors({});
    };

    const handleDelete = async (userId: string) => {
        if (user?.id === userId) {
            toast.error('Nu poti sterge contul cu care esti autentificat.');
            return;
        }

        const confirmed = window.confirm('Stergi utilizatorul selectat? Actiunea modifica datele locale mock.');

        if (!confirmed) {
            return;
        }

        try {
            await userService.deleteUser(userId);
            toast.success('Utilizatorul a fost sters.');
            await loadData();
        } catch (deleteError) {
            const message = isMockHttpError(deleteError) ? deleteError.message : 'Stergerea utilizatorului nu a reusit.';
            toast.error(message);
        }
    };

    const handleSimulateError = () => {
        toast.info('Se simuleaza o eroare 500 in serviciul de utilizatori.');
        void loadData(true);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Admin Control Panel"
                description="Administrare mock pentru utilizatori, roluri si statusuri persistate in localStorage."
                actions={
                    <button type="button" onClick={handleSimulateError} className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700">
                        Simuleaza 500
                    </button>
                }
            />

            <section className="grid gap-4 md:grid-cols-4">
                <StatCard label="Utilizatori total" value={allUsers.length} />
                <StatCard label="Activi" value={metrics.activeUsers} />
                <StatCard label="Fotografi" value={metrics.photographers} />
                <StatCard label="Venit fotografi" value={formatCurrency(metrics.revenue)} />
            </section>

            <section className="soft-panel p-5">
                <h2 className="text-xl font-bold text-slate-950">{editingId ? 'Editeaza utilizator' : 'Utilizator nou'}</h2>
                <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="admin-name">
                            Nume complet
                        </label>
                        <input
                            id="admin-name"
                            value={form.fullName}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, fullName: event.target.value }))}
                            className="form-input"
                        />
                        {formErrors.fullName && <p className="field-error">{formErrors.fullName}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="admin-email">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            value={form.email}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, email: event.target.value }))}
                            className="form-input"
                        />
                        {formErrors.email && <p className="field-error">{formErrors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="admin-password">
                            Parola {editingId ? 'noua optionala' : ''}
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, password: event.target.value }))}
                            className="form-input"
                            placeholder={editingId ? 'lasa gol pentru pastrare' : 'minimum 6 caractere'}
                        />
                        {formErrors.password && <p className="field-error">{formErrors.password}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="admin-role">
                                Rol
                            </label>
                            <select
                                id="admin-role"
                                value={form.role}
                                onChange={(event) => setForm((currentForm) => ({ ...currentForm, role: event.target.value as UserRole }))}
                                className="form-input"
                            >
                                <option value="user">User</option>
                                <option value="photographer">Fotograf</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="admin-status">
                                Status
                            </label>
                            <select
                                id="admin-status"
                                value={form.status}
                                onChange={(event) => setForm((currentForm) => ({ ...currentForm, status: event.target.value as UserStatus }))}
                                className="form-input"
                            >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:col-span-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se salveaza...' : editingId ? 'Salveaza utilizator' : 'Creeaza utilizator'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                                Anuleaza editarea
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="soft-panel grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_190px]">
                <input
                    type="search"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                    }}
                    className="form-input"
                    placeholder="Cauta dupa nume, email sau rol"
                />
                <select
                    value={role}
                    onChange={(event) => {
                        setRole(event.target.value as 'all' | UserRole);
                        setPage(1);
                    }}
                    className="form-input"
                >
                    {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as 'all' | UserStatus);
                        setPage(1);
                    }}
                    className="form-input"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as UserSort)} className="form-input">
                    {userSortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </section>

            {isLoading && <LoadingState title="Se incarca utilizatorii..." />}
            {!isLoading && error && <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadData() }} />}
            {!isLoading && !error && result && result.items.length === 0 && (
                <EmptyState title="Nu exista utilizatori" message="Schimba filtrele sau creeaza un utilizator nou." />
            )}
            {!isLoading && !error && result && result.items.length > 0 && (
                <section className="soft-panel table-scroll p-5">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th className="pb-3">Utilizator</th>
                                <th className="pb-3">Rol</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Creat</th>
                                <th className="pb-3">Rezervari</th>
                                <th className="pb-3">Venit</th>
                                <th className="pb-3">Actiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((selectedUser) => (
                                <tr key={selectedUser.id} className="border-b border-slate-100 last:border-0">
                                    <td className="py-3">
                                        <p className="font-semibold text-slate-950">{selectedUser.fullName}</p>
                                        <p className="text-xs text-slate-500">{selectedUser.email}</p>
                                    </td>
                                    <td className="py-3 capitalize">{selectedUser.role}</td>
                                    <td className="py-3">
                                        <Badge tone={statusTone[selectedUser.status]}>{selectedUser.status}</Badge>
                                    </td>
                                    <td className="py-3">{formatDate(selectedUser.createdAt)}</td>
                                    <td className="py-3">{selectedUser.totalBookings}</td>
                                    <td className="py-3">{formatCurrency(selectedUser.revenueEur)}</td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(selectedUser)}
                                                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete(selectedUser.id)}
                                                className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-600">
                            {result.total} utilizatori · pagina {result.page} din {result.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                disabled={result.page === 1}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inapoi
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.min(result.totalPages, currentPage + 1))}
                                disabled={result.page === result.totalPages}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inainte
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminPanel;

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { PATHS } from '../routes/paths';
import { isMockHttpError } from '../services/mockHttp';
import { userService } from '../services/userService';
import type { UserRole } from '../types/models';

interface AccountSettingsForm {
    fullName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

type AccountSettingsErrors = Partial<Record<keyof AccountSettingsForm, string>>;

const dashboardPathByRole: Record<UserRole, string> = {
    user: PATHS.USER_DASHBOARD,
    photographer: PATHS.PHOTOGRAPHER_DASHBOARD,
    admin: PATHS.ADMIN_PANEL,
};

const createInitialForm = (fullName = '', email = ''): AccountSettingsForm => ({
    fullName,
    email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
});

const AccountSettingsPage = () => {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState<AccountSettingsForm>(() => createInitialForm(user?.fullName, user?.email));
    const [errors, setErrors] = useState<AccountSettingsErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wasUpdated, setWasUpdated] = useState(false);
    const activeUserId = useRef(user?.id);

    useEffect(() => {
        if (activeUserId.current === user?.id) {
            return;
        }

        activeUserId.current = user?.id;
        setForm(createInitialForm(user?.fullName, user?.email));
        setErrors({});
        setWasUpdated(false);
    }, [user]);

    const dashboardPath = useMemo(() => (user ? dashboardPathByRole[user.role] : PATHS.HOME), [user]);

    const updateField = (field: keyof AccountSettingsForm, value: string) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
        setWasUpdated(false);
    };

    const validateForm = () => {
        const nextErrors: AccountSettingsErrors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const wantsPasswordChange = Boolean(form.newPassword || form.confirmPassword);

        if (form.fullName.trim().length < 3) {
            nextErrors.fullName = 'Numele trebuie sa aiba minimum 3 caractere.';
        }

        if (!emailPattern.test(form.email.trim())) {
            nextErrors.email = 'Emailul nu este valid.';
        }

        if (!form.currentPassword) {
            nextErrors.currentPassword = 'Introdu parola curenta pentru validare.';
        }

        if (wantsPasswordChange && form.newPassword.length < 6) {
            nextErrors.newPassword = 'Parola noua trebuie sa aiba minimum 6 caractere.';
        }

        if (wantsPasswordChange && form.newPassword !== form.confirmPassword) {
            nextErrors.confirmPassword = 'Confirmarea parolei nu coincide.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || !validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setWasUpdated(false);

        try {
            const updatedUser = await userService.updateAccountSettings(user.id, {
                fullName: form.fullName,
                email: form.email,
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            refreshUser(updatedUser);
            setForm((currentForm) => ({
                ...currentForm,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
            setWasUpdated(true);
            toast.success('Datele personale au fost actualizate.');
        } catch (submitError) {
            const message = isMockHttpError(submitError) ? submitError.message : 'Actualizarea datelor personale nu a reusit.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <Link to={dashboardPath} className="account-settings-back" aria-label="Inapoi la dashboard">
                    <span className="account-settings-back-icon" aria-hidden="true" />
                </Link>
                <div className="pl-12">
                    <PageHeader title="Setari cont" description="Actualizeaza informatiile personale si parola contului tau." />
                </div>
            </div>

            <section className="soft-panel p-5">
                <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    {user && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                            <h2 className="text-lg font-bold text-slate-950">Informatii cont</h2>
                            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                <div>
                                    <dt className="text-slate-500">Rol</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{user.role}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Status</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{user.status}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Email curent</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{user.email}</dd>
                                </div>
                            </dl>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="settings-name">
                            Nume complet
                        </label>
                        <input
                            id="settings-name"
                            value={form.fullName}
                            onChange={(event) => updateField('fullName', event.target.value)}
                            className="form-input"
                            placeholder="Maria Popescu"
                        />
                        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="settings-email">
                            Email
                        </label>
                        <input
                            id="settings-email"
                            type="email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            className="form-input"
                            placeholder="user@demo.local"
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="settings-current-password">
                            Parola curenta
                        </label>
                        <input
                            id="settings-current-password"
                            type="password"
                            value={form.currentPassword}
                            onChange={(event) => updateField('currentPassword', event.target.value)}
                            className="form-input"
                            placeholder="confirma credentialele"
                        />
                        {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="settings-new-password">
                            Parola noua
                        </label>
                        <input
                            id="settings-new-password"
                            type="password"
                            value={form.newPassword}
                            onChange={(event) => updateField('newPassword', event.target.value)}
                            className="form-input"
                            placeholder="optional, minimum 6 caractere"
                        />
                        {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
                    </div>

                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="settings-confirm-password">
                            Confirma parola noua
                        </label>
                        <input
                            id="settings-confirm-password"
                            type="password"
                            value={form.confirmPassword}
                            onChange={(event) => updateField('confirmPassword', event.target.value)}
                            className="form-input"
                            placeholder="repeta parola noua"
                        />
                        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se actualizeaza...' : 'Actualizare date personale'}
                        </button>
                        {wasUpdated && <span className="account-settings-checkmark" aria-label="Date validate si actualizate" />}
                    </div>
                </form>
            </section>
        </div>
    );
};

export default AccountSettingsPage;

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuth } from '../context/useAuth';
import { isMockHttpError } from '../services/mockHttp';
import { PATHS } from '../routes/paths';
import type { UserRole } from '../types/models';

const dashboardPathByRole: Record<UserRole, string> = {
    user: PATHS.USER_DASHBOARD,
    photographer: PATHS.PHOTOGRAPHER_DASHBOARD,
    admin: PATHS.ADMIN_PANEL,
};

const roleOptions: Array<{ value: UserRole; label: string; helper: string }> = [
    { value: 'user', label: 'Client', helper: 'Cauta fotografi si trimite cereri de rezervare.' },
    { value: 'photographer', label: 'Fotograf', helper: 'Publica oferte si gestioneaza cererile primite.' },
    { value: 'admin', label: 'Admin', helper: 'Gestioneaza utilizatori si datele demo ale platformei.' },
];

interface SignUpErrors {
    fullName?: string;
    email?: string;
    password?: string;
    form?: string;
}

const SignUpPage = () => {
    const { isAuthenticated, user, signUp } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole>('user');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<SignUpErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isAuthenticated && user) {
        return <Navigate to={dashboardPathByRole[user.role]} replace />;
    }

    const validate = () => {
        const nextErrors: SignUpErrors = {};

        if (fullName.trim().length < 3) {
            nextErrors.fullName = 'Numele trebuie sa aiba minimum 3 caractere.';
        }

        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            nextErrors.email = 'Introdu un email valid.';
        }

        if (password.length < 6) {
            nextErrors.password = 'Parola trebuie sa aiba minimum 6 caractere.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const session = await signUp({
                fullName,
                email,
                password,
                role: selectedRole,
            });
            toast.success(`Cont creat pentru ${session.user.fullName}.`);
            navigate(dashboardPathByRole[session.user.role], { replace: true });
        } catch (error) {
            const message = isMockHttpError(error) ? error.message : 'Inregistrarea a esuat.';
            setErrors({ form: message });
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-shell min-h-screen">
            <Header />
            <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_460px]">
                <section>
                    <p className="text-sm font-semibold uppercase text-teal-700">Cont mock nou</p>
                    <h1 className="mt-2 text-4xl font-bold text-slate-950">Inregistrare cu rol si sesiune persistenta</h1>
                    <p className="mt-4 max-w-2xl text-slate-600">
                        Conturile noi sunt salvate local, apar in administrare si pot fi folosite imediat pentru demo.
                    </p>
                </section>

                <section className="auth-card bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-950">Creeaza cont</h2>
                    {errors.form && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errors.form}</div>}

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                        <fieldset>
                            <legend className="mb-3 text-sm font-semibold text-slate-800">Rol</legend>
                            <div className="grid gap-3">
                                {roleOptions.map((role) => (
                                    <label
                                        key={role.value}
                                        className={`auth-role-option cursor-pointer rounded-lg border p-4 ${
                                            selectedRole === role.value ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.value}
                                            checked={selectedRole === role.value}
                                            onChange={() => setSelectedRole(role.value)}
                                            className="sr-only"
                                        />
                                        <span className="font-semibold text-slate-950">{role.label}</span>
                                        <span className="mt-1 block text-sm text-slate-600">{role.helper}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="signup-name">
                                Nume complet
                            </label>
                            <input
                                id="signup-name"
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                className="form-input"
                                placeholder="Popescu Andrei"
                            />
                            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="signup-email">
                                Email
                            </label>
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="form-input"
                                placeholder="nume@demo.local"
                            />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="signup-password">
                                Parola
                            </label>
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="form-input"
                                placeholder="minimum 6 caractere"
                            />
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se creeaza...' : 'Creeaza cont'}
                        </button>
                    </form>

                    <p className="mt-5 text-sm text-slate-600">
                        Ai deja cont?{' '}
                        <Link className="font-semibold text-teal-700 hover:underline" to={PATHS.LOGIN}>
                            Intra in cont
                        </Link>
                        .
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default SignUpPage;

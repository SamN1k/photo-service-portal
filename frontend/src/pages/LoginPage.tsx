import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuth } from '../context/useAuth';
import { authService, type DemoAccount } from '../services/authService';
import { isMockHttpError } from '../services/mockHttp';
import { PATHS } from '../routes/paths';
import type { UserRole } from '../types/models';

const dashboardPathByRole: Record<UserRole, string> = {
    user: PATHS.USER_DASHBOARD,
    photographer: PATHS.PHOTOGRAPHER_DASHBOARD,
    admin: PATHS.ADMIN_PANEL,
};

interface LoginErrors {
    email?: string;
    password?: string;
    form?: string;
}

const LoginPage = () => {
    const { isAuthenticated, user, login } = useAuth();
    const navigate = useNavigate();
    const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
    const [email, setEmail] = useState('user@demo.local');
    const [password, setPassword] = useState('demo1234');
    const [errors, setErrors] = useState<LoginErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        authService
            .getDemoAccounts()
            .then((accounts) => {
                if (isMounted) {
                    setDemoAccounts(accounts);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setDemoAccounts([]);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (isAuthenticated && user) {
        return <Navigate to={dashboardPathByRole[user.role]} replace />;
    }

    const validate = () => {
        const nextErrors: LoginErrors = {};

        if (!email.trim()) {
            nextErrors.email = 'Emailul este obligatoriu.';
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            nextErrors.email = 'Introdu un email valid.';
        }

        if (!password) {
            nextErrors.password = 'Parola este obligatorie.';
        } else if (password.length < 6) {
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
            const session = await login({ email, password });
            toast.success(`Bun venit, ${session.user.fullName}.`);
            navigate(dashboardPathByRole[session.user.role], { replace: true });
        } catch (error) {
            const message = isMockHttpError(error) ? error.message : 'Autentificarea a esuat.';
            setErrors({ form: message });
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-shell min-h-screen">
            <Header />
            <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px] lg:items-start">
                <section className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase text-teal-700">Demo cu backend ASP.NET</p>
                    <h1 className="mt-2 text-4xl font-bold text-slate-950">Autentificare API cu roluri reale in UI</h1>
                    <p className="mt-4 text-slate-600">
                        Login-ul foloseste Web API-ul, salveaza sesiunea in localStorage, iar accesul la rute si actiuni se schimba dupa rol.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {demoAccounts.map((account) => (
                            <button
                                type="button"
                                key={account.email}
                                onClick={() => {
                                    setEmail(account.email);
                                    setPassword(account.password);
                                    setErrors({});
                                }}
                                className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-600"
                            >
                                <span className="text-xs font-semibold uppercase text-slate-500">{account.role}</span>
                                <span className="mt-1 block font-semibold text-slate-950">{account.fullName}</span>
                                <span className="mt-1 block text-xs text-slate-500">{account.email}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="auth-card bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-950">Login</h2>
                    <p className="mt-2 text-sm text-slate-600">Foloseste unul dintre conturile demo sau introdu manual credentilele.</p>

                    {errors.form && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errors.form}</div>}

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="login-email">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="form-input"
                                placeholder="user@demo.local"
                            />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="login-password">
                                Parola
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="form-input"
                                placeholder="demo1234"
                            />
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se autentifica...' : 'Intra in cont'}
                        </button>
                    </form>

                    <p className="mt-5 text-sm text-slate-600">
                        Nu ai cont?{' '}
                        <Link className="font-semibold text-teal-700 hover:underline" to={PATHS.SIGN_UP}>
                            Creeaza unul
                        </Link>
                        .
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;

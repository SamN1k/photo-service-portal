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

interface SignUpErrors {
    fullName?: string;
    email?: string;
    password?: string;
    form?: string;
}

const SignUpPage = () => {
    const { isAuthenticated, user, signUp } = useAuth();
    const navigate = useNavigate();
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
            <main className="auth-main mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10">
                <section className="auth-card w-full max-w-md bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-950">Creeaza cont</h1>
                    <p className="mt-2 text-sm text-slate-600">Completeaza datele pentru un cont nou.</p>
                    {errors.form && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errors.form}</div>}

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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

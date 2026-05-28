import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuth } from '../context/useAuth';
import { authService } from '../services/authService';
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
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
    form?: string;
}

type AuthMode = 'login' | 'reset-email' | 'reset-code' | 'reset-password';

const titleByMode: Record<AuthMode, string> = {
    login: 'Login',
    'reset-email': 'Resetare parola',
    'reset-code': 'Cod de acces',
    'reset-password': 'Actualizare parola',
};

const descriptionByMode: Record<AuthMode, string> = {
    login: 'Introdu emailul si parola contului tau.',
    'reset-email': 'Introdu emailul contului pentru a primi un cod de acces.',
    'reset-code': 'Introdu codul primit pe email pentru a continua.',
    'reset-password': 'Alege parola noua pentru contul tau.',
};

const LoginPage = () => {
    const { isAuthenticated, user, login } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isAuthenticated && user) {
        return <Navigate to={dashboardPathByRole[user.role]} replace />;
    }

    const validateEmail = (nextErrors: LoginErrors) => {
        if (!email.trim()) {
            nextErrors.email = 'Emailul este obligatoriu.';
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            nextErrors.email = 'Introdu un email valid.';
        }
    };

    const validateLogin = () => {
        const nextErrors: LoginErrors = {};

        validateEmail(nextErrors);

        if (!password) {
            nextErrors.password = 'Parola este obligatorie.';
        } else if (password.length < 6) {
            nextErrors.password = 'Parola trebuie sa aiba minimum 6 caractere.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateResetEmail = () => {
        const nextErrors: LoginErrors = {};
        validateEmail(nextErrors);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateAccessCode = () => {
        const nextErrors: LoginErrors = {};

        validateEmail(nextErrors);

        if (!/^\d{6}$/.test(accessCode.trim())) {
            nextErrors.code = 'Codul de acces trebuie sa contina 6 cifre.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateNewPassword = () => {
        const nextErrors: LoginErrors = {};

        if (newPassword.length < 6) {
            nextErrors.newPassword = 'Parola noua trebuie sa aiba minimum 6 caractere.';
        }

        if (confirmPassword !== newPassword) {
            nextErrors.confirmPassword = 'Confirmarea parolei nu coincide.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const runRequest = async (action: () => Promise<void>) => {
        setIsSubmitting(true);
        setErrors({});

        try {
            await action();
        } catch (error) {
            const message = isMockHttpError(error) ? error.message : 'Cererea nu a putut fi procesata.';
            setErrors({ form: message });
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = async () => {
        if (!validateLogin()) {
            return;
        }

        await runRequest(async () => {
            const session = await login({ email, password });
            toast.success(`Bun venit, ${session.user.fullName}.`);
            navigate(dashboardPathByRole[session.user.role], { replace: true });
        });
    };

    const handleRequestResetCode = async () => {
        if (!validateResetEmail()) {
            return;
        }

        await runRequest(async () => {
            await authService.requestPasswordReset({ email });
            toast.success('Codul de acces a fost trimis pe email.');
            setAccessCode('');
            setMode('reset-code');
        });
    };

    const handleVerifyResetCode = async () => {
        if (!validateAccessCode()) {
            return;
        }

        await runRequest(async () => {
            await authService.verifyPasswordResetCode({ email, code: accessCode.trim() });
            toast.success('Cod valid. Poti seta parola noua.');
            setNewPassword('');
            setConfirmPassword('');
            setMode('reset-password');
        });
    };

    const handleCompletePasswordReset = async () => {
        if (!validateNewPassword()) {
            return;
        }

        await runRequest(async () => {
            await authService.completePasswordReset({
                email,
                code: accessCode.trim(),
                newPassword,
            });
            toast.success('Parola a fost actualizata. Te poti autentifica acum.');
            setPassword('');
            setAccessCode('');
            setNewPassword('');
            setConfirmPassword('');
            setMode('login');
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'login') {
            void handleLogin();
            return;
        }

        if (mode === 'reset-email') {
            void handleRequestResetCode();
            return;
        }

        if (mode === 'reset-code') {
            void handleVerifyResetCode();
            return;
        }

        void handleCompletePasswordReset();
    };

    const switchMode = (nextMode: AuthMode) => {
        setMode(nextMode);
        setErrors({});
        setPassword('');
        setAccessCode('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const submitLabelByMode: Record<AuthMode, string> = {
        login: isSubmitting ? 'Se autentifica...' : 'Intra in cont',
        'reset-email': isSubmitting ? 'Se trimite...' : 'Trimite cod',
        'reset-code': isSubmitting ? 'Se verifica...' : 'Verifica cod',
        'reset-password': isSubmitting ? 'Se actualizeaza...' : 'Actualizeaza parola',
    };

    const isPasswordUpdate = mode === 'reset-password';

    return (
        <div className="auth-shell min-h-screen">
            <Header />
            <main className="auth-main mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10">
                <section className="auth-card w-full max-w-md bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-950">{titleByMode[mode]}</h1>
                    <p className="mt-2 text-sm text-slate-600">{descriptionByMode[mode]}</p>

                    {errors.form && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errors.form}</div>}

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                        {mode !== 'reset-password' && (
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
                                    placeholder="email@exemplu.com"
                                    readOnly={mode === 'reset-code'}
                                />
                                {errors.email && <p className="field-error">{errors.email}</p>}
                            </div>
                        )}

                        {mode === 'login' && (
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
                                    placeholder="parola contului"
                                />
                                {errors.password && <p className="field-error">{errors.password}</p>}
                            </div>
                        )}

                        {mode === 'reset-code' && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="reset-code">
                                    Cod de acces
                                </label>
                                <input
                                    id="reset-code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={accessCode}
                                    onChange={(event) => setAccessCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="form-input"
                                    placeholder="000000"
                                />
                                {errors.code && <p className="field-error">{errors.code}</p>}
                            </div>
                        )}

                        {mode === 'reset-password' && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="reset-new-password">
                                        Parola noua
                                    </label>
                                    <input
                                        id="reset-new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        className="form-input"
                                        placeholder="minimum 6 caractere"
                                    />
                                    {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="reset-confirm-password">
                                        Confirma parola noua
                                    </label>
                                    <input
                                        id="reset-confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className="form-input"
                                        placeholder="repeta parola noua"
                                    />
                                    {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full rounded-lg px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 ${
                                isPasswordUpdate ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-700 hover:bg-teal-800'
                            }`}
                        >
                            {submitLabelByMode[mode]}
                        </button>
                    </form>

                    {mode === 'login' ? (
                        <div className="mt-5 space-y-3 text-sm text-slate-600">
                            <button
                                type="button"
                                onClick={() => switchMode('reset-email')}
                                className="font-semibold text-teal-700 hover:underline"
                            >
                                Ai uitat parola?
                            </button>
                            <p>
                                Nu ai cont?{' '}
                                <Link className="font-semibold text-teal-700 hover:underline" to={PATHS.SIGN_UP}>
                                    Creeaza unul
                                </Link>
                                .
                            </p>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-slate-600">
                            Ti-ai amintit parola?{' '}
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="font-semibold text-teal-700 hover:underline"
                            >
                                Inapoi la login
                            </button>
                            .
                        </p>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';
import type { UserRole } from '../routes/paths';

type AuthRole = Exclude<UserRole, 'guest'>;

const ROLE_OPTIONS: { value: AuthRole; label: string; description: string }[] = [
    { value: 'user', label: 'User obișnuit', description: 'Intră în cont pentru a rezerva ședințe foto.' },
    { value: 'photographer', label: 'Fotograf', description: 'Gestionează ofertele și rezervările tale.' },
    { value: 'admin', label: 'Admin', description: 'Administrează utilizatori și conținutul platformei.' },
];

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState<AuthRole>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatusMessage(`Simulare login: ${email} (${selectedRole}).`);
    };

    return (
        /* Modificat: Adăugat 'auth-shell' */
        <main className="auth-shell min-h-screen bg-slate-100 px-4 py-10">
            /* Modificat: Adăugat 'auth-card' */
            <div className="auth-card mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-slate-900">Autentificare</h1>
                <p className="mt-2 text-slate-600">Conectează-te în platformă și selectează tipul de cont.</p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <fieldset>
                        <legend className="mb-3 font-semibold text-slate-800">Tip utilizator</legend>
                        <div className="grid gap-3 md:grid-cols-3">
                            {ROLE_OPTIONS.map((role) => (
                                <label
                                    key={role.value}
                                    /* Modificat: Adăugat 'auth-role-option' */
                                    className={`auth-role-option cursor-pointer rounded-xl border p-4 transition ${
                                        selectedRole === role.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300'
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
                                    <p className="font-semibold text-slate-900">{role.label}</p>
                                    <p className="mt-1 text-sm text-slate-600">{role.description}</p>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {/* Restul formularului rămâne neschimbat */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="nume@exemplu.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="login-password">
                            Parolă
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Intră în cont
                    </button>
                </form>

                {statusMessage && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{statusMessage}</p>}

                <p className="mt-6 text-sm text-slate-600">
                    Nu ai cont?{' '}
                    <Link className="font-semibold text-blue-600 hover:underline" to={PATHS.SIGN_UP}>
                        Creează unul aici
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
};

export default LoginPage;
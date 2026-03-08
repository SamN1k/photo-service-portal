import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PATHS } from '../routes/paths';
import type { UserRole } from '../routes/paths';

type AuthRole = Exclude<UserRole, 'guest'>;

const ROLE_OPTIONS: { value: AuthRole; label: string; description: string; icon: string }[] = [
    {
        value: 'user',
        label: 'User obișnuit',
        description: 'Intră în cont pentru a rezerva ședințe foto.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/17125d-star/dynamic/200/color.webp',
    },
    {
        value: 'photographer',
        label: 'Fotograf',
        description: 'Gestionează ofertele și rezervările tale.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/744cc0-rocket/dynamic/200/color.webp',
    },
    {
        value: 'admin',
        label: 'Admin',
        description: 'Administrează utilizatori și conținutul platformei.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/b91186-shield/dynamic/200/color.webp',
    },
];

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState<AuthRole>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toast.success(`Bun venit, ${email}! Rol selectat: ${selectedRole}.`);
    };

    return (
        <main className="auth-shell min-h-screen px-4 py-10">
            <div className="auth-card card-hover mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-slate-900">Autentificare</h1>
                <p className="mt-2 text-slate-600">Conectează-te în platformă și selectează tipul de cont.</p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <fieldset>
                        <legend className="mb-3 font-semibold text-slate-800">Tip utilizator</legend>
                        <div className="grid gap-3 md:grid-cols-3">
                            {ROLE_OPTIONS.map((role) => (
                                <label
                                    key={role.value}
                                    className={`auth-role-option card-hover cursor-pointer rounded-xl border p-4 transition ${
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
                                    <img className="mb-2 h-10 w-10" src={role.icon} alt={role.label} loading="lazy" />
                                    <p className="font-semibold text-slate-900">{role.label}</p>
                                    <p className="mt-1 text-sm text-slate-600">{role.description}</p>
                                </label>
                            ))}
                        </div>
                    </fieldset>

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

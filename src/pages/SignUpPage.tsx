import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PATHS } from '../routes/paths';
import type { UserRole } from '../routes/paths';

type AuthRole = Exclude<UserRole, 'guest'>;

const ROLE_OPTIONS: { value: AuthRole; label: string; helper: string; icon: string }[] = [
    {
        value: 'user',
        label: 'User obișnuit',
        helper: 'Potrivit pentru clienți care caută fotografi.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/4e7918-thumb-up/dynamic/200/color.webp',
    },
    {
        value: 'photographer',
        label: 'Fotograf',
        helper: 'Pentru profesioniști care oferă servicii foto.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/5f20be-computer/dynamic/200/color.webp',
    },
    {
        value: 'admin',
        label: 'Admin',
        helper: 'Pentru administrarea aplicației și moderare.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/778c78-key/dynamic/200/color.webp',
    },
];

const SignUpPage = () => {
    const [selectedRole, setSelectedRole] = useState<AuthRole>('user');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toast.success(`Cont creat pentru ${fullName} (${selectedRole}).`);
    };

    return (
        <main className="auth-shell min-h-screen px-4 py-10">
            <div className="auth-card card-hover mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-slate-900">Înregistrare</h1>
                <p className="mt-2 text-slate-600">Creează un cont nou și alege tipul de utilizator.</p>

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
                                    <p className="mt-1 text-sm text-slate-600">{role.helper}</p>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="signup-name">
                            Nume complet
                        </label>
                        <input
                            id="signup-name"
                            type="text"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Ex: Popescu Andrei"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="signup-email">
                            Email
                        </label>
                        <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="nume@exemplu.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="signup-password">
                            Parolă
                        </label>
                        <input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Creează o parolă"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Creează cont
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-600">
                    Ai deja cont?{' '}
                    <Link className="font-semibold text-blue-600 hover:underline" to={PATHS.LOGIN}>
                        Intră în cont
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
};

export default SignUpPage;

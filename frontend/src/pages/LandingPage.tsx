import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { PATHS } from '../routes/paths';

const LandingPage = () => {
    return (
        <div className="app-shell min-h-screen">
            <Header />
            <main>
                <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_480px] lg:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase text-teal-700">React + TypeScript demo</p>
                        <h1 className="mt-3 text-5xl font-bold leading-tight text-slate-950">Photo Service Portal</h1>
                        <p className="mt-4 max-w-2xl text-lg text-slate-700">
                            Aplicatie frontend completa pentru cautare fotografi, rezervari, oferte si administrare, folosind servicii mock si date locale.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link to={PATHS.LOGIN} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">
                                Intra in demo
                            </Link>
                            <Link to={PATHS.OFFERS} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                                Vezi catalogul
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <img
                            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=80"
                            alt="Camera foto profesionala"
                            className="h-72 w-full object-cover"
                        />
                        <div className="grid divide-y divide-slate-200 p-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            {[
                                ['3', 'Conturi demo'],
                                ['3x', 'CRUD complet'],
                                ['401-500', 'HTTP UI'],
                            ].map(([value, label]) => (
                                <div key={label} className="p-3">
                                    <p className="text-2xl font-bold text-slate-950">{value}</p>
                                    <p className="mt-1 text-sm text-slate-500">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-12 md:grid-cols-3">
                    <article className="soft-panel p-5">
                        <h2 className="text-lg font-bold text-slate-950">Flux client</h2>
                        <p className="mt-2 text-sm text-slate-600">Clientul se autentifica, filtreaza ofertele si gestioneaza cereri de rezervare.</p>
                    </article>
                    <article className="soft-panel p-5">
                        <h2 className="text-lg font-bold text-slate-950">Flux fotograf</h2>
                        <p className="mt-2 text-sm text-slate-600">Fotograful creeaza, editeaza, arhiveaza si sterge oferte proprii.</p>
                    </article>
                    <article className="soft-panel p-5">
                        <h2 className="text-lg font-bold text-slate-950">Flux admin</h2>
                        <p className="mt-2 text-sm text-slate-600">Adminul listeaza utilizatori, aplica filtre si ruleaza CRUD complet pe conturi.</p>
                    </article>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;

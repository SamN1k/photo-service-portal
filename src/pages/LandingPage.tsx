import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';

const features = [
    {
        title: 'Photographers catalog',
        description: 'Filtrare rapidă pe stil, buget și disponibilitate.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/1858b9-map-pin/dynamic/200/color.webp',
    },
    {
        title: 'Booking simplificat',
        description: 'Flux clar de rezervare cu notificări în timp real.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/196608-notify-heart/dynamic/200/color.webp',
    },
    {
        title: 'Admin insights',
        description: 'Monitorizare utilizatori, plăți și activitate platformă.',
        icon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/39121b-medal/dynamic/200/color.webp',
    },
];

const Landing = () => {
    return (
        <div className="dashboard-shell min-h-screen">
            <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 md:items-center">
                <div>
                    <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Minimal Dashboard style</p>
                    <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-900">Găsește fotograful potrivit, fără efort.</h1>
                    <p className="mt-4 text-slate-600">Interfață modernă inspirată de dashboard-uri SaaS, cu carduri curate și ierarhie vizuală clară.</p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to={PATHS.SIGN_UP} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">Start acum</Link>
                        <Link to={PATHS.OFFERS} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100">Vezi oferte</Link>
                    </div>
                </div>
                <div className="soft-panel card-hover relative overflow-hidden p-7">
                    <div className="glass-orb glass-orb--one" />
                    <div className="relative z-10">
                        <p className="text-sm text-slate-500">Platform activity</p>
                        <h3 className="mt-1 text-2xl font-bold">1,240 users active this month</h3>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Rezervări</p>
                                <p className="text-xl font-bold">+28%</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Conversie</p>
                                <p className="text-xl font-bold">4.8%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-5 px-6 pb-14 md:grid-cols-3">
                {features.map((item) => (
                    <article key={item.title} className="soft-panel card-hover p-6">
                        <img src={item.icon} alt={item.title} className="h-12 w-12" loading="lazy" />
                        <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    </article>
                ))}
            </section>
        </div>
    );
};

export default Landing;

import { Link, useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { PATHS } from '../../routes/paths';

interface HttpErrorPageProps {
    statusCode: 401 | 403 | 404 | 500 | 503;
    title: string;
    description: string;
}

interface LocationState {
    message?: string;
    from?: string;
}

const actionByStatus: Record<HttpErrorPageProps['statusCode'], { label: string; to: string }> = {
    401: { label: 'Mergi la login', to: PATHS.LOGIN },
    403: { label: 'Inapoi la dashboard', to: PATHS.HOME },
    404: { label: 'Inapoi acasa', to: PATHS.HOME },
    500: { label: 'Reincarca aplicatia', to: PATHS.HOME },
    503: { label: 'Reincearca', to: PATHS.HOME },
};

const HttpErrorPage = ({ statusCode, title, description }: HttpErrorPageProps) => {
    const location = useLocation();
    const state = location.state as LocationState | null;
    const action = actionByStatus[statusCode];

    return (
        <div className="app-shell min-h-screen">
            <Header />
            <main className="mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-4xl items-center px-6 py-12">
                <section className="w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase text-teal-700">HTTP {statusCode}</p>
                    <h1 className="mt-2 text-4xl font-bold text-slate-950">{title}</h1>
                    <p className="mt-3 text-slate-600">{state?.message ?? description}</p>
                    {state?.from && <p className="mt-2 text-sm text-slate-500">Ruta ceruta: {state.from}</p>}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to={action.to} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                            {action.label}
                        </Link>
                        <Link to={PATHS.OFFERS} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                            Vezi ofertele
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default HttpErrorPage;

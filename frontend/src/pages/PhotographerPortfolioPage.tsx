import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { PATHS } from '../routes/paths';
import { isMockHttpError } from '../services/mockHttp';
import { userService } from '../services/userService';
import type { PhotographerPortfolio } from '../types/models';

const fallbackProfileImage =
    'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=900&q=80';

const PhotographerPortfolioPage = () => {
    const { photographerId } = useParams();
    const [portfolio, setPortfolio] = useState<PhotographerPortfolio | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPortfolio = useCallback(async () => {
        if (!photographerId) {
            setError('Portofoliul fotografului nu a fost gasit.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const nextPortfolio = await userService.getPhotographerPortfolio(photographerId);
            setPortfolio(nextPortfolio);
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Portofoliul fotografului nu a putut fi incarcat.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [photographerId]);

    useEffect(() => {
        void loadPortfolio();
    }, [loadPortfolio]);

    return (
        <div className="app-shell min-h-screen">
            <Header />

            <main className="mx-auto w-full max-w-7xl px-4 py-10">
                {isLoading && <LoadingState title="Se incarca portofoliul..." />}

                {!isLoading && error && (
                    <ErrorState
                        title="Portofoliu indisponibil"
                        message={error}
                        action={{ label: 'Reincearca', onClick: () => void loadPortfolio() }}
                    />
                )}

                {!isLoading && !error && portfolio && (
                    <div className="space-y-8">
                        <section className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
                            <img
                                src={portfolio.profileImageUrl || fallbackProfileImage}
                                alt={portfolio.fullName}
                                className="aspect-[4/5] w-full rounded-lg object-cover shadow-sm"
                            />

                            <div className="soft-panel p-6">
                                <p className="text-sm font-semibold uppercase text-teal-700">Portofoliu fotograf</p>
                                <h1 className="mt-2 text-4xl font-bold text-slate-950">{portfolio.fullName}</h1>

                                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="text-slate-500">Email</dt>
                                        <dd className="mt-1 font-semibold text-slate-950">{portfolio.email}</dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">Telefon</dt>
                                        <dd className="mt-1 font-semibold text-slate-950">
                                            {portfolio.phoneNumber || 'Contact disponibil la cerere'}
                                        </dd>
                                    </div>
                                </dl>

                                <p className="mt-6 whitespace-pre-line leading-7 text-slate-700">
                                    {portfolio.description || 'Fotograful inca isi pregateste descrierea portofoliului.'}
                                </p>

                                <Link
                                    to={PATHS.OFFERS}
                                    className="mt-6 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    Inapoi la catalog
                                </Link>
                            </div>
                        </section>

                        <section>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase text-teal-700">Galerie</p>
                                    <h2 className="mt-1 text-3xl font-bold text-slate-950">Fotografii realizate</h2>
                                </div>
                            </div>

                            {portfolio.galleryImageUrls.length > 0 ? (
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {portfolio.galleryImageUrls.map((imageUrl) => (
                                        <img
                                            key={imageUrl}
                                            src={imageUrl}
                                            alt={`Lucrare realizata de ${portfolio.fullName}`}
                                            className="h-64 w-full rounded-lg object-cover shadow-sm"
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Galerie in pregatire"
                                    message="Fotograful nu a incarcat inca imagini in portofoliu."
                                />
                            )}
                        </section>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default PhotographerPortfolioPage;

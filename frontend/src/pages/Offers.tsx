import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Badge } from '../components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { isMockHttpError } from '../services/mockHttp';
import { offerService, type OfferSort } from '../services/offerService';
import { PATHS } from '../routes/paths';
import type { OfferCategory, PaginatedResult, PhotoOffer, SelectOption } from '../types/models';
import { formatCurrency } from '../utils/formatters';

const categoryOptions: Array<SelectOption<'all' | OfferCategory>> = [
    { value: 'all', label: 'Toate categoriile' },
    { value: 'wedding', label: 'Nunta' },
    { value: 'portrait', label: 'Portret' },
    { value: 'event', label: 'Eveniment' },
    { value: 'commercial', label: 'Comercial' },
];

const sortOptions: Array<SelectOption<OfferSort>> = [
    { value: 'newest', label: 'Cele mai noi' },
    { value: 'ratingDesc', label: 'Rating descrescator' },
    { value: 'priceAsc', label: 'Pret crescator' },
    { value: 'priceDesc', label: 'Pret descrescator' },
    { value: 'titleAsc', label: 'Titlu A-Z' },
];

const Offers = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<'all' | OfferCategory>('all');
    const [sortBy, setSortBy] = useState<OfferSort>('newest');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<PaginatedResult<PhotoOffer> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOffers = useCallback(
        async (forceError = false) => {
            setIsLoading(true);
            setError(null);

            try {
                const nextResult = await offerService.listOffers({
                    query,
                    category,
                    sortBy,
                    page,
                    pageSize: 6,
                    publicOnly: true,
                    forceError,
                });
                setResult(nextResult);
            } catch (loadError) {
                const message = isMockHttpError(loadError) ? loadError.message : 'Ofertele nu au putut fi incarcate.';
                setError(message);

                if (isMockHttpError(loadError) && loadError.status === 500) {
                    navigate(PATHS.SERVER_ERROR, { state: { message } });
                }
            } finally {
                setIsLoading(false);
            }
        },
        [category, navigate, page, query, sortBy],
    );

    useEffect(() => {
        void loadOffers();
    }, [loadOffers]);

    const activeFilters = useMemo(() => {
        const filters = [];

        if (query.trim()) {
            filters.push(`cautare: ${query.trim()}`);
        }

        if (category !== 'all') {
            filters.push(category);
        }

        return filters;
    }, [category, query]);

    const handleSimulateError = () => {
        toast.info('Se simuleaza o eroare 500 in serviciul API.');
        void loadOffers(true);
    };

    return (
        <div className="app-shell min-h-screen">
            <Header />
            <main className="mx-auto w-full max-w-7xl px-4 py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase text-teal-700">Catalog public</p>
                        <h1 className="mt-1 text-4xl font-bold text-slate-950">Oferte foto</h1>
                        <p className="mt-2 max-w-2xl text-slate-600">
                            Listarea foloseste API-ul backend, cu filtrare, sortare si paginare calculate in BusinessLayer.
                        </p>
                    </div>
                    <button type="button" onClick={handleSimulateError} className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700">
                        Simuleaza 500
                    </button>
                </div>

                <section className="soft-panel mt-6 grid gap-3 p-4 md:grid-cols-[1fr_220px_220px]">
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setPage(1);
                        }}
                        className="form-input"
                        placeholder="Cauta dupa titlu, oras sau fotograf"
                    />
                    <select
                        value={category}
                        onChange={(event) => {
                            setCategory(event.target.value as 'all' | OfferCategory);
                            setPage(1);
                        }}
                        className="form-input"
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value as OfferSort)} className="form-input">
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </section>

                {activeFilters.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                            <Badge key={filter} tone="info">
                                {filter}
                            </Badge>
                        ))}
                    </div>
                )}

                <section className="mt-6">
                    {isLoading && <LoadingState title="Se incarca ofertele..." />}
                    {!isLoading && error && <ErrorState title="Eroare la incarcare" message={error} action={{ label: 'Reincearca', onClick: () => void loadOffers() }} />}
                    {!isLoading && !error && result && result.items.length === 0 && (
                        <EmptyState title="Nu exista oferte pentru filtrele curente" message="Schimba termenul de cautare sau categoria." />
                    )}
                    {!isLoading && !error && result && result.items.length > 0 && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {result.items.map((offer) => (
                                    <article key={offer.id} className="soft-panel card-hover overflow-hidden">
                                        <img src={offer.coverImageUrl} alt={offer.title} className="h-44 w-full object-cover" loading="lazy" />
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <Badge tone="success">{offer.category}</Badge>
                                                <span className="text-sm font-semibold text-amber-700">Rating {offer.rating}</span>
                                            </div>
                                            <h2 className="mt-3 text-xl font-bold text-slate-950">{offer.title}</h2>
                                            <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
                                            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <dt className="text-slate-500">Pret</dt>
                                                    <dd className="font-semibold text-slate-950">{formatCurrency(offer.priceEur)}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500">Durata</dt>
                                                    <dd className="font-semibold text-slate-950">{offer.durationHours}h</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500">Oras</dt>
                                                    <dd className="font-semibold text-slate-950">{offer.location}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500">Fotograf</dt>
                                                    <dd className="font-semibold text-slate-950">{offer.photographerName}</dd>
                                                </div>
                                            </dl>
                                            <div className="mt-5">
                                                {isAuthenticated && user?.role === 'user' ? (
                                                    <Link
                                                        to={PATHS.USER_DASHBOARD}
                                                        className="inline-flex w-full justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                                    >
                                                        Rezerva din dashboard
                                                    </Link>
                                                ) : !isAuthenticated ? (
                                                    <Link
                                                        to={PATHS.LOGIN}
                                                        className="inline-flex w-full justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                                    >
                                                        Login pentru rezervare
                                                    </Link>
                                                ) : (
                                                    <span className="inline-flex w-full justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                                                        Rezervari disponibile pentru clienti
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
                                <p className="text-sm text-slate-600">
                                    {result.total} oferte · pagina {result.page} din {result.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                        disabled={result.page === 1}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Inapoi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage((currentPage) => Math.min(result.totalPages, currentPage + 1))}
                                        disabled={result.page === result.totalPages}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Inainte
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Offers;

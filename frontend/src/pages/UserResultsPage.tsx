import { useCallback, useEffect, useMemo, useState } from 'react';
import { ResultPhotoLightbox } from '../components/ResultPhotoLightbox';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { bookingService } from '../services/bookingService';
import { isMockHttpError } from '../services/mockHttp';
import { resultService, type BookingResult, type ResultPhoto } from '../services/resultService';
import type { Booking, BookingStatus } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

const statusTone: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    paid: 'success',
    finalized: 'neutral',
};

const UserResultsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [results, setResults] = useState<BookingResult[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<ResultPhoto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!user) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [bookingsResult, nextResults] = await Promise.all([
                bookingService.listBookings({
                    clientId: user.id,
                    sortBy: 'eventDateAsc',
                    page: 1,
                    pageSize: 100,
                }),
                resultService.listResults(),
            ]);

            setBookings(bookingsResult.items);
            setResults(nextResults);
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Rezultatele nu au putut fi incarcate.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const resultByBookingId = useMemo(() => {
        return results.reduce<Record<string, BookingResult>>((accumulator, result) => {
            accumulator[result.bookingId] = result;
            return accumulator;
        }, {});
    }, [results]);

    return (
        <div className="space-y-6">
            <PageHeader title="Vizualizeaza rezultatele" description="Vezi ofertele solicitate si previzualizeaza pozele incarcate de fotograf." />

            {isLoading && <LoadingState title="Se incarca rezultatele..." />}
            {!isLoading && error && <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadData() }} />}
            {!isLoading && !error && bookings.length === 0 && (
                <EmptyState title="Nu exista oferte solicitate" message="Dupa ce creezi o rezervare, rezultatele vor aparea aici." />
            )}
            {!isLoading && !error && bookings.length > 0 && (
                <section className="grid gap-4">
                    {bookings.map((booking) => {
                        const result = resultByBookingId[booking.id];
                        const photos = result?.photos ?? [];

                        return (
                            <article key={booking.id} className="soft-panel p-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-xl font-bold text-slate-950">{booking.offerTitle}</h2>
                                            <Badge tone={statusTone[booking.status]}>{booking.status}</Badge>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">Fotograf: {booking.photographerName}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-950">{formatCurrency(booking.budgetEur)}</p>
                                </div>

                                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                    <div>
                                        <dt className="text-slate-500">Data</dt>
                                        <dd className="mt-1 font-semibold text-slate-950">{formatDate(booking.eventDate)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Locatie</dt>
                                        <dd className="mt-1 font-semibold text-slate-950">{booking.location}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Poze disponibile</dt>
                                        <dd className="mt-1 font-semibold text-slate-950">{photos.length}</dd>
                                    </div>
                                </dl>

                                {photos.length > 0 ? (
                                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        {photos.map((photo) => (
                                            <figure key={photo.id} className="result-photo-card">
                                                <button type="button" onClick={() => setSelectedPhoto(photo)} className="result-photo-preview-button">
                                                    <img src={photo.dataUrl} alt={photo.name} className="h-44 w-full rounded-lg object-cover" />
                                                </button>
                                                <figcaption className="mt-2 truncate text-xs font-semibold text-slate-600">{photo.name}</figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
                                        Previzualizare indisponibila
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}
            <ResultPhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
    );
};

export default UserResultsPage;

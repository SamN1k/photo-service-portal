import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { ResultPhotoLightbox } from '../components/ResultPhotoLightbox';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { bookingService } from '../services/bookingService';
import { isMockHttpError } from '../services/mockHttp';
import { createResultPhoto, resultService, type BookingResult, type ResultPhoto } from '../services/resultService';
import type { Booking } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

const readFileAsResultPhoto = (file: File): Promise<ResultPhoto> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('Fisierul nu a putut fi citit.'));
                return;
            }

            resolve(createResultPhoto(file.name, reader.result));
        };

        reader.onerror = () => reject(new Error('Fisierul nu a putut fi citit.'));
        reader.readAsDataURL(file);
    });
};

const PhotographerResultsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [results, setResults] = useState<BookingResult[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<ResultPhoto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
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
                    photographerId: user.id,
                    status: 'paid',
                    sortBy: 'eventDateAsc',
                    page: 1,
                    pageSize: 100,
                }),
                resultService.listResults(),
            ]);

            setBookings(bookingsResult.items);
            setResults(nextResults);
            setSelectedBookingId((currentId) => currentId ?? bookingsResult.items[0]?.id ?? null);
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

    const selectedBooking = useMemo(() => bookings.find((booking) => booking.id === selectedBookingId) ?? null, [bookings, selectedBookingId]);
    const selectedResult = useMemo(() => results.find((result) => result.bookingId === selectedBookingId) ?? null, [results, selectedBookingId]);

    const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!selectedBooking) {
            return;
        }

        const files = Array.from(event.target.files ?? []);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            toast.error('Alege cel putin o poza.');
            event.target.value = '';
            return;
        }

        setIsUploading(true);

        try {
            const photos = await Promise.all(imageFiles.map(readFileAsResultPhoto));
            const updatedResult = await resultService.saveResultPhotos(selectedBooking.id, [...(selectedResult?.photos ?? []), ...photos]);

            setResults((currentResults) => {
                const hasResult = currentResults.some((result) => result.bookingId === updatedResult.bookingId);
                return hasResult
                    ? currentResults.map((result) => (result.bookingId === updatedResult.bookingId ? updatedResult : result))
                    : [updatedResult, ...currentResults];
            });
            toast.success('Pozele au fost incarcate pentru client.');
        } catch {
            toast.error('Pozele nu au putut fi incarcate.');
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleRemovePhoto = async (photoId: string) => {
        if (!selectedBooking || !selectedResult) {
            return;
        }

        const updatedResult = await resultService.saveResultPhotos(
            selectedBooking.id,
            selectedResult.photos.filter((photo) => photo.id !== photoId),
        );

        setResults((currentResults) => currentResults.map((result) => (result.bookingId === updatedResult.bookingId ? updatedResult : result)));
        toast.success('Galeria a fost actualizata.');
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Incarca rezultate" description="Alege rezervarile achitate si incarca pozele finale pentru client." />

            {isLoading && <LoadingState title="Se incarca ofertele achitate..." />}
            {!isLoading && error && <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadData() }} />}
            {!isLoading && !error && bookings.length === 0 && (
                <EmptyState title="Nu exista oferte achitate" message="Ofertele vor aparea aici dupa ce clientul finalizeaza plata." />
            )}
            {!isLoading && !error && bookings.length > 0 && (
                <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
                    <div className="space-y-3">
                        {bookings.map((booking) => {
                            const result = results.find((candidate) => candidate.bookingId === booking.id);
                            const isSelected = booking.id === selectedBookingId;

                            return (
                                <button
                                    key={booking.id}
                                    type="button"
                                    onClick={() => setSelectedBookingId(booking.id)}
                                    className={`result-offer-button ${isSelected ? 'result-offer-button-active' : ''}`}
                                >
                                    <span className="font-semibold text-slate-950">{booking.offerTitle}</span>
                                    <span className="mt-1 text-sm text-slate-600">{booking.clientName}</span>
                                    <span className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                                        <span>{formatDate(booking.eventDate)}</span>
                                        <span>{result?.photos.length ?? 0} poze</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {selectedBooking && (
                        <article className="soft-panel p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase text-sky-700">Oferta achitata</p>
                                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{selectedBooking.offerTitle}</h2>
                                    <p className="mt-2 text-sm text-slate-600">Solicitant: {selectedBooking.clientName}</p>
                                </div>
                                <Badge tone="success">{selectedBooking.status}</Badge>
                            </div>

                            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <dt className="text-slate-500">Data</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{formatDate(selectedBooking.eventDate)}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Locatie</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{selectedBooking.location}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Total</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{formatCurrency(selectedBooking.budgetEur)}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Poze incarcate</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{selectedResult?.photos.length ?? 0}</dd>
                                </div>
                            </dl>

                            {selectedBooking.notes && (
                                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-800">Note client</p>
                                    <p className="mt-1 text-sm text-slate-600">{selectedBooking.notes}</p>
                                </div>
                            )}

                            <div className="mt-5">
                                <label className="result-upload-button">
                                    <input type="file" accept="image/*" multiple onChange={(event) => void handlePhotoUpload(event)} className="sr-only" />
                                    {isUploading ? 'Se incarca pozele...' : 'Editeaza pozele reusite'}
                                </label>
                            </div>

                            {selectedResult && selectedResult.photos.length > 0 ? (
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {selectedResult.photos.map((photo) => (
                                        <figure key={photo.id} className="result-photo-card">
                                            <button type="button" onClick={() => setSelectedPhoto(photo)} className="result-photo-preview-button">
                                                <img src={photo.dataUrl} alt={photo.name} className="h-40 w-full rounded-lg object-cover" />
                                            </button>
                                            <figcaption className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-600">
                                                <span className="truncate">{photo.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRemovePhoto(photo.id)}
                                                    className="rounded-md border border-rose-300 px-2 py-1 font-semibold text-rose-700 hover:bg-rose-50"
                                                >
                                                    Sterge
                                                </button>
                                            </figcaption>
                                        </figure>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                                    Nu ai incarcat inca poze pentru aceasta oferta.
                                </p>
                            )}
                        </article>
                    )}
                </section>
            )}
            <ResultPhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
    );
};

export default PhotographerResultsPage;

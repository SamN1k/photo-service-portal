import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { bookingService } from '../services/bookingService';
import { isMockHttpError } from '../services/mockHttp';
import { offerService, type OfferSort } from '../services/offerService';
import { PATHS } from '../routes/paths';
import type { Booking, BookingStatus, OfferCategory, OfferInput, OfferStatus, PaginatedResult, PhotoOffer, SelectOption } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

interface OfferFormState {
    title: string;
    description: string;
    category: OfferCategory;
    location: string;
    priceEur: string;
    durationHours: string;
    status: OfferStatus;
    coverImageUrl: string;
}

interface OfferFormErrors {
    title?: string;
    description?: string;
    location?: string;
    priceEur?: string;
    durationHours?: string;
}

const initialForm: OfferFormState = {
    title: '',
    description: '',
    category: 'portrait',
    location: '',
    priceEur: '',
    durationHours: '2',
    status: 'active',
    coverImageUrl: '',
};

const categoryOptions: Array<SelectOption<OfferCategory>> = [
    { value: 'wedding', label: 'Nunta' },
    { value: 'portrait', label: 'Portret' },
    { value: 'event', label: 'Eveniment' },
    { value: 'commercial', label: 'Comercial' },
];

const statusOptions: Array<SelectOption<'all' | OfferStatus>> = [
    { value: 'all', label: 'Toate statusurile' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Arhivate' },
];

const offerSortOptions: Array<SelectOption<OfferSort>> = [
    { value: 'newest', label: 'Cele mai noi' },
    { value: 'priceAsc', label: 'Pret crescator' },
    { value: 'priceDesc', label: 'Pret descrescator' },
    { value: 'titleAsc', label: 'Titlu A-Z' },
    { value: 'ratingDesc', label: 'Rating' },
];

const bookingStatusTone: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    paid: 'success',
    finalized: 'neutral',
};

const offerStatusTone: Record<OfferStatus, 'success' | 'warning' | 'neutral'> = {
    active: 'success',
    draft: 'warning',
    archived: 'neutral',
};

const canConfirmBooking = (status: BookingStatus) => status === 'pending';
const canRejectBooking = (status: BookingStatus) => status === 'pending' || status === 'confirmed';
const canFinalizeBooking = (status: BookingStatus) => status === 'confirmed' || status === 'paid';

const readImageAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('Imaginea nu a putut fi citita.'));
                return;
            }

            resolve(reader.result);
        };

        reader.onerror = () => reject(new Error('Imaginea nu a putut fi citita.'));
        reader.readAsDataURL(file);
    });
};

const PhotographerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [offersResult, setOffersResult] = useState<PaginatedResult<PhotoOffer> | null>(null);
    const [bookingsResult, setBookingsResult] = useState<PaginatedResult<Booking> | null>(null);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'all' | OfferStatus>('all');
    const [sortBy, setSortBy] = useState<OfferSort>('newest');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<OfferFormState>(initialForm);
    const [formErrors, setFormErrors] = useState<OfferFormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!user) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [nextOffers, nextBookings] = await Promise.all([
                offerService.listOffers({
                    photographerId: user.id,
                    query,
                    status,
                    sortBy,
                    page,
                    pageSize: 5,
                }),
                bookingService.listBookings({
                    photographerId: user.id,
                    page: 1,
                    pageSize: 6,
                    sortBy: 'eventDateAsc',
                }),
            ]);

            setOffersResult(nextOffers);
            setBookingsResult(nextBookings);
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Datele fotografului nu au putut fi incarcate.';
            setError(message);

            if (isMockHttpError(loadError) && loadError.status === 500) {
                navigate(PATHS.SERVER_ERROR, { state: { message } });
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate, page, query, sortBy, status, user]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const stats = useMemo(() => {
        const offers = offersResult?.items ?? [];
        const bookings = bookingsResult?.items ?? [];
        const activeOffers = offers.filter((offer) => offer.status === 'active').length;
        const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
        const expectedRevenue = bookings
            .filter((booking) => booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'paid')
            .reduce((sum, booking) => sum + booking.budgetEur, 0);

        return { activeOffers, pendingBookings, expectedRevenue };
    }, [bookingsResult, offersResult]);

    const validateForm = () => {
        const nextErrors: OfferFormErrors = {};

        if (form.title.trim().length < 4) {
            nextErrors.title = 'Titlul trebuie sa aiba minimum 4 caractere.';
        }

        if (form.description.trim().length < 12) {
            nextErrors.description = 'Descrierea trebuie sa aiba minimum 12 caractere.';
        }

        if (form.location.trim().length < 2) {
            nextErrors.location = 'Locatia este obligatorie.';
        }

        if (!Number.isFinite(Number(form.priceEur)) || Number(form.priceEur) <= 0) {
            nextErrors.priceEur = 'Pretul trebuie sa fie pozitiv.';
        }

        if (!Number.isFinite(Number(form.durationHours)) || Number(form.durationHours) <= 0) {
            nextErrors.durationHours = 'Durata trebuie sa fie pozitiva.';
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setFormErrors({});
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || !validateForm()) {
            return;
        }

        const payload: OfferInput = {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            location: form.location.trim(),
            priceEur: Number(form.priceEur),
            durationHours: Number(form.durationHours),
            status: form.status,
            coverImageUrl: form.coverImageUrl,
        };

        setIsSubmitting(true);

        try {
            if (editingId) {
                await offerService.updateOffer(editingId, payload);
                toast.success('Oferta a fost actualizata.');
            } else {
                await offerService.createOffer(payload, user.id, user.fullName);
                toast.success('Oferta a fost creata.');
            }

            resetForm();
            await loadData();
        } catch (submitError) {
            const message = isMockHttpError(submitError) ? submitError.message : 'Salvarea ofertei nu a reusit.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (offer: PhotoOffer) => {
        setEditingId(offer.id);
        setForm({
            title: offer.title,
            description: offer.description,
            category: offer.category,
            location: offer.location,
            priceEur: String(offer.priceEur),
            durationHours: String(offer.durationHours),
            status: offer.status,
            coverImageUrl: offer.coverImageUrl,
        });
        setFormErrors({});
    };

    const handleCoverImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Alege un fisier imagine pentru oferta.');
            event.target.value = '';
            return;
        }

        try {
            const coverImageUrl = await readImageAsDataUrl(file);
            setForm((currentForm) => ({ ...currentForm, coverImageUrl }));
        } catch {
            toast.error('Poza ofertei nu a putut fi incarcata.');
        } finally {
            event.target.value = '';
        }
    };

    const handleDelete = async (offerId: string) => {
        const confirmed = window.confirm('Stergi oferta? Rezervarile existente raman in istoricul mock.');

        if (!confirmed) {
            return;
        }

        try {
            await offerService.deleteOffer(offerId);
            toast.success('Oferta a fost stearsa.');
            await loadData();
        } catch (deleteError) {
            const message = isMockHttpError(deleteError) ? deleteError.message : 'Stergerea ofertei nu a reusit.';
            toast.error(message);
        }
    };

    const handleBookingStatus = async (bookingId: string, nextStatus: BookingStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, nextStatus);
            toast.success('Statusul rezervarii a fost actualizat.');
            await loadData();
        } catch (statusError) {
            const message = isMockHttpError(statusError) ? statusError.message : 'Actualizarea statusului nu a reusit.';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Ofertele mele" description="Gestioneaza pachetele foto publicate si cererile primite de la clienti." />

            <section className="grid gap-4 md:grid-cols-3">
                <StatCard label="Oferte active" value={stats.activeOffers} />
                <StatCard label="Cereri in asteptare" value={stats.pendingBookings} />
                <StatCard label="Venit estimat" value={formatCurrency(stats.expectedRevenue)} />
            </section>

            <section className="soft-panel p-5">
                <h2 className="text-xl font-bold text-slate-950">{editingId ? 'Editeaza oferta' : 'Oferta noua'}</h2>
                <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-title">
                            Titlu
                        </label>
                        <input
                            id="offer-title"
                            value={form.title}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                            className="form-input"
                            placeholder="Portret editorial"
                        />
                        {formErrors.title && <p className="field-error">{formErrors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-location">
                            Locatie
                        </label>
                        <input
                            id="offer-location"
                            value={form.location}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, location: event.target.value }))}
                            className="form-input"
                            placeholder="Chisinau"
                        />
                        {formErrors.location && <p className="field-error">{formErrors.location}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-category">
                            Categorie
                        </label>
                        <select
                            id="offer-category"
                            value={form.category}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, category: event.target.value as OfferCategory }))}
                            className="form-input"
                        >
                            {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-status">
                            Status
                        </label>
                        <select
                            id="offer-status"
                            value={form.status}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, status: event.target.value as OfferStatus }))}
                            className="form-input"
                        >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-price">
                            Pret
                        </label>
                        <input
                            id="offer-price"
                            type="number"
                            min="1"
                            value={form.priceEur}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, priceEur: event.target.value }))}
                            className="form-input"
                            placeholder="300"
                        />
                        {formErrors.priceEur && <p className="field-error">{formErrors.priceEur}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-duration">
                            Durata ore
                        </label>
                        <input
                            id="offer-duration"
                            type="number"
                            min="1"
                            value={form.durationHours}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, durationHours: event.target.value }))}
                            className="form-input"
                        />
                        {formErrors.durationHours && <p className="field-error">{formErrors.durationHours}</p>}
                    </div>

                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-description">
                            Descriere
                        </label>
                        <textarea
                            id="offer-description"
                            value={form.description}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))}
                            className="form-input min-h-24"
                            placeholder="Ce include pachetul"
                        />
                        {formErrors.description && <p className="field-error">{formErrors.description}</p>}
                    </div>

                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="offer-cover-image">
                            Poza oferta
                        </label>
                        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                {form.coverImageUrl ? (
                                    <img src={form.coverImageUrl} alt="Previzualizare poza oferta" className="h-36 w-full object-cover" />
                                ) : (
                                    <div className="flex h-36 items-center justify-center px-4 text-center text-sm font-semibold text-slate-500">
                                        Alege o poza pentru oferta
                                    </div>
                                )}
                            </div>
                            <div>
                                <input id="offer-cover-image" type="file" accept="image/*" onChange={(event) => void handleCoverImageChange(event)} className="form-input" />
                                <p className="mt-2 text-xs text-slate-500">Poza va fi afisata in catalogul de oferte pentru clienti.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:col-span-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se salveaza...' : editingId ? 'Salveaza oferta' : 'Creeaza oferta'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                                Anuleaza editarea
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="soft-panel grid gap-3 p-4 md:grid-cols-[1fr_200px_220px]">
                <input
                    type="search"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                    }}
                    className="form-input"
                    placeholder="Cauta in ofertele tale"
                />
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as 'all' | OfferStatus);
                        setPage(1);
                    }}
                    className="form-input"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as OfferSort)} className="form-input">
                    {offerSortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </section>

            {isLoading && <LoadingState title="Se incarca datele fotografului..." />}
            {!isLoading && error && <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadData() }} />}
            {!isLoading && !error && offersResult && offersResult.items.length === 0 && (
                <EmptyState title="Nu exista oferte" message="Creeaza prima oferta sau schimba filtrele curente." />
            )}
            {!isLoading && !error && offersResult && offersResult.items.length > 0 && (
                <section className="soft-panel table-scroll p-5">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th className="pb-3">Oferta</th>
                                <th className="pb-3">Categorie</th>
                                <th className="pb-3">Pret</th>
                                <th className="pb-3">Durata</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Actiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offersResult.items.map((offer) => (
                                <tr key={offer.id} className="border-b border-slate-100 last:border-0">
                                    <td className="py-3">
                                        <p className="font-semibold text-slate-950">{offer.title}</p>
                                        <p className="text-xs text-slate-500">{offer.location}</p>
                                    </td>
                                    <td className="py-3">{offer.category}</td>
                                    <td className="py-3">{formatCurrency(offer.priceEur)}</td>
                                    <td className="py-3">{offer.durationHours}h</td>
                                    <td className="py-3">
                                        <Badge tone={offerStatusTone[offer.status]}>{offer.status}</Badge>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(offer)}
                                                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete(offer.id)}
                                                className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-600">
                            {offersResult.total} oferte · pagina {offersResult.page} din {offersResult.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                disabled={offersResult.page === 1}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inapoi
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.min(offersResult.totalPages, currentPage + 1))}
                                disabled={offersResult.page === offersResult.totalPages}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inainte
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <section className="soft-panel p-5">
                <h2 className="text-xl font-bold text-slate-950">Cereri primite</h2>
                {!bookingsResult || bookingsResult.items.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">Nu exista cereri pentru ofertele tale.</p>
                ) : (
                    <div className="mt-4 grid gap-3">
                        {bookingsResult.items.map((booking) => (
                            <article key={booking.id} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-950">{booking.offerTitle}</h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {booking.clientName} · {formatDate(booking.eventDate)} · {booking.location}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatCurrency(booking.budgetEur)}</p>
                                    </div>
                                    <Badge tone={bookingStatusTone[booking.status]}>{booking.status}</Badge>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void handleBookingStatus(booking.id, 'confirmed')}
                                        disabled={!canConfirmBooking(booking.status)}
                                        className="rounded-lg border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                                    >
                                        Confirma
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleBookingStatus(booking.id, 'rejected')}
                                        disabled={!canRejectBooking(booking.status)}
                                        className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                                    >
                                        Respinge
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleBookingStatus(booking.id, 'finalized')}
                                        disabled={!canFinalizeBooking(booking.status)}
                                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                    >
                                        Finalizeaza
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default PhotographerDashboard;

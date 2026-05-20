import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { bookingService, type BookingSort } from '../services/bookingService';
import { isMockHttpError } from '../services/mockHttp';
import { offerService } from '../services/offerService';
import { PATHS } from '../routes/paths';
import type { Booking, BookingInput, BookingStatus, PaginatedResult, PhotoOffer, SelectOption } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BookingFormState {
    offerId: string;
    eventDate: string;
    location: string;
    budgetEur: string;
    notes: string;
}

interface BookingFormErrors {
    offerId?: string;
    eventDate?: string;
    location?: string;
    budgetEur?: string;
}

const initialForm: BookingFormState = {
    offerId: '',
    eventDate: '',
    location: '',
    budgetEur: '',
    notes: '',
};

const statusOptions: Array<SelectOption<'all' | BookingStatus>> = [
    { value: 'all', label: 'Toate statusurile' },
    { value: 'pending', label: 'In asteptare' },
    { value: 'confirmed', label: 'Confirmate' },
    { value: 'rejected', label: 'Respinse' },
    { value: 'paid', label: 'Achitate' },
    { value: 'finalized', label: 'Finalizate' },
];

const sortOptions: Array<SelectOption<BookingSort>> = [
    { value: 'eventDateAsc', label: 'Data crescator' },
    { value: 'eventDateDesc', label: 'Data descrescator' },
    { value: 'budgetDesc', label: 'Buget descrescator' },
    { value: 'newest', label: 'Cele mai noi' },
];

const statusTone: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    paid: 'success',
    finalized: 'neutral',
};

const canPayBooking = (status: BookingStatus) => !['rejected', 'paid', 'finalized'].includes(status);

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedOfferId = searchParams.get('offerId');
    const [offers, setOffers] = useState<PhotoOffer[]>([]);
    const [result, setResult] = useState<PaginatedResult<Booking> | null>(null);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'all' | BookingStatus>('all');
    const [sortBy, setSortBy] = useState<BookingSort>('eventDateAsc');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<BookingFormState>(initialForm);
    const [formErrors, setFormErrors] = useState<BookingFormErrors>({});
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
            const [bookingsResult, offersResult] = await Promise.all([
                bookingService.listBookings({
                    clientId: user.id,
                    query,
                    status,
                    sortBy,
                    page,
                    pageSize: 5,
                }),
                offerService.listOffers({ publicOnly: true, page: 1, pageSize: 50, sortBy: 'titleAsc' }),
            ]);

            setResult(bookingsResult);
            setOffers(offersResult.items);

            const requestedOffer = requestedOfferId ? offersResult.items.find((offer) => offer.id === requestedOfferId) : null;
            const defaultOffer = requestedOffer ?? offersResult.items[0];

            if (defaultOffer) {
                setForm((currentForm) => {
                    if (requestedOffer && currentForm.offerId !== requestedOffer.id) {
                        return {
                            ...currentForm,
                            offerId: requestedOffer.id,
                            location: currentForm.location || requestedOffer.location,
                            budgetEur: currentForm.budgetEur || String(requestedOffer.priceEur),
                        };
                    }

                    return currentForm.offerId ? currentForm : { ...currentForm, offerId: defaultOffer.id };
                });
            }
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Rezervarile nu au putut fi incarcate.';
            setError(message);

            if (isMockHttpError(loadError) && loadError.status === 500) {
                navigate(PATHS.SERVER_ERROR, { state: { message } });
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate, page, query, requestedOfferId, sortBy, status, user]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const stats = useMemo(() => {
        const bookings = result?.items ?? [];
        const confirmed = bookings.filter((booking) => booking.status === 'confirmed').length;
        const pending = bookings.filter((booking) => booking.status === 'pending').length;
        const totalBudget = bookings.reduce((sum, booking) => sum + booking.budgetEur, 0);

        return { confirmed, pending, totalBudget };
    }, [result]);

    const selectedOfferForForm = useMemo(() => offers.find((offer) => offer.id === form.offerId) ?? null, [form.offerId, offers]);

    const validateForm = () => {
        const nextErrors: BookingFormErrors = {};
        const today = new Date().toISOString().slice(0, 10);

        if (!form.offerId) {
            nextErrors.offerId = 'Alege o oferta.';
        }

        if (!form.eventDate) {
            nextErrors.eventDate = 'Data este obligatorie.';
        } else if (form.eventDate < today) {
            nextErrors.eventDate = 'Data nu poate fi in trecut.';
        }

        if (form.location.trim().length < 3) {
            nextErrors.location = 'Locatia trebuie sa aiba minimum 3 caractere.';
        }

        if (!Number.isFinite(Number(form.budgetEur)) || Number(form.budgetEur) <= 0) {
            nextErrors.budgetEur = 'Bugetul trebuie sa fie un numar pozitiv.';
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const resetForm = () => {
        setForm({
            ...initialForm,
            offerId: offers[0]?.id ?? '',
        });
        setEditingId(null);
        setFormErrors({});
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || !validateForm()) {
            return;
        }

        const selectedOffer = offers.find((offer) => offer.id === form.offerId);

        if (!selectedOffer) {
            setFormErrors({ offerId: 'Oferta selectata nu mai exista.' });
            return;
        }

        const payload: BookingInput = {
            offerId: form.offerId,
            eventDate: form.eventDate,
            location: form.location.trim(),
            budgetEur: Number(form.budgetEur),
            notes: form.notes.trim(),
        };

        setIsSubmitting(true);

        try {
            if (editingId) {
                await bookingService.updateBooking(editingId, payload, selectedOffer);
                toast.success('Rezervarea a fost actualizata.');
            } else {
                await bookingService.createBooking(payload, user, selectedOffer);
                toast.success('Cererea de rezervare a fost trimisa.');
            }

            resetForm();
            await loadData();
        } catch (submitError) {
            const message = isMockHttpError(submitError) ? submitError.message : 'Operatia nu a reusit.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (booking: Booking) => {
        setEditingId(booking.id);
        setForm({
            offerId: booking.offerId,
            eventDate: booking.eventDate,
            location: booking.location,
            budgetEur: String(booking.budgetEur),
            notes: booking.notes,
        });
        setFormErrors({});
    };

    const handleDelete = async (bookingId: string) => {
        const confirmed = window.confirm('Stergi aceasta rezervare? Actiunea nu poate fi anulata.');

        if (!confirmed) {
            return;
        }

        try {
            await bookingService.deleteBooking(bookingId);
            toast.success('Rezervarea a fost stearsa.');
            await loadData();
        } catch (deleteError) {
            const message = isMockHttpError(deleteError) ? deleteError.message : 'Stergerea nu a reusit.';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Rezervarile mele" description="Creeaza si gestioneaza cereri de rezervare pe baza ofertelor active." />

            <section className="grid gap-4 md:grid-cols-3">
                <StatCard label="Confirmate" value={stats.confirmed} />
                <StatCard label="In asteptare" value={stats.pending} />
                <StatCard label="Buget vizibil" value={formatCurrency(stats.totalBudget)} />
            </section>

            <section className="soft-panel p-5">
                <h2 className="text-xl font-bold text-slate-950">{editingId ? 'Editeaza rezervarea' : 'Cerere noua'}</h2>
                <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="booking-offer">
                            Oferta
                        </label>
                        <select
                            id="booking-offer"
                            value={form.offerId}
                            onChange={(event) => {
                                const nextOffer = offers.find((offer) => offer.id === event.target.value);

                                setForm((currentForm) => ({
                                    ...currentForm,
                                    offerId: event.target.value,
                                    location: nextOffer?.location ?? currentForm.location,
                                    budgetEur: nextOffer ? String(nextOffer.priceEur) : currentForm.budgetEur,
                                }));
                            }}
                            className="form-input"
                        >
                            <option value="">Alege oferta</option>
                            {offers.map((offer) => (
                                <option key={offer.id} value={offer.id}>
                                    {offer.title} · {offer.photographerName}
                                </option>
                            ))}
                        </select>
                        {formErrors.offerId && <p className="field-error">{formErrors.offerId}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="booking-date">
                            Data evenimentului
                        </label>
                        <input
                            id="booking-date"
                            type="date"
                            value={form.eventDate}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, eventDate: event.target.value }))}
                            className="form-input"
                        />
                        {formErrors.eventDate && <p className="field-error">{formErrors.eventDate}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="booking-location">
                            Locatie
                        </label>
                        <input
                            id="booking-location"
                            type="text"
                            value={form.location}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, location: event.target.value }))}
                            className="form-input"
                            placeholder="Chisinau"
                        />
                        {formErrors.location && <p className="field-error">{formErrors.location}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="booking-budget">
                            Buget estimat
                        </label>
                        <input
                            id="booking-budget"
                            type="number"
                            min="1"
                            value={form.budgetEur}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, budgetEur: event.target.value }))}
                            className="form-input"
                            placeholder="350"
                        />
                        {formErrors.budgetEur && <p className="field-error">{formErrors.budgetEur}</p>}
                    </div>

                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="booking-notes">
                            Note
                        </label>
                        <textarea
                            id="booking-notes"
                            value={form.notes}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, notes: event.target.value }))}
                            className="form-input min-h-24"
                            placeholder="Detalii despre eveniment"
                        />
                    </div>

                    {selectedOfferForForm && (
                        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm lg:col-span-2">
                            <p className="font-semibold text-teal-900">Oferta selectata din catalog</p>
                            <p className="mt-1 text-teal-800">
                                {selectedOfferForForm.title} · {selectedOfferForForm.photographerName} · {formatCurrency(selectedOfferForForm.priceEur)}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 lg:col-span-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se salveaza...' : editingId ? 'Salveaza modificarile' : 'Trimite cererea'}
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
                    placeholder="Cauta dupa oferta, fotograf sau locatie"
                />
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as 'all' | BookingStatus);
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
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as BookingSort)} className="form-input">
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </section>

            {isLoading && <LoadingState title="Se incarca rezervarile..." />}
            {!isLoading && error && <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadData() }} />}
            {!isLoading && !error && result && result.items.length === 0 && (
                <EmptyState title="Nu exista rezervari" message="Creeaza prima cerere sau schimba filtrele curente." />
            )}
            {!isLoading && !error && result && result.items.length > 0 && (
                <section className="soft-panel table-scroll p-5">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th className="pb-3">Oferta</th>
                                <th className="pb-3">Fotograf</th>
                                <th className="pb-3">Data</th>
                                <th className="pb-3">Locatie</th>
                                <th className="pb-3">Buget</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Actiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((booking) => (
                                <tr key={booking.id} className="border-b border-slate-100 last:border-0">
                                    <td className="py-3 font-semibold text-slate-950">{booking.offerTitle}</td>
                                    <td className="py-3">{booking.photographerName}</td>
                                    <td className="py-3">{formatDate(booking.eventDate)}</td>
                                    <td className="py-3">{booking.location}</td>
                                    <td className="py-3">{formatCurrency(booking.budgetEur)}</td>
                                    <td className="py-3">
                                        <Badge tone={statusTone[booking.status]}>{booking.status}</Badge>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {canPayBooking(booking.status) && (
                                                <Link
                                                    to={PATHS.USER_PAYMENT.replace(':bookingId', booking.id)}
                                                    className="payment-outline-button rounded-lg border border-emerald-500 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors"
                                                >
                                                    Mergi spre achitare
                                                </Link>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(booking)}
                                                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete(booking.id)}
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
                            {result.total} rezervari · pagina {result.page} din {result.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                disabled={result.page === 1}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inapoi
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.min(result.totalPages, currentPage + 1))}
                                disabled={result.page === result.totalPages}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inainte
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default UserDashboard;

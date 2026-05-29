import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { PATHS } from '../routes/paths';
import { bookingService } from '../services/bookingService';
import { isMockHttpError } from '../services/mockHttp';
import type { Booking, BookingStatus } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

type PaymentMethod = 'cash' | 'card';

interface CardFormState {
    holderName: string;
    cardNumber: string;
    expiresAt: string;
    cvc: string;
}

interface CardFormErrors {
    holderName?: string;
    cardNumber?: string;
    expiresAt?: string;
    cvc?: string;
}

const initialCardForm: CardFormState = {
    holderName: '',
    cardNumber: '',
    expiresAt: '',
    cvc: '',
};

const statusTone: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    paid: 'success',
    finalized: 'neutral',
};

const formatCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const PaymentPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [cardForm, setCardForm] = useState<CardFormState>(initialCardForm);
    const [cardErrors, setCardErrors] = useState<CardFormErrors>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBooking = useCallback(async () => {
        if (!user || !bookingId) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const nextBooking = await bookingService.getBooking(bookingId);

            if (nextBooking.clientId !== user.id) {
                navigate(PATHS.FORBIDDEN);
                return;
            }

            setBooking(nextBooking);
            setIsPaymentProcessed(nextBooking.status === 'paid');
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Oferta pentru achitare nu a putut fi incarcata.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [bookingId, navigate, user]);

    useEffect(() => {
        void loadBooking();
    }, [loadBooking]);

    const validateCardForm = () => {
        const nextErrors: CardFormErrors = {};
        const cardDigits = cardForm.cardNumber.replace(/\D/g, '');
        const [month] = cardForm.expiresAt.split('/');
        const expiryMonth = Number(month);

        if (cardForm.holderName.trim().length < 3) {
            nextErrors.holderName = 'Numele de pe card este obligatoriu.';
        }

        if (cardDigits.length !== 16) {
            nextErrors.cardNumber = 'Numarul cardului trebuie sa contina 16 cifre.';
        }

        if (!/^\d{2}\/\d{2}$/.test(cardForm.expiresAt) || expiryMonth < 1 || expiryMonth > 12) {
            nextErrors.expiresAt = 'Data expirarii trebuie sa fie in format LL/AA.';
        }

        if (!/^\d{3,4}$/.test(cardForm.cvc)) {
            nextErrors.cvc = 'CVC trebuie sa contina 3 sau 4 cifre.';
        }

        setCardErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleConfirmPayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!booking || booking.status !== 'confirmed') {
            return;
        }

        if (method === 'card' && !validateCardForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            const paidBooking = await bookingService.updateBookingStatus(booking.id, 'paid');
            setBooking(paidBooking);
            setIsPaymentProcessed(true);
            toast.success('Plata a fost procesata.');
        } catch (paymentError) {
            const message = isMockHttpError(paymentError) ? paymentError.message : 'Plata nu a putut fi procesata.';
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const isAlreadyPaid = booking?.status === 'paid';
    const canPay = booking?.status === 'confirmed';
    const isPaymentUnavailable = Boolean(booking && !canPay && !isAlreadyPaid);

    return (
        <div className="space-y-6">
            <PageHeader title="Achitare oferta" description="Finalizeaza plata pentru oferta selectata din dashboard." />

            {isLoading && <LoadingState title="Se incarca oferta pentru achitare..." />}
            {!isLoading && error && <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadBooking() }} />}
            {!isLoading && !error && booking && (
                <section className="rounded-lg bg-slate-100 p-5">
                    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="rounded-lg border border-slate-200 bg-white p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase text-emerald-700">Oferta de achitat</p>
                                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{booking.offerTitle}</h2>
                                    <p className="mt-2 text-sm text-slate-600">{booking.photographerName}</p>
                                </div>
                                <Badge tone={statusTone[booking.status]}>{booking.status}</Badge>
                            </div>

                            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-slate-500">Data evenimentului</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{formatDate(booking.eventDate)}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Locatie</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{booking.location}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Client</dt>
                                    <dd className="mt-1 font-semibold text-slate-950">{booking.clientName}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Total de achitat</dt>
                                    <dd className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(booking.budgetEur)}</dd>
                                </div>
                            </dl>

                            {booking.notes && (
                                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-800">Note</p>
                                    <p className="mt-1 text-sm text-slate-600">{booking.notes}</p>
                                </div>
                            )}
                        </div>

                        <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={handleConfirmPayment} noValidate>
                            <h2 className="text-xl font-bold text-slate-950">Metoda de plata</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className={`payment-method-option ${method === 'cash' ? 'payment-method-option-active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment-method"
                                        value="cash"
                                        checked={method === 'cash'}
                                        onChange={() => setMethod('cash')}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-semibold text-slate-950">Achitare pe loc</span>
                                </label>
                                <label className={`payment-method-option ${method === 'card' ? 'payment-method-option-active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment-method"
                                        value="card"
                                        checked={method === 'card'}
                                        onChange={() => setMethod('card')}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-semibold text-slate-950">Card</span>
                                </label>
                            </div>

                            {method === 'card' && (
                                <div className="mt-5 grid gap-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="card-holder">
                                            Nume pe card
                                        </label>
                                        <input
                                            id="card-holder"
                                            value={cardForm.holderName}
                                            onChange={(event) => setCardForm((currentForm) => ({ ...currentForm, holderName: event.target.value }))}
                                            className="form-input"
                                            placeholder="Maria Popescu"
                                        />
                                        {cardErrors.holderName && <p className="field-error">{cardErrors.holderName}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="card-number">
                                            Numar card
                                        </label>
                                        <input
                                            id="card-number"
                                            inputMode="numeric"
                                            value={cardForm.cardNumber}
                                            onChange={(event) =>
                                                setCardForm((currentForm) => ({ ...currentForm, cardNumber: formatCardNumber(event.target.value) }))
                                            }
                                            className="form-input"
                                            placeholder="4242 4242 4242 4242"
                                        />
                                        {cardErrors.cardNumber && <p className="field-error">{cardErrors.cardNumber}</p>}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="card-expiry">
                                                Expira
                                            </label>
                                            <input
                                                id="card-expiry"
                                                inputMode="numeric"
                                                value={cardForm.expiresAt}
                                                onChange={(event) =>
                                                    setCardForm((currentForm) => ({ ...currentForm, expiresAt: formatExpiry(event.target.value) }))
                                                }
                                                className="form-input"
                                                placeholder="LL/AA"
                                            />
                                            {cardErrors.expiresAt && <p className="field-error">{cardErrors.expiresAt}</p>}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="card-cvc">
                                                CVC
                                            </label>
                                            <input
                                                id="card-cvc"
                                                inputMode="numeric"
                                                value={cardForm.cvc}
                                                onChange={(event) =>
                                                    setCardForm((currentForm) => ({
                                                        ...currentForm,
                                                        cvc: event.target.value.replace(/\D/g, '').slice(0, 4),
                                                    }))
                                                }
                                                className="form-input"
                                                placeholder="123"
                                            />
                                            {cardErrors.cvc && <p className="field-error">{cardErrors.cvc}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isPaymentUnavailable && (
                                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                                    Cererea trebuie confirmata de fotograf inainte de achitare.
                                </p>
                            )}

                            {isPaymentProcessed && (
                                <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                    <span className="payment-checkmark" aria-hidden="true" />
                                    <div>
                                        <p className="font-semibold text-emerald-900">Plata a fost procesata.</p>
                                        <p className="text-sm text-emerald-800">Statusul ofertei este paid.</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={isProcessing || !canPay || isAlreadyPaid}
                                    className="rounded-lg bg-emerald-200 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isProcessing ? 'Se proceseaza...' : 'Confirma plata'}
                                </button>
                                <Link to={PATHS.USER_DASHBOARD} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Inapoi la oferte
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>
            )}
        </div>
    );
};

export default PaymentPage;

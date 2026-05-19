import { MOCK_BOOKINGS } from '../data/mockData';
import type { Booking, BookingInput, BookingStatus, PaginatedResult, PhotoOffer, UserRecord } from '../types/models';
import { delay, MockHttpError } from './mockHttp';
import { storageService } from './storageService';

const BOOKINGS_KEY = 'photoPortal.bookings';

export type BookingSort = 'eventDateAsc' | 'eventDateDesc' | 'budgetDesc' | 'newest';
type StoredBooking = Omit<Booking, 'status'> & { status: BookingStatus | 'cancelled' | 'completed' };

export interface BookingListParams {
    query?: string;
    status?: 'all' | BookingStatus;
    sortBy?: BookingSort;
    page?: number;
    pageSize?: number;
    clientId?: string;
    photographerId?: string;
    forceError?: boolean;
}

const createId = () => `booking-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeBooking = (booking: StoredBooking): Booking => ({
    ...booking,
    status: booking.status === 'cancelled' ? 'rejected' : booking.status === 'completed' ? 'finalized' : booking.status,
});

const getBookings = (): Booking[] => {
    const bookings = storageService.read<StoredBooking[]>(BOOKINGS_KEY, []);

    if (bookings.length > 0) {
        const normalizedBookings = bookings.map(normalizeBooking);
        const wasMigrated = normalizedBookings.some((booking, index) => booking.status !== bookings[index].status);

        if (wasMigrated) {
            saveBookings(normalizedBookings);
        }

        return normalizedBookings;
    }

    storageService.write(BOOKINGS_KEY, MOCK_BOOKINGS);
    return MOCK_BOOKINGS;
};

const saveBookings = (bookings: Booking[]): void => {
    storageService.write(BOOKINGS_KEY, bookings);
};

const sortBookings = (bookings: Booking[], sortBy: BookingSort): Booking[] => {
    const sorted = [...bookings];

    switch (sortBy) {
        case 'eventDateAsc':
            return sorted.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
        case 'eventDateDesc':
            return sorted.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
        case 'budgetDesc':
            return sorted.sort((a, b) => b.budgetEur - a.budgetEur);
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
};

export const bookingService = {
    async listBookings(params: BookingListParams = {}): Promise<PaginatedResult<Booking>> {
        await delay();

        if (params.forceError || params.query?.trim().toLowerCase() === 'eroare') {
            throw new MockHttpError(500, 'Serviciul mock pentru rezervari a esuat.');
        }

        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.max(1, params.pageSize ?? 6);
        const query = params.query?.trim().toLowerCase() ?? '';

        let items = getBookings();

        if (params.clientId) {
            items = items.filter((booking) => booking.clientId === params.clientId);
        }

        if (params.photographerId) {
            items = items.filter((booking) => booking.photographerId === params.photographerId);
        }

        if (params.status && params.status !== 'all') {
            items = items.filter((booking) => booking.status === params.status);
        }

        if (query) {
            items = items.filter((booking) => {
                const searchable = `${booking.offerTitle} ${booking.photographerName} ${booking.clientName} ${booking.location}`.toLowerCase();
                return searchable.includes(query);
            });
        }

        items = sortBookings(items, params.sortBy ?? 'eventDateAsc');

        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const normalizedPage = Math.min(page, totalPages);
        const start = (normalizedPage - 1) * pageSize;

        return {
            items: items.slice(start, start + pageSize),
            total,
            page: normalizedPage,
            pageSize,
            totalPages,
        };
    },

    async getBooking(bookingId: string): Promise<Booking> {
        await delay();

        const booking = getBookings().find((candidate) => candidate.id === bookingId);

        if (!booking) {
            throw new MockHttpError(404, 'Rezervarea nu exista.');
        }

        return booking;
    },

    async createBooking(input: BookingInput, client: UserRecord, offer: PhotoOffer): Promise<Booking> {
        await delay();

        const now = new Date().toISOString();
        const booking: Booking = {
            id: createId(),
            clientId: client.id,
            clientName: client.fullName,
            offerId: offer.id,
            offerTitle: offer.title,
            photographerId: offer.photographerId,
            photographerName: offer.photographerName,
            eventDate: input.eventDate,
            location: input.location,
            budgetEur: input.budgetEur,
            notes: input.notes,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        };

        saveBookings([booking, ...getBookings()]);
        return booking;
    },

    async updateBooking(bookingId: string, input: BookingInput, offer: PhotoOffer): Promise<Booking> {
        await delay();

        let updatedBooking: Booking | null = null;
        const bookings = getBookings().map((booking) => {
            if (booking.id !== bookingId) {
                return booking;
            }

            updatedBooking = {
                ...booking,
                offerId: offer.id,
                offerTitle: offer.title,
                photographerId: offer.photographerId,
                photographerName: offer.photographerName,
                eventDate: input.eventDate,
                location: input.location,
                budgetEur: input.budgetEur,
                notes: input.notes,
                updatedAt: new Date().toISOString(),
            };
            return updatedBooking;
        });

        if (!updatedBooking) {
            throw new MockHttpError(404, 'Rezervarea nu exista.');
        }

        saveBookings(bookings);
        return updatedBooking;
    },

    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
        await delay();

        let updatedBooking: Booking | null = null;
        const bookings = getBookings().map((booking) => {
            if (booking.id !== bookingId) {
                return booking;
            }

            updatedBooking = {
                ...booking,
                status,
                updatedAt: new Date().toISOString(),
            };
            return updatedBooking;
        });

        if (!updatedBooking) {
            throw new MockHttpError(404, 'Rezervarea nu exista.');
        }

        saveBookings(bookings);
        return updatedBooking;
    },

    async deleteBooking(bookingId: string): Promise<void> {
        await delay();

        const bookings = getBookings();
        const nextBookings = bookings.filter((booking) => booking.id !== bookingId);

        if (nextBookings.length === bookings.length) {
            throw new MockHttpError(404, 'Rezervarea nu exista.');
        }

        saveBookings(nextBookings);
    },
};

import apiClient from '../api/axios';

import type {
    Booking,
    BookingInput,
    BookingStatus,
    PaginatedResult,
    PhotoOffer,
    UserRecord,
} from '../types/models';

export type BookingSort =
    | 'eventDateAsc'
    | 'eventDateDesc'
    | 'budgetDesc'
    | 'newest';

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

export const bookingService = {
    async listBookings(
        params: BookingListParams = {},
    ): Promise<PaginatedResult<Booking>> {
        const { data } = await apiClient.get<PaginatedResult<Booking>>(
            '/bookings',
            {
                params,
            },
        );

        return data;
    },

    async getBooking(bookingId: string): Promise<Booking> {
        const { data } = await apiClient.get<Booking>(
            `/bookings/${bookingId}`,
        );

        return data;
    },

    async createBooking(
        input: BookingInput,
        client: UserRecord,
        offer: PhotoOffer,
    ): Promise<Booking> {
        const { data } = await apiClient.post<Booking>(
            '/bookings',
            {
                ...input,
                offerId: offer.id,
                clientId: client.id,
                clientName: client.fullName,
            },
        );

        return data;
    },

    async updateBooking(
        bookingId: string,
        input: BookingInput,
        offer: PhotoOffer,
    ): Promise<Booking> {
        const { data } = await apiClient.put<Booking>(
            `/bookings/${bookingId}`,
            {
                ...input,
                offerId: offer.id,
            },
        );

        return data;
    },

    async updateBookingStatus(
        bookingId: string,
        status: BookingStatus,
    ): Promise<Booking> {
        const { data } = await apiClient.patch<Booking>(
            `/bookings/${bookingId}/status`,
            { status },
        );

        return data;
    },

    async deleteBooking(bookingId: string): Promise<void> {
        await apiClient.delete(`/bookings/${bookingId}`);
    },
};
import apiClient from '../api/axios';

import type {
    OfferCategory,
    OfferInput,
    OfferStatus,
    PaginatedResult,
    PhotoOffer,
} from '../types/models';

export type OfferSort =
    | 'newest'
    | 'priceAsc'
    | 'priceDesc'
    | 'ratingDesc'
    | 'titleAsc';

export interface OfferListParams {
    query?: string;
    category?: 'all' | OfferCategory;
    status?: 'all' | OfferStatus;
    sortBy?: OfferSort;
    page?: number;
    pageSize?: number;
    photographerId?: string;
    publicOnly?: boolean;
    forceError?: boolean;
}

export const offerService = {
    async listOffers(
        params: OfferListParams = {},
    ): Promise<PaginatedResult<PhotoOffer>> {
        const { data } =
            await apiClient.get<PaginatedResult<PhotoOffer>>(
                '/offers',
                {
                    params,
                },
            );

        return data;
    },

    async getOffer(
        offerId: string,
    ): Promise<PhotoOffer> {
        const { data } =
            await apiClient.get<PhotoOffer>(
                `/offers/${offerId}`,
            );

        return data;
    },

    async createOffer(
        input: OfferInput,
        photographerId: string,
        photographerName: string,
    ): Promise<PhotoOffer> {
        const { data } =
            await apiClient.post<PhotoOffer>(
                '/offers',
                {
                    ...input,
                    photographerId,
                    photographerName,
                },
            );

        return data;
    },

    async updateOffer(
        offerId: string,
        input: OfferInput,
    ): Promise<PhotoOffer> {
        const { data } =
            await apiClient.put<PhotoOffer>(
                `/offers/${offerId}`,
                input,
            );

        return data;
    },

    async deleteOffer(
        offerId: string,
    ): Promise<void> {
        await apiClient.delete(
            `/offers/${offerId}`,
        );
    },
};
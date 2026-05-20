import { MOCK_OFFERS } from '../data/mockData';
import type { OfferCategory, OfferInput, OfferStatus, PaginatedResult, PhotoOffer } from '../types/models';
import { delay, MockHttpError } from './mockHttp';
import { storageService } from './storageService';

const OFFERS_KEY = 'photoPortal.offers';

export type OfferSort = 'newest' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'titleAsc';

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

const createId = () => `offer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80';

const getOffers = (): PhotoOffer[] => {
    const offers = storageService.read<PhotoOffer[]>(OFFERS_KEY, []);

    if (offers.length > 0) {
        return offers;
    }

    storageService.write(OFFERS_KEY, MOCK_OFFERS);
    return MOCK_OFFERS;
};

const saveOffers = (offers: PhotoOffer[]): void => {
    storageService.write(OFFERS_KEY, offers);
};

const sortOffers = (offers: PhotoOffer[], sortBy: OfferSort): PhotoOffer[] => {
    const sorted = [...offers];

    switch (sortBy) {
        case 'priceAsc':
            return sorted.sort((a, b) => a.priceEur - b.priceEur);
        case 'priceDesc':
            return sorted.sort((a, b) => b.priceEur - a.priceEur);
        case 'ratingDesc':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'titleAsc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
};

export const offerService = {
    async listOffers(params: OfferListParams = {}): Promise<PaginatedResult<PhotoOffer>> {
        await delay();

        if (params.forceError || params.query?.trim().toLowerCase() === 'eroare') {
            throw new MockHttpError(500, 'Serviciul mock pentru oferte a esuat.');
        }

        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.max(1, params.pageSize ?? 6);
        const query = params.query?.trim().toLowerCase() ?? '';

        let items = getOffers();

        if (params.publicOnly) {
            items = items.filter((offer) => offer.status === 'active');
        }

        if (params.photographerId) {
            items = items.filter((offer) => offer.photographerId === params.photographerId);
        }

        if (params.category && params.category !== 'all') {
            items = items.filter((offer) => offer.category === params.category);
        }

        if (params.status && params.status !== 'all') {
            items = items.filter((offer) => offer.status === params.status);
        }

        if (query) {
            items = items.filter((offer) => {
                const searchable = `${offer.title} ${offer.description} ${offer.location} ${offer.photographerName}`.toLowerCase();
                return searchable.includes(query);
            });
        }

        items = sortOffers(items, params.sortBy ?? 'newest');

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

    async getOffer(offerId: string): Promise<PhotoOffer> {
        await delay(150);

        const offer = getOffers().find((candidate) => candidate.id === offerId);

        if (!offer) {
            throw new MockHttpError(404, 'Oferta nu exista.');
        }

        return offer;
    },

    async createOffer(input: OfferInput, photographerId: string, photographerName: string): Promise<PhotoOffer> {
        await delay();

        const now = new Date().toISOString();
        const newOffer: PhotoOffer = {
            id: createId(),
            ...input,
            photographerId,
            photographerName,
            rating: 4.5,
            coverImageUrl: input.coverImageUrl || DEFAULT_COVER_IMAGE,
            createdAt: now,
            updatedAt: now,
        };

        saveOffers([newOffer, ...getOffers()]);
        return newOffer;
    },

    async updateOffer(offerId: string, input: OfferInput): Promise<PhotoOffer> {
        await delay();

        let updatedOffer: PhotoOffer | null = null;
        const offers = getOffers().map((offer) => {
            if (offer.id !== offerId) {
                return offer;
            }

            updatedOffer = {
                ...offer,
                ...input,
                updatedAt: new Date().toISOString(),
            };
            return updatedOffer;
        });

        if (!updatedOffer) {
            throw new MockHttpError(404, 'Oferta nu exista.');
        }

        saveOffers(offers);
        return updatedOffer;
    },

    async deleteOffer(offerId: string): Promise<void> {
        await delay();

        const offers = getOffers();
        const nextOffers = offers.filter((offer) => offer.id !== offerId);

        if (nextOffers.length === offers.length) {
            throw new MockHttpError(404, 'Oferta nu exista.');
        }

        saveOffers(nextOffers);
    },
};

import { delay } from './mockHttp';
import { storageService } from './storageService';

const RESULTS_KEY = 'photoPortal.bookingResults';

export interface ResultPhoto {
    id: string;
    name: string;
    dataUrl: string;
    createdAt: string;
}

export interface BookingResult {
    bookingId: string;
    photos: ResultPhoto[];
    updatedAt: string;
}

const createId = () => `result-photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const getResults = (): BookingResult[] => storageService.read<BookingResult[]>(RESULTS_KEY, []);

const saveResults = (results: BookingResult[]): void => {
    storageService.write(RESULTS_KEY, results);
};

export const createResultPhoto = (name: string, dataUrl: string): ResultPhoto => ({
    id: createId(),
    name,
    dataUrl,
    createdAt: new Date().toISOString(),
});

export const resultService = {
    async listResults(): Promise<BookingResult[]> {
        await delay();
        return getResults();
    },

    async getResult(bookingId: string): Promise<BookingResult | null> {
        await delay();
        return getResults().find((result) => result.bookingId === bookingId) ?? null;
    },

    async saveResultPhotos(bookingId: string, photos: ResultPhoto[]): Promise<BookingResult> {
        await delay();

        const now = new Date().toISOString();
        const nextResult: BookingResult = {
            bookingId,
            photos,
            updatedAt: now,
        };

        const results = getResults();
        const hasResult = results.some((result) => result.bookingId === bookingId);
        const nextResults = hasResult ? results.map((result) => (result.bookingId === bookingId ? nextResult : result)) : [nextResult, ...results];

        saveResults(nextResults);
        return nextResult;
    },
};

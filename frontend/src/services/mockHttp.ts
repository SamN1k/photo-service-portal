export type MockHttpStatus = number;

export class MockHttpError extends Error {
    status: MockHttpStatus;

    constructor(status: MockHttpStatus, message: string) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

export const isMockHttpError = (error: unknown): error is MockHttpError => {
    return error instanceof MockHttpError;
};

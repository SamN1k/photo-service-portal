export type MockHttpStatus = 401 | 403 | 404 | 409 | 422 | 500;

export class MockHttpError extends Error {
    status: MockHttpStatus;

    constructor(status: MockHttpStatus, message: string) {
        super(message);
        this.name = 'MockHttpError';
        this.status = status;
    }
}

export const delay = (milliseconds = 350) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });

export const isMockHttpError = (error: unknown): error is MockHttpError => {
    return error instanceof MockHttpError;
};

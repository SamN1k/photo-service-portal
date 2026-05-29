import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { MockHttpError } from '../services/mockHttp';

interface ApiErrorResponse {
    statusCode?: number;
    message?: string;
    title?: string;
    errors?: Record<string, string[]>;
}

type GlobalApiErrorHandler = (error: MockHttpError) => void;

const SESSION_KEY = 'photoPortal.session';
const SESSION_EXPIRED_EVENT = 'photoPortal.sessionExpired';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5280/api';
const USES_NGROK_TUNNEL = (() => {
    try {
        return new URL(API_BASE_URL).hostname.endsWith('.ngrok-free.dev');
    } catch {
        return false;
    }
})();

let globalApiErrorHandler: GlobalApiErrorHandler | null = null;

const readSessionToken = (): string | null => {
    const rawSession = window.localStorage.getItem(SESSION_KEY);

    if (!rawSession) {
        return null;
    }

    try {
        const session = JSON.parse(rawSession) as { token?: string };
        return session.token ?? null;
    } catch {
        return null;
    }
};

const clearStoredSession = () => {
    window.localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

const messageByStatus = (status: number): string => {
    switch (status) {
        case 400:
        case 422:
            return 'Datele trimise nu sunt valide.';
        case 401:
            return 'Sesiunea a expirat sau autentificarea este invalida.';
        case 403:
            return 'Nu ai permisiune pentru aceasta actiune.';
        case 404:
            return 'Resursa solicitata nu a fost gasita.';
        case 409:
            return 'Exista un conflict cu datele existente.';
        case 500:
            return 'Serverul a returnat o eroare interna.';
        case 503:
            return 'API-ul nu este disponibil momentan.';
        default:
            return 'Cererea catre API nu a reusit.';
    }
};

const extractValidationMessage = (data?: ApiErrorResponse): string | null => {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    return firstError ?? null;
};

const toHttpError = (error: AxiosError<ApiErrorResponse>): MockHttpError => {
    if (!error.response) {
        return new MockHttpError(503, `API-ul nu este disponibil. Verifica daca backend-ul ruleaza la ${API_BASE_URL}.`);
    }

    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const message = data?.message ?? extractValidationMessage(data) ?? data?.title ?? messageByStatus(status);

    return new MockHttpError(status, message);
};

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = readSessionToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (USES_NGROK_TUNNEL) {
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const httpError = toHttpError(error);

        if (httpError.status === 401) {
            clearStoredSession();
        }

        globalApiErrorHandler?.(httpError);
        return Promise.reject(httpError);
    },
);

export const setGlobalApiErrorHandler = (handler: GlobalApiErrorHandler) => {
    globalApiErrorHandler = handler;

    return () => {
        if (globalApiErrorHandler === handler) {
            globalApiErrorHandler = null;
        }
    };
};

export default apiClient;

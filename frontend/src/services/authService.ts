import apiClient from '../api/axios';
import type {
    AuthSession,
    LoginCredentials,
    PasswordResetCodePayload,
    PasswordResetCodeResult,
    PasswordResetCompletePayload,
    PasswordResetRequestPayload,
    PasswordResetRequestResult,
    SignUpPayload,
    UserRecord,
    UserRole,
} from '../types/models';
import { storageService } from './storageService';

const SESSION_KEY = 'photoPortal.session';
export const SESSION_EXPIRED_EVENT = 'photoPortal.sessionExpired';

interface JwtPayload {
    exp?: number;
    email?: string;
    role?: string | string[];
    userId?: string;
    sub?: string;
    nameid?: string;
    [key: string]: unknown;
}

export interface DemoAccount {
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
}

const decodeBase64Url = (value: string): string => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return window.atob(padded);
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
    const [, payload] = token.split('.');

    if (!payload) {
        return null;
    }

    try {
        return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
    } catch {
        return null;
    }
};

const readRole = (payload: JwtPayload): UserRole | null => {
    const rawRole =
        payload.role ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;

    return role === 'user' || role === 'photographer' || role === 'admin' ? role : null;
};

const readUserId = (payload: JwtPayload): string | null => {
    const claimValue =
        payload.userId ??
        payload.sub ??
        payload.nameid ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    return typeof claimValue === 'string' && claimValue ? claimValue : null;
};

const normalizeSession = (session: AuthSession | null): AuthSession | null => {
    if (!session?.token) {
        return null;
    }

    const payload = decodeJwtPayload(session.token);

    if (!payload?.exp || payload.exp * 1000 <= Date.now()) {
        return null;
    }

    const userId = readUserId(payload);
    const role = readRole(payload);

    if (!userId || !role) {
        return null;
    }

    return {
        ...session,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        user: {
            ...session.user,
            id: userId,
            email: payload.email ?? session.user.email,
            role,
        },
    };
};

const persistSession = (session: AuthSession): AuthSession => {
    const normalizedSession = normalizeSession(session);

    if (!normalizedSession) {
        storageService.remove(SESSION_KEY);
        throw new Error('Token JWT invalid primit de la API.');
    }

    storageService.write(SESSION_KEY, normalizedSession);
    return normalizedSession;
};

export const authService = {
    getSession(): AuthSession | null {
        const session = normalizeSession(storageService.read<AuthSession | null>(SESSION_KEY, null));

        if (!session) {
            storageService.remove(SESSION_KEY);
        }

        return session;
    },

    isSessionValid(session: AuthSession | null): session is AuthSession {
        return Boolean(normalizeSession(session));
    },

    async login(credentials: LoginCredentials): Promise<AuthSession> {
        const { data } = await apiClient.post<AuthSession>('/auth/login', credentials);
        return persistSession(data);
    },

    async signUp(payload: SignUpPayload): Promise<AuthSession> {
        const { data } = await apiClient.post<AuthSession>('/auth/signup', payload);
        return persistSession(data);
    },

    async requestPasswordReset(payload: PasswordResetRequestPayload): Promise<PasswordResetRequestResult> {
        const { data } = await apiClient.post<PasswordResetRequestResult>('/auth/password-reset/request', payload);
        return data;
    },

    async verifyPasswordResetCode(payload: PasswordResetCodePayload): Promise<PasswordResetCodeResult> {
        const { data } = await apiClient.post<PasswordResetCodeResult>('/auth/password-reset/verify', payload);
        return data;
    },

    async completePasswordReset(payload: PasswordResetCompletePayload): Promise<UserRecord> {
        const { data } = await apiClient.post<UserRecord>('/auth/password-reset/complete', payload);
        return data;
    },

    logout(): void {
        storageService.remove(SESSION_KEY);
    },

    async getDemoAccounts(): Promise<DemoAccount[]> {
        const { data } = await apiClient.get<DemoAccount[]>('/auth/demo-accounts');
        return data;
    },

    refreshSessionUser(user: UserRecord): AuthSession | null {
        const session = this.getSession();

        if (!session || session.user.id !== user.id) {
            return session;
        }

        return persistSession({ ...session, user });
    },
};

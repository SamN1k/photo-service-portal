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

export interface DemoAccount {
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
}

const persistSession = (session: AuthSession): AuthSession => {
    storageService.write(SESSION_KEY, session);
    return session;
};

export const authService = {
    getSession(): AuthSession | null {
        return storageService.read<AuthSession | null>(SESSION_KEY, null);
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

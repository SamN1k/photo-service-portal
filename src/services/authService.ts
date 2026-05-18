import type { AuthSession, LoginCredentials, SignUpPayload, UserRecord } from '../types/models';
import { delay, MockHttpError } from './mockHttp';
import { getStoredUsers, saveStoredUsers, toPublicUser, updateStoredUser, type StoredUser } from './userRepository';
import { storageService } from './storageService';

const SESSION_KEY = 'photoPortal.session';

const createId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createSession = (user: UserRecord): AuthSession => ({
    token: `mock-token-${user.id}-${Date.now()}`,
    user,
    createdAt: new Date().toISOString(),
});

const persistSession = (session: AuthSession): AuthSession => {
    storageService.write(SESSION_KEY, session);
    return session;
};

export const authService = {
    getSession(): AuthSession | null {
        return storageService.read<AuthSession | null>(SESSION_KEY, null);
    },

    async login(credentials: LoginCredentials): Promise<AuthSession> {
        await delay();

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = getStoredUsers().find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

        if (!user || user.password !== credentials.password) {
            throw new MockHttpError(401, 'Email sau parola invalida.');
        }

        if (user.status === 'suspended') {
            throw new MockHttpError(403, 'Contul este suspendat.');
        }

        const loggedInUser = updateStoredUser(user.id, (currentUser) => ({
            ...currentUser,
            lastLogin: new Date().toISOString(),
        }));

        const session = createSession(toPublicUser(loggedInUser ?? user));
        return persistSession(session);
    },

    async signUp(payload: SignUpPayload): Promise<AuthSession> {
        await delay();

        const normalizedEmail = payload.email.trim().toLowerCase();
        const users = getStoredUsers();
        const emailExists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

        if (emailExists) {
            throw new MockHttpError(409, 'Exista deja un cont cu acest email.');
        }

        const newUser: StoredUser = {
            id: createId(payload.role),
            fullName: payload.fullName.trim(),
            email: normalizedEmail,
            password: payload.password,
            role: payload.role,
            status: payload.role === 'photographer' ? 'pending' : 'active',
            createdAt: new Date().toISOString(),
            totalBookings: 0,
            revenueEur: 0,
            lastLogin: new Date().toISOString(),
        };

        saveStoredUsers([newUser, ...users]);

        const session = createSession(toPublicUser(newUser));
        return persistSession(session);
    },

    logout(): void {
        storageService.remove(SESSION_KEY);
    },

    getDemoAccounts(): Array<Pick<StoredUser, 'email' | 'password' | 'role' | 'fullName'>> {
        return getStoredUsers()
            .filter((user) => user.status === 'active')
            .slice(0, 3)
            .map((user) => ({
                email: user.email,
                password: user.password,
                role: user.role,
                fullName: user.fullName,
            }));
    },

    refreshSessionUser(user: UserRecord): AuthSession | null {
        const session = this.getSession();

        if (!session || session.user.id !== user.id) {
            return session;
        }

        return persistSession({ ...session, user });
    },
};

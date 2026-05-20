import type { PaginatedResult, UserRecord, UserRole, UserStatus } from '../types/models';
import { delay, MockHttpError } from './mockHttp';
import { getStoredUsers, saveStoredUsers, toPublicUser, type StoredUser } from './userRepository';

export type UserSort = 'newest' | 'nameAsc' | 'revenueDesc' | 'bookingsDesc';

export interface UserListParams {
    query?: string;
    role?: 'all' | UserRole;
    status?: 'all' | UserStatus;
    sortBy?: UserSort;
    page?: number;
    pageSize?: number;
    forceError?: boolean;
}

export interface UserInput {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
}

export interface AccountSettingsInput {
    fullName: string;
    email: string;
    currentPassword: string;
    newPassword?: string;
}

const createId = (role: UserRole) => `${role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const sortUsers = (users: UserRecord[], sortBy: UserSort): UserRecord[] => {
    const sorted = [...users];

    switch (sortBy) {
        case 'nameAsc':
            return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
        case 'revenueDesc':
            return sorted.sort((a, b) => b.revenueEur - a.revenueEur);
        case 'bookingsDesc':
            return sorted.sort((a, b) => b.totalBookings - a.totalBookings);
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
};

export const userService = {
    async listUsers(params: UserListParams = {}): Promise<PaginatedResult<UserRecord>> {
        await delay();

        if (params.forceError || params.query?.trim().toLowerCase() === 'eroare') {
            throw new MockHttpError(500, 'Serviciul mock pentru utilizatori a esuat.');
        }

        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.max(1, params.pageSize ?? 6);
        const query = params.query?.trim().toLowerCase() ?? '';

        let items = getStoredUsers().map(toPublicUser);

        if (params.role && params.role !== 'all') {
            items = items.filter((user) => user.role === params.role);
        }

        if (params.status && params.status !== 'all') {
            items = items.filter((user) => user.status === params.status);
        }

        if (query) {
            items = items.filter((user) => {
                const searchable = `${user.fullName} ${user.email} ${user.role}`.toLowerCase();
                return searchable.includes(query);
            });
        }

        items = sortUsers(items, params.sortBy ?? 'newest');

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

    async createUser(input: UserInput): Promise<UserRecord> {
        await delay();

        const users = getStoredUsers();
        const normalizedEmail = input.email.trim().toLowerCase();

        if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
            throw new MockHttpError(409, 'Exista deja un utilizator cu acest email.');
        }

        const user: StoredUser = {
            id: createId(input.role),
            fullName: input.fullName.trim(),
            email: normalizedEmail,
            password: input.password ?? 'demo1234',
            role: input.role,
            status: input.status,
            createdAt: new Date().toISOString(),
            totalBookings: 0,
            revenueEur: 0,
        };

        saveStoredUsers([user, ...users]);
        return toPublicUser(user);
    },

    async updateUser(userId: string, input: UserInput): Promise<UserRecord> {
        await delay();

        const users = getStoredUsers();
        const normalizedEmail = input.email.trim().toLowerCase();
        const emailUsed = users.some((user) => user.id !== userId && user.email.toLowerCase() === normalizedEmail);

        if (emailUsed) {
            throw new MockHttpError(409, 'Emailul este deja folosit de alt utilizator.');
        }

        let updatedUser: StoredUser | null = null;
        const nextUsers = users.map((user) => {
            if (user.id !== userId) {
                return user;
            }

            updatedUser = {
                ...user,
                fullName: input.fullName.trim(),
                email: normalizedEmail,
                password: input.password?.trim() ? input.password : user.password,
                role: input.role,
                status: input.status,
            };
            return updatedUser;
        });

        if (!updatedUser) {
            throw new MockHttpError(404, 'Utilizatorul nu exista.');
        }

        saveStoredUsers(nextUsers);
        return toPublicUser(updatedUser);
    },

    async updateAccountSettings(userId: string, input: AccountSettingsInput): Promise<UserRecord> {
        await delay();

        const users = getStoredUsers();
        const normalizedEmail = input.email.trim().toLowerCase();
        const currentUser = users.find((user) => user.id === userId);

        if (!currentUser) {
            throw new MockHttpError(404, 'Utilizatorul nu exista.');
        }

        if (currentUser.password !== input.currentPassword) {
            throw new MockHttpError(401, 'Parola curenta nu este corecta.');
        }

        const emailUsed = users.some((user) => user.id !== userId && user.email.toLowerCase() === normalizedEmail);

        if (emailUsed) {
            throw new MockHttpError(409, 'Emailul este deja folosit de alt utilizator.');
        }

        let updatedUser: StoredUser | null = null;
        const nextUsers = users.map((user) => {
            if (user.id !== userId) {
                return user;
            }

            updatedUser = {
                ...user,
                fullName: input.fullName.trim(),
                email: normalizedEmail,
                password: input.newPassword?.trim() ? input.newPassword.trim() : user.password,
            };
            return updatedUser;
        });

        saveStoredUsers(nextUsers);
        return toPublicUser(updatedUser ?? currentUser);
    },

    async deleteUser(userId: string): Promise<void> {
        await delay();

        const users = getStoredUsers();
        const nextUsers = users.filter((user) => user.id !== userId);

        if (nextUsers.length === users.length) {
            throw new MockHttpError(404, 'Utilizatorul nu exista.');
        }

        saveStoredUsers(nextUsers);
    },
};

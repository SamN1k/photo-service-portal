import apiClient from '../api/axios';
import type {
    PaginatedResult,
    PhotographerPortfolio,
    PhotographerPortfolioInput,
    UserRecord,
    UserRole,
    UserStatus,
} from '../types/models';

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

export const userService = {
    async listUsers(params: UserListParams = {}): Promise<PaginatedResult<UserRecord>> {
        const { data } = await apiClient.get<PaginatedResult<UserRecord>>('/users', { params });
        return data;
    },

    async createUser(input: UserInput): Promise<UserRecord> {
        const { data } = await apiClient.post<UserRecord>('/users', input);
        return data;
    },

    async updateUser(userId: string, input: UserInput): Promise<UserRecord> {
        const { data } = await apiClient.put<UserRecord>(`/users/${userId}`, input);
        return data;
    },

    async updateAccountSettings(userId: string, input: AccountSettingsInput): Promise<UserRecord> {
        const { data } = await apiClient.put<UserRecord>(`/users/${userId}/settings`, input);
        return data;
    },

    async getPhotographerPortfolio(photographerId: string): Promise<PhotographerPortfolio> {
        const { data } = await apiClient.get<PhotographerPortfolio>(`/users/${photographerId}/portfolio`);
        return data;
    },

    async updatePhotographerPortfolio(
        photographerId: string,
        input: PhotographerPortfolioInput,
    ): Promise<PhotographerPortfolio> {
        const { data } = await apiClient.put<PhotographerPortfolio>(`/users/${photographerId}/portfolio`, input);
        return data;
    },

    async deleteUser(userId: string): Promise<void> {
        await apiClient.delete(`/users/${userId}`);
    },
};

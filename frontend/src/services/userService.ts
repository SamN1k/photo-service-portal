import apiClient from '../api/axios';
import type { PaginatedResult, UserRecord, UserRole, UserStatus } from '../types/models';

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

    async deleteUser(userId: string): Promise<void> {
        await apiClient.delete(`/users/${userId}`);
    },
};

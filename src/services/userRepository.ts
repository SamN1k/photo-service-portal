import { MOCK_ACCOUNTS, type MockAccount } from '../data/mockData';
import type { UserRecord } from '../types/models';
import { storageService } from './storageService';

const USERS_KEY = 'photoPortal.users';

export type StoredUser = MockAccount;

export const toPublicUser = (user: StoredUser): UserRecord => {
    const { password: _password, ...publicUser } = user;
    void _password;
    return publicUser;
};

export const getStoredUsers = (): StoredUser[] => {
    const users = storageService.read<StoredUser[]>(USERS_KEY, []);

    if (users.length > 0) {
        return users;
    }

    storageService.write(USERS_KEY, MOCK_ACCOUNTS);
    return MOCK_ACCOUNTS;
};

export const saveStoredUsers = (users: StoredUser[]): void => {
    storageService.write(USERS_KEY, users);
};

export const getPublicUsers = (): UserRecord[] => {
    return getStoredUsers().map(toPublicUser);
};

export const updateStoredUser = (userId: string, updater: (user: StoredUser) => StoredUser): StoredUser | null => {
    const users = getStoredUsers();
    const nextUsers = users.map((user) => (user.id === userId ? updater(user) : user));
    const updatedUser = nextUsers.find((user) => user.id === userId) ?? null;

    saveStoredUsers(nextUsers);
    return updatedUser;
};

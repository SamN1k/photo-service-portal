import { createContext } from 'react';
import type { AuthSession, LoginCredentials, SignUpPayload, UserRecord } from '../types/models';

export interface AuthContextValue {
    session: AuthSession | null;
    user: UserRecord | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthSession>;
    signUp: (payload: SignUpPayload) => Promise<AuthSession>;
    logout: () => void;
    refreshUser: (user: UserRecord) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

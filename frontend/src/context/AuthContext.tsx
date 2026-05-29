import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SESSION_EXPIRED_EVENT, authService } from '../services/authService';
import type { AuthSession, LoginCredentials, SignUpPayload, UserRecord } from '../types/models';
import { AuthContext, type AuthContextValue } from './authState';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());

    const login = useCallback(async (credentials: LoginCredentials) => {
        const nextSession = await authService.login(credentials);
        setSession(nextSession);
        return nextSession;
    }, []);

    const signUp = useCallback(async (payload: SignUpPayload) => {
        const nextSession = await authService.signUp(payload);
        setSession(nextSession);
        return nextSession;
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setSession(null);
    }, []);

    useEffect(() => {
        const handleSessionExpired = () => setSession(null);

        window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    }, []);

    useEffect(() => {
        if (!session) {
            return undefined;
        }

        const expiresInMs = new Date(session.expiresAt).getTime() - Date.now();

        const timeoutId = window.setTimeout(logout, Math.max(expiresInMs, 0));

        return () => window.clearTimeout(timeoutId);
    }, [logout, session]);

    const refreshUser = useCallback((user: UserRecord) => {
        const nextSession = authService.refreshSessionUser(user);
        setSession(nextSession);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user: session?.user ?? null,
            isAuthenticated: authService.isSessionValid(session),
            login,
            signUp,
            logout,
            refreshUser,
        }),
        [login, logout, refreshUser, session, signUp],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

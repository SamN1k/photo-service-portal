import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AxiosInstance } from 'axios';
import apiClient, { setGlobalApiErrorHandler } from '../axios';
import type { MockHttpError } from '../../services/mockHttp';

interface AxiosContextValue {
    client: AxiosInstance;
    lastError: MockHttpError | null;
    clearError: () => void;
}

const AxiosContext = createContext<AxiosContextValue | undefined>(undefined);

export const AxiosProvider = ({ children }: { children: ReactNode }) => {
    const [lastError, setLastError] = useState<MockHttpError | null>(null);

    useEffect(() => {
        return setGlobalApiErrorHandler(setLastError);
    }, []);

    const value = useMemo<AxiosContextValue>(
        () => ({
            client: apiClient,
            lastError,
            clearError: () => setLastError(null),
        }),
        [lastError],
    );

    return <AxiosContext.Provider value={value}>{children}</AxiosContext.Provider>;
};

export const useAxios = () => {
    const context = useContext(AxiosContext);

    if (!context) {
        throw new Error('useAxios must be used inside AxiosProvider.');
    }

    return context;
};

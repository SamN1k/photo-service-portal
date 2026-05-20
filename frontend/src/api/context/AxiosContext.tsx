import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import apiClient, { setGlobalApiErrorHandler } from '../axios';
import type { MockHttpError } from '../../services/mockHttp';
import { AxiosContext, type AxiosContextValue } from './axiosState';

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

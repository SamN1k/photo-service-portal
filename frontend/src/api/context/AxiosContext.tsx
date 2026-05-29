import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import apiClient, { setGlobalApiErrorHandler } from '../axios';
import type { MockHttpError } from '../../services/mockHttp';
import { router } from '../../routes/AppRouter';
import { PATHS } from '../../routes/paths';
import { AxiosContext, type AxiosContextValue } from './axiosState';

export const AxiosProvider = ({ children }: { children: ReactNode }) => {
    const [lastError, setLastError] = useState<MockHttpError | null>(null);

    useEffect(() => {
        return setGlobalApiErrorHandler(setLastError);
    }, []);

    useEffect(() => {
        if (lastError?.status !== 503 || window.location.pathname === PATHS.API_UNAVAILABLE) {
            return;
        }

        void router.navigate(PATHS.API_UNAVAILABLE, {
            replace: true,
            state: {
                message: lastError.message,
                from: `${window.location.pathname}${window.location.search}`,
            },
        });
    }, [lastError]);

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

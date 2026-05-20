import { createContext } from 'react';
import type { AxiosInstance } from 'axios';
import type { MockHttpError } from '../../services/mockHttp';

export interface AxiosContextValue {
    client: AxiosInstance;
    lastError: MockHttpError | null;
    clearError: () => void;
}

export const AxiosContext = createContext<AxiosContextValue | undefined>(undefined);

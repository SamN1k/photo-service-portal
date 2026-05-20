import { useContext } from 'react';
import { AxiosContext } from './axiosState';

export const useAxios = () => {
    const context = useContext(AxiosContext);

    if (!context) {
        throw new Error('useAxios must be used inside AxiosProvider.');
    }

    return context;
};

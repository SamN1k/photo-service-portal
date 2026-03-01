// Import axios and the specific type for the request config
import axios, { type InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api.yourdomain.com',
    timeout: 10000,
});


apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default apiClient;
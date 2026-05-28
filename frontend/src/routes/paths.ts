export const PATHS = {
    HOME: '/',
    LOGIN: '/login',
    SIGN_UP: '/signup',
    OFFERS: '/offers',
    PHOTOGRAPHER_PUBLIC_PORTFOLIO: '/photographers/:photographerId',
    USER_DASHBOARD: '/dashboard/user',
    USER_PAYMENT: '/dashboard/user/payment/:bookingId',
    USER_RESULTS: '/dashboard/user/results',
    PHOTOGRAPHER_DASHBOARD: '/dashboard/photographer',
    PHOTOGRAPHER_PORTFOLIO_SETTINGS: '/dashboard/photographer/portfolio',
    PHOTOGRAPHER_RESULTS: '/dashboard/photographer/results',
    ADMIN_PANEL: '/admin',
    ACCOUNT_SETTINGS: '/dashboard/settings',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '*',
} as const;

export type { UserRole } from '../types/models';

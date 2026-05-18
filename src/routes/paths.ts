export const PATHS = {
    HOME: '/',
    LOGIN: '/login',
    SIGN_UP: '/signup',
    OFFERS: '/offers',
    USER_DASHBOARD: '/dashboard/user',
    PHOTOGRAPHER_DASHBOARD: '/dashboard/photographer',
    ADMIN_PANEL: '/admin',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '*',
} as const;

export type { UserRole } from '../types/models';

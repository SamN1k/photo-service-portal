export const PATHS = {
    HOME: '/',
    LOGIN: '/login',
    SIGN_UP: '/signup',
    OFFERS: '/offers',
    USER_DASHBOARD: '/dashboard/user',
    PHOTOGRAPHER_DASHBOARD: '/dashboard/photographer',
    ADMIN_PANEL: '/admin',
    NOT_FOUND: '*'
} as const;

// Types for role management
export type UserRole = 'user' | 'photographer' | 'admin' | 'guest';
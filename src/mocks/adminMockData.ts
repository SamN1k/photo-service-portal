export type AdminRole = 'user' | 'photographer' | 'admin';

export type MockUser = {
    id: string;
    fullName: string;
    email: string;
    role: AdminRole;
    status: 'active' | 'pending' | 'suspended';
    joinedAt: string;
    totalBookings: number;
    revenueEur: number;
};

export type MockBookingEvent = {
    id: string;
    userId: string;
    kind: 'booking_created' | 'booking_completed' | 'payment_received' | 'refund';
    amountEur: number;
    createdAt: string;
};

export const mockAdminUser = {
    id: 'admin-001',
    name: 'Andrei Moderator',
    email: 'admin@photo-portal.local',
    permissions: ['users:read', 'users:write', 'billing:read', 'reports:read'],
    lastLogin: '2026-03-08T08:10:00Z',
};

export const mockUsers: MockUser[] = [
    {
        id: 'u-101',
        fullName: 'Maria Popescu',
        email: 'maria.popescu@demo.local',
        role: 'user',
        status: 'active',
        joinedAt: '2026-02-20T11:00:00Z',
        totalBookings: 3,
        revenueEur: 0,
    },
    {
        id: 'u-102',
        fullName: 'Radu Ionescu',
        email: 'radu.ionescu@demo.local',
        role: 'photographer',
        status: 'active',
        joinedAt: '2026-02-02T09:20:00Z',
        totalBookings: 14,
        revenueEur: 2150,
    },
    {
        id: 'u-103',
        fullName: 'Elena Stan',
        email: 'elena.stan@demo.local',
        role: 'photographer',
        status: 'pending',
        joinedAt: '2026-03-01T14:05:00Z',
        totalBookings: 0,
        revenueEur: 0,
    },
    {
        id: 'u-104',
        fullName: 'Victor Mihai',
        email: 'victor.mihai@demo.local',
        role: 'user',
        status: 'suspended',
        joinedAt: '2026-01-11T12:30:00Z',
        totalBookings: 1,
        revenueEur: 0,
    },
    {
        id: 'u-105',
        fullName: 'Ioana Avram',
        email: 'ioana.avram@demo.local',
        role: 'admin',
        status: 'active',
        joinedAt: '2025-12-10T08:45:00Z',
        totalBookings: 0,
        revenueEur: 0,
    },
];

export const mockBookingEvents: MockBookingEvent[] = [
    { id: 'e-1', userId: 'u-101', kind: 'booking_created', amountEur: 0, createdAt: '2026-03-06T10:05:00Z' },
    { id: 'e-2', userId: 'u-102', kind: 'booking_completed', amountEur: 350, createdAt: '2026-03-06T12:40:00Z' },
    { id: 'e-3', userId: 'u-102', kind: 'payment_received', amountEur: 350, createdAt: '2026-03-06T12:45:00Z' },
    { id: 'e-4', userId: 'u-101', kind: 'booking_created', amountEur: 0, createdAt: '2026-03-07T09:30:00Z' },
    { id: 'e-5', userId: 'u-104', kind: 'refund', amountEur: -80, createdAt: '2026-03-07T18:20:00Z' },
    { id: 'e-6', userId: 'u-102', kind: 'payment_received', amountEur: 600, createdAt: '2026-03-08T10:12:00Z' },
];

export const processAdminMetrics = (users: MockUser[], events: MockBookingEvent[]) => {
    const activeUsers = users.filter((user) => user.status === 'active').length;
    const activePhotographers = users.filter((user) => user.role === 'photographer' && user.status === 'active').length;

    const paymentTotal = events
        .filter((event) => event.kind === 'payment_received')
        .reduce((acc, event) => acc + event.amountEur, 0);

    const refundTotal = events
        .filter((event) => event.kind === 'refund')
        .reduce((acc, event) => acc + Math.abs(event.amountEur), 0);

    const netRevenue = paymentTotal - refundTotal;

    const processingHealthScore = Math.max(0, Math.min(100, Math.round((activeUsers / users.length) * 70 + (netRevenue / 20) * 0.3)));

    return {
        totalUsers: users.length,
        activeUsers,
        activePhotographers,
        paymentTotal,
        refundTotal,
        netRevenue,
        processingHealthScore,
    };
};

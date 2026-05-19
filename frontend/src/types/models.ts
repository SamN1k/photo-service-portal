export type UserRole = 'user' | 'photographer' | 'admin';

export type UserStatus = 'active' | 'pending' | 'suspended';

export interface UserRecord {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    totalBookings: number;
    revenueEur: number;
    lastLogin?: string;
}

export interface AuthSession {
    token: string;
    user: UserRecord;
    createdAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpPayload {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
}

export type OfferCategory = 'wedding' | 'portrait' | 'event' | 'commercial';

export type OfferStatus = 'active' | 'draft' | 'archived';

export interface PhotoOffer {
    id: string;
    title: string;
    description: string;
    category: OfferCategory;
    location: string;
    priceEur: number;
    durationHours: number;
    photographerId: string;
    photographerName: string;
    status: OfferStatus;
    rating: number;
    coverImageUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface OfferInput {
    title: string;
    description: string;
    category: OfferCategory;
    location: string;
    priceEur: number;
    durationHours: number;
    status: OfferStatus;
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'paid' | 'finalized';

export interface Booking {
    id: string;
    clientId: string;
    clientName: string;
    offerId: string;
    offerTitle: string;
    photographerId: string;
    photographerName: string;
    eventDate: string;
    location: string;
    budgetEur: number;
    notes: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

export interface BookingInput {
    offerId: string;
    eventDate: string;
    location: string;
    budgetEur: number;
    notes: string;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SelectOption<T extends string> {
    value: T;
    label: string;
}

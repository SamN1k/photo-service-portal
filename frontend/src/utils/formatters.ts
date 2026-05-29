export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(value);

export const formatDate = (value: string) =>
    new Intl.DateTimeFormat('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));

export const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));

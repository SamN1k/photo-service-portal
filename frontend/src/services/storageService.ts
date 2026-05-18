const safeParse = <T>(value: string | null, fallback: T): T => {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};

export const storageService = {
    read<T>(key: string, fallback: T): T {
        return safeParse(window.localStorage.getItem(key), fallback);
    },

    write<T>(key: string, value: T): void {
        window.localStorage.setItem(key, JSON.stringify(value));
    },

    remove(key: string): void {
        window.localStorage.removeItem(key);
    },
};

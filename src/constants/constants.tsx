export const PageIds = {
    MainPage: 'main'
} as const;

export type PageIds = typeof PageIds[keyof typeof PageIds];

export const ErrorTypes = {
    Error_404: 'Error_404',
    Error_500: 'Error_500'
} as const;

export type ErrorTypes = typeof ErrorTypes[keyof typeof ErrorTypes];

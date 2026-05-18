interface StatusMessageProps {
    title: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const LoadingState = ({ title = 'Se incarca datele...' }: { title?: string }) => {
    return (
        <div className="soft-panel flex items-center gap-3 p-5 text-sm text-slate-600">
            <span className="h-3 w-3 animate-pulse rounded-full bg-teal-600" />
            {title}
        </div>
    );
};

export const EmptyState = ({ title, message, action }: StatusMessageProps) => {
    return (
        <div className="soft-panel p-6 text-center">
            <h3 className="font-semibold text-slate-950">{title}</h3>
            {message && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{message}</p>}
            {action && (
                <button type="button" onClick={action.onClick} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    {action.label}
                </button>
            )}
        </div>
    );
};

export const ErrorState = ({ title, message, action }: StatusMessageProps) => {
    return (
        <div className="soft-panel border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
            <h3 className="font-semibold">{title}</h3>
            {message && <p className="mt-1">{message}</p>}
            {action && (
                <button type="button" onClick={action.onClick} className="mt-3 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white">
                    {action.label}
                </button>
            )}
        </div>
    );
};

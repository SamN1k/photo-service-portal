interface StatCardProps {
    label: string;
    value: string | number;
    helper?: string;
}

export const StatCard = ({ label, value, helper }: StatCardProps) => {
    return (
        <article className="soft-panel p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
            {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </article>
    );
};

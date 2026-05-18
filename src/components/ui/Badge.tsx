import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    tone?: BadgeTone;
    children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
    info: 'bg-sky-100 text-sky-800',
};

export const Badge = ({ tone = 'neutral', children }: BadgeProps) => {
    return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>;
};

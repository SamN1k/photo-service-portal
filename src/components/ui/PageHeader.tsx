import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase text-teal-700">Photo Service Portal</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-950">{title}</h1>
                {description && <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
};

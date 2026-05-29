import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { isMockHttpError } from '../services/mockHttp';
import { reportService, type ProblemReportSort } from '../services/reportService';
import type { PaginatedResult, ProblemReport, ProblemReportStatus, SelectOption, UserRole } from '../types/models';
import { formatDateTime } from '../utils/formatters';

const roleOptions: Array<SelectOption<'all' | UserRole>> = [
    { value: 'all', label: 'Toate rolurile' },
    { value: 'user', label: 'Clienti' },
    { value: 'photographer', label: 'Fotografi' },
    { value: 'admin', label: 'Admin' },
];

const statusOptions: Array<SelectOption<'all' | ProblemReportStatus>> = [
    { value: 'all', label: 'Toate statusurile' },
    { value: 'new', label: 'Noi' },
    { value: 'reviewed', label: 'Analizate' },
];

const sortOptions: Array<SelectOption<ProblemReportSort>> = [
    { value: 'newest', label: 'Cele mai noi' },
    { value: 'oldest', label: 'Cele mai vechi' },
    { value: 'titleAsc', label: 'Titlu A-Z' },
];

const roleLabel: Record<UserRole, string> = {
    user: 'Client',
    photographer: 'Fotograf',
    admin: 'Admin',
};

const AdminReportsPage = () => {
    const [result, setResult] = useState<PaginatedResult<ProblemReport> | null>(null);
    const [query, setQuery] = useState('');
    const [reporterRole, setReporterRole] = useState<'all' | UserRole>('all');
    const [status, setStatus] = useState<'all' | ProblemReportStatus>('all');
    const [sortBy, setSortBy] = useState<ProblemReportSort>('newest');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const nextResult = await reportService.listReports({
                query,
                reporterRole,
                status,
                sortBy,
                page,
                pageSize: 6,
            });
            setResult(nextResult);
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Reporturile nu au putut fi incarcate.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [page, query, reporterRole, sortBy, status]);

    useEffect(() => {
        void loadReports();
    }, [loadReports]);

    const newReports = useMemo(() => result?.items.filter((report) => report.status === 'new').length ?? 0, [result]);

    const updateReportInPage = (updatedReport: ProblemReport) => {
        setResult((currentResult) => {
            if (!currentResult) {
                return currentResult;
            }

            return {
                ...currentResult,
                items: currentResult.items.map((report) => (report.id === updatedReport.id ? updatedReport : report)),
            };
        });
    };

    const handleConfirmReviewed = async () => {
        if (!selectedReport) {
            return;
        }

        setIsUpdating(true);

        try {
            const updatedReport = await reportService.markReportReviewed(selectedReport.id);
            updateReportInPage(updatedReport);
            setSelectedReport(null);
            toast.success('Problema a fost marcata ca analizata.');
        } catch (updateError) {
            const message = isMockHttpError(updateError) ? updateError.message : 'Statusul reportului nu a putut fi actualizat.';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analiza problemelor"
                description="Reporturi trimise de clienti si fotografi catre administrator."
                actions={
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800">
                        {newReports} reporturi noi pe pagina
                    </div>
                }
            />

            <section className="soft-panel grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_180px]">
                <input
                    type="search"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                    }}
                    className="form-input"
                    placeholder="Cauta dupa titlu, descriere, nume sau email"
                />
                <select
                    value={reporterRole}
                    onChange={(event) => {
                        setReporterRole(event.target.value as 'all' | UserRole);
                        setPage(1);
                    }}
                    className="form-input"
                >
                    {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as 'all' | ProblemReportStatus);
                        setPage(1);
                    }}
                    className="form-input"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(event) => {
                        setSortBy(event.target.value as ProblemReportSort);
                        setPage(1);
                    }}
                    className="form-input"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </section>

            {isLoading && <LoadingState title="Se incarca reporturile..." />}
            {!isLoading && error && (
                <ErrorState title="Eroare" message={error} action={{ label: 'Reincearca', onClick: () => void loadReports() }} />
            )}
            {!isLoading && !error && result && result.items.length === 0 && (
                <EmptyState title="Nu exista reporturi" message="Cand clientii sau fotografii raporteaza o problema, aceasta apare aici." />
            )}
            {!isLoading && !error && result && result.items.length > 0 && (
                <section className="grid gap-4">
                    {result.items.map((report) => (
                        <article key={report.id} className="soft-panel border-l-4 border-l-rose-500 p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge tone={report.status === 'new' ? 'danger' : 'neutral'}>
                                            {report.status === 'new' ? 'Nou' : 'Analizat'}
                                        </Badge>
                                        <Badge tone="info">{roleLabel[report.reporterRole]}</Badge>
                                        <span className="text-xs font-semibold uppercase text-slate-500">{formatDateTime(report.createdAt)}</span>
                                    </div>
                                    <h2 className="mt-3 text-xl font-bold text-slate-950">{report.title}</h2>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{report.description}</p>
                                </div>
                                <div className="min-w-56 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                    <p className="font-semibold text-slate-950">{report.reporterName}</p>
                                    <p className="mt-1 text-slate-600">{report.reporterEmail}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase text-slate-500">ID: {report.reporterId}</p>
                                    {report.status === 'new' ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedReport(report)}
                                            className="mt-4 w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                                        >
                                            Problema analizata
                                        </button>
                                    ) : (
                                        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                            Problema analizata
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}

                    <div className="soft-panel flex items-center justify-between gap-3 p-4">
                        <p className="text-sm text-slate-600">
                            {result.total} reporturi · pagina {result.page} din {result.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                disabled={result.page === 1}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inapoi
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((currentPage) => Math.min(result.totalPages, currentPage + 1))}
                                disabled={result.page === result.totalPages}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                            >
                                Inainte
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reviewed-report-title">
                        <h2 id="reviewed-report-title" className="text-xl font-bold text-slate-950">
                            Confirma problema analizata
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Confirmi ca problema "{selectedReport.title}" a fost analizata si rezolvata de administrator?
                        </p>
                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                disabled={isUpdating}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                            >
                                Anuleaza
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleConfirmReviewed()}
                                disabled={isUpdating}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isUpdating ? 'Se confirma...' : 'Confirma'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReportsPage;

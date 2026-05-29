import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { isMockHttpError } from '../services/mockHttp';
import { reportService } from '../services/reportService';
import type { ProblemReport } from '../types/models';
import { formatDateTime } from '../utils/formatters';

interface ProblemReportForm {
    title: string;
    description: string;
}

type ProblemReportErrors = Partial<Record<keyof ProblemReportForm, string>>;

const initialForm: ProblemReportForm = {
    title: '',
    description: '',
};

const ProblemReportPage = () => {
    const { user } = useAuth();
    const [form, setForm] = useState<ProblemReportForm>(initialForm);
    const [errors, setErrors] = useState<ProblemReportErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [reportsError, setReportsError] = useState<string | null>(null);
    const [lastSentTitle, setLastSentTitle] = useState<string | null>(null);

    const loadMyReports = useCallback(async () => {
        setIsLoadingReports(true);
        setReportsError(null);

        try {
            const result = await reportService.listMyReports({ page: 1, pageSize: 50, sortBy: 'newest' });
            setReports(result.items);
        } catch (loadError) {
            const message = isMockHttpError(loadError) ? loadError.message : 'Reporturile trimise nu au putut fi incarcate.';
            setReportsError(message);
        } finally {
            setIsLoadingReports(false);
        }
    }, []);

    useEffect(() => {
        void loadMyReports();
    }, [loadMyReports]);

    const updateField = (field: keyof ProblemReportForm, value: string) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
        setLastSentTitle(null);
    };

    const validateForm = () => {
        const nextErrors: ProblemReportErrors = {};

        if (form.title.trim().length < 3) {
            nextErrors.title = 'Titlul problemei trebuie sa aiba minimum 3 caractere.';
        }

        if (form.description.trim().length < 10) {
            nextErrors.description = 'Descrierea problemei trebuie sa aiba minimum 10 caractere.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const report = await reportService.createReport({
                title: form.title,
                description: form.description,
            });

            setForm(initialForm);
            setLastSentTitle(report.title);
            await loadMyReports();
            toast.success('Problema a fost trimisa catre administrator.');
        } catch (submitError) {
            const message = isMockHttpError(submitError) ? submitError.message : 'Problema nu a putut fi trimisa.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Raporteaza o problema"
                description="Trimite administratorului o problema observata in cont, rezervari, oferte sau functionalitatea aplicatiei."
            />

            <section className="soft-panel p-5">
                <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                    <p className="font-semibold">Report trimis ca {user?.fullName}</p>
                    <p className="mt-1 text-rose-800">
                        Administratorul va vedea numele, emailul, rolul tau si descrierea problemei.
                    </p>
                </div>

                <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="problem-title">
                            Titlul problemei
                        </label>
                        <input
                            id="problem-title"
                            value={form.title}
                            onChange={(event) => updateField('title', event.target.value)}
                            className="form-input"
                            placeholder="Ex: Nu pot confirma rezervarea"
                            maxLength={160}
                        />
                        {errors.title && <p className="field-error">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="problem-description">
                            Descrierea problemei
                        </label>
                        <textarea
                            id="problem-description"
                            value={form.description}
                            onChange={(event) => updateField('description', event.target.value)}
                            className="form-input min-h-44 resize-y"
                            placeholder="Descrie ce s-a intamplat, pe ce pagina erai si ce actiune ai incercat."
                            maxLength={4000}
                        />
                        {errors.description && <p className="field-error">{errors.description}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Se trimite...' : 'Trimite problema'}
                        </button>
                        {lastSentTitle && <p className="text-sm font-semibold text-emerald-700">Report trimis: {lastSentTitle}</p>}
                    </div>
                </form>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-950">Problemele trimise</h2>
                {isLoadingReports && <LoadingState title="Se incarca problemele trimise..." />}
                {!isLoadingReports && reportsError && (
                    <ErrorState
                        title="Eroare"
                        message={reportsError}
                        action={{ label: 'Reincearca', onClick: () => void loadMyReports() }}
                    />
                )}
                {!isLoadingReports && !reportsError && reports.length === 0 && (
                    <EmptyState title="Nu ai reporturi trimise" message="Dupa ce trimiti o problema, statusul ei va aparea aici." />
                )}
                {!isLoadingReports && !reportsError && reports.length > 0 && (
                    <div className="grid gap-4">
                        {reports.map((report) => (
                            <article key={report.id} className="soft-panel p-5">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge tone={report.status === 'reviewed' ? 'success' : 'warning'}>
                                                {report.status === 'reviewed' ? 'Analizata' : 'In analiza'}
                                            </Badge>
                                            <span className="text-xs font-semibold uppercase text-slate-500">
                                                {formatDateTime(report.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className="mt-3 text-lg font-bold text-slate-950">{report.title}</h3>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{report.description}</p>
                                    </div>
                                    <div className="min-w-64 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                        {report.status === 'reviewed' ? (
                                            <p className="font-semibold text-emerald-600">
                                                Problema analizata de catre administrator
                                            </p>
                                        ) : (
                                            <p className="font-semibold text-amber-700">
                                                Problema este in analiza la administrator
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProblemReportPage;

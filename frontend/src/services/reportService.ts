import apiClient from '../api/axios';
import type { PaginatedResult, ProblemReport, ProblemReportInput, ProblemReportStatus, UserRole } from '../types/models';

export type ProblemReportSort = 'newest' | 'oldest' | 'titleAsc';

export interface ProblemReportListParams {
    query?: string;
    reporterRole?: 'all' | UserRole;
    status?: 'all' | ProblemReportStatus;
    sortBy?: ProblemReportSort;
    page?: number;
    pageSize?: number;
    forceError?: boolean;
}

export const reportService = {
    async listReports(params: ProblemReportListParams = {}): Promise<PaginatedResult<ProblemReport>> {
        const { data } = await apiClient.get<PaginatedResult<ProblemReport>>('/reports', { params });
        return data;
    },

    async listMyReports(params: ProblemReportListParams = {}): Promise<PaginatedResult<ProblemReport>> {
        const { data } = await apiClient.get<PaginatedResult<ProblemReport>>('/reports/my', { params });
        return data;
    },

    async createReport(input: ProblemReportInput): Promise<ProblemReport> {
        const { data } = await apiClient.post<ProblemReport>('/reports', input);
        return data;
    },

    async markReportReviewed(reportId: string): Promise<ProblemReport> {
        const { data } = await apiClient.patch<ProblemReport>(`/reports/${reportId}/status`, { status: 'reviewed' });
        return data;
    },
};

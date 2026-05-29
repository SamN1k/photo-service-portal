using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Core;

public sealed class ProblemReportLogic : ProblemReportAction, IProblemReportLogic
{
    public Task<PaginatedResultDto<ProblemReportDto>> ListReportsAsync(ProblemReportListQueryDto query)
    {
        return ListReportsActionAsync(query);
    }

    public Task<PaginatedResultDto<ProblemReportDto>> ListReporterReportsAsync(string reporterId, ProblemReportListQueryDto query)
    {
        return ListReporterReportsActionAsync(reporterId, query);
    }

    public Task<ProblemReportDto> CreateReportAsync(string reporterId, ProblemReportInputDto input)
    {
        return CreateReportActionAsync(reporterId, input);
    }

    public Task<ProblemReportDto> UpdateReportStatusAsync(string reportId, ProblemReportStatusUpdateDto input)
    {
        return UpdateReportStatusActionAsync(reportId, input);
    }
}

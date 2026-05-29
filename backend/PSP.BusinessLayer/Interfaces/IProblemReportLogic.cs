using PSP.Domain.Models.Common;
using PSP.Domain.Models.ProblemReport;

namespace PSP.BusinessLayer.Interfaces;

public interface IProblemReportLogic
{
    Task<PaginatedResultDto<ProblemReportDto>> ListReportsAsync(ProblemReportListQueryDto query);
    Task<PaginatedResultDto<ProblemReportDto>> ListReporterReportsAsync(string reporterId, ProblemReportListQueryDto query);
    Task<ProblemReportDto> CreateReportAsync(string reporterId, ProblemReportInputDto input);
    Task<ProblemReportDto> UpdateReportStatusAsync(string reportId, ProblemReportStatusUpdateDto input);
}

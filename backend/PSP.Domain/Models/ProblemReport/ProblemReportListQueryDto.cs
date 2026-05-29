namespace PSP.Domain.Models.ProblemReport;

public sealed class ProblemReportListQueryDto
{
    public string? Query { get; set; }
    public string? ReporterRole { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public bool ForceError { get; set; }
}

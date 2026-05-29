namespace PSP.Domain.Entities;

public sealed class ProblemReportEntity
{
    public string Id { get; set; } = string.Empty;
    public string ReporterId { get; set; } = string.Empty;
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    public string ReporterRole { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "new";
    public DateTimeOffset CreatedAt { get; set; }
}

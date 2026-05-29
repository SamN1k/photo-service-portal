namespace PSP.Domain.Models;

public sealed record ProblemReportDto(
    string Id,
    string ReporterId,
    string ReporterName,
    string ReporterEmail,
    string ReporterRole,
    string Title,
    string Description,
    string Status,
    DateTimeOffset CreatedAt);

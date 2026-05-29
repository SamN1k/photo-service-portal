using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.DataAccessLayer.Context;
using PSP.Domain.Entities;
using PSP.Domain.Models.Common;
using PSP.Domain.Models.ProblemReport;

namespace PSP.BusinessLayer.Structure;

public class ProblemReportAction
{
    private readonly PhotoPortalDbContext db;

    private static readonly HashSet<string> ReporterRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "user",
        "photographer"
    };

    private static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "new",
        "reviewed"
    };

    public ProblemReportAction()
    {
        db = new PhotoPortalDbContext();
    }

    protected async Task<PaginatedResultDto<ProblemReportDto>> ListReportsActionAsync(ProblemReportListQueryDto query)
    {
        return await ListReportsCoreAsync(query, null);
    }

    protected async Task<PaginatedResultDto<ProblemReportDto>> ListReporterReportsActionAsync(string reporterId, ProblemReportListQueryDto query)
    {
        var normalizedReporterId = NormalizeRequired(reporterId, "Utilizatorul autentificat este obligatoriu.");
        return await ListReportsCoreAsync(query, normalizedReporterId);
    }

    private async Task<PaginatedResultDto<ProblemReportDto>> ListReportsCoreAsync(ProblemReportListQueryDto query, string? reporterId)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru reporturi a esuat.");
        }

        IQueryable<ProblemReportEntity> reports = db.ProblemReports.AsNoTracking();
        var search = query.Query?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(reporterId))
        {
            reports = reports.Where(report => report.ReporterId == reporterId);
        }

        if (!string.IsNullOrWhiteSpace(query.ReporterRole) && !IsAll(query.ReporterRole))
        {
            var role = query.ReporterRole.Trim().ToLowerInvariant();
            reports = reports.Where(report => report.ReporterRole == role);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
        {
            var status = query.Status.Trim().ToLowerInvariant();
            reports = reports.Where(report => report.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            reports = reports.Where(report =>
                EF.Functions.ILike(report.Title, pattern) ||
                EF.Functions.ILike(report.Description, pattern) ||
                EF.Functions.ILike(report.ReporterName, pattern) ||
                EF.Functions.ILike(report.ReporterEmail, pattern) ||
                EF.Functions.ILike(report.ReporterRole, pattern));
        }

        reports = SortReports(reports, query.SortBy ?? "newest");
        return await Pagination.FromQueryAsync(reports, query.Page, query.PageSize, DtoMapper.ToDto);
    }

    protected async Task<ProblemReportDto> CreateReportActionAsync(string reporterId, ProblemReportInputDto input)
    {
        var reporter = await db.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == reporterId)
            ?? throw new BusinessException(404, "Utilizatorul autentificat nu exista.");

        if (!ReporterRoles.Contains(reporter.Role))
        {
            throw new BusinessException(403, "Doar clientii si fotografii pot trimite reporturi.");
        }

        var title = NormalizeRequired(input.Title, "Titlul problemei este obligatoriu.");
        var description = NormalizeRequired(input.Description, "Descrierea problemei este obligatorie.");

        if (title.Length < 3)
        {
            throw new BusinessException(422, "Titlul problemei trebuie sa aiba minimum 3 caractere.");
        }

        if (description.Length < 10)
        {
            throw new BusinessException(422, "Descrierea problemei trebuie sa aiba minimum 10 caractere.");
        }

        if (title.Length > 160)
        {
            throw new BusinessException(422, "Titlul problemei este prea lung.");
        }

        if (description.Length > 4000)
        {
            throw new BusinessException(422, "Descrierea problemei este prea lunga.");
        }

        var report = new ProblemReportEntity
        {
            Id = $"report-{Guid.NewGuid():N}"[..20],
            ReporterId = reporter.Id,
            ReporterName = reporter.FullName,
            ReporterEmail = reporter.Email,
            ReporterRole = reporter.Role,
            Title = title,
            Description = description,
            Status = "new",
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.ProblemReports.Add(report);
        await db.SaveChangesAsync();

        return DtoMapper.ToDto(report);
    }

    protected async Task<ProblemReportDto> UpdateReportStatusActionAsync(string reportId, ProblemReportStatusUpdateDto input)
    {
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul reportului este invalid.");
        var report = await db.ProblemReports.FirstOrDefaultAsync(candidate => candidate.Id == reportId)
            ?? throw new BusinessException(404, "Reportul nu exista.");

        report.Status = status;
        await db.SaveChangesAsync();

        return DtoMapper.ToDto(report);
    }

    private static IOrderedQueryable<ProblemReportEntity> SortReports(IQueryable<ProblemReportEntity> reports, string sortBy)
    {
        return sortBy switch
        {
            "oldest" => reports.OrderBy(report => report.CreatedAt).ThenBy(report => report.Title),
            "titleAsc" => reports.OrderBy(report => report.Title).ThenByDescending(report => report.CreatedAt),
            _ => reports.OrderByDescending(report => report.CreatedAt).ThenBy(report => report.Title)
        };
    }

    private static bool IsAll(string value)
    {
        return string.Equals(value, "all", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeAllowed(string? value, HashSet<string> allowedValues, string errorMessage)
    {
        var normalized = NormalizeRequired(value, errorMessage).ToLowerInvariant();

        if (!allowedValues.Contains(normalized))
        {
            throw new BusinessException(422, errorMessage);
        }

        return normalized;
    }

    private static string NormalizeRequired(string? value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }
}

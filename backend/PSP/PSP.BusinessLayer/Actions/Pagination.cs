using PSP.Domain.Models;

namespace PSP.BusinessLayer.Actions;

internal static class Pagination
{
    public static PaginatedResultDto<T> From<T>(IReadOnlyList<T> items, int? page, int? pageSize)
    {
        var normalizedPage = Math.Max(1, page ?? 1);
        var normalizedPageSize = Math.Max(1, pageSize ?? 6);
        var total = items.Count;
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)normalizedPageSize));
        var currentPage = Math.Min(normalizedPage, totalPages);
        var start = (currentPage - 1) * normalizedPageSize;

        return new PaginatedResultDto<T>(
            items.Skip(start).Take(normalizedPageSize).ToList(),
            total,
            currentPage,
            normalizedPageSize,
            totalPages);
    }
}

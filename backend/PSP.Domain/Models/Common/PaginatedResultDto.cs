namespace PSP.Domain.Models.Common;

public sealed record PaginatedResultDto<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize,
    int TotalPages);

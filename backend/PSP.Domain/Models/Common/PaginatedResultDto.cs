namespace PSP.Domain.Models;

public sealed record PaginatedResultDto<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize,
    int TotalPages);

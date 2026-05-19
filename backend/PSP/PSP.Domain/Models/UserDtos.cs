namespace PSP.Domain.Models;

public sealed record UserDto(
    string Id,
    string FullName,
    string Email,
    string Role,
    string Status,
    DateTimeOffset CreatedAt,
    int TotalBookings,
    decimal RevenueEur,
    DateTimeOffset? LastLogin);

public sealed record UserInputDto(
    string FullName,
    string Email,
    string? Password,
    string Role,
    string Status);

public sealed class UserListQueryDto
{
    public string? Query { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public bool ForceError { get; set; }
}

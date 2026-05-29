namespace PSP.Domain.Models;

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

namespace PSP.Domain.Models;

public sealed record PhotoOfferDto(
    string Id,
    string Title,
    string Description,
    string Category,
    string Location,
    decimal PriceEur,
    int DurationHours,
    string PhotographerId,
    string PhotographerName,
    string Status,
    decimal Rating,
    string CoverImageUrl,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record OfferInputDto(
    string Title,
    string Description,
    string Category,
    string Location,
    decimal PriceEur,
    int DurationHours,
    string Status,
    string? CoverImageUrl = null);

public sealed record CreateOfferDto(
    string Title,
    string Description,
    string Category,
    string Location,
    decimal PriceEur,
    int DurationHours,
    string Status,
    string PhotographerId,
    string PhotographerName,
    string? CoverImageUrl = null);

public sealed class OfferListQueryDto
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public string? PhotographerId { get; set; }
    public bool PublicOnly { get; set; }
    public bool ForceError { get; set; }
}

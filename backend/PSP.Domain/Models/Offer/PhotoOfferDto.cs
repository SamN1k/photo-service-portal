namespace PSP.Domain.Models.Offer;

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

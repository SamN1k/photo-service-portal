namespace PSP.Domain.Models.Offer;

public sealed record OfferInputDto(
    string Title,
    string Description,
    string Category,
    string Location,
    decimal PriceEur,
    int DurationHours,
    string Status,
    string? CoverImageUrl = null);

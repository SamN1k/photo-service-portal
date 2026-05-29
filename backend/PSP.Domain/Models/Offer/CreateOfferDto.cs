namespace PSP.Domain.Models.Offer;

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

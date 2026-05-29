namespace PSP.Domain.Models;

public sealed record OfferInputDto(
    string Title,
    string Description,
    string Category,
    string Location,
    decimal PriceEur,
    int DurationHours,
    string Status,
    string? CoverImageUrl = null);

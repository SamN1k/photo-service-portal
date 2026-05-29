namespace PSP.Domain.Models;

public sealed record PhotographerPortfolioInputDto(
    string FullName,
    string Email,
    string? PhoneNumber,
    string? ProfileImageUrl,
    string? Description,
    IReadOnlyList<string>? GalleryImageUrls);

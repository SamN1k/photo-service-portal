namespace PSP.Domain.Models.User;

public sealed record PhotographerPortfolioDto(
    string PhotographerId,
    string FullName,
    string Email,
    string PhoneNumber,
    string ProfileImageUrl,
    string Description,
    IReadOnlyList<string> GalleryImageUrls);

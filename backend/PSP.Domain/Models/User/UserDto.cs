namespace PSP.Domain.Models.User;

public sealed record UserDto(
    string Id,
    string FullName,
    string Email,
    string Role,
    string Status,
    DateTimeOffset CreatedAt,
    int TotalBookings,
    decimal RevenueEur,
    DateTimeOffset? LastLogin,
    string PhoneNumber,
    string ProfileImageUrl,
    string PortfolioDescription,
    IReadOnlyList<string> PortfolioGalleryImageUrls);

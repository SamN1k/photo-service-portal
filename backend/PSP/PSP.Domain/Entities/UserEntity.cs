namespace PSP.Domain.Entities;

public sealed class UserEntity
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string Status { get; set; } = "active";
    public string PhoneNumber { get; set; } = string.Empty;
    public string ProfileImageUrl { get; set; } = string.Empty;
    public string PortfolioDescription { get; set; } = string.Empty;
    public string PortfolioGalleryImageUrls { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public int TotalBookings { get; set; }
    public decimal RevenueEur { get; set; }
    public DateTimeOffset? LastLogin { get; set; }
}

namespace PSP.Domain.Entities;

public sealed class PhotoOfferEntity
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "portrait";
    public string Location { get; set; } = string.Empty;
    public decimal PriceEur { get; set; }
    public int DurationHours { get; set; }
    public string PhotographerId { get; set; } = string.Empty;
    public string PhotographerName { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public decimal Rating { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

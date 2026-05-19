namespace PSP.Domain.Entities;

public sealed class BookingEntity
{
    public string Id { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string OfferId { get; set; } = string.Empty;
    public string OfferTitle { get; set; } = string.Empty;
    public string PhotographerId { get; set; } = string.Empty;
    public string PhotographerName { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal BudgetEur { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

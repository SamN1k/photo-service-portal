namespace PSP.Domain.Models.Booking;

public sealed class BookingListQueryDto
{
    public string? Query { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public string? ClientId { get; set; }
    public string? PhotographerId { get; set; }
    public bool ForceError { get; set; }
}

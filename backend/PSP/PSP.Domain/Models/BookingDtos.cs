namespace PSP.Domain.Models;

public sealed record BookingDto(
    string Id,
    string ClientId,
    string ClientName,
    string OfferId,
    string OfferTitle,
    string PhotographerId,
    string PhotographerName,
    string EventDate,
    string Location,
    decimal BudgetEur,
    string Notes,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record BookingInputDto(
    string OfferId,
    string EventDate,
    string Location,
    decimal BudgetEur,
    string Notes);

public sealed record CreateBookingDto(
    string OfferId,
    string EventDate,
    string Location,
    decimal BudgetEur,
    string Notes,
    string ClientId,
    string ClientName);

public sealed record UpdateBookingStatusDto(string Status);

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

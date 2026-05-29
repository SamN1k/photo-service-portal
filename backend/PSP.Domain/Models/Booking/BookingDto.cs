namespace PSP.Domain.Models.Booking;

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

namespace PSP.Domain.Models;

public sealed record CreateBookingDto(
    string OfferId,
    string EventDate,
    string Location,
    decimal BudgetEur,
    string Notes,
    string ClientId,
    string ClientName);

namespace PSP.Domain.Models;

public sealed record BookingInputDto(
    string OfferId,
    string EventDate,
    string Location,
    decimal BudgetEur,
    string Notes);

namespace PSP.Domain.Models.Booking;

public sealed record BookingInputDto(
    string OfferId,
    string EventDate,
    string Location,
    decimal BudgetEur,
    string Notes);

using PSP.BusinessLayer.Core;
using PSP.Domain.Models;
using PSP.Domain.Entities;

namespace PSP.BusinessLayer.Actions;

public class BookingAction(InMemoryDataStore store)
{
    private static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "pending",
        "confirmed",
        "cancelled",
        "completed"
    };

    public PaginatedResultDto<BookingDto> ListBookings(BookingListQueryDto query)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru rezervari a esuat.");
        }

        lock (store.SyncRoot)
        {
            IEnumerable<BookingEntity> bookings = store.Bookings;
            var search = query.Query?.Trim().ToLowerInvariant() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(query.ClientId))
            {
                bookings = bookings.Where(booking => booking.ClientId == query.ClientId);
            }

            if (!string.IsNullOrWhiteSpace(query.PhotographerId))
            {
                bookings = bookings.Where(booking => booking.PhotographerId == query.PhotographerId);
            }

            if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
            {
                bookings = bookings.Where(booking => string.Equals(booking.Status, query.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                bookings = bookings.Where(booking =>
                    $"{booking.OfferTitle} {booking.PhotographerName} {booking.ClientName} {booking.Location}".ToLowerInvariant().Contains(search));
            }

            bookings = SortBookings(bookings, query.SortBy ?? "eventDateAsc");
            return Pagination.From(bookings.Select(DtoMapper.ToDto).ToList(), query.Page, query.PageSize);
        }
    }

    public BookingDto CreateBooking(CreateBookingDto input)
    {
        var normalizedInput = NormalizeInput(new BookingInputDto(input.OfferId, input.EventDate, input.Location, input.BudgetEur, input.Notes));
        var clientId = NormalizeRequired(input.ClientId, "Clientul este obligatoriu.");
        var clientName = NormalizeRequired(input.ClientName, "Numele clientului este obligatoriu.");
        var now = DateTimeOffset.UtcNow;

        lock (store.SyncRoot)
        {
            var offer = FindOffer(normalizedInput.OfferId);
            var client = store.Users.FirstOrDefault(user => user.Id == clientId)
                ?? throw new BusinessException(404, "Clientul nu exista.");

            var booking = new BookingEntity
            {
                Id = $"booking-{Guid.NewGuid():N}"[..20],
                ClientId = clientId,
                ClientName = string.IsNullOrWhiteSpace(client.FullName) ? clientName : client.FullName,
                OfferId = offer.Id,
                OfferTitle = offer.Title,
                PhotographerId = offer.PhotographerId,
                PhotographerName = offer.PhotographerName,
                EventDate = normalizedInput.EventDate,
                Location = normalizedInput.Location,
                BudgetEur = normalizedInput.BudgetEur,
                Notes = normalizedInput.Notes,
                Status = "pending",
                CreatedAt = now,
                UpdatedAt = now
            };

            store.Bookings.Insert(0, booking);
            client.TotalBookings += 1;

            var photographer = store.Users.FirstOrDefault(user => user.Id == offer.PhotographerId);
            if (photographer is not null)
            {
                photographer.TotalBookings += 1;
                photographer.RevenueEur += booking.BudgetEur;
            }

            return DtoMapper.ToDto(booking);
        }
    }

    public BookingDto UpdateBooking(string bookingId, BookingInputDto input)
    {
        var normalizedInput = NormalizeInput(input);

        lock (store.SyncRoot)
        {
            var booking = FindBooking(bookingId);
            var offer = FindOffer(normalizedInput.OfferId);

            booking.OfferId = offer.Id;
            booking.OfferTitle = offer.Title;
            booking.PhotographerId = offer.PhotographerId;
            booking.PhotographerName = offer.PhotographerName;
            booking.EventDate = normalizedInput.EventDate;
            booking.Location = normalizedInput.Location;
            booking.BudgetEur = normalizedInput.BudgetEur;
            booking.Notes = normalizedInput.Notes;
            booking.UpdatedAt = DateTimeOffset.UtcNow;

            return DtoMapper.ToDto(booking);
        }
    }

    public BookingDto UpdateBookingStatus(string bookingId, UpdateBookingStatusDto input)
    {
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul rezervarii este invalid.");

        lock (store.SyncRoot)
        {
            var booking = FindBooking(bookingId);
            booking.Status = status;
            booking.UpdatedAt = DateTimeOffset.UtcNow;
            return DtoMapper.ToDto(booking);
        }
    }

    public void DeleteBooking(string bookingId)
    {
        lock (store.SyncRoot)
        {
            var booking = FindBooking(bookingId);
            store.Bookings.Remove(booking);
        }
    }

    private BookingEntity FindBooking(string bookingId)
    {
        return store.Bookings.FirstOrDefault(candidate => candidate.Id == bookingId)
            ?? throw new BusinessException(404, "Rezervarea nu exista.");
    }

    private PhotoOfferEntity FindOffer(string offerId)
    {
        return store.Offers.FirstOrDefault(candidate => candidate.Id == offerId)
            ?? throw new BusinessException(404, "Oferta nu exista.");
    }

    private static IOrderedEnumerable<BookingEntity> SortBookings(IEnumerable<BookingEntity> bookings, string sortBy)
    {
        return sortBy switch
        {
            "eventDateDesc" => bookings.OrderByDescending(booking => booking.EventDate),
            "budgetDesc" => bookings.OrderByDescending(booking => booking.BudgetEur),
            "newest" => bookings.OrderByDescending(booking => booking.CreatedAt),
            _ => bookings.OrderBy(booking => booking.EventDate)
        };
    }

    private static BookingInputDto NormalizeInput(BookingInputDto input)
    {
        var offerId = NormalizeRequired(input.OfferId, "Oferta este obligatorie.");
        var eventDate = NormalizeRequired(input.EventDate, "Data evenimentului este obligatorie.");
        var location = NormalizeRequired(input.Location, "Locatia rezervarii este obligatorie.");
        var notes = input.Notes?.Trim() ?? string.Empty;

        if (input.BudgetEur <= 0)
        {
            throw new BusinessException(422, "Bugetul rezervarii trebuie sa fie pozitiv.");
        }

        return new BookingInputDto(offerId, eventDate, location, input.BudgetEur, notes);
    }

    private static bool IsAll(string value)
    {
        return string.Equals(value, "all", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeAllowed(string value, HashSet<string> allowedValues, string errorMessage)
    {
        var normalized = NormalizeRequired(value, errorMessage).ToLowerInvariant();

        if (!allowedValues.Contains(normalized))
        {
            throw new BusinessException(422, errorMessage);
        }

        return normalized;
    }

    private static string NormalizeRequired(string value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }
}

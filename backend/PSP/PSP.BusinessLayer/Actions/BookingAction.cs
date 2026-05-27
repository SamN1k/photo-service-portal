using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.DataAccessLayer;
using PSP.Domain.Entities;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Actions;

public class BookingAction(PhotoPortalDbContext db)
{
    private static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "pending",
        "confirmed",
        "rejected",
        "paid",
        "finalized"
    };

    public async Task<PaginatedResultDto<BookingDto>> ListBookingsAsync(BookingListQueryDto query)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru rezervari a esuat.");
        }

        IQueryable<BookingEntity> bookings = db.Bookings.AsNoTracking();
        var search = query.Query?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(query.ClientId))
        {
            var clientId = query.ClientId.Trim();
            bookings = bookings.Where(booking => booking.ClientId == clientId);
        }

        if (!string.IsNullOrWhiteSpace(query.PhotographerId))
        {
            var photographerId = query.PhotographerId.Trim();
            bookings = bookings.Where(booking => booking.PhotographerId == photographerId);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
        {
            var status = query.Status.Trim().ToLowerInvariant();
            bookings = bookings.Where(booking => booking.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            bookings = bookings.Where(booking =>
                EF.Functions.ILike(booking.OfferTitle, pattern) ||
                EF.Functions.ILike(booking.PhotographerName, pattern) ||
                EF.Functions.ILike(booking.ClientName, pattern) ||
                EF.Functions.ILike(booking.Location, pattern));
        }

        bookings = SortBookings(bookings, query.SortBy ?? "eventDateAsc");
        return await Pagination.FromQueryAsync(bookings, query.Page, query.PageSize, DtoMapper.ToDto);
    }

    public async Task<BookingDto> GetBookingAsync(string bookingId)
    {
        var booking = await db.Bookings.AsNoTracking().FirstOrDefaultAsync(candidate => candidate.Id == bookingId)
            ?? throw new BusinessException(404, "Rezervarea nu exista.");

        return DtoMapper.ToDto(booking);
    }

    public async Task<BookingDto> CreateBookingAsync(CreateBookingDto input)
    {
        var normalizedInput = NormalizeInput(new BookingInputDto(input.OfferId, input.EventDate, input.Location, input.BudgetEur, input.Notes));
        var clientId = NormalizeRequired(input.ClientId, "Clientul este obligatoriu.");
        var clientName = NormalizeRequired(input.ClientName, "Numele clientului este obligatoriu.");
        var offer = await FindOfferAsync(normalizedInput.OfferId);
        var client = await db.Users.FirstOrDefaultAsync(user => user.Id == clientId)
            ?? throw new BusinessException(404, "Clientul nu exista.");
        var now = DateTimeOffset.UtcNow;

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

        db.Bookings.Add(booking);
        client.TotalBookings += 1;

        var photographer = await db.Users.FirstOrDefaultAsync(user => user.Id == offer.PhotographerId);
        if (photographer is not null)
        {
            photographer.TotalBookings += 1;
            photographer.RevenueEur += booking.BudgetEur;
        }

        await db.SaveChangesAsync();

        return DtoMapper.ToDto(booking);
    }

    public async Task<BookingDto> UpdateBookingAsync(string bookingId, BookingInputDto input)
    {
        var normalizedInput = NormalizeInput(input);
        var booking = await FindBookingAsync(bookingId);
        var offer = await FindOfferAsync(normalizedInput.OfferId);

        booking.OfferId = offer.Id;
        booking.OfferTitle = offer.Title;
        booking.PhotographerId = offer.PhotographerId;
        booking.PhotographerName = offer.PhotographerName;
        booking.EventDate = normalizedInput.EventDate;
        booking.Location = normalizedInput.Location;
        booking.BudgetEur = normalizedInput.BudgetEur;
        booking.Notes = normalizedInput.Notes;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        return DtoMapper.ToDto(booking);
    }

    public async Task<BookingDto> UpdateBookingStatusAsync(string bookingId, UpdateBookingStatusDto input)
    {
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul rezervarii este invalid.");
        var booking = await FindBookingAsync(bookingId);

        booking.Status = status;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        return DtoMapper.ToDto(booking);
    }

    public async Task DeleteBookingAsync(string bookingId)
    {
        var booking = await FindBookingAsync(bookingId);

        db.Bookings.Remove(booking);
        await db.SaveChangesAsync();
    }

    private async Task<BookingEntity> FindBookingAsync(string bookingId)
    {
        return await db.Bookings.FirstOrDefaultAsync(candidate => candidate.Id == bookingId)
            ?? throw new BusinessException(404, "Rezervarea nu exista.");
    }

    private async Task<PhotoOfferEntity> FindOfferAsync(string offerId)
    {
        return await db.Offers.FirstOrDefaultAsync(candidate => candidate.Id == offerId)
            ?? throw new BusinessException(404, "Oferta nu exista.");
    }

    private static IOrderedQueryable<BookingEntity> SortBookings(IQueryable<BookingEntity> bookings, string sortBy)
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

    private static string NormalizeAllowed(string? value, HashSet<string> allowedValues, string errorMessage)
    {
        var normalized = NormalizeRequired(value, errorMessage).ToLowerInvariant();

        if (!allowedValues.Contains(normalized))
        {
            throw new BusinessException(422, errorMessage);
        }

        return normalized;
    }

    private static string NormalizeRequired(string? value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }
}

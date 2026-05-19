using PSP.Domain.Models;
using PSP.Domain.Entities;

namespace PSP.BusinessLayer.Actions;

internal static class DtoMapper
{
    public static UserDto ToDto(UserEntity user)
    {
        return new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.Status,
            user.CreatedAt,
            user.TotalBookings,
            user.RevenueEur,
            user.LastLogin);
    }

    public static PhotoOfferDto ToDto(PhotoOfferEntity offer)
    {
        return new PhotoOfferDto(
            offer.Id,
            offer.Title,
            offer.Description,
            offer.Category,
            offer.Location,
            offer.PriceEur,
            offer.DurationHours,
            offer.PhotographerId,
            offer.PhotographerName,
            offer.Status,
            offer.Rating,
            offer.CoverImageUrl,
            offer.CreatedAt,
            offer.UpdatedAt);
    }

    public static BookingDto ToDto(BookingEntity booking)
    {
        return new BookingDto(
            booking.Id,
            booking.ClientId,
            booking.ClientName,
            booking.OfferId,
            booking.OfferTitle,
            booking.PhotographerId,
            booking.PhotographerName,
            booking.EventDate,
            booking.Location,
            booking.BudgetEur,
            booking.Notes,
            booking.Status,
            booking.CreatedAt,
            booking.UpdatedAt);
    }
}

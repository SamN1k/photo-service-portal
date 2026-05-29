using PSP.Domain.Models;
using PSP.Domain.Entities;

namespace PSP.BusinessLayer.Structure;

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
            user.LastLogin,
            user.PhoneNumber,
            user.ProfileImageUrl,
            user.PortfolioDescription,
            SplitGallery(user.PortfolioGalleryImageUrls));
    }

    public static PhotographerPortfolioDto ToPortfolioDto(UserEntity user)
    {
        return new PhotographerPortfolioDto(
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.ProfileImageUrl,
            user.PortfolioDescription,
            SplitGallery(user.PortfolioGalleryImageUrls));
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

    public static ProblemReportDto ToDto(ProblemReportEntity report)
    {
        return new ProblemReportDto(
            report.Id,
            report.ReporterId,
            report.ReporterName,
            report.ReporterEmail,
            report.ReporterRole,
            report.Title,
            report.Description,
            report.Status,
            report.CreatedAt);
    }

    private static IReadOnlyList<string> SplitGallery(string? galleryImageUrls)
    {
        if (string.IsNullOrWhiteSpace(galleryImageUrls))
        {
            return [];
        }

        return galleryImageUrls
            .Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .ToList();
    }
}

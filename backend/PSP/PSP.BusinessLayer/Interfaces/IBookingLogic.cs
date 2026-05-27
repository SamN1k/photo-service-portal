using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IBookingLogic
{
    Task<PaginatedResultDto<BookingDto>> ListBookingsAsync(BookingListQueryDto query);
    Task<BookingDto> GetBookingAsync(string bookingId);
    Task<BookingDto> CreateBookingAsync(CreateBookingDto input);
    Task<BookingDto> UpdateBookingAsync(string bookingId, BookingInputDto input);
    Task<BookingDto> UpdateBookingStatusAsync(string bookingId, UpdateBookingStatusDto input);
    Task DeleteBookingAsync(string bookingId);
}

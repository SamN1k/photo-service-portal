using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IBookingLogic
{
    PaginatedResultDto<BookingDto> ListBookings(BookingListQueryDto query);
    BookingDto CreateBooking(CreateBookingDto input);
    BookingDto UpdateBooking(string bookingId, BookingInputDto input);
    BookingDto UpdateBookingStatus(string bookingId, UpdateBookingStatusDto input);
    void DeleteBooking(string bookingId);
}

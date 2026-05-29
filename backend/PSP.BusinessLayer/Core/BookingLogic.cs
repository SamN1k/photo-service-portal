using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Core;

public sealed class BookingLogic : BookingAction, IBookingLogic
{
    public Task<PaginatedResultDto<BookingDto>> ListBookingsAsync(BookingListQueryDto query)
    {
        return ListBookingsActionAsync(query);
    }

    public Task<BookingDto> GetBookingAsync(string bookingId)
    {
        return GetBookingActionAsync(bookingId);
    }

    public Task<BookingDto> CreateBookingAsync(CreateBookingDto input)
    {
        return CreateBookingActionAsync(input);
    }

    public Task<BookingDto> UpdateBookingAsync(string bookingId, BookingInputDto input)
    {
        return UpdateBookingActionAsync(bookingId, input);
    }

    public Task<BookingDto> UpdateBookingStatusAsync(string bookingId, UpdateBookingStatusDto input)
    {
        return UpdateBookingStatusActionAsync(bookingId, input);
    }

    public Task DeleteBookingAsync(string bookingId)
    {
        return DeleteBookingActionAsync(bookingId);
    }
}

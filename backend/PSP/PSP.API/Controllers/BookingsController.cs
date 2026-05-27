using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/bookings")]
public sealed class BookingsController(IBookingLogic bookingLogic) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<BookingDto>>> ListBookings([FromQuery] BookingListQueryDto query)
    {
        try
        {
            return Ok(await bookingLogic.ListBookingsAsync(query));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpGet("{bookingId}")]
    public async Task<ActionResult<BookingDto>> GetBooking(string bookingId)
    {
        try
        {
            return Ok(await bookingLogic.GetBookingAsync(bookingId));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto input)
    {
        try
        {
            var booking = await bookingLogic.CreateBookingAsync(input);
            return Created($"/api/bookings/{booking.Id}", booking);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpPut("{bookingId}")]
    public async Task<ActionResult<BookingDto>> UpdateBooking(string bookingId, [FromBody] BookingInputDto input)
    {
        try
        {
            return Ok(await bookingLogic.UpdateBookingAsync(bookingId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpPatch("{bookingId}/status")]
    public async Task<ActionResult<BookingDto>> UpdateBookingStatus(string bookingId, [FromBody] UpdateBookingStatusDto input)
    {
        try
        {
            return Ok(await bookingLogic.UpdateBookingStatusAsync(bookingId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpDelete("{bookingId}")]
    public async Task<IActionResult> DeleteBooking(string bookingId)
    {
        try
        {
            await bookingLogic.DeleteBookingAsync(bookingId);
            return NoContent();
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }
}

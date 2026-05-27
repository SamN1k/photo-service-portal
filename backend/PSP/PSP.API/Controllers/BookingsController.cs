using Microsoft.AspNetCore.Mvc;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/bookings")]
public sealed class BookingsController(IBookingLogic bookingLogic) : ApiControllerBase
{
    [HttpGet]
    public ActionResult<PaginatedResultDto<BookingDto>> ListBookings([FromQuery] BookingListQueryDto query)
    {
        try
        {
            return Ok(bookingLogic.ListBookings(query));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpGet("{bookingId}")]
    public ActionResult<BookingDto> GetBooking(string bookingId)
    {
        try
        {
            return Ok(bookingLogic.GetBooking(bookingId));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPost]
    public ActionResult<BookingDto> CreateBooking([FromBody] CreateBookingDto input)
    {
        try
        {
            var booking = bookingLogic.CreateBooking(input);
            return Created($"/api/bookings/{booking.Id}", booking);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPut("{bookingId}")]
    public ActionResult<BookingDto> UpdateBooking(string bookingId, [FromBody] BookingInputDto input)
    {
        try
        {
            return Ok(bookingLogic.UpdateBooking(bookingId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPatch("{bookingId}/status")]
    public ActionResult<BookingDto> UpdateBookingStatus(string bookingId, [FromBody] UpdateBookingStatusDto input)
    {
        try
        {
            return Ok(bookingLogic.UpdateBookingStatus(bookingId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpDelete("{bookingId}")]
    public IActionResult DeleteBooking(string bookingId)
    {
        try
        {
            bookingLogic.DeleteBooking(bookingId);
            return NoContent();
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }
}

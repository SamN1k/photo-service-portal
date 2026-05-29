using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models.Booking;
using PSP.Domain.Models.Common;

namespace PSP.API.Controllers;

[Route("api/bookings")]
[Authorize]
public sealed class BookingsController : ApiControllerBase
{
    private readonly IBookingLogic bookingLogic;

    public BookingsController()
    {
        var businessLogic = new BusinessLogic();
        bookingLogic = businessLogic.GetBookingLogic();
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<BookingDto>>> ListBookings([FromQuery] BookingListQueryDto filters)
    {
        try
        {
            ScopeBookingFilters(filters);
            return Ok(await bookingLogic.ListBookingsAsync(filters));
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
            var booking = await bookingLogic.GetBookingAsync(bookingId);

            if (!CanAccessBooking(booking))
            {
                return Forbid();
            }

            return Ok(booking);
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
    [Authorize(Roles = "user,admin")]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto input)
    {
        if (!CurrentUserIsAdmin && !IsCurrentUser(input.ClientId))
        {
            return Forbid();
        }

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
    [Authorize(Roles = "user,admin")]
    public async Task<ActionResult<BookingDto>> UpdateBooking(string bookingId, [FromBody] BookingInputDto input)
    {
        try
        {
            var booking = await bookingLogic.GetBookingAsync(bookingId);

            if (!CurrentUserIsAdmin && !IsCurrentUser(booking.ClientId))
            {
                return Forbid();
            }

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
            var booking = await bookingLogic.GetBookingAsync(bookingId);

            if (!CanUpdateBookingStatus(booking, input.Status))
            {
                return Forbid();
            }

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
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> DeleteBooking(string bookingId)
    {
        try
        {
            var booking = await bookingLogic.GetBookingAsync(bookingId);

            if (!CurrentUserIsAdmin && !IsCurrentUser(booking.ClientId))
            {
                return Forbid();
            }

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

    private void ScopeBookingFilters(BookingListQueryDto filters)
    {
        if (CurrentUserIsAdmin)
        {
            return;
        }

        if (CurrentUserIsPhotographer)
        {
            filters.PhotographerId = CurrentUserId;
            filters.ClientId = null;
            return;
        }

        filters.ClientId = CurrentUserId;
        filters.PhotographerId = null;
    }

    private bool CanAccessBooking(BookingDto booking)
    {
        return CurrentUserIsAdmin ||
            IsCurrentUser(booking.ClientId) ||
            (CurrentUserIsPhotographer && IsCurrentUser(booking.PhotographerId));
    }

    private bool CanUpdateBookingStatus(BookingDto booking, string status)
    {
        if (CurrentUserIsAdmin)
        {
            return true;
        }

        if (CurrentUserIsPhotographer && IsCurrentUser(booking.PhotographerId))
        {
            return CanPhotographerUpdateBookingStatus(booking.Status, status);
        }

        return CurrentUserIsUser &&
            IsCurrentUser(booking.ClientId) &&
            string.Equals(booking.Status, "confirmed", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(status, "paid", StringComparison.OrdinalIgnoreCase);
    }

    private static bool CanPhotographerUpdateBookingStatus(string currentStatus, string nextStatus)
    {
        if (string.Equals(currentStatus, "pending", StringComparison.OrdinalIgnoreCase))
        {
            return string.Equals(nextStatus, "confirmed", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(nextStatus, "rejected", StringComparison.OrdinalIgnoreCase);
        }

        if (string.Equals(currentStatus, "confirmed", StringComparison.OrdinalIgnoreCase))
        {
            return string.Equals(nextStatus, "rejected", StringComparison.OrdinalIgnoreCase);
        }

        return string.Equals(currentStatus, "paid", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(nextStatus, "finalized", StringComparison.OrdinalIgnoreCase);
    }
}

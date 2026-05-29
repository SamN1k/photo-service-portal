using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/offers")]
public sealed class OffersController : ApiControllerBase
{
    private readonly IOfferLogic offerLogic;

    public OffersController()
    {
        var businessLogic = new BusinessLogic();
        offerLogic = businessLogic.GetOfferLogic();
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PaginatedResultDto<PhotoOfferDto>>> ListOffers([FromQuery] OfferListQueryDto filters)
    {
        try
        {
            ScopeOfferFilters(filters);
            return Ok(await offerLogic.ListOffersAsync(filters));
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

    [HttpGet("{offerId}")]
    [AllowAnonymous]
    public async Task<ActionResult<PhotoOfferDto>> GetOffer(string offerId)
    {
        try
        {
            var offer = await offerLogic.GetOfferAsync(offerId);

            if (offer.Status != "active" && !CanManageOffer(offer))
            {
                return User.Identity?.IsAuthenticated == true ? Forbid() : Unauthorized();
            }

            return Ok(offer);
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
    [Authorize(Roles = "photographer,admin")]
    public async Task<ActionResult<PhotoOfferDto>> CreateOffer([FromBody] CreateOfferDto input)
    {
        if (!CurrentUserIsAdmin && !IsCurrentUser(input.PhotographerId))
        {
            return Forbid();
        }

        try
        {
            var offer = await offerLogic.CreateOfferAsync(input);
            return Created($"/api/offers/{offer.Id}", offer);
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

    [HttpPut("{offerId}")]
    [Authorize(Roles = "photographer,admin")]
    public async Task<ActionResult<PhotoOfferDto>> UpdateOffer(string offerId, [FromBody] OfferInputDto input)
    {
        try
        {
            var offer = await offerLogic.GetOfferAsync(offerId);

            if (!CanManageOffer(offer))
            {
                return Forbid();
            }

            return Ok(await offerLogic.UpdateOfferAsync(offerId, input));
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

    [HttpDelete("{offerId}")]
    [Authorize(Roles = "photographer,admin")]
    public async Task<IActionResult> DeleteOffer(string offerId)
    {
        try
        {
            var offer = await offerLogic.GetOfferAsync(offerId);

            if (!CanManageOffer(offer))
            {
                return Forbid();
            }

            await offerLogic.DeleteOfferAsync(offerId);
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

    private void ScopeOfferFilters(OfferListQueryDto filters)
    {
        if (filters.PublicOnly || User.Identity?.IsAuthenticated != true || CurrentUserIsUser)
        {
            filters.PublicOnly = true;
            return;
        }

        if (CurrentUserIsPhotographer && !CurrentUserIsAdmin)
        {
            filters.PhotographerId = CurrentUserId;
        }
    }

    private bool CanManageOffer(PhotoOfferDto offer)
    {
        return CurrentUserIsAdmin || (CurrentUserIsPhotographer && IsCurrentUser(offer.PhotographerId));
    }
}

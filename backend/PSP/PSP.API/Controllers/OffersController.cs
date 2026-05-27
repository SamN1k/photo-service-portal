using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/offers")]
public sealed class OffersController(IOfferLogic offerLogic) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<PhotoOfferDto>>> ListOffers([FromQuery] OfferListQueryDto query)
    {
        try
        {
            return Ok(await offerLogic.ListOffersAsync(query));
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
    public async Task<ActionResult<PhotoOfferDto>> GetOffer(string offerId)
    {
        try
        {
            return Ok(await offerLogic.GetOfferAsync(offerId));
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
    public async Task<ActionResult<PhotoOfferDto>> CreateOffer([FromBody] CreateOfferDto input)
    {
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
    public async Task<ActionResult<PhotoOfferDto>> UpdateOffer(string offerId, [FromBody] OfferInputDto input)
    {
        try
        {
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
    public async Task<IActionResult> DeleteOffer(string offerId)
    {
        try
        {
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
}

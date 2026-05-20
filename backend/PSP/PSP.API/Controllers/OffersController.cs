using Microsoft.AspNetCore.Mvc;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/offers")]
public sealed class OffersController(IOfferLogic offerLogic) : ApiControllerBase
{
    [HttpGet]
    public ActionResult<PaginatedResultDto<PhotoOfferDto>> ListOffers([FromQuery] OfferListQueryDto query)
    {
        try
        {
            return Ok(offerLogic.ListOffers(query));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpGet("{offerId}")]
    public ActionResult<PhotoOfferDto> GetOffer(string offerId)
    {
        try
        {
            return Ok(offerLogic.GetOffer(offerId));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPost]
    public ActionResult<PhotoOfferDto> CreateOffer([FromBody] CreateOfferDto input)
    {
        try
        {
            var offer = offerLogic.CreateOffer(input);
            return Created($"/api/offers/{offer.Id}", offer);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPut("{offerId}")]
    public ActionResult<PhotoOfferDto> UpdateOffer(string offerId, [FromBody] OfferInputDto input)
    {
        try
        {
            return Ok(offerLogic.UpdateOffer(offerId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpDelete("{offerId}")]
    public IActionResult DeleteOffer(string offerId)
    {
        try
        {
            offerLogic.DeleteOffer(offerId);
            return NoContent();
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }
}

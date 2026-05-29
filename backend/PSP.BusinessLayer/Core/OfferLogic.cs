using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models.Common;
using PSP.Domain.Models.Offer;

namespace PSP.BusinessLayer.Core;

public sealed class OfferLogic : OfferAction, IOfferLogic
{
    public Task<PaginatedResultDto<PhotoOfferDto>> ListOffersAsync(OfferListQueryDto query)
    {
        return ListOffersActionAsync(query);
    }

    public Task<PhotoOfferDto> GetOfferAsync(string offerId)
    {
        return GetOfferActionAsync(offerId);
    }

    public Task<PhotoOfferDto> CreateOfferAsync(CreateOfferDto input)
    {
        return CreateOfferActionAsync(input);
    }

    public Task<PhotoOfferDto> UpdateOfferAsync(string offerId, OfferInputDto input)
    {
        return UpdateOfferActionAsync(offerId, input);
    }

    public Task DeleteOfferAsync(string offerId)
    {
        return DeleteOfferActionAsync(offerId);
    }
}

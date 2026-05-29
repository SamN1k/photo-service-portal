using PSP.Domain.Models.Common;
using PSP.Domain.Models.Offer;

namespace PSP.BusinessLayer.Interfaces;

public interface IOfferLogic
{
    Task<PaginatedResultDto<PhotoOfferDto>> ListOffersAsync(OfferListQueryDto query);
    Task<PhotoOfferDto> GetOfferAsync(string offerId);
    Task<PhotoOfferDto> CreateOfferAsync(CreateOfferDto input);
    Task<PhotoOfferDto> UpdateOfferAsync(string offerId, OfferInputDto input);
    Task DeleteOfferAsync(string offerId);
}

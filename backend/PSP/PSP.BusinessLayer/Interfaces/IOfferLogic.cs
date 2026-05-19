using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IOfferLogic
{
    PaginatedResultDto<PhotoOfferDto> ListOffers(OfferListQueryDto query);
    PhotoOfferDto GetOffer(string offerId);
    PhotoOfferDto CreateOffer(CreateOfferDto input);
    PhotoOfferDto UpdateOffer(string offerId, OfferInputDto input);
    void DeleteOffer(string offerId);
}

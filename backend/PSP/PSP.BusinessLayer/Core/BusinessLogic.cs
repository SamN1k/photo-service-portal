using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer.Core;

public sealed class BusinessLogic
{
    private readonly InMemoryDataStore _store = new();

    public IUserLogic GetUserLogic()
    {
        return new UserLogic(_store);
    }

    public IOfferLogic GetOfferLogic()
    {
        return new OfferLogic(_store);
    }

    public IBookingLogic GetBookingLogic()
    {
        return new BookingLogic(_store);
    }

    public IAuthLogic GetAuthLogic()
    {
        return new AuthLogic(_store);
    }
}

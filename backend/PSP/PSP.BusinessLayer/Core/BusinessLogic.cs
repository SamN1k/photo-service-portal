using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer.Context;

namespace PSP.BusinessLayer.Core;

public sealed class BusinessLogic(PhotoPortalDbContext db)
{
    public IUserLogic GetUserLogic()
    {
        return new UserLogic(db);
    }

    public IOfferLogic GetOfferLogic()
    {
        return new OfferLogic(db);
    }

    public IBookingLogic GetBookingLogic()
    {
        return new BookingLogic(db);
    }

    public IAuthLogic GetAuthLogic()
    {
        return new AuthLogic(db);
    }
}

using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer;

public sealed class BusinessLogic
{
    public BusinessLogic()
    {
    }

    public IUserLogic GetUserLogic()
    {
        return new UserLogic();
    }

    public IOfferLogic GetOfferLogic()
    {
        return new OfferLogic();
    }

    public IBookingLogic GetBookingLogic()
    {
        return new BookingLogic();
    }

    public IProblemReportLogic GetProblemReportLogic()
    {
        return new ProblemReportLogic();
    }

    public IAuthLogic GetAuthLogic()
    {
        return new AuthLogic();
    }
}

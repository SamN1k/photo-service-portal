using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer.Context;

namespace PSP.BusinessLayer.Core;

public sealed class BusinessLogic(
    PhotoPortalDbContext db,
    IPasswordResetEmailSender? emailSender = null,
    IPasswordHasher? passwordHasher = null,
    IJwtTokenService? jwtTokenService = null)
{
    private readonly IPasswordResetEmailSender emailSender = emailSender ?? new PasswordResetEmailSender();
    private readonly IPasswordHasher passwordHasher = passwordHasher ?? new Pbkdf2PasswordHasher();
    private readonly IJwtTokenService jwtTokenService = jwtTokenService ?? new JwtTokenService(new JwtOptions
    {
        Issuer = "PSP.PhotoPortal.Api",
        Audience = "PSP.PhotoPortal.Frontend",
        SecretKey = "dev-photo-portal-jwt-secret-key-change-in-production-2026",
        ExpirationMinutes = 120
    });

    public IUserLogic GetUserLogic()
    {
        return new UserLogic(db, passwordHasher);
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
        return new AuthLogic(db, emailSender, passwordHasher, jwtTokenService);
    }
}

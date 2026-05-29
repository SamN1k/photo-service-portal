namespace PSP.BusinessLayer.Security;

public sealed class JwtOptions
{
    public static JwtOptions Current { get; set; } = new()
    {
        Issuer = "PSP.PhotoPortal.Api",
        Audience = "PSP.PhotoPortal.Frontend",
        SecretKey = "dev-photo-portal-jwt-secret-key-change-in-production-2026",
        ExpirationMinutes = 120
    };

    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string SecretKey { get; init; } = string.Empty;
    public int ExpirationMinutes { get; init; } = 120;
}

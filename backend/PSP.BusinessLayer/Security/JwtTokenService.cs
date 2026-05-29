using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Entities;
using PSP.Domain.Models.Auth;

namespace PSP.BusinessLayer.Security;

public sealed class JwtTokenService(JwtOptions options) : IJwtTokenService
{
    public JwtTokenResultDto GenerateToken(UserEntity user)
    {
        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddMinutes(options.ExpirationMinutes);
        var credentials = new SigningCredentials(CreateSecurityKey(options), SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("userId", user.Id),
            new("role", user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return new JwtTokenResultDto(new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true)
    {
        try
        {
            return new JwtSecurityTokenHandler().ValidateToken(
                token,
                CreateValidationParameters(options, validateLifetime),
                out _);
        }
        catch (Exception)
        {
            return null;
        }
    }

    public static TokenValidationParameters CreateValidationParameters(JwtOptions options, bool validateLifetime = true)
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = options.Issuer,
            ValidateAudience = true,
            ValidAudience = options.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = CreateSecurityKey(options),
            ValidateLifetime = validateLifetime,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
    }

    private static SymmetricSecurityKey CreateSecurityKey(JwtOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.SecretKey) || Encoding.UTF8.GetByteCount(options.SecretKey) < 32)
        {
            throw new InvalidOperationException("JWT SecretKey trebuie sa aiba minimum 32 bytes.");
        }

        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SecretKey));
    }
}

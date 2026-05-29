using System.Security.Claims;
using PSP.Domain.Entities;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IJwtTokenService
{
    JwtTokenResultDto GenerateToken(UserEntity user);
    ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);
}

namespace PSP.Domain.Models.Auth;

public sealed record JwtTokenResultDto(
    string Token,
    DateTimeOffset ExpiresAt);

namespace PSP.Domain.Models;

public sealed record JwtTokenResultDto(
    string Token,
    DateTimeOffset ExpiresAt);

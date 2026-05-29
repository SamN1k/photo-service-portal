namespace PSP.Domain.Models;

public sealed record AuthSessionDto(
    string Token,
    UserDto User,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

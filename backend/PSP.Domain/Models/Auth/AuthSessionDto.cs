using PSP.Domain.Models.User;

namespace PSP.Domain.Models.Auth;

public sealed record AuthSessionDto(
    string Token,
    UserDto User,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

namespace PSP.Domain.Models.Auth;

public sealed record PasswordResetRequestResultDto(
    string Email,
    DateTimeOffset ExpiresAt);

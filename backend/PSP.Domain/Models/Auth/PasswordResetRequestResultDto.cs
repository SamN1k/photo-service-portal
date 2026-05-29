namespace PSP.Domain.Models;

public sealed record PasswordResetRequestResultDto(
    string Email,
    DateTimeOffset ExpiresAt);

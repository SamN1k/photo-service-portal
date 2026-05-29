namespace PSP.Domain.Models.Auth;

public sealed record PasswordResetCodeResultDto(
    string Email,
    bool Verified);

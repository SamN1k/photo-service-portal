namespace PSP.Domain.Models.Auth;

public sealed record PasswordResetCompleteDto(
    string Email,
    string Code,
    string NewPassword);

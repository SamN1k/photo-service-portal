namespace PSP.Domain.Models;

public sealed record PasswordResetCompleteDto(
    string Email,
    string Code,
    string NewPassword);

namespace PSP.Domain.Models;

public sealed record PasswordResetCodeDto(
    string Email,
    string Code);

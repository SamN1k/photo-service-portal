namespace PSP.Domain.Models.Auth;

public sealed record PasswordResetCodeDto(
    string Email,
    string Code);

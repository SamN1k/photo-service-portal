namespace PSP.Domain.Models;

public sealed record PasswordResetCodeResultDto(
    string Email,
    bool Verified);

namespace PSP.Domain.Models.Auth;

public sealed record SignUpPayloadDto(
    string FullName,
    string Email,
    string Password,
    string? Role = null);

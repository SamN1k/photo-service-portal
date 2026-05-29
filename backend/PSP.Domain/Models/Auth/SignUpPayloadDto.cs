namespace PSP.Domain.Models;

public sealed record SignUpPayloadDto(
    string FullName,
    string Email,
    string Password,
    string? Role = null);

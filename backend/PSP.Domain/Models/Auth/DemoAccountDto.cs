namespace PSP.Domain.Models.Auth;

public sealed record DemoAccountDto(
    string Email,
    string Password,
    string Role,
    string FullName);

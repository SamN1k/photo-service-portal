namespace PSP.Domain.Models;

public sealed record DemoAccountDto(
    string Email,
    string Password,
    string Role,
    string FullName);

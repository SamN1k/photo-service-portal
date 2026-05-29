namespace PSP.Domain.Models;

public sealed record UserInputDto(
    string FullName,
    string Email,
    string? Password,
    string Role,
    string Status);

namespace PSP.Domain.Models;

public sealed record AccountSettingsInputDto(
    string FullName,
    string Email,
    string CurrentPassword,
    string? NewPassword);

namespace PSP.Domain.Models.User;

public sealed record AccountSettingsInputDto(
    string FullName,
    string Email,
    string CurrentPassword,
    string? NewPassword);

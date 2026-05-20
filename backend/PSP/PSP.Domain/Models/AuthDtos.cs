namespace PSP.Domain.Models;

public sealed record LoginCredentialsDto(string Email, string Password);

public sealed record SignUpPayloadDto(
    string FullName,
    string Email,
    string Password,
    string Role);

public sealed record AuthSessionDto(
    string Token,
    UserDto User,
    DateTimeOffset CreatedAt);

public sealed record DemoAccountDto(
    string Email,
    string Password,
    string Role,
    string FullName);

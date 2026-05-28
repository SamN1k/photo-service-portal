namespace PSP.Domain.Models;

public sealed record LoginCredentialsDto(string Email, string Password);

public sealed record SignUpPayloadDto(
    string FullName,
    string Email,
    string Password,
    string? Role = null);

public sealed record PasswordResetRequestDto(string Email);

public sealed record PasswordResetRequestResultDto(
    string Email,
    DateTimeOffset ExpiresAt);

public sealed record PasswordResetCodeDto(
    string Email,
    string Code);

public sealed record PasswordResetCodeResultDto(
    string Email,
    bool Verified);

public sealed record PasswordResetCompleteDto(
    string Email,
    string Code,
    string NewPassword);

public sealed record AuthSessionDto(
    string Token,
    UserDto User,
    DateTimeOffset CreatedAt);

public sealed record DemoAccountDto(
    string Email,
    string Password,
    string Role,
    string FullName);

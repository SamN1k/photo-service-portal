using System.Collections.Concurrent;
using System.Globalization;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Security;
using PSP.DataAccessLayer.Context;
using PSP.Domain.Entities;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Structure;

public class AuthAction
{
    private const int ResetCodeExpirationMinutes = 10;
    private static readonly ConcurrentDictionary<string, PasswordResetTicket> PasswordResetTickets = new(StringComparer.OrdinalIgnoreCase);
    private readonly PasswordResetEmailSender emailSender = new();
    private readonly Pbkdf2PasswordHasher passwordHasher = new();
    private readonly JwtTokenService jwtTokenService = new(JwtOptions.Current);

    protected async Task<AuthSessionDto> LoginActionAsync(LoginCredentialsDto credentials)
    {
        using var db = new PhotoPortalDbContext();
        var email = NormalizeRequired(credentials.Email, "Emailul este obligatoriu.").ToLowerInvariant();
        var password = NormalizeRequired(credentials.Password, "Parola este obligatorie.");
        var user = await db.Users.FirstOrDefaultAsync(candidate => candidate.Email == email);

        if (user is null || !passwordHasher.Verify(password, user.Password))
        {
            throw new BusinessException(401, "Email sau parola invalida.");
        }

        if (user.Status == "suspended")
        {
            throw new BusinessException(403, "Contul este suspendat.");
        }

        UpgradePasswordHashIfNeeded(user, password);
        user.LastLogin = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        return CreateSession(user);
    }

    protected async Task<AuthSessionDto> SignUpActionAsync(SignUpPayloadDto payload)
    {
        using var db = new PhotoPortalDbContext();
        var fullName = NormalizeRequired(payload.FullName, "Numele este obligatoriu.");
        var email = NormalizeEmail(payload.Email);
        var password = NormalizePassword(payload.Password);
        const string role = "user";

        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            throw new BusinessException(409, "Exista deja un cont cu acest email.");
        }

        var user = new UserEntity
        {
            Id = $"{role}-{Guid.NewGuid():N}"[..18],
            FullName = fullName,
            Email = email,
            Password = passwordHasher.Hash(password),
            Role = role,
            Status = "active",
            CreatedAt = DateTimeOffset.UtcNow,
            TotalBookings = 0,
            RevenueEur = 0,
            LastLogin = DateTimeOffset.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreateSession(user);
    }

    protected async Task<PasswordResetRequestResultDto> RequestPasswordResetActionAsync(PasswordResetRequestDto payload)
    {
        using var db = new PhotoPortalDbContext();
        var email = NormalizeEmail(payload.Email);
        var userExists = await db.Users.AnyAsync(candidate => candidate.Email == email);

        if (!userExists)
        {
            throw new BusinessException(404, "Nu exista un cont cu acest email.");
        }

        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString(CultureInfo.InvariantCulture);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(ResetCodeExpirationMinutes);
        PasswordResetTickets[email] = new PasswordResetTicket(code, expiresAt, false);

        await emailSender.SendPasswordResetCodeAsync(email, code, expiresAt);

        return new PasswordResetRequestResultDto(email, expiresAt);
    }

    protected Task<PasswordResetCodeResultDto> VerifyPasswordResetCodeActionAsync(PasswordResetCodeDto payload)
    {
        var email = NormalizeEmail(payload.Email);
        var code = NormalizeCode(payload.Code);
        var ticket = GetValidPasswordResetTicket(email, code);

        PasswordResetTickets[email] = ticket with { Verified = true };

        return Task.FromResult(new PasswordResetCodeResultDto(email, true));
    }

    protected async Task<UserDto> CompletePasswordResetActionAsync(PasswordResetCompleteDto payload)
    {
        using var db = new PhotoPortalDbContext();
        var email = NormalizeEmail(payload.Email);
        var code = NormalizeCode(payload.Code);
        var newPassword = NormalizePassword(payload.NewPassword);
        var ticket = GetValidPasswordResetTicket(email, code);

        if (!ticket.Verified)
        {
            throw new BusinessException(422, "Codul de acces trebuie verificat inainte de actualizarea parolei.");
        }

        var user = await db.Users.FirstOrDefaultAsync(candidate => candidate.Email == email)
            ?? throw new BusinessException(404, "Nu exista un cont cu acest email.");

        user.Password = passwordHasher.Hash(newPassword);
        await db.SaveChangesAsync();
        PasswordResetTickets.TryRemove(email, out _);

        return DtoMapper.ToDto(user);
    }

    protected async Task<IReadOnlyList<DemoAccountDto>> GetDemoAccountsActionAsync()
    {
        using var db = new PhotoPortalDbContext();
        return await db.Users
            .AsNoTracking()
            .Where(user => user.Status == "active")
            .OrderBy(user => user.CreatedAt)
            .Take(3)
            .Select(user => new DemoAccountDto(user.Email, "demo1234", user.Role, user.FullName))
            .ToListAsync();
    }

    private AuthSessionDto CreateSession(UserEntity user)
    {
        var token = jwtTokenService.GenerateToken(user);

        return new AuthSessionDto(
            token.Token,
            DtoMapper.ToDto(user),
            DateTimeOffset.UtcNow,
            token.ExpiresAt);
    }

    private void UpgradePasswordHashIfNeeded(UserEntity user, string plainPassword)
    {
        if (!passwordHasher.IsHashed(user.Password))
        {
            user.Password = passwordHasher.Hash(plainPassword);
        }
    }

    private static string NormalizeEmail(string? value)
    {
        var normalized = NormalizeRequired(value, "Emailul este obligatoriu.").ToLowerInvariant();

        if (!normalized.Contains('@', StringComparison.Ordinal) || !normalized.Contains('.', StringComparison.Ordinal))
        {
            throw new BusinessException(422, "Emailul nu are un format valid.");
        }

        return normalized;
    }

    private static string NormalizePassword(string? value)
    {
        var password = NormalizeRequired(value, "Parola este obligatorie.");

        if (password.Length < 6)
        {
            throw new BusinessException(422, "Parola trebuie sa aiba minimum 6 caractere.");
        }

        return password;
    }

    private static string NormalizeCode(string? value)
    {
        var code = NormalizeRequired(value, "Codul de acces este obligatoriu.");

        if (code.Length != 6 || code.Any(character => !char.IsDigit(character)))
        {
            throw new BusinessException(422, "Codul de acces trebuie sa contina 6 cifre.");
        }

        return code;
    }

    private static PasswordResetTicket GetValidPasswordResetTicket(string email, string code)
    {
        if (!PasswordResetTickets.TryGetValue(email, out var ticket) || ticket.Code != code)
        {
            throw new BusinessException(422, "Codul de acces este invalid.");
        }

        if (ticket.ExpiresAt < DateTimeOffset.UtcNow)
        {
            PasswordResetTickets.TryRemove(email, out _);
            throw new BusinessException(422, "Codul de acces a expirat. Solicita un cod nou.");
        }

        return ticket;
    }

    private static string NormalizeRequired(string? value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }

    private sealed record PasswordResetTicket(string Code, DateTimeOffset ExpiresAt, bool Verified);
}

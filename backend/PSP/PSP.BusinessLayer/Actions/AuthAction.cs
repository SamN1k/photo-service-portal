using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.DataAccessLayer;
using PSP.Domain.Entities;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Actions;

public class AuthAction(PhotoPortalDbContext db)
{
    private static readonly HashSet<string> Roles = new(StringComparer.OrdinalIgnoreCase)
    {
        "user",
        "photographer",
        "admin"
    };

    public async Task<AuthSessionDto> LoginAsync(LoginCredentialsDto credentials)
    {
        var email = NormalizeRequired(credentials.Email, "Emailul este obligatoriu.").ToLowerInvariant();
        var password = NormalizeRequired(credentials.Password, "Parola este obligatorie.");
        var user = await db.Users.FirstOrDefaultAsync(candidate => candidate.Email == email);

        if (user is null || user.Password != password)
        {
            throw new BusinessException(401, "Email sau parola invalida.");
        }

        if (user.Status == "suspended")
        {
            throw new BusinessException(403, "Contul este suspendat.");
        }

        user.LastLogin = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        return CreateSession(user);
    }

    public async Task<AuthSessionDto> SignUpAsync(SignUpPayloadDto payload)
    {
        var fullName = NormalizeRequired(payload.FullName, "Numele este obligatoriu.");
        var email = NormalizeRequired(payload.Email, "Emailul este obligatoriu.").ToLowerInvariant();
        var password = NormalizeRequired(payload.Password, "Parola este obligatorie.");
        var role = NormalizeRole(payload.Role);

        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            throw new BusinessException(409, "Exista deja un cont cu acest email.");
        }

        var user = new UserEntity
        {
            Id = $"{role}-{Guid.NewGuid():N}"[..18],
            FullName = fullName,
            Email = email,
            Password = password,
            Role = role,
            Status = role == "photographer" ? "pending" : "active",
            CreatedAt = DateTimeOffset.UtcNow,
            TotalBookings = 0,
            RevenueEur = 0,
            LastLogin = DateTimeOffset.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreateSession(user);
    }

    public async Task<IReadOnlyList<DemoAccountDto>> GetDemoAccountsAsync()
    {
        return await db.Users
            .AsNoTracking()
            .Where(user => user.Status == "active")
            .OrderBy(user => user.CreatedAt)
            .Take(3)
            .Select(user => new DemoAccountDto(user.Email, user.Password, user.Role, user.FullName))
            .ToListAsync();
    }

    private static AuthSessionDto CreateSession(UserEntity user)
    {
        return new AuthSessionDto(
            $"api-token-{user.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
            DtoMapper.ToDto(user),
            DateTimeOffset.UtcNow);
    }

    private static string NormalizeRole(string? value)
    {
        var normalized = NormalizeRequired(value, "Rolul este obligatoriu.").ToLowerInvariant();

        if (!Roles.Contains(normalized))
        {
            throw new BusinessException(422, "Rolul este invalid.");
        }

        return normalized;
    }

    private static string NormalizeRequired(string? value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }
}

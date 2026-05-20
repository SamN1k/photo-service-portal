using PSP.BusinessLayer.Core;
using PSP.Domain.Models;
using PSP.Domain.Entities;

namespace PSP.BusinessLayer.Actions;

public class AuthAction(InMemoryDataStore store)
{
    private static readonly HashSet<string> Roles = new(StringComparer.OrdinalIgnoreCase)
    {
        "user",
        "photographer",
        "admin"
    };

    public AuthSessionDto Login(LoginCredentialsDto credentials)
    {
        var email = NormalizeRequired(credentials.Email, "Emailul este obligatoriu.").ToLowerInvariant();
        var password = NormalizeRequired(credentials.Password, "Parola este obligatorie.");

        lock (store.SyncRoot)
        {
            var user = store.Users.FirstOrDefault(candidate => string.Equals(candidate.Email, email, StringComparison.OrdinalIgnoreCase));

            if (user is null || user.Password != password)
            {
                throw new BusinessException(401, "Email sau parola invalida.");
            }

            if (user.Status == "suspended")
            {
                throw new BusinessException(403, "Contul este suspendat.");
            }

            user.LastLogin = DateTimeOffset.UtcNow;
            return CreateSession(user);
        }
    }

    public AuthSessionDto SignUp(SignUpPayloadDto payload)
    {
        var fullName = NormalizeRequired(payload.FullName, "Numele este obligatoriu.");
        var email = NormalizeRequired(payload.Email, "Emailul este obligatoriu.").ToLowerInvariant();
        var password = NormalizeRequired(payload.Password, "Parola este obligatorie.");
        var role = NormalizeRole(payload.Role);

        lock (store.SyncRoot)
        {
            if (store.Users.Any(user => string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase)))
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

            store.Users.Insert(0, user);
            return CreateSession(user);
        }
    }

    public IReadOnlyList<DemoAccountDto> GetDemoAccounts()
    {
        lock (store.SyncRoot)
        {
            return store.Users
                .Where(user => user.Status == "active")
                .Take(3)
                .Select(user => new DemoAccountDto(user.Email, user.Password, user.Role, user.FullName))
                .ToList();
        }
    }

    private static AuthSessionDto CreateSession(UserEntity user)
    {
        return new AuthSessionDto(
            $"api-token-{user.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
            DtoMapper.ToDto(user),
            DateTimeOffset.UtcNow);
    }

    private static string NormalizeRole(string value)
    {
        var normalized = NormalizeRequired(value, "Rolul este obligatoriu.").ToLowerInvariant();

        if (!Roles.Contains(normalized))
        {
            throw new BusinessException(422, "Rolul este invalid.");
        }

        return normalized;
    }

    private static string NormalizeRequired(string value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }
}

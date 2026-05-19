using PSP.BusinessLayer.Core;
using PSP.Domain.Models;
using PSP.Domain.Entities;

namespace PSP.BusinessLayer.Actions;

public class UserAction(InMemoryDataStore store)
{
    private static readonly HashSet<string> Roles = new(StringComparer.OrdinalIgnoreCase)
    {
        "user",
        "photographer",
        "admin"
    };

    private static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "active",
        "pending",
        "suspended"
    };

    public PaginatedResultDto<UserDto> ListUsers(UserListQueryDto query)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru utilizatori a esuat.");
        }

        lock (store.SyncRoot)
        {
            IEnumerable<UserEntity> users = store.Users;
            var search = query.Query?.Trim().ToLowerInvariant() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(query.Role) && !IsAll(query.Role))
            {
                users = users.Where(user => string.Equals(user.Role, query.Role, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
            {
                users = users.Where(user => string.Equals(user.Status, query.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                users = users.Where(user =>
                    $"{user.FullName} {user.Email} {user.Role}".ToLowerInvariant().Contains(search));
            }

            users = SortUsers(users, query.SortBy ?? "newest");
            return Pagination.From(users.Select(DtoMapper.ToDto).ToList(), query.Page, query.PageSize);
        }
    }

    public UserDto CreateUser(UserInputDto input)
    {
        var fullName = NormalizeRequired(input.FullName, "Numele utilizatorului este obligatoriu.");
        var email = NormalizeEmail(input.Email);
        var role = NormalizeAllowed(input.Role, Roles, "Rolul utilizatorului este invalid.");
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul utilizatorului este invalid.");

        lock (store.SyncRoot)
        {
            if (store.Users.Any(user => string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase)))
            {
                throw new BusinessException(409, "Exista deja un utilizator cu acest email.");
            }

            var user = new UserEntity
            {
                Id = $"{role}-{Guid.NewGuid():N}"[..18],
                FullName = fullName,
                Email = email,
                Password = string.IsNullOrWhiteSpace(input.Password) ? "demo1234" : input.Password.Trim(),
                Role = role,
                Status = status,
                CreatedAt = DateTimeOffset.UtcNow,
                TotalBookings = 0,
                RevenueEur = 0
            };

            store.Users.Insert(0, user);
            return DtoMapper.ToDto(user);
        }
    }

    public UserDto UpdateUser(string userId, UserInputDto input)
    {
        var fullName = NormalizeRequired(input.FullName, "Numele utilizatorului este obligatoriu.");
        var email = NormalizeEmail(input.Email);
        var role = NormalizeAllowed(input.Role, Roles, "Rolul utilizatorului este invalid.");
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul utilizatorului este invalid.");

        lock (store.SyncRoot)
        {
            var user = store.Users.FirstOrDefault(candidate => candidate.Id == userId)
                ?? throw new BusinessException(404, "Utilizatorul nu exista.");

            var emailIsUsed = store.Users.Any(candidate =>
                candidate.Id != userId && string.Equals(candidate.Email, email, StringComparison.OrdinalIgnoreCase));

            if (emailIsUsed)
            {
                throw new BusinessException(409, "Emailul este deja folosit de alt utilizator.");
            }

            user.FullName = fullName;
            user.Email = email;
            user.Role = role;
            user.Status = status;

            if (!string.IsNullOrWhiteSpace(input.Password))
            {
                user.Password = input.Password.Trim();
            }

            return DtoMapper.ToDto(user);
        }
    }

    public void DeleteUser(string userId)
    {
        lock (store.SyncRoot)
        {
            var user = store.Users.FirstOrDefault(candidate => candidate.Id == userId)
                ?? throw new BusinessException(404, "Utilizatorul nu exista.");

            store.Users.Remove(user);
        }
    }

    private static IOrderedEnumerable<UserEntity> SortUsers(IEnumerable<UserEntity> users, string sortBy)
    {
        return sortBy switch
        {
            "nameAsc" => users.OrderBy(user => user.FullName),
            "revenueDesc" => users.OrderByDescending(user => user.RevenueEur),
            "bookingsDesc" => users.OrderByDescending(user => user.TotalBookings),
            _ => users.OrderByDescending(user => user.CreatedAt)
        };
    }

    private static bool IsAll(string value)
    {
        return string.Equals(value, "all", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeEmail(string email)
    {
        var normalized = NormalizeRequired(email, "Emailul este obligatoriu.").ToLowerInvariant();

        if (!normalized.Contains('@', StringComparison.Ordinal) || !normalized.Contains('.', StringComparison.Ordinal))
        {
            throw new BusinessException(422, "Emailul nu are un format valid.");
        }

        return normalized;
    }

    private static string NormalizeAllowed(string value, HashSet<string> allowedValues, string errorMessage)
    {
        var normalized = NormalizeRequired(value, errorMessage).ToLowerInvariant();

        if (!allowedValues.Contains(normalized))
        {
            throw new BusinessException(422, errorMessage);
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

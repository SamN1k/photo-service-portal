using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer.Context;
using PSP.Domain.Entities;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Structure;

public class UserAction(PhotoPortalDbContext db, IPasswordHasher passwordHasher)
{
    private const int MaxPortfolioGalleryImages = 12;

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

    public async Task<PaginatedResultDto<UserDto>> ListUsersAsync(UserListQueryDto query)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru utilizatori a esuat.");
        }

        IQueryable<UserEntity> users = db.Users.AsNoTracking();
        var search = query.Query?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(query.Role) && !IsAll(query.Role))
        {
            var role = query.Role.Trim().ToLowerInvariant();
            users = users.Where(user => user.Role == role);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
        {
            var status = query.Status.Trim().ToLowerInvariant();
            users = users.Where(user => user.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            users = users.Where(user =>
                EF.Functions.ILike(user.FullName, pattern) ||
                EF.Functions.ILike(user.Email, pattern) ||
                EF.Functions.ILike(user.Role, pattern));
        }

        users = SortUsers(users, query.SortBy ?? "newest");
        return await Pagination.FromQueryAsync(users, query.Page, query.PageSize, DtoMapper.ToDto);
    }

    public async Task<UserDto> CreateUserAsync(UserInputDto input)
    {
        var fullName = NormalizeRequired(input.FullName, "Numele utilizatorului este obligatoriu.");
        var email = NormalizeEmail(input.Email);
        var role = NormalizeAllowed(input.Role, Roles, "Rolul utilizatorului este invalid.");
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul utilizatorului este invalid.");

        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            throw new BusinessException(409, "Exista deja un utilizator cu acest email.");
        }

        var user = new UserEntity
        {
            Id = $"{role}-{Guid.NewGuid():N}"[..18],
            FullName = fullName,
            Email = email,
            Password = passwordHasher.Hash(string.IsNullOrWhiteSpace(input.Password) ? "demo1234" : input.Password.Trim()),
            Role = role,
            Status = status,
            CreatedAt = DateTimeOffset.UtcNow,
            TotalBookings = 0,
            RevenueEur = 0
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return DtoMapper.ToDto(user);
    }

    public async Task<UserDto> UpdateUserAsync(string userId, UserInputDto input)
    {
        var fullName = NormalizeRequired(input.FullName, "Numele utilizatorului este obligatoriu.");
        var email = NormalizeEmail(input.Email);
        var role = NormalizeAllowed(input.Role, Roles, "Rolul utilizatorului este invalid.");
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul utilizatorului este invalid.");

        var user = await FindUserAsync(userId);
        var emailIsUsed = await db.Users.AnyAsync(candidate => candidate.Id != userId && candidate.Email == email);

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
            user.Password = passwordHasher.Hash(input.Password.Trim());
        }

        await db.SaveChangesAsync();

        return DtoMapper.ToDto(user);
    }

    public async Task<UserDto> UpdateAccountSettingsAsync(string userId, AccountSettingsInputDto input)
    {
        var fullName = NormalizeRequired(input.FullName, "Numele utilizatorului este obligatoriu.");
        var email = NormalizeEmail(input.Email);
        var currentPassword = NormalizeRequired(input.CurrentPassword, "Parola curenta este obligatorie.");
        var newPassword = input.NewPassword?.Trim();

        if (!string.IsNullOrWhiteSpace(newPassword) && newPassword.Length < 6)
        {
            throw new BusinessException(422, "Parola noua trebuie sa aiba minimum 6 caractere.");
        }

        var user = await FindUserAsync(userId);

        if (!passwordHasher.Verify(currentPassword, user.Password))
        {
            throw new BusinessException(403, "Parola curenta este invalida.");
        }

        var emailIsUsed = await db.Users.AnyAsync(candidate => candidate.Id != userId && candidate.Email == email);

        if (emailIsUsed)
        {
            throw new BusinessException(409, "Emailul este deja folosit de alt utilizator.");
        }

        user.FullName = fullName;
        user.Email = email;

        if (!string.IsNullOrWhiteSpace(newPassword))
        {
            user.Password = passwordHasher.Hash(newPassword);
        }

        await db.SaveChangesAsync();

        return DtoMapper.ToDto(user);
    }

    public async Task<PhotographerPortfolioDto> GetPhotographerPortfolioAsync(string photographerId)
    {
        var photographer = await FindPhotographerAsync(photographerId);
        return DtoMapper.ToPortfolioDto(photographer);
    }

    public async Task<PhotographerPortfolioDto> UpdatePhotographerPortfolioAsync(string photographerId, PhotographerPortfolioInputDto input)
    {
        var photographer = await FindPhotographerAsync(photographerId);
        var fullName = NormalizeRequired(input.FullName, "Numele fotografului este obligatoriu.");
        var email = NormalizeEmail(input.Email);
        var emailIsUsed = await db.Users.AnyAsync(candidate => candidate.Id != photographerId && candidate.Email == email);

        if (emailIsUsed)
        {
            throw new BusinessException(409, "Emailul este deja folosit de alt utilizator.");
        }

        photographer.FullName = fullName;
        photographer.Email = email;
        photographer.PhoneNumber = NormalizeOptional(input.PhoneNumber, 64, "Numarul de telefon este prea lung.");
        photographer.ProfileImageUrl = NormalizeOptional(input.ProfileImageUrl);
        photographer.PortfolioDescription = NormalizeOptional(input.Description, 4000, "Descrierea portofoliului este prea lunga.");
        photographer.PortfolioGalleryImageUrls = NormalizeGallery(input.GalleryImageUrls);

        await db.SaveChangesAsync();

        return DtoMapper.ToPortfolioDto(photographer);
    }

    public async Task DeleteUserAsync(string userId)
    {
        var user = await FindUserAsync(userId);
        var relatedBookings = await db.Bookings
            .Where(booking => booking.ClientId == userId || booking.PhotographerId == userId)
            .ToListAsync();
        var relatedOffers = await db.Offers
            .Where(offer => offer.PhotographerId == userId)
            .ToListAsync();

        db.Bookings.RemoveRange(relatedBookings);
        db.Offers.RemoveRange(relatedOffers);
        db.Users.Remove(user);

        await db.SaveChangesAsync();
    }

    private async Task<UserEntity> FindUserAsync(string userId)
    {
        return await db.Users.FirstOrDefaultAsync(candidate => candidate.Id == userId)
            ?? throw new BusinessException(404, "Utilizatorul nu exista.");
    }

    private async Task<UserEntity> FindPhotographerAsync(string photographerId)
    {
        var user = await FindUserAsync(photographerId);

        if (!string.Equals(user.Role, "photographer", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(404, "Portofoliul fotografului nu exista.");
        }

        return user;
    }

    private static IOrderedQueryable<UserEntity> SortUsers(IQueryable<UserEntity> users, string sortBy)
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

    private static string NormalizeEmail(string? email)
    {
        var normalized = NormalizeRequired(email, "Emailul este obligatoriu.").ToLowerInvariant();

        if (!normalized.Contains('@', StringComparison.Ordinal) || !normalized.Contains('.', StringComparison.Ordinal))
        {
            throw new BusinessException(422, "Emailul nu are un format valid.");
        }

        return normalized;
    }

    private static string NormalizeAllowed(string? value, HashSet<string> allowedValues, string errorMessage)
    {
        var normalized = NormalizeRequired(value, errorMessage).ToLowerInvariant();

        if (!allowedValues.Contains(normalized))
        {
            throw new BusinessException(422, errorMessage);
        }

        return normalized;
    }

    private static string NormalizeOptional(string? value, int maxLength, string errorMessage)
    {
        var normalized = value?.Trim() ?? string.Empty;

        if (normalized.Length > maxLength)
        {
            throw new BusinessException(422, errorMessage);
        }

        return normalized;
    }

    private static string NormalizeOptional(string? value)
    {
        return value?.Trim() ?? string.Empty;
    }

    private static string NormalizeGallery(IReadOnlyList<string>? imageUrls)
    {
        var normalized = (imageUrls ?? [])
            .Select(imageUrl => imageUrl.Trim())
            .Where(imageUrl => !string.IsNullOrWhiteSpace(imageUrl))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(MaxPortfolioGalleryImages + 1)
            .ToList();

        if (normalized.Count > MaxPortfolioGalleryImages)
        {
            throw new BusinessException(422, $"Galeria poate contine maximum {MaxPortfolioGalleryImages} imagini.");
        }

        return string.Join('\n', normalized);
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

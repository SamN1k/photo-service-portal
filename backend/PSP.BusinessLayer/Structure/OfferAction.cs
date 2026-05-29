using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.DataAccessLayer.Context;
using PSP.Domain.Entities;
using PSP.Domain.Models.Common;
using PSP.Domain.Models.Offer;

namespace PSP.BusinessLayer.Structure;

public class OfferAction
{
    private const string DefaultCoverImageUrl = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80";
    private readonly PhotoPortalDbContext db;

    private static readonly HashSet<string> Categories = new(StringComparer.OrdinalIgnoreCase)
    {
        "wedding",
        "portrait",
        "event",
        "commercial"
    };

    private static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "active",
        "draft",
        "archived"
    };

    public OfferAction()
    {
        db = new PhotoPortalDbContext();
    }

    protected async Task<PaginatedResultDto<PhotoOfferDto>> ListOffersActionAsync(OfferListQueryDto query)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru oferte a esuat.");
        }

        IQueryable<PhotoOfferEntity> offers = db.Offers.AsNoTracking();
        var search = query.Query?.Trim() ?? string.Empty;

        if (query.PublicOnly)
        {
            offers = offers.Where(offer => offer.Status == "active");
        }

        if (!string.IsNullOrWhiteSpace(query.PhotographerId))
        {
            var photographerId = query.PhotographerId.Trim();
            offers = offers.Where(offer => offer.PhotographerId == photographerId);
        }

        if (!string.IsNullOrWhiteSpace(query.Category) && !IsAll(query.Category))
        {
            var category = query.Category.Trim().ToLowerInvariant();
            offers = offers.Where(offer => offer.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
        {
            var status = query.Status.Trim().ToLowerInvariant();
            offers = offers.Where(offer => offer.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            var categoryAliases = ResolveCategoryAliases(search);

            offers = offers.Where(offer =>
                EF.Functions.ILike(offer.Title, pattern) ||
                EF.Functions.ILike(offer.Description, pattern) ||
                EF.Functions.ILike(offer.Location, pattern) ||
                EF.Functions.ILike(offer.PhotographerName, pattern) ||
                EF.Functions.ILike(offer.Category, pattern) ||
                categoryAliases.Contains(offer.Category));
        }

        offers = SortOffers(offers, query.SortBy ?? "newest");
        return await Pagination.FromQueryAsync(offers, query.Page, query.PageSize, DtoMapper.ToDto);
    }

    protected async Task<PhotoOfferDto> GetOfferActionAsync(string offerId)
    {
        var offer = await db.Offers.AsNoTracking().FirstOrDefaultAsync(candidate => candidate.Id == offerId)
            ?? throw new BusinessException(404, "Oferta nu exista.");

        return DtoMapper.ToDto(offer);
    }

    protected async Task<PhotoOfferDto> CreateOfferActionAsync(CreateOfferDto input)
    {
        var normalizedInput = NormalizeInput(new OfferInputDto(
            input.Title,
            input.Description,
            input.Category,
            input.Location,
            input.PriceEur,
            input.DurationHours,
            input.Status,
            input.CoverImageUrl));
        var photographerId = NormalizeRequired(input.PhotographerId, "Fotograful este obligatoriu.");
        var photographerName = NormalizeRequired(input.PhotographerName, "Numele fotografului este obligatoriu.");
        var photographer = await db.Users.FirstOrDefaultAsync(user => user.Id == photographerId)
            ?? throw new BusinessException(404, "Fotograful nu exista.");
        var now = DateTimeOffset.UtcNow;

        var offer = new PhotoOfferEntity
        {
            Id = $"offer-{Guid.NewGuid():N}"[..18],
            Title = normalizedInput.Title,
            Description = normalizedInput.Description,
            Category = normalizedInput.Category,
            Location = normalizedInput.Location,
            PriceEur = normalizedInput.PriceEur,
            DurationHours = normalizedInput.DurationHours,
            PhotographerId = photographerId,
            PhotographerName = string.IsNullOrWhiteSpace(photographer.FullName) ? photographerName : photographer.FullName,
            Status = normalizedInput.Status,
            Rating = 4.5m,
            CoverImageUrl = NormalizeCoverImageUrl(normalizedInput.CoverImageUrl, DefaultCoverImageUrl),
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Offers.Add(offer);
        await db.SaveChangesAsync();

        return DtoMapper.ToDto(offer);
    }

    protected async Task<PhotoOfferDto> UpdateOfferActionAsync(string offerId, OfferInputDto input)
    {
        var normalizedInput = NormalizeInput(input);
        var offer = await FindOfferAsync(offerId);

        offer.Title = normalizedInput.Title;
        offer.Description = normalizedInput.Description;
        offer.Category = normalizedInput.Category;
        offer.Location = normalizedInput.Location;
        offer.PriceEur = normalizedInput.PriceEur;
        offer.DurationHours = normalizedInput.DurationHours;
        offer.Status = normalizedInput.Status;
        offer.CoverImageUrl = NormalizeCoverImageUrl(normalizedInput.CoverImageUrl, offer.CoverImageUrl);
        offer.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        return DtoMapper.ToDto(offer);
    }

    protected async Task DeleteOfferActionAsync(string offerId)
    {
        var offer = await FindOfferAsync(offerId);

        db.Offers.Remove(offer);
        await db.SaveChangesAsync();
    }

    private async Task<PhotoOfferEntity> FindOfferAsync(string offerId)
    {
        return await db.Offers.FirstOrDefaultAsync(candidate => candidate.Id == offerId)
            ?? throw new BusinessException(404, "Oferta nu exista.");
    }

    private static IOrderedQueryable<PhotoOfferEntity> SortOffers(IQueryable<PhotoOfferEntity> offers, string sortBy)
    {
        return sortBy switch
        {
            "priceAsc" => offers.OrderBy(offer => offer.PriceEur).ThenBy(offer => offer.Title),
            "priceDesc" => offers.OrderByDescending(offer => offer.PriceEur).ThenBy(offer => offer.Title),
            "ratingDesc" => offers.OrderByDescending(offer => offer.Rating).ThenBy(offer => offer.Title),
            "titleAsc" => offers.OrderBy(offer => offer.Title),
            _ => offers.OrderByDescending(offer => offer.CreatedAt).ThenBy(offer => offer.Title)
        };
    }

    private static IReadOnlyList<string> ResolveCategoryAliases(string search)
    {
        var normalized = search.Trim().ToLowerInvariant();
        var aliases = new List<string>();

        AddAlias(aliases, normalized, "wedding", "nunta");
        AddAlias(aliases, normalized, "portrait", "portret");
        AddAlias(aliases, normalized, "event", "eveniment");
        AddAlias(aliases, normalized, "commercial", "comercial");

        return aliases;
    }

    private static void AddAlias(List<string> aliases, string search, string category, string label)
    {
        if (category.Contains(search, StringComparison.OrdinalIgnoreCase) ||
            label.Contains(search, StringComparison.OrdinalIgnoreCase) ||
            search.Contains(label, StringComparison.OrdinalIgnoreCase))
        {
            aliases.Add(category);
        }
    }

    private static OfferInputDto NormalizeInput(OfferInputDto input)
    {
        var title = NormalizeRequired(input.Title, "Titlul ofertei este obligatoriu.");
        var description = NormalizeRequired(input.Description, "Descrierea ofertei este obligatorie.");
        var category = NormalizeAllowed(input.Category, Categories, "Categoria ofertei este invalida.");
        var location = NormalizeRequired(input.Location, "Locatia ofertei este obligatorie.");
        var status = NormalizeAllowed(input.Status, Statuses, "Statusul ofertei este invalid.");

        if (input.PriceEur <= 0)
        {
            throw new BusinessException(422, "Pretul ofertei trebuie sa fie pozitiv.");
        }

        if (input.DurationHours <= 0)
        {
            throw new BusinessException(422, "Durata ofertei trebuie sa fie pozitiva.");
        }

        var coverImageUrl = input.CoverImageUrl?.Trim();

        return new OfferInputDto(title, description, category, location, input.PriceEur, input.DurationHours, status, coverImageUrl);
    }

    private static bool IsAll(string value)
    {
        return string.Equals(value, "all", StringComparison.OrdinalIgnoreCase);
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

    private static string NormalizeRequired(string? value, string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(422, errorMessage);
        }

        return value.Trim();
    }

    private static string NormalizeCoverImageUrl(string? coverImageUrl, string fallback)
    {
        return string.IsNullOrWhiteSpace(coverImageUrl) ? fallback : coverImageUrl.Trim();
    }
}

using PSP.BusinessLayer.Core;
using PSP.Domain.Models;
using PSP.Domain.Entities;

namespace PSP.BusinessLayer.Actions;

public class OfferAction(InMemoryDataStore store)
{
    private const string DefaultCoverImageUrl = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80";

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

    public PaginatedResultDto<PhotoOfferDto> ListOffers(OfferListQueryDto query)
    {
        if (query.ForceError || string.Equals(query.Query?.Trim(), "eroare", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(500, "Serviciul API pentru oferte a esuat.");
        }

        lock (store.SyncRoot)
        {
            IEnumerable<PhotoOfferEntity> offers = store.Offers;
            var search = query.Query?.Trim().ToLowerInvariant() ?? string.Empty;

            if (query.PublicOnly)
            {
                offers = offers.Where(offer => offer.Status == "active");
            }

            if (!string.IsNullOrWhiteSpace(query.PhotographerId))
            {
                offers = offers.Where(offer => offer.PhotographerId == query.PhotographerId);
            }

            if (!string.IsNullOrWhiteSpace(query.Category) && !IsAll(query.Category))
            {
                offers = offers.Where(offer => string.Equals(offer.Category, query.Category, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(query.Status) && !IsAll(query.Status))
            {
                offers = offers.Where(offer => string.Equals(offer.Status, query.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                offers = offers.Where(offer =>
                    $"{offer.Title} {offer.Description} {offer.Location} {offer.PhotographerName}".ToLowerInvariant().Contains(search));
            }

            offers = SortOffers(offers, query.SortBy ?? "newest");
            return Pagination.From(offers.Select(DtoMapper.ToDto).ToList(), query.Page, query.PageSize);
        }
    }

    public PhotoOfferDto GetOffer(string offerId)
    {
        lock (store.SyncRoot)
        {
            var offer = FindOffer(offerId);
            return DtoMapper.ToDto(offer);
        }
    }

    public PhotoOfferDto CreateOffer(CreateOfferDto input)
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
        var now = DateTimeOffset.UtcNow;

        lock (store.SyncRoot)
        {
            var photographer = store.Users.FirstOrDefault(user => user.Id == photographerId)
                ?? throw new BusinessException(404, "Fotograful nu exista.");

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

            store.Offers.Insert(0, offer);
            return DtoMapper.ToDto(offer);
        }
    }

    public PhotoOfferDto UpdateOffer(string offerId, OfferInputDto input)
    {
        var normalizedInput = NormalizeInput(input);

        lock (store.SyncRoot)
        {
            var offer = FindOffer(offerId);
            offer.Title = normalizedInput.Title;
            offer.Description = normalizedInput.Description;
            offer.Category = normalizedInput.Category;
            offer.Location = normalizedInput.Location;
            offer.PriceEur = normalizedInput.PriceEur;
            offer.DurationHours = normalizedInput.DurationHours;
            offer.Status = normalizedInput.Status;
            offer.CoverImageUrl = NormalizeCoverImageUrl(normalizedInput.CoverImageUrl, offer.CoverImageUrl);
            offer.UpdatedAt = DateTimeOffset.UtcNow;

            return DtoMapper.ToDto(offer);
        }
    }

    public void DeleteOffer(string offerId)
    {
        lock (store.SyncRoot)
        {
            var offer = FindOffer(offerId);
            store.Offers.Remove(offer);
        }
    }

    private PhotoOfferEntity FindOffer(string offerId)
    {
        return store.Offers.FirstOrDefault(candidate => candidate.Id == offerId)
            ?? throw new BusinessException(404, "Oferta nu exista.");
    }

    private static IOrderedEnumerable<PhotoOfferEntity> SortOffers(IEnumerable<PhotoOfferEntity> offers, string sortBy)
    {
        return sortBy switch
        {
            "priceAsc" => offers.OrderBy(offer => offer.PriceEur),
            "priceDesc" => offers.OrderByDescending(offer => offer.PriceEur),
            "ratingDesc" => offers.OrderByDescending(offer => offer.Rating),
            "titleAsc" => offers.OrderBy(offer => offer.Title),
            _ => offers.OrderByDescending(offer => offer.CreatedAt)
        };
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

    private static string NormalizeCoverImageUrl(string? coverImageUrl, string fallback)
    {
        return string.IsNullOrWhiteSpace(coverImageUrl) ? fallback : coverImageUrl.Trim();
    }
}

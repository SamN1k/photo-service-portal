using System.Globalization;
using Microsoft.EntityFrameworkCore;
using PSP.Domain.Entities;

namespace PSP.DataAccessLayer.Context;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(PhotoPortalDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return;
        }

        context.Users.AddRange(SeedUsers());
        context.Offers.AddRange(SeedOffers());
        context.Bookings.AddRange(SeedBookings());

        await context.SaveChangesAsync();
    }

    private static List<UserEntity> SeedUsers()
    {
        return
        [
            new UserEntity
            {
                Id = "user-001",
                FullName = "Maria Popescu",
                Email = "user@demo.local",
                Password = "demo1234",
                Role = "user",
                Status = "active",
                PhoneNumber = "",
                ProfileImageUrl = "",
                PortfolioDescription = "",
                PortfolioGalleryImageUrls = "",
                CreatedAt = Utc("2026-01-12T10:00:00.000Z"),
                TotalBookings = 3,
                RevenueEur = 0,
                LastLogin = Utc("2026-05-05T08:25:00.000Z")
            },
            new UserEntity
            {
                Id = "photo-001",
                FullName = "Radu Ionescu",
                Email = "photographer@demo.local",
                Password = "demo1234",
                Role = "photographer",
                Status = "active",
                PhoneNumber = "+373 69 145 802",
                ProfileImageUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
                PortfolioDescription = "Fotograf de eveniment cu accent pe cadre naturale, lumina calda si editare editoriala. Lucrez cu nunti, cununii civile, portrete business si evenimente corporate.",
                PortfolioGalleryImageUrls = string.Join('\n',
                    [
                        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
                        "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
                        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
                        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"
                    ]),
                CreatedAt = Utc("2026-01-04T09:10:00.000Z"),
                TotalBookings = 18,
                RevenueEur = 6150,
                LastLogin = Utc("2026-05-07T11:30:00.000Z")
            },
            new UserEntity
            {
                Id = "admin-001",
                FullName = "Ioana Avram",
                Email = "admin@demo.local",
                Password = "demo1234",
                Role = "admin",
                Status = "active",
                PhoneNumber = "",
                ProfileImageUrl = "",
                PortfolioDescription = "",
                PortfolioGalleryImageUrls = "",
                CreatedAt = Utc("2025-12-10T08:45:00.000Z"),
                TotalBookings = 0,
                RevenueEur = 0,
                LastLogin = Utc("2026-05-08T07:55:00.000Z")
            },
            new UserEntity
            {
                Id = "user-002",
                FullName = "Victor Mihai",
                Email = "victor@demo.local",
                Password = "demo1234",
                Role = "user",
                Status = "suspended",
                PhoneNumber = "",
                ProfileImageUrl = "",
                PortfolioDescription = "",
                PortfolioGalleryImageUrls = "",
                CreatedAt = Utc("2026-02-14T12:30:00.000Z"),
                TotalBookings = 1,
                RevenueEur = 0,
                LastLogin = Utc("2026-04-20T14:05:00.000Z")
            },
            new UserEntity
            {
                Id = "photo-002",
                FullName = "Elena Stan",
                Email = "elena@demo.local",
                Password = "demo1234",
                Role = "photographer",
                Status = "pending",
                PhoneNumber = "+40 744 332 118",
                ProfileImageUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
                PortfolioDescription = "Fotograf de familie si evenimente restranse. Imi place sa surprind expresii sincere, detalii de decor si fotografii luminoase pentru albume personale.",
                PortfolioGalleryImageUrls = string.Join('\n',
                    [
                        "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
                        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80"
                    ]),
                CreatedAt = Utc("2026-03-01T14:05:00.000Z"),
                TotalBookings = 2,
                RevenueEur = 900
            }
        ];
    }

    private static List<PhotoOfferEntity> SeedOffers()
    {
        return
        [
            new PhotoOfferEntity
            {
                Id = "offer-001",
                Title = "Nunta editoriala",
                Description = "Acoperire foto pentru nunta, selectie color grading si galerie online privata.",
                Category = "wedding",
                Location = "Chisinau",
                PriceEur = 780,
                DurationHours = 8,
                PhotographerId = "photo-001",
                PhotographerName = "Radu Ionescu",
                Status = "active",
                Rating = 4.9m,
                CoverImageUrl = "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
                CreatedAt = Utc("2026-02-01T08:00:00.000Z"),
                UpdatedAt = Utc("2026-05-01T08:00:00.000Z")
            },
            new PhotoOfferEntity
            {
                Id = "offer-002",
                Title = "Portret business",
                Description = "Sesiune rapida pentru profil profesional, LinkedIn, CV sau website personal.",
                Category = "portrait",
                Location = "Bucuresti",
                PriceEur = 180,
                DurationHours = 2,
                PhotographerId = "photo-001",
                PhotographerName = "Radu Ionescu",
                Status = "active",
                Rating = 4.7m,
                CoverImageUrl = "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
                CreatedAt = Utc("2026-02-12T09:30:00.000Z"),
                UpdatedAt = Utc("2026-04-26T09:30:00.000Z")
            },
            new PhotoOfferEntity
            {
                Id = "offer-003",
                Title = "Eveniment corporate",
                Description = "Fotografiere conferinte, lansari de produs si evenimente interne pentru companii.",
                Category = "commercial",
                Location = "Cluj-Napoca",
                PriceEur = 520,
                DurationHours = 5,
                PhotographerId = "photo-001",
                PhotographerName = "Radu Ionescu",
                Status = "active",
                Rating = 4.8m,
                CoverImageUrl = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
                CreatedAt = Utc("2026-03-02T10:15:00.000Z"),
                UpdatedAt = Utc("2026-04-12T10:15:00.000Z")
            },
            new PhotoOfferEntity
            {
                Id = "offer-004",
                Title = "Botez si familie",
                Description = "Fotografii naturale pentru botez, familie si momente intime de weekend.",
                Category = "event",
                Location = "Iasi",
                PriceEur = 360,
                DurationHours = 4,
                PhotographerId = "photo-002",
                PhotographerName = "Elena Stan",
                Status = "active",
                Rating = 4.6m,
                CoverImageUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
                CreatedAt = Utc("2026-03-11T13:00:00.000Z"),
                UpdatedAt = Utc("2026-04-18T13:00:00.000Z")
            },
            new PhotoOfferEntity
            {
                Id = "offer-005",
                Title = "Campanie produs",
                Description = "Set de fotografii pentru ecommerce si social media, cu styling de produs inclus.",
                Category = "commercial",
                Location = "Timisoara",
                PriceEur = 450,
                DurationHours = 3,
                PhotographerId = "photo-002",
                PhotographerName = "Elena Stan",
                Status = "draft",
                Rating = 4.5m,
                CoverImageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
                CreatedAt = Utc("2026-04-02T16:20:00.000Z"),
                UpdatedAt = Utc("2026-04-15T16:20:00.000Z")
            }
        ];
    }

    private static List<BookingEntity> SeedBookings()
    {
        return
        [
            new BookingEntity
            {
                Id = "booking-001",
                ClientId = "user-001",
                ClientName = "Maria Popescu",
                OfferId = "offer-001",
                OfferTitle = "Nunta editoriala",
                PhotographerId = "photo-001",
                PhotographerName = "Radu Ionescu",
                EventDate = "2026-06-18",
                Location = "Chisinau",
                BudgetEur = 800,
                Notes = "Cununie civila si petrecere seara.",
                Status = "confirmed",
                CreatedAt = Utc("2026-04-20T10:00:00.000Z"),
                UpdatedAt = Utc("2026-04-25T10:00:00.000Z")
            },
            new BookingEntity
            {
                Id = "booking-002",
                ClientId = "user-001",
                ClientName = "Maria Popescu",
                OfferId = "offer-002",
                OfferTitle = "Portret business",
                PhotographerId = "photo-001",
                PhotographerName = "Radu Ionescu",
                EventDate = "2026-05-28",
                Location = "Bucuresti",
                BudgetEur = 200,
                Notes = "Am nevoie de 5 cadre finale pentru profil.",
                Status = "pending",
                CreatedAt = Utc("2026-05-03T09:00:00.000Z"),
                UpdatedAt = Utc("2026-05-03T09:00:00.000Z")
            },
            new BookingEntity
            {
                Id = "booking-003",
                ClientId = "user-001",
                ClientName = "Maria Popescu",
                OfferId = "offer-004",
                OfferTitle = "Botez si familie",
                PhotographerId = "photo-002",
                PhotographerName = "Elena Stan",
                EventDate = "2026-06-02",
                Location = "Iasi",
                BudgetEur = 360,
                Notes = "Eveniment mic, aproximativ 30 invitati.",
                Status = "rejected",
                CreatedAt = Utc("2026-04-19T17:00:00.000Z"),
                UpdatedAt = Utc("2026-04-23T17:00:00.000Z")
            }
        ];
    }

    private static DateTimeOffset Utc(string value)
    {
        return DateTimeOffset.Parse(value, CultureInfo.InvariantCulture).ToUniversalTime();
    }
}

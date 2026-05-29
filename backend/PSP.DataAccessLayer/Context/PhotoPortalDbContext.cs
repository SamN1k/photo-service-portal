using Microsoft.EntityFrameworkCore;
using PSP.DataAccessLayer;
using PSP.Domain.Entities;

namespace PSP.DataAccessLayer.Context;

public sealed class PhotoPortalDbContext : DbContext
{
    private const string DefaultConnectionString =
        "Host=localhost;Port=5432;Database=psp_photo_portal;Username=postgres;Password=12345678";

    public PhotoPortalDbContext()
    {
    }

    public PhotoPortalDbContext(DbContextOptions<PhotoPortalDbContext> options)
        : base(options)
    {
    }

    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<PhotoOfferEntity> Offers => Set<PhotoOfferEntity>();
    public DbSet<BookingEntity> Bookings => Set<BookingEntity>();
    public DbSet<ProblemReportEntity> ProblemReports => Set<ProblemReportEntity>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (optionsBuilder.IsConfigured)
        {
            return;
        }

        var connectionString = DbSession.ConnectionString
            ?? Environment.GetEnvironmentVariable("PSP_CONNECTION_STRING")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? DefaultConnectionString;

        optionsBuilder.UseNpgsql(
            connectionString,
            npgsql => npgsql.MigrationsAssembly(typeof(PhotoPortalDbContext).Assembly.FullName));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureUsers(modelBuilder);
        ConfigureOffers(modelBuilder);
        ConfigureBookings(modelBuilder);
        ConfigureProblemReports(modelBuilder);
    }

    private static void ConfigureUsers(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserEntity>();

        entity.ToTable("Users");
        entity.HasKey(user => user.Id);
        entity.Property(user => user.Id).HasMaxLength(64);
        entity.Property(user => user.FullName).HasMaxLength(160).IsRequired();
        entity.Property(user => user.Email).HasMaxLength(256).IsRequired();
        entity.Property(user => user.Password).HasMaxLength(256).IsRequired();
        entity.Property(user => user.Role).HasMaxLength(32).IsRequired();
        entity.Property(user => user.Status).HasMaxLength(32).IsRequired();
        entity.Property(user => user.PhoneNumber).HasMaxLength(64).IsRequired();
        entity.Property(user => user.ProfileImageUrl).IsRequired();
        entity.Property(user => user.PortfolioDescription).HasMaxLength(4000).IsRequired();
        entity.Property(user => user.PortfolioGalleryImageUrls).IsRequired();
        entity.Property(user => user.RevenueEur).HasPrecision(12, 2);

        entity.HasIndex(user => user.Email).IsUnique();
        entity.HasIndex(user => user.Role);
        entity.HasIndex(user => user.Status);
    }

    private static void ConfigureOffers(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<PhotoOfferEntity>();

        entity.ToTable("PhotoOffers");
        entity.HasKey(offer => offer.Id);
        entity.Property(offer => offer.Id).HasMaxLength(64);
        entity.Property(offer => offer.Title).HasMaxLength(160).IsRequired();
        entity.Property(offer => offer.Description).HasMaxLength(4000).IsRequired();
        entity.Property(offer => offer.Category).HasMaxLength(32).IsRequired();
        entity.Property(offer => offer.Location).HasMaxLength(160).IsRequired();
        entity.Property(offer => offer.PriceEur).HasPrecision(12, 2);
        entity.Property(offer => offer.PhotographerId).HasMaxLength(64).IsRequired();
        entity.Property(offer => offer.PhotographerName).HasMaxLength(160).IsRequired();
        entity.Property(offer => offer.Status).HasMaxLength(32).IsRequired();
        entity.Property(offer => offer.Rating).HasPrecision(3, 2);
        entity.Property(offer => offer.CoverImageUrl).IsRequired();

        entity.HasIndex(offer => offer.Category);
        entity.HasIndex(offer => offer.PhotographerId);
        entity.HasIndex(offer => offer.Status);

        entity
            .HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(offer => offer.PhotographerId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureBookings(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<BookingEntity>();

        entity.ToTable("Bookings");
        entity.HasKey(booking => booking.Id);
        entity.Property(booking => booking.Id).HasMaxLength(64);
        entity.Property(booking => booking.ClientId).HasMaxLength(64).IsRequired();
        entity.Property(booking => booking.ClientName).HasMaxLength(160).IsRequired();
        entity.Property(booking => booking.OfferId).HasMaxLength(64).IsRequired();
        entity.Property(booking => booking.OfferTitle).HasMaxLength(160).IsRequired();
        entity.Property(booking => booking.PhotographerId).HasMaxLength(64).IsRequired();
        entity.Property(booking => booking.PhotographerName).HasMaxLength(160).IsRequired();
        entity.Property(booking => booking.EventDate).HasMaxLength(10).IsRequired();
        entity.Property(booking => booking.Location).HasMaxLength(160).IsRequired();
        entity.Property(booking => booking.BudgetEur).HasPrecision(12, 2);
        entity.Property(booking => booking.Notes).HasMaxLength(4000).IsRequired();
        entity.Property(booking => booking.Status).HasMaxLength(32).IsRequired();

        entity.HasIndex(booking => booking.ClientId);
        entity.HasIndex(booking => booking.PhotographerId);
        entity.HasIndex(booking => booking.OfferId);
        entity.HasIndex(booking => booking.Status);

        entity
            .HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(booking => booking.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(booking => booking.PhotographerId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureProblemReports(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ProblemReportEntity>();

        entity.ToTable("ProblemReports");
        entity.HasKey(report => report.Id);
        entity.Property(report => report.Id).HasMaxLength(64);
        entity.Property(report => report.ReporterId).HasMaxLength(64).IsRequired();
        entity.Property(report => report.ReporterName).HasMaxLength(160).IsRequired();
        entity.Property(report => report.ReporterEmail).HasMaxLength(256).IsRequired();
        entity.Property(report => report.ReporterRole).HasMaxLength(32).IsRequired();
        entity.Property(report => report.Title).HasMaxLength(160).IsRequired();
        entity.Property(report => report.Description).HasMaxLength(4000).IsRequired();
        entity.Property(report => report.Status).HasMaxLength(32).IsRequired();

        entity.HasIndex(report => report.ReporterId);
        entity.HasIndex(report => report.ReporterRole);
        entity.HasIndex(report => report.Status);
        entity.HasIndex(report => report.CreatedAt);

        entity
            .HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(report => report.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

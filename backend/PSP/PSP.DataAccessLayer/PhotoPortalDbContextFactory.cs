using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PSP.DataAccessLayer;

public sealed class PhotoPortalDbContextFactory : IDesignTimeDbContextFactory<PhotoPortalDbContext>
{
    private const string DefaultConnectionString =
        "Host=localhost;Port=5432;Database=psp_photo_portal;Username=postgres;Password=12345678";

    public PhotoPortalDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("PSP_CONNECTION_STRING")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? DefaultConnectionString;

        var options = new DbContextOptionsBuilder<PhotoPortalDbContext>()
            .UseNpgsql(
                connectionString,
                npgsql => npgsql.MigrationsAssembly(typeof(PhotoPortalDbContext).Assembly.FullName))
            .Options;

        return new PhotoPortalDbContext(options);
    }
}

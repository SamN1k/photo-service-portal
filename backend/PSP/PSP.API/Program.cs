using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer.Context;
using PSP.Domain.Models;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "FrontendCorsPolicy";
var connectionString = Environment.GetEnvironmentVariable("PSP_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<PhotoPortalDbContext>(options =>
{
    options.UseNpgsql(
        connectionString,
        npgsql => npgsql.MigrationsAssembly(typeof(PhotoPortalDbContext).Assembly.FullName));
});

// Business Logic
builder.Services.AddSingleton<IPasswordResetEmailSender, PasswordResetEmailSender>();
builder.Services.AddScoped<IAuthLogic, AuthLogic>();
builder.Services.AddScoped<IUserLogic, UserLogic>();
builder.Services.AddScoped<IOfferLogic, OfferLogic>();
builder.Services.AddScoped<IBookingLogic, BookingLogic>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .SetIsOriginAllowed(IsAllowedFrontendOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

await InitializeDatabaseAsync(app);

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Middleware
app.UseCors(frontendCorsPolicy);

app.UseAuthorization();

// Global Exception Handler
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await context.Response.WriteAsJsonAsync(
            new ErrorResponseDto(
                500,
                "A aparut o eroare neasteptata pe server."
            )
        );
    }
});

app.MapControllers();

// Render / Docker support; local runs keep the launchSettings.json URL.
var port = Environment.GetEnvironmentVariable("PORT");

if (string.IsNullOrWhiteSpace(port))
{
    app.Run();
}
else
{
    app.Run($"http://0.0.0.0:{port}");
}

static bool IsAllowedFrontendOrigin(string origin)
{
    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
    {
        return false;
    }

    return uri.IsLoopback ||
        uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
        uri.Host.EndsWith(".ngrok-free.dev", StringComparison.OrdinalIgnoreCase);
}

static async Task InitializeDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<PhotoPortalDbContext>();

    await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db);
}

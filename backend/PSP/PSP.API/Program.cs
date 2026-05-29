using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
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
var jwtOptions = ReadJwtOptions(builder.Configuration);
ValidateJwtOptions(jwtOptions);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        JwtBearerDefaults.AuthenticationScheme,
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = JwtBearerDefaults.AuthenticationScheme,
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Introdu token-ul JWT in format Bearer."
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = JwtBearerDefaults.AuthenticationScheme
                    }
                },
                []
            }
        });
});

// Database
builder.Services.AddDbContext<PhotoPortalDbContext>(options =>
{
    options.UseNpgsql(
        connectionString,
        npgsql => npgsql.MigrationsAssembly(typeof(PhotoPortalDbContext).Assembly.FullName));
});

// Business Logic
builder.Services.AddSingleton(jwtOptions);
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddSingleton<IPasswordResetEmailSender, PasswordResetEmailSender>();
builder.Services.AddScoped<IAuthLogic, AuthLogic>();
builder.Services.AddScoped<IUserLogic, UserLogic>();
builder.Services.AddScoped<IOfferLogic, OfferLogic>();
builder.Services.AddScoped<IBookingLogic, BookingLogic>();
builder.Services.AddScoped<IProblemReportLogic, ProblemReportLogic>();

// JWT Authentication / RBAC
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = JwtTokenService.CreateValidationParameters(jwtOptions);
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;

                await context.Response.WriteAsJsonAsync(
                    new ErrorResponseDto(401, "Token JWT lipsa, expirat sau invalid."));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;

                await context.Response.WriteAsJsonAsync(
                    new ErrorResponseDto(403, "Rolul curent nu permite accesul la aceasta resursa."));
            }
        };
    });

builder.Services.AddAuthorization();

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
if(app.Environment.IsDevelopment()){ 
    app.UseSwagger(); 
    app.UseSwaggerUI();
}
// Middleware
app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
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

static JwtOptions ReadJwtOptions(IConfiguration configuration)
{
    var section = configuration.GetSection("Jwt");
    _ = int.TryParse(section["ExpirationMinutes"], out var expirationMinutes);

    return new JwtOptions
    {
        Issuer = section["Issuer"] ?? string.Empty,
        Audience = section["Audience"] ?? string.Empty,
        SecretKey = section["SecretKey"] ?? string.Empty,
        ExpirationMinutes = expirationMinutes > 0 ? expirationMinutes : 120
    };
}

static void ValidateJwtOptions(JwtOptions options)
{
    if (string.IsNullOrWhiteSpace(options.Issuer))
    {
        throw new InvalidOperationException("Configuratia Jwt:Issuer lipseste.");
    }

    if (string.IsNullOrWhiteSpace(options.Audience))
    {
        throw new InvalidOperationException("Configuratia Jwt:Audience lipseste.");
    }

    if (string.IsNullOrWhiteSpace(options.SecretKey))
    {
        throw new InvalidOperationException("Configuratia Jwt:SecretKey lipseste.");
    }
}

static async Task InitializeDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<PhotoPortalDbContext>();

    await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db);
}

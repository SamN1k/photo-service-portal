using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PSP.BusinessLayer.Security;
using PSP.DataAccessLayer;
using PSP.DataAccessLayer.Context;
using PSP.Domain.Models.Common;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "FrontendCorsPolicy";

var connectionString = Environment.GetEnvironmentVariable("PSP_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");
}

var jwtSection = builder.Configuration.GetSection("Jwt");
var expirationMinutes = int.TryParse(jwtSection["ExpirationMinutes"], out var configuredExpirationMinutes)
    ? configuredExpirationMinutes
    : 120;
var jwtOptions = new JwtOptions
{
    Issuer = jwtSection["Issuer"] ?? string.Empty,
    Audience = jwtSection["Audience"] ?? string.Empty,
    SecretKey = jwtSection["SecretKey"] ?? string.Empty,
    ExpirationMinutes = expirationMinutes > 0 ? expirationMinutes : 120
};

if (string.IsNullOrWhiteSpace(jwtOptions.Issuer))
{
    throw new InvalidOperationException("Configuratia Jwt:Issuer lipseste.");
}

if (string.IsNullOrWhiteSpace(jwtOptions.Audience))
{
    throw new InvalidOperationException("Configuratia Jwt:Audience lipseste.");
}

if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
{
    throw new InvalidOperationException("Configuratia Jwt:SecretKey lipseste.");
}

DbSession.ConnectionString = connectionString;
JwtOptions.Current = jwtOptions;

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Introdu token-ul JWT in format Bearer."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
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

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return uri.IsLoopback ||
                    uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.EndsWith(".ngrok-free.dev", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var db = new PhotoPortalDbContext())
{
    await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(frontendCorsPolicy);

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
            new ErrorResponseDto(500, "A aparut o eroare neasteptata pe server."));
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT");
if (string.IsNullOrWhiteSpace(port))
{
    app.Run();
}
else
{
    app.Run($"http://0.0.0.0:{port}");
}

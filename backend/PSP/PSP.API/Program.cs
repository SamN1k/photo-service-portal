using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "FrontendCorsPolicy";

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Business Logic
builder.Services.AddSingleton<BusinessLogic>();

builder.Services.AddScoped<IAuthLogic>(
    provider => provider.GetRequiredService<BusinessLogic>().GetAuthLogic());

builder.Services.AddScoped<IUserLogic>(
    provider => provider.GetRequiredService<BusinessLogic>().GetUserLogic());

builder.Services.AddScoped<IOfferLogic>(
    provider => provider.GetRequiredService<BusinessLogic>().GetOfferLogic());

builder.Services.AddScoped<IBookingLogic>(
    provider => provider.GetRequiredService<BusinessLogic>().GetBookingLogic());

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
                origin.Contains("localhost") ||
                origin.Contains("vercel.app") ||
                origin.Contains("ngrok-free.dev"))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

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

// Render / Docker / Local support
var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";

app.Run($"http://0.0.0.0:{port}");
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<BusinessLogic>();
builder.Services.AddScoped<IAuthLogic>(provider => provider.GetRequiredService<BusinessLogic>().GetAuthLogic());
builder.Services.AddScoped<IUserLogic>(provider => provider.GetRequiredService<BusinessLogic>().GetUserLogic());
builder.Services.AddScoped<IOfferLogic>(provider => provider.GetRequiredService<BusinessLogic>().GetOfferLogic());
builder.Services.AddScoped<IBookingLogic>(provider => provider.GetRequiredService<BusinessLogic>().GetBookingLogic());

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

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
        await context.Response.WriteAsJsonAsync(new ErrorResponseDto(500, "A aparut o eroare neasteptata pe server."));
    }
});

app.MapControllers();

app.Run();

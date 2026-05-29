namespace PSP.Domain.Models;

public sealed record ErrorResponseDto(int StatusCode, string Message);

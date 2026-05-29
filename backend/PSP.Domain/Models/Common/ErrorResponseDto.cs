namespace PSP.Domain.Models.Common;

public sealed record ErrorResponseDto(int StatusCode, string Message);

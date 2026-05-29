using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.Domain.Models.Common;

namespace PSP.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected string? CurrentUserId => User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    protected bool CurrentUserIsAdmin => User.IsInRole("admin");

    protected bool CurrentUserIsPhotographer => User.IsInRole("photographer");

    protected bool CurrentUserIsUser => User.IsInRole("user");

    protected bool IsCurrentUser(string userId)
    {
        return string.Equals(CurrentUserId, userId, StringComparison.OrdinalIgnoreCase);
    }

    protected ObjectResult FromBusinessException(BusinessException exception)
    {
        return StatusCode(exception.StatusCode, new ErrorResponseDto(exception.StatusCode, exception.Message));
    }

    protected ObjectResult FromDatabaseException(DbUpdateException exception)
    {
        return StatusCode(
            StatusCodes.Status500InternalServerError,
            new ErrorResponseDto(500, "Operatia asupra bazei de date nu a reusit."));
    }
}

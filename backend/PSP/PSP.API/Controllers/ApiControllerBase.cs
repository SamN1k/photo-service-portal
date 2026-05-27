using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
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

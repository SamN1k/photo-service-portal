using Microsoft.AspNetCore.Mvc;
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
}

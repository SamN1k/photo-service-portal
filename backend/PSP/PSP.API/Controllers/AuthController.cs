using Microsoft.AspNetCore.Mvc;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/auth")]
public sealed class AuthController(IAuthLogic authLogic) : ApiControllerBase
{
    [HttpPost("login")]
    public ActionResult<AuthSessionDto> Login([FromBody] LoginCredentialsDto credentials)
    {
        try
        {
            return Ok(authLogic.Login(credentials));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPost("signup")]
    public ActionResult<AuthSessionDto> SignUp([FromBody] SignUpPayloadDto payload)
    {
        try
        {
            var session = authLogic.SignUp(payload);
            return Created($"/api/users/{session.User.Id}", session);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpGet("demo-accounts")]
    public ActionResult<IReadOnlyList<DemoAccountDto>> GetDemoAccounts()
    {
        return Ok(authLogic.GetDemoAccounts());
    }
}

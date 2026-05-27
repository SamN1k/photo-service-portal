using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/auth")]
public sealed class AuthController(IAuthLogic authLogic) : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthSessionDto>> Login([FromBody] LoginCredentialsDto credentials)
    {
        try
        {
            return Ok(await authLogic.LoginAsync(credentials));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpPost("signup")]
    public async Task<ActionResult<AuthSessionDto>> SignUp([FromBody] SignUpPayloadDto payload)
    {
        try
        {
            var session = await authLogic.SignUpAsync(payload);
            return Created($"/api/users/{session.User.Id}", session);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpGet("demo-accounts")]
    public async Task<ActionResult<IReadOnlyList<DemoAccountDto>>> GetDemoAccounts()
    {
        try
        {
            return Ok(await authLogic.GetDemoAccountsAsync());
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }
}

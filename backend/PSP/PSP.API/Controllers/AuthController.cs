using Microsoft.AspNetCore.Authorization;
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
    [AllowAnonymous]
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
    [AllowAnonymous]
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

    [HttpPost("password-reset/request")]
    [AllowAnonymous]
    public async Task<ActionResult<PasswordResetRequestResultDto>> RequestPasswordReset([FromBody] PasswordResetRequestDto payload)
    {
        try
        {
            return Ok(await authLogic.RequestPasswordResetAsync(payload));
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

    [HttpPost("password-reset/verify")]
    [AllowAnonymous]
    public async Task<ActionResult<PasswordResetCodeResultDto>> VerifyPasswordResetCode([FromBody] PasswordResetCodeDto payload)
    {
        try
        {
            return Ok(await authLogic.VerifyPasswordResetCodeAsync(payload));
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

    [HttpPost("password-reset/complete")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> CompletePasswordReset([FromBody] PasswordResetCompleteDto payload)
    {
        try
        {
            return Ok(await authLogic.CompletePasswordResetAsync(payload));
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
    [Authorize(Roles = "admin")]
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

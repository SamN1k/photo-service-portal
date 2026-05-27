using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/users")]
public sealed class UsersController(IUserLogic userLogic) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResultDto<UserDto>>> ListUsers([FromQuery] UserListQueryDto query)
    {
        try
        {
            return Ok(await userLogic.ListUsersAsync(query));
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

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] UserInputDto input)
    {
        try
        {
            var user = await userLogic.CreateUserAsync(input);
            return Created($"/api/users/{user.Id}", user);
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

    [HttpPut("{userId}")]
    public async Task<ActionResult<UserDto>> UpdateUser(string userId, [FromBody] UserInputDto input)
    {
        try
        {
            return Ok(await userLogic.UpdateUserAsync(userId, input));
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

    [HttpPut("{userId}/settings")]
    public async Task<ActionResult<UserDto>> UpdateAccountSettings(string userId, [FromBody] AccountSettingsInputDto input)
    {
        try
        {
            return Ok(await userLogic.UpdateAccountSettingsAsync(userId, input));
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

    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        try
        {
            await userLogic.DeleteUserAsync(userId);
            return NoContent();
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
}

using Microsoft.AspNetCore.Mvc;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/users")]
public sealed class UsersController(IUserLogic userLogic) : ApiControllerBase
{
    [HttpGet]
    public ActionResult<PaginatedResultDto<UserDto>> ListUsers([FromQuery] UserListQueryDto query)
    {
        try
        {
            return Ok(userLogic.ListUsers(query));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPost]
    public ActionResult<UserDto> CreateUser([FromBody] UserInputDto input)
    {
        try
        {
            var user = userLogic.CreateUser(input);
            return Created($"/api/users/{user.Id}", user);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPut("{userId}")]
    public ActionResult<UserDto> UpdateUser(string userId, [FromBody] UserInputDto input)
    {
        try
        {
            return Ok(userLogic.UpdateUser(userId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpPut("{userId}/settings")]
    public ActionResult<UserDto> UpdateAccountSettings(string userId, [FromBody] AccountSettingsInputDto input)
    {
        try
        {
            return Ok(userLogic.UpdateAccountSettings(userId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }

    [HttpDelete("{userId}")]
    public IActionResult DeleteUser(string userId)
    {
        try
        {
            userLogic.DeleteUser(userId);
            return NoContent();
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
    }
}

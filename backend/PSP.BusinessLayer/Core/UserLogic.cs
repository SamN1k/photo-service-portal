using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Core;

public sealed class UserLogic : UserAction, IUserLogic
{
    public Task<PaginatedResultDto<UserDto>> ListUsersAsync(UserListQueryDto query)
    {
        return ListUsersActionAsync(query);
    }

    public Task<UserDto> CreateUserAsync(UserInputDto input)
    {
        return CreateUserActionAsync(input);
    }

    public Task<UserDto> UpdateUserAsync(string userId, UserInputDto input)
    {
        return UpdateUserActionAsync(userId, input);
    }

    public Task<UserDto> UpdateAccountSettingsAsync(string userId, AccountSettingsInputDto input)
    {
        return UpdateAccountSettingsActionAsync(userId, input);
    }

    public Task<PhotographerPortfolioDto> GetPhotographerPortfolioAsync(string photographerId)
    {
        return GetPhotographerPortfolioActionAsync(photographerId);
    }

    public Task<PhotographerPortfolioDto> UpdatePhotographerPortfolioAsync(string photographerId, PhotographerPortfolioInputDto input)
    {
        return UpdatePhotographerPortfolioActionAsync(photographerId, input);
    }

    public Task DeleteUserAsync(string userId)
    {
        return DeleteUserActionAsync(userId);
    }
}

using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IUserLogic
{
    Task<PaginatedResultDto<UserDto>> ListUsersAsync(UserListQueryDto query);
    Task<UserDto> CreateUserAsync(UserInputDto input);
    Task<UserDto> UpdateUserAsync(string userId, UserInputDto input);
    Task<UserDto> UpdateAccountSettingsAsync(string userId, AccountSettingsInputDto input);
    Task<PhotographerPortfolioDto> GetPhotographerPortfolioAsync(string photographerId);
    Task<PhotographerPortfolioDto> UpdatePhotographerPortfolioAsync(string photographerId, PhotographerPortfolioInputDto input);
    Task DeleteUserAsync(string userId);
}

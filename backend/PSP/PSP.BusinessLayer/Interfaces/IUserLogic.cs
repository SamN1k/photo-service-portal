using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IUserLogic
{
    PaginatedResultDto<UserDto> ListUsers(UserListQueryDto query);
    UserDto CreateUser(UserInputDto input);
    UserDto UpdateUser(string userId, UserInputDto input);
    void DeleteUser(string userId);
}

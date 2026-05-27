using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IAuthLogic
{
    Task<AuthSessionDto> LoginAsync(LoginCredentialsDto credentials);
    Task<AuthSessionDto> SignUpAsync(SignUpPayloadDto payload);
    Task<IReadOnlyList<DemoAccountDto>> GetDemoAccountsAsync();
}

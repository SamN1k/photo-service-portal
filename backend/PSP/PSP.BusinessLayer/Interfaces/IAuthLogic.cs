using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IAuthLogic
{
    AuthSessionDto Login(LoginCredentialsDto credentials);
    AuthSessionDto SignUp(SignUpPayloadDto payload);
    IReadOnlyList<DemoAccountDto> GetDemoAccounts();
}

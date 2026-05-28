using PSP.Domain.Models;

namespace PSP.BusinessLayer.Interfaces;

public interface IAuthLogic
{
    Task<AuthSessionDto> LoginAsync(LoginCredentialsDto credentials);
    Task<AuthSessionDto> SignUpAsync(SignUpPayloadDto payload);
    Task<PasswordResetRequestResultDto> RequestPasswordResetAsync(PasswordResetRequestDto payload);
    Task<PasswordResetCodeResultDto> VerifyPasswordResetCodeAsync(PasswordResetCodeDto payload);
    Task<UserDto> CompletePasswordResetAsync(PasswordResetCompleteDto payload);
    Task<IReadOnlyList<DemoAccountDto>> GetDemoAccountsAsync();
}

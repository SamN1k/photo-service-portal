using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.BusinessLayer.Core;

public sealed class AuthLogic : AuthAction, IAuthLogic
{
    public Task<AuthSessionDto> LoginAsync(LoginCredentialsDto credentials)
    {
        return LoginActionAsync(credentials);
    }

    public Task<AuthSessionDto> SignUpAsync(SignUpPayloadDto payload)
    {
        return SignUpActionAsync(payload);
    }

    public Task<PasswordResetRequestResultDto> RequestPasswordResetAsync(PasswordResetRequestDto payload)
    {
        return RequestPasswordResetActionAsync(payload);
    }

    public Task<PasswordResetCodeResultDto> VerifyPasswordResetCodeAsync(PasswordResetCodeDto payload)
    {
        return VerifyPasswordResetCodeActionAsync(payload);
    }

    public Task<UserDto> CompletePasswordResetAsync(PasswordResetCompleteDto payload)
    {
        return CompletePasswordResetActionAsync(payload);
    }

    public Task<IReadOnlyList<DemoAccountDto>> GetDemoAccountsAsync()
    {
        return GetDemoAccountsActionAsync();
    }
}

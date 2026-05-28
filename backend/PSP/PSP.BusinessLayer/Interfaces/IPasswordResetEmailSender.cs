namespace PSP.BusinessLayer.Interfaces;

public interface IPasswordResetEmailSender
{
    Task SendPasswordResetCodeAsync(string email, string code, DateTimeOffset expiresAt);
}

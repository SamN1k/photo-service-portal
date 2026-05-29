using System.Net;
using System.Net.Mail;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer.Structure;

public sealed class PasswordResetEmailSender : IPasswordResetEmailSender
{
    public async Task SendPasswordResetCodeAsync(string email, string code, DateTimeOffset expiresAt)
    {
        var host = Environment.GetEnvironmentVariable("PSP_SMTP_HOST");
        var from = Environment.GetEnvironmentVariable("PSP_SMTP_FROM")
            ?? Environment.GetEnvironmentVariable("PSP_SMTP_USERNAME");

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
        {
            Console.WriteLine(
                $"Cod resetare parola pentru {email}: {code}. Expira la {expiresAt:u}. Configureaza PSP_SMTP_HOST si PSP_SMTP_FROM pentru trimitere email reala.");

            return;
        }

        var port = int.TryParse(Environment.GetEnvironmentVariable("PSP_SMTP_PORT"), out var parsedPort)
            ? parsedPort
            : 587;
        var useSsl = !bool.TryParse(Environment.GetEnvironmentVariable("PSP_SMTP_SSL"), out var parsedSsl) || parsedSsl;
        var username = Environment.GetEnvironmentVariable("PSP_SMTP_USERNAME");
        var password = Environment.GetEnvironmentVariable("PSP_SMTP_PASSWORD");

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = useSsl
        };

        if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        using var message = new MailMessage(from, email)
        {
            Subject = "Cod resetare parola PhotoPortal",
            Body = $"Codul tau de acces pentru resetarea parolei este {code}. Codul expira la {expiresAt:HH:mm} UTC.",
            IsBodyHtml = false
        };

        await client.SendMailAsync(message);
    }
}

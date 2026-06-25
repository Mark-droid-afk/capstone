using Applications.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Applications.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendErpCredentialsAsync(string email, string username, string password)
        {
            var subject = "Your ERP Account Credentials";
            var body = $"""
                <h2>Welcome to the ERP System</h2>
                <p>Your account has been created. Here are your login credentials:</p>
                <p><strong>Username:</strong> {username}</p>
                <p><strong>Temporary Password:</strong> {password}</p>
                <p>You will be required to change your password on first login.</p>
                <p>Please keep your credentials secure.</p>
                """;

            await SendAsync(email, subject, body);
        }

        public async Task SendPasswordResetAsync(string email, string resetLink)
        {
            var subject = "Password Reset Request";
            var body = $"""
                <h2>Password Reset</h2>
                <p>You requested to reset your password. Click the link below:</p>
                <p><a href="{resetLink}">Reset Password</a></p>
                <p>This link expires in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
                """;

            await SendAsync(email, subject, body);
        }

        public async Task SendEmailConfirmationAsync(string email, string confirmationLink)
        {
            var subject = "Confirm Your Email";
            var body = $"""
                <h2>Email Confirmation</h2>
                <p>Thank you for registering. Please confirm your email by clicking the link below:</p>
                <p><a href="{confirmationLink}">Confirm Email</a></p>
                <p>If you did not create an account, please ignore this email.</p>
                """;

            await SendAsync(email, subject, body);
        }

        private async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var message = new MimeMessage();

            message.From.Add(new MailboxAddress(
                Environment.GetEnvironmentVariable("SMTP_FROM_NAME"),
                Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL")
            ));

            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                Environment.GetEnvironmentVariable("SMTP_SERVER"),
                int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT")!),
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                Environment.GetEnvironmentVariable("SMTP_LOGIN"),
                Environment.GetEnvironmentVariable("SMTP_KEY")
            );

            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }
}
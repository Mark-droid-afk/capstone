using CRM.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace CRM.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly string _host;
    private readonly int    _port;
    private readonly string _user;
    private readonly string _password;
    private readonly string _fromAddress;
    private readonly string _fromName;

    public SmtpEmailSender()
    {
        _host        = DotNetEnv.Env.GetString("SMTP_HOST",         "smtp-relay.brevo.com");
        _port        = DotNetEnv.Env.GetInt   ("SMTP_PORT",          587);
        _user        = DotNetEnv.Env.GetString("SMTP_USER",         "");
        _password    = DotNetEnv.Env.GetString("SMTP_PASSWORD",     "");
        _fromAddress = DotNetEnv.Env.GetString("EMAIL_FROM_ADDRESS", "");
        _fromName    = DotNetEnv.Env.GetString("EMAIL_FROM_NAME",    "CRM System");
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromAddress));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;

        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_user, _password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}

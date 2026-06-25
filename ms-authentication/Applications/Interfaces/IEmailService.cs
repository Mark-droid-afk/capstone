namespace Applications.Interfaces
{
    public interface IEmailService
    {
        Task SendErpCredentialsAsync(string email, string username, string password);
        Task SendPasswordResetAsync(string email, string resetLink);
        Task SendEmailConfirmationAsync(string email, string confirmationLink);
    }
}
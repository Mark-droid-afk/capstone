namespace Api.Contracts.Requests
{
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
}
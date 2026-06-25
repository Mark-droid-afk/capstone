namespace Api.Contracts.Requests
{
    public record CustomerRegisterRequest(
        string FirstName,
        string LastName,
        string Email,
        string Password
    );
}
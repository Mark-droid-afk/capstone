namespace Api.Contracts.Requests
{
    public record UpdateCustomerRequest(
        string FirstName,
        string LastName,
        string Email
    );
}
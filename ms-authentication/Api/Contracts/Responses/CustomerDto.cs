namespace Api.Contracts.Responses
{
    public record CustomerDto(
        Guid Id,
        string FirstName,
        string LastName,
        string Email,
        bool EmailConfirmed
    );
}
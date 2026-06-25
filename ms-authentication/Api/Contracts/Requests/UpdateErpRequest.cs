namespace Api.Contracts.Requests
{
    public record UpdateErpUserRequest(
        string FirstName,
        string LastName,
        string Email,
        bool IsActive,
        List<string> Roles,
        List<AppAccessRequest> AppAccesses
    );
}
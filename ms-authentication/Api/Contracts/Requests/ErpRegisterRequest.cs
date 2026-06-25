namespace Api.Contracts.Requests
{
    public record ErpRegisterRequest(
        string FirstName,
        string LastName,
        string Email,
        List<AppAccessRequest> AppAccesses
    );
}
namespace Api.Contracts.Responses
{
    public record ErpUserDto(
        Guid Id,
        string Username,
        string FirstName,
        string LastName,
        string Email,
        bool MustChangePassword,
        List<string> Roles,
        List<AppAccessDto> Apps
    );
}
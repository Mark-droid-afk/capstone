namespace Api.Contracts.Requests
{
    public record AppAccessRequest(
        string AppName,
        List<ModuleAccessRequest> Modules
    );
}
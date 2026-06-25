namespace Api.Contracts.Requests
{
    public record ModuleAccessRequest(
        string ModuleName,
        bool CanRead,
        bool CanWrite,
        bool CanDelete,
        bool CanExport
    );
}
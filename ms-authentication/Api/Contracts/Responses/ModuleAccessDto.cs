namespace Api.Contracts.Responses
{
    public record ModuleAccessDto(
        string ModuleName,
        bool CanRead,
        bool CanWrite,
        bool CanDelete,
        bool CanExport
    );
}
namespace Api.Contracts.Responses
{
    public record AppAccessDto(
        string AppName,
        List<ModuleAccessDto> Modules
    );
}
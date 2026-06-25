namespace Domains.Entities
{
    public class ModuleAccess
    {
        public Guid Id { get; set; }
        public Guid AppAccessId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool CanRead { get; set; }
        public bool CanWrite { get; set; }
        public bool CanDelete { get; set; }
        public bool CanExport { get; set; }
        public AppAccess AppAccess { get; set; } = null!;
    }
}
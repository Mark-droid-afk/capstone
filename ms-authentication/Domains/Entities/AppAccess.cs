namespace Domains.Entities
{
    public class AppAccess
    {
        public Guid Id { get; set; }
        public Guid ErpUserId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public ErpUser ErpUser { get; set; } = null!;
        public ICollection<ModuleAccess> Modules { get; set; } = [];
    }
}
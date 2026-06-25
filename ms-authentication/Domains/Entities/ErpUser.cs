using Microsoft.AspNetCore.Identity;

namespace Domains.Entities
{
    public class ErpUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool MustChangePassword { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public ICollection<AppAccess> AppAccesses { get; set; } = [];
    }
}
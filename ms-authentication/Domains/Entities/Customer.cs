using Microsoft.AspNetCore.Identity;

namespace Domains.Entities
{
    public class Customer : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
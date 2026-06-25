namespace CRM.Domain.Entities;

public enum CustomerStatus { Active, Inactive, Suspended }
public enum CustomerType { Regular, InstitutionalBuyer }

public class Customer
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ProfileImage { get; set; }
    public string? Notes { get; set; }
    public string? AuthId { get; set; }
    public CustomerStatus Status { get; set; } = CustomerStatus.Active;
    public CustomerType CustomerType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; } = false;

    public ICollection<MarketingHistory> MarketingHistories { get; set; } = [];
}
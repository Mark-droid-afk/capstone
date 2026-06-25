using CRM.Application.DTOs;
using CRM.Domain.Entities;

namespace CRM.Application.Interfaces;

public interface ICustomerRepository
{
    Task<(IEnumerable<Customer> Data, int Total)> GetAllAsync(GetCustomersRequest request);
    Task<Customer?> GetByIdAsync(Guid id);
    Task<Customer> CreateAsync(Customer customer);
    Task UpdateAsync(Customer customer);
    Task DeleteAsync(Customer customer);

    /// <summary>
    /// Returns all active customers for email dispatch.
    /// audienceFilter: "all" | "Regular" | "InstitutionalBuyer"
    /// </summary>
    Task<IEnumerable<Customer>> GetEmailRecipientsAsync(string audienceFilter);
}
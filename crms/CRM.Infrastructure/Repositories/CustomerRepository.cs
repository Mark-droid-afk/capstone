using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

public class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    public async Task<(IEnumerable<Customer> Data, int Total)> GetAllAsync(GetCustomersRequest request)
    {
        var query = db.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(c =>
                c.FirstName.Contains(request.Search) ||
                c.LastName.Contains(request.Search) ||
                c.Email.Contains(request.Search));

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<CustomerStatus>(request.Status, true, out var status))
            query = query.Where(c => c.Status == status);

        if (!string.IsNullOrWhiteSpace(request.Type) &&
            Enum.TryParse<CustomerType>(request.Type, true, out var type))
            query = query.Where(c => c.CustomerType == type);

        var total = await query.CountAsync();

        var data = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (data, total);
    }

    public async Task<Customer?> GetByIdAsync(Guid id) =>
        await db.Customers.FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Customer> CreateAsync(Customer customer)
    {
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
        return customer;
    }

    public async Task UpdateAsync(Customer customer)
    {
        db.Customers.Update(customer);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Customer customer)
    {
        customer.IsDeleted = true;
        await db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Customer>> GetEmailRecipientsAsync(string audienceFilter)
    {
        var query = db.Customers
            .Where(c => c.Status == CustomerStatus.Active && !string.IsNullOrEmpty(c.Email));

        if (!string.IsNullOrWhiteSpace(audienceFilter) &&
            audienceFilter.ToLower() != "all" &&
            Enum.TryParse<CustomerType>(audienceFilter, true, out var type))
        {
            query = query.Where(c => c.CustomerType == type);
        }

        return await query.ToListAsync();
    }
}
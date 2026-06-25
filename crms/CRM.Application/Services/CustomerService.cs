using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;

namespace CRM.Application.Services;

public class CustomerService(ICustomerRepository repository) : ICustomerService
{
    public async Task<PaginatedResponse<CustomerResponse>> GetAllAsync(GetCustomersRequest request)
    {
        var (data, total) = await repository.GetAllAsync(request);
        return new PaginatedResponse<CustomerResponse>(
            data.Select(ToResponse), total, request.Page, request.PageSize);
    }

    public async Task<CustomerResponse?> GetByIdAsync(Guid id)
    {
        var customer = await repository.GetByIdAsync(id);
        return customer is null ? null : ToResponse(customer);
    }

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request)
    {
        Console.WriteLine("Customer Type: " + request.CustomerType);
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            AuthId = request.AuthId,
            CustomerType = request.CustomerType == "regular" ? CustomerType.Regular : CustomerType.InstitutionalBuyer,
        };
        await repository.CreateAsync(customer);
        return ToResponse(customer);
    }

    public async Task UpdateStatusAsync(Guid id, UpdateCustomerStatusRequest request)
    {
        var customer = await repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Customer not found.");
        customer.Status = Enum.Parse<CustomerStatus>(request.Status, true);
        await repository.UpdateAsync(customer);
    }

    public async Task UpdateTypeAsync(Guid id, UpdateCustomerTypeRequest request)
    {
        var customer = await repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Customer not found.");
        customer.CustomerType = Enum.Parse<CustomerType>(request.CustomerType, true);
        await repository.UpdateAsync(customer);
    }

    public async Task UpdateNotesAsync(Guid id, UpdateCustomerNotesRequest request)
    {
        var customer = await repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Customer not found.");
        customer.Notes = request.Notes;
        await repository.UpdateAsync(customer);
    }

    public async Task UpdateAddressAsync(Guid id, UpdateCustomerAddressRequest request)
    {
        var customer = await repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Customer not found.");
        customer.Address = request.Address;
        await repository.UpdateAsync(customer);
    }

    public async Task DeleteAsync(Guid id)
    {
        var customer = await repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Customer not found.");
        await repository.DeleteAsync(customer);
    }

    private static CustomerResponse ToResponse(Customer c) => new(
        c.Id, c.FirstName, c.LastName, c.Email,
        c.Phone, c.Address, c.ProfileImage, c.Notes,
        c.AuthId, c.Status.ToString(), c.CustomerType.ToString(), c.CreatedAt
    );
}
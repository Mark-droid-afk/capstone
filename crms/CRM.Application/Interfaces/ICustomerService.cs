using CRM.Application.DTOs;

namespace CRM.Application.Interfaces;

public interface ICustomerService
{
    Task<PaginatedResponse<CustomerResponse>> GetAllAsync(GetCustomersRequest request);
    Task<CustomerResponse?> GetByIdAsync(Guid id);
    Task<CustomerResponse> CreateAsync(CreateCustomerRequest request);
    Task UpdateStatusAsync(Guid id, UpdateCustomerStatusRequest request);
    Task UpdateTypeAsync(Guid id, UpdateCustomerTypeRequest request);
    Task UpdateNotesAsync(Guid id, UpdateCustomerNotesRequest request);
    Task UpdateAddressAsync(Guid id, UpdateCustomerAddressRequest request);
    Task DeleteAsync(Guid id);
}
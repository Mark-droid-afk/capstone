using CRM.Application.DTOs;

namespace CRM.Application.Interfaces;

public interface IOrderService
{
    Task<PaginatedResponse<OrderResponse>> GetOrderHistoryAsync(GetOrderHistoryRequest request);
}
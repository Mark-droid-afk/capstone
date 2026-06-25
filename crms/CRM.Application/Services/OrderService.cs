using System.Net.Http.Json;
using CRM.Application.DTOs;
using CRM.Application.Interfaces;

namespace CRM.Application.Services;

public class OrderService(HttpClient httpClient, ICustomerRepository customerRepository) : IOrderService
{
    public async Task<PaginatedResponse<OrderResponse>> GetOrderHistoryAsync(GetOrderHistoryRequest request)
    {
        try
        {
            var customer = await customerRepository.GetByIdAsync(request.CustomerId);
            if (customer == null || string.IsNullOrEmpty(customer.AuthId))
            {
                return new PaginatedResponse<OrderResponse>([], 0, request.Page, request.PageSize);
            }

            var posBaseUrl = Environment.GetEnvironmentVariable("POS_API_URL") ?? "http://localhost:5005";
            var url = $"{posBaseUrl}/api-pos/customers/{customer.AuthId}/orders";
            var posResult = await httpClient.GetFromJsonAsync<PosOrdersResponse>(url);

            if (posResult == null || posResult.Items == null || posResult.Items.Count == 0)
            {
                return new PaginatedResponse<OrderResponse>([], 0, request.Page, request.PageSize);
            }

            // Group the flat order item rows by OrderId or OrderNumber
            var groupedOrders = posResult.Items
                .GroupBy(o => o.OrderId)
                .Select(g =>
                {
                    var first = g.First();
                    var items = g.Select(i => new OrderItemResponse(
                        i.Product.ProductName,
                        i.Quantity,
                        i.UnitPrice
                    )).ToList();

                    // Generate a deterministic Guid from OrderId so it's consistent
                    var guid = new Guid(first.OrderId, 0, 0, new byte[8]);

                    return new OrderResponse(
                        guid,
                        string.IsNullOrEmpty(first.OrderNumber) ? $"ORD-{first.OrderId:D4}" : first.OrderNumber,
                        first.OrderStatus.ToLower(), // standard lowercase status for CSS mapping
                        first.Pricing.TotalAmount,
                        items,
                        first.OrderedAt
                    );
                })
                .OrderByDescending(o => o.CreatedAt)
                .ToList();

            var total = groupedOrders.Count;
            var paginated = groupedOrders
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return new PaginatedResponse<OrderResponse>(paginated, total, request.Page, request.PageSize);
        }
        catch
        {
            return new PaginatedResponse<OrderResponse>([], 0, request.Page, request.PageSize);
        }
    }
}

public class PosOrdersResponse
{
    public List<PosOrderSummary> Items { get; set; } = new();
}

public class PosOrderSummary
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public PosProductRef Product { get; set; } = new();
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public PosOrderPricing Pricing { get; set; } = new();
    public string? DeliveryAddress { get; set; }
    public DateTime OrderedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}

public class PosProductRef
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
}

public class PosOrderPricing
{
    public decimal SubtotalAmount { get; set; }
    public decimal TotalAmount { get; set; }
}
using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/v1/customers/{customerId}/order-history")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrderHistory(Guid customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        Ok(await orderService.GetOrderHistoryAsync(new GetOrderHistoryRequest(customerId, page, pageSize)));
}
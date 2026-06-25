using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/v1/customers/{customerId}/marketing-history")]
public class MarketingController(IMarketingService marketingService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHistory(Guid customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        Ok(await marketingService.GetHistoryAsync(new GetMarketingHistoryRequest(customerId, page, pageSize)));
}

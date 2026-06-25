using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/v1/campaigns")]
public class CampaignsController(ICampaignService campaignService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetCampaignsRequest request) =>
        Ok(await campaignService.GetAllAsync(request));

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates() =>
        Ok(await campaignService.GetTemplatesAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await campaignService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCampaignRequest request) =>
        Ok(await campaignService.CreateAsync(request));

    [HttpPost("draft")]
    public async Task<IActionResult> Draft([FromBody] DraftCampaignRequest request) =>
        Ok(await campaignService.DraftAsync(request));
}

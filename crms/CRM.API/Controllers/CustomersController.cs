using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/v1/customers")]
public class CustomersController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetCustomersRequest request) =>
        Ok(await customerService.GetAllAsync(request));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var customer = await customerService.GetByIdAsync(id);
        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request) =>
        Ok(await customerService.CreateAsync(request));

    [HttpPost("sync")]
    public async Task<IActionResult> Sync([FromBody] SyncCustomerRequest request)
    {
        var createRequest = new CreateCustomerRequest(
            FirstName: request.FirstName,
            LastName: request.LastName,
            Email: request.Email,
            Phone: request.PhoneNumber,
            CustomerType: "Regular",
            Address: request.Address,
            AuthId: request.AuthId
        );

        var result = await customerService.CreateAsync(createRequest);
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateCustomerStatusRequest request)
    {
        await customerService.UpdateStatusAsync(id, request);
        return NoContent();
    }

    [HttpPatch("{id}/type")]
    public async Task<IActionResult> UpdateType(Guid id, [FromBody] UpdateCustomerTypeRequest request)
    {
        await customerService.UpdateTypeAsync(id, request);
        return NoContent();
    }

    [HttpPatch("{id}/notes")]
    public async Task<IActionResult> UpdateNotes(Guid id, [FromBody] UpdateCustomerNotesRequest request)
    {
        await customerService.UpdateNotesAsync(id, request);
        return NoContent();
    }

    [HttpPatch("{id}/address")]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] UpdateCustomerAddressRequest request)
    {
        await customerService.UpdateAddressAsync(id, request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await customerService.DeleteAsync(id);
        return NoContent();
    }
}

public record SyncCustomerRequest(
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? Address,
    string AuthId
);
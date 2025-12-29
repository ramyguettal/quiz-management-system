using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.CreateAdmin;
using quiz_management_system.Contracts.Reponses.Admin;
using quiz_management_system.Contracts.Requests.Admin;

namespace quiz_management_system.App.Controllers;

/// <summary>
/// Manages administrator accounts.
/// </summary>
[ApiController]
[Route("api/admins")]
[Tags("Admins")]
[ApiVersion("1.0")]

public sealed class AdminsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Creates a new administrator account.
    /// </summary>
    /// <remarks>
    /// Only Super Admins can create new admin accounts.
    /// </remarks>
    /// <param name="request">Admin details including email and full name.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Admin created successfully.</response>
    /// <response code="400">Validation failure.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden — missing SuperAdmin role.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost]
    [EndpointSummary("Creates a new administrator account.")]
    [EndpointDescription("Allows a SuperAdmin to create a new system administrator.")]
    [ProducesResponseType(typeof(AdminResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [Authorize(Roles = DefaultRoles.SuperAdmin)]

    public async Task<ActionResult<AdminResponse>> CreateAdmin(
        [FromBody] CreateAdminRequest request,
        CancellationToken ct)
    {
        var command = new CreateAdminCommand(request.Email, request.FullName);

        var result = await sender.Send(command, ct);
        return result.ToActionResult<AdminResponse>(HttpContext);
    }
}

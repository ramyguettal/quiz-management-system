using Asp.Versioning;
using Makayen.App.Helpers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.Application.Features.UpdatePassword;
using quiz_management_system.Contracts.Requests;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[ApiVersion("1.0")]

public class UserController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Changes the authenticated user's password.
    /// </summary>
    /// <remarks>
    /// Requires the user to provide their current password and a new valid password.
    /// </remarks>
    /// <param name="request">Contains current and new password.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <response code="200">Password changed successfully.</response>
    /// <response code="400">Weak password or validation error.</response>
    /// <response code="401">User not authenticated.</response>
    /// <response code="404">User not found.</response>
    /// <response code="409">New password is the same as the old one.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("update-password")]
    [EndpointSummary("Updates the user's password.")]
    [EndpointDescription("Allows an authenticated user to update their password by providing the current one.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdatePassword(
        [FromBody] UpdatePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var userIpAddress = HttpContext.GetClientIp();

        Result result = await sender.Send(
            new UpdatePasswordCommand(
                request.CurrentPassword,
                request.NewPassword,
                UserIpAddress: userIpAddress
            ),
            cancellationToken
        );

        return result.ToActionResult(HttpContext);
    }

}

using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.Profiles.GetAdminProfile;
using quiz_management_system.Contracts.Reponses.Admin;

namespace quiz_management_system.App.Controllers;

[Route("api/admin/profile")]
[ApiController]
[ApiVersion("1.0")]
[Authorize(Roles = DefaultRoles.Admin)]
[Tags("Admin Profile")]
[Produces("application/json")]
[Authorize]
public sealed class AdminProfileController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets the current admin's profile.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(AdminProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Get admin profile")]
    [EndpointDescription("Retrieves the authenticated admin's profile information.")]
    public async Task<ActionResult<AdminProfileResponse>> GetProfile(CancellationToken ct = default)
        => (await sender.Send(new GetAdminProfileQuery(), ct))
            .ToActionResult(HttpContext);

    /// <summary>
    /// Updates the current admin's profile.
    /// </summary>
    [HttpPut]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [EndpointSummary("Update admin profile")]
    [EndpointDescription("Updates the authenticated admin's profile information and optionally uploads a profile image.")]
    public async Task<IActionResult> UpdateProfile(
        [FromForm] UpdateAdminProfileRequest request,
        CancellationToken ct = default)
    {
        var command = new UpdateAdminProfileCommand(
            request.FullName,
            request.EmailNotifications,
            request.ProfileImage
        );

        return (await sender.Send(command, ct))
            .ToActionResult(HttpContext);
    }
}

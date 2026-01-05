using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.Profiles.GetInstructorProfile;
using quiz_management_system.Application.Features.Profiles.UpdateInstructorProfile;
using quiz_management_system.Contracts.Reponses.Instructor;
using quiz_management_system.Contracts.Requests.Instructor;

namespace quiz_management_system.App.Controllers;

[Route("api/instructor/profile")]
[ApiController]
[ApiVersion("1.0")]
//[Authorize(Roles = DefaultRoles.Instructor)]
[Tags("Instructor Profile")]
[Produces("application/json")]
public sealed class InstructorProfileController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets the current instructor's profile.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(InstructorProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Get instructor profile")]
    [EndpointDescription("Retrieves the authenticated instructor's profile information.")]
    public async Task<ActionResult<InstructorProfileResponse>> GetProfile(CancellationToken ct = default)
        => (await sender.Send(new GetInstructorProfileQuery(), ct))
            .ToActionResult(HttpContext);

    /// <summary>
    /// Updates the current instructor's profile.
    /// </summary>
    [HttpPut]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [EndpointSummary("Update instructor profile")]
    [EndpointDescription("Updates the authenticated instructor's profile information and optionally uploads a profile image.")]
    public async Task<IActionResult> UpdateProfile(
        [FromForm] UpdateInstructorProfileRequest request,
        CancellationToken ct = default)
    {
        var command = new UpdateInstructorProfileCommand(
            request.FullName,
            request.Title,
            request.PhoneNumber,
            request.Department,
            request.OfficeLocation,
            request.Bio,
            request.EmailNotifications,
            request.ProfileImage
        );
        return (await sender.Send(command, ct))
            .ToActionResult(HttpContext);
    }
}
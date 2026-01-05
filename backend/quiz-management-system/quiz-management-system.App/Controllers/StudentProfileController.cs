using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.Profiles.GetStudentProfile;
using quiz_management_system.Application.Features.Profiles.UpdateStudentProfile;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Contracts.Requests.Student;

namespace quiz_management_system.App.Controllers;

[Route("api/student/profile")]
[ApiController]
[ApiVersion("1.0")]
[Authorize(Roles = DefaultRoles.Student)]
[Tags("Student Profile")]
[Produces("application/json")]
public sealed class StudentProfileController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets the current student's profile.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(StudentProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Get student profile")]
    [EndpointDescription("Retrieves the authenticated student's profile information.")]
    public async Task<ActionResult<StudentProfileResponse>> GetProfile(CancellationToken ct = default)
        => (await sender.Send(new GetStudentProfileQuery(), ct))
            .ToActionResult(HttpContext);

    /// <summary>
    /// Updates the current student's profile.
    /// </summary>
    [HttpPut]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [EndpointSummary("Update student profile")]
    [EndpointDescription("Updates the authenticated student's profile information and optionally uploads a profile image.")]
    public async Task<IActionResult> UpdateProfile(
        [FromForm] UpdateStudentProfileRequest request,
        CancellationToken ct = default)
    {
        var command = new UpdateStudentProfileCommand(
             request.FullName,
             request.EmailNotifications,
             request.ProfileImage
         );

        return (await sender.Send(command, ct))
            .ToActionResult(HttpContext);
    }
}
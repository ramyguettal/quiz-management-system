using Makayen.App.Helpers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.CreateStudent;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

/// <summary>
/// Manages student accounts and academic details.
/// </summary>
[ApiController]
[Route("api/students")]
[Tags("Students")]
[Authorize]
public sealed class StudentsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Creates a new student account.
    /// </summary>
    /// <remarks>
    /// Requires admin privileges.  
    /// Automatically creates identity credentials and attaches student to the specified academic year and group.
    /// </remarks>
    /// <param name="request">Student registration data.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Student created successfully.</response>
    /// <response code="400">Validation or academic-year mismatch.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden — Admin role required.</response>
    /// <response code="404">Academic year not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost]
    [Authorize(Roles = RoleGroups.Admins)]
    [EndpointSummary("Creates a new student account.")]
    [EndpointDescription("Allows an Admin to register a new student, including year and group assignment.")]
    [ProducesResponseType(typeof(StudentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<StudentResponse>> CreateStudent(
        [FromBody] CreateStudentRequest request,
        CancellationToken ct)
    {
        var command = new CreateStudentCommand(
            request.Email,
            request.FullName,
            request.AcademicYear,
            request.GroupNumber
        );

        Result<StudentResponse> result = await sender.Send(command, ct);
        return result.ToActionResult<StudentResponse>(HttpContext);
    }
}
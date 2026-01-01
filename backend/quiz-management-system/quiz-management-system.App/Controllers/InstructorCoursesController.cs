using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.GetStudentsEnrolledInCourse;
using quiz_management_system.Contracts.Reponses.Courses;

namespace quiz_management_system.App.Controllers;

/// <summary>
/// Instructor-specific operations related to courses.
/// </summary>
[ApiController]
[Authorize(Roles = DefaultRoles.Instructor)]
[Route("api/instructor/courses")]
[Produces("application/json")]
public sealed class InstructorCoursesController(ISender sender) : ControllerBase
{


    /// <summary>
    /// Gets the list of students enrolled in a specific course owned by the instructor.
    /// </summary>
    /// <remarks>
    /// Enrollment is inferred from quiz submissions:
    /// <list type="bullet">
    /// <item>The course must belong to the authenticated instructor</item>
    /// <item>Only students who submitted at least one quiz in this course are returned</item>
    /// <item>Quiz count is calculated per student for this course</item>
    /// </list>
    /// </remarks>
    /// <param name="courseId">The unique identifier of the course</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>A list of enrolled students with quiz statistics</returns>
    /// <response code="200">Students successfully retrieved</response>
    /// <response code="401">User is not authenticated</response>
    /// <response code="403">Instructor does not own the course</response>
    /// <response code="404">Course not found</response>
    [HttpGet("{courseId:guid}/students")]
    [ProducesResponseType(typeof(IReadOnlyList<CourseStudentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<CourseStudentResponse>>> GetStudentsForCourse(
        Guid courseId,
        CancellationToken ct)
    {
        var result = await sender.Send(
            new GetStudentsEnrolledInInstructorCoursesQuery(courseId),
            ct);

        return result.ToActionResult(HttpContext);

    }
}
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.Courses.Commands.UpdateInstructorCourses;
using quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;
using quiz_management_system.Application.Features.Courses.Queries.GetCourseById;
using quiz_management_system.Application.Features.Courses.Queries.GetCoursesByAcademicYear;
using quiz_management_system.Application.Features.Courses.Queries.GetCoursesByInstructor;
using quiz_management_system.Application.Features.Courses.Queries.GetMyCourses;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Contracts.Requests.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

[Route("api/[controller]")]
[ApiController]
[ApiVersion("1.0")]
[Authorize]
public sealed class CoursesController(ISender sender) : ControllerBase
{




    // -----------------------------------------------------------
    // 1. Get all courses
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves all courses available in the system.
    /// </summary>
    /// <remarks>
    /// This endpoint is cached for 24 hours using the application's memory caching behavior.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A list of all courses.</returns>
    /// <response code="200">Successfully returned all courses.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CourseResponse>), StatusCodes.Status200OK)]
    [EndpointSummary("Get all courses (cached for 24 hours).")]
    [EndpointDescription("Returns every course in the system. Uses caching to optimize repeated calls.")]
    [Authorize(Roles = RoleGroups.Admins)]
    public async Task<ActionResult<IReadOnlyList<CourseResponse>>> GetAllCourses(CancellationToken ct)
    {
        Result<IReadOnlyList<CourseResponse>> result =
            await sender.Send(new GetAllCoursesQuery(), ct);

        return result.ToActionResult(HttpContext);
    }

    // -----------------------------------------------------------
    // 2. Get courses by academic year
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves all courses that belong to a specific academic year.
    /// </summary>
    /// <param name="academicYearId">The academic year's unique identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of courses for the given academic year.</returns>
    /// <response code="200">Successfully returned courses.</response>
    /// <response code="404">Academic year not found.</response>
    [HttpGet("year/{academicYearId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Get all courses for a specific academic year.")]
    [EndpointDescription("Returns the list of courses associated with the given academic year ID. Cached for 24 hours.")]
    [Authorize(Roles = RoleGroups.Admins)]
    public async Task<ActionResult<IReadOnlyList<CourseResponse>>> GetCoursesByAcademicYear(
        Guid academicYearId,
        CancellationToken ct)
    {
        var query = new GetCoursesByAcademicYearQuery(academicYearId);
        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }

    // -----------------------------------------------------------
    // 3. Get courses by instructor
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves all courses assigned to a specific instructor.
    /// </summary>
    /// <param name="instructorId">The instructor's unique identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of instructor's courses.</returns>
    /// <response code="200">Successfully returned instructor courses.</response>
    [HttpGet("instructor/{instructorId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<CourseResponse>), StatusCodes.Status200OK)]
    [EndpointSummary("Get all courses taught by a specific instructor.")]
    [EndpointDescription("Returns the list of courses this instructor is assigned to. Not cached.")]
    [Authorize(Roles = RoleGroups.Staff)]
    public async Task<ActionResult<IReadOnlyList<CourseResponse>>> GetCoursesByInstructor(
        Guid instructorId,
        CancellationToken ct)
    {
        var query = new GetCoursesByInstructorQuery(instructorId);
        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }

    // -----------------------------------------------------------
    // 4. Get my courses (Student or Instructor)
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves the list of courses assigned to the current authenticated user.
    /// </summary>
    /// <remarks>
    /// - If the user is a <b>Student</b>, returns courses based on their academic year. <br/>
    /// - If the user is an <b>Instructor</b>, returns courses they teach.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A list of courses belonging to the current user.</returns>
    /// <response code="200">Successfully returned user-specific courses.</response>
    /// <response code="401">User not authenticated.</response>
    [HttpGet("my")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [EndpointSummary("Get courses for the current authenticated user.")]
    [EndpointDescription("Returns courses based on whether the user is a Student or Instructor.")]
    public async Task<ActionResult<IReadOnlyList<CourseResponse>>> GetMyCourses(CancellationToken ct)
    {
        var result = await sender.Send(new GetMyCoursesQuery(), ct);

        return result.ToActionResult(HttpContext);
    }

    // -----------------------------------------------------------
    // 5. Get a course by ID
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves a course by its unique identifier.
    /// </summary>
    /// <param name="courseId">The ID of the course.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The requested course.</returns>
    /// <response code="200">Successfully returned the course.</response>
    /// <response code="404">Course not found.</response>
    [HttpGet("{courseId:guid}")]
    [ProducesResponseType(typeof(CourseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Get a course by its ID.")]
    [EndpointDescription("Retrieves a single course by its unique identifier.")]

    public async Task<ActionResult<CourseResponse>> GetCourseById(
        Guid courseId,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetCourseByIdQuery(courseId), ct);

        return result.ToActionResult(HttpContext);
    }


    [HttpPut("instructor/{instructorId:guid}/courses")]
    [Authorize(Roles = RoleGroups.Admins)]
    [ProducesResponseType(typeof(IReadOnlyList<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Update instructor courses.")]
    [EndpointDescription("Updates the list of assigned courses for an instructor. Adds new, removes missing, keeps existing.")]
    [Authorize(Roles = RoleGroups.Admins)]
    public async Task<ActionResult<IReadOnlyList<CourseResponse>>> UpdateInstructorCourses(
    [FromRoute] Guid instructorId,
   [FromBody] UpdateInstructorCoursesRequest request,
    CancellationToken ct)
    {
        var command = new UpdateInstructorCoursesCommand(instructorId, request.CourseIds);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

}

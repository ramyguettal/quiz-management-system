using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.CreateStudent;
using quiz_management_system.Application.Features.Dashboard;
using quiz_management_system.Application.Features.Quizzes.GetStudentQuizzes;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
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
[ApiVersion("1.0")]

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





    [HttpGet("quizzes")]
    [Authorize(Roles = DefaultRoles.Student)]
    [EndpointSummary("Gets quizzes available for the authenticated student.")]
    [EndpointDescription("""
Returns quizzes assigned to the student's groups and academic year.
Supports filtering by course and status, with cursor-based pagination.
""")]
    [ProducesResponseType(typeof(CursorPagedResponse<QuizListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CursorPagedResponse<QuizListItemResponse>>> GetStudentQuizzes(
    [FromQuery] GetStudentQuizzesRequest request,
    CancellationToken ct)
    {
        var query = new GetStudentQuizzesQuery(
            CourseId: request.CourseId,
            Status: request.Status,
            Cursor: request.Cursor,
            PageSize: request.PageSize
        );

        var result = await sender.Send(query, ct);
        return result.ToActionResult<CursorPagedResponse<QuizListItemResponse>>(HttpContext);
    }



    // <summary>
    /// Retrieves the complete student dashboard data.
    /// </summary>
    /// <remarks>
    /// Returns comprehensive dashboard information including:
    /// <br/>
    /// **Statistics:**
    /// <br/>
    /// - Active quizzes available to take
    /// <br/>
    /// - Total completed quiz attempts
    /// <br/>
    /// - Average score across all graded submissions
    /// <br/>
    /// - Score trend (+/-% compared to previous attempts)
    /// <br/>
    /// - Unread notification count
    /// <br/><br/>
    /// **Available Quizzes:**
    /// <br/>
    /// - Up to 10 quizzes that are published and assigned to student's groups
    /// <br/>
    /// - Excludes quizzes already submitted by the student
    /// <br/>
    /// - Shows status (Active/Upcoming) and deadlines
    /// <br/>
    /// - Ordered by availability date
    /// <br/><br/>
    /// **Recent Notifications:**
    /// <br/>
    /// - Last 5 notifications with relative timestamps
    /// <br/>
    /// - Formatted as "2 hours ago", "1 day ago", etc.
    /// <br/><br/>
    /// <b>Note:</b> Only quizzes assigned to groups the student belongs to are included.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// Complete dashboard data including stats, available quizzes, and recent notifications.
    /// </returns>
    /// <response code="200">Dashboard data successfully retrieved.</response>
    /// <response code="401">User is not authenticated or not a student.</response>
    /// <response code="404">Student record not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(StudentDashboardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves student dashboard.")]
    [EndpointDescription(
        "Returns comprehensive dashboard data including statistics, available quizzes, and recent notifications for the authenticated student.")]
    [EndpointName("GetStudentDashboard")]
    [Authorize(Roles = DefaultRoles.Student)]
    public async Task<ActionResult<StudentDashboardResponse>> GetDashboard(
        CancellationToken ct = default)
        =>
        (await sender.Send(new GetStudentDashboardQuery(), ct))
            .ToActionResult(HttpContext);

}
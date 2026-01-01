using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.CreateInstructor;
using quiz_management_system.Application.Features.Quizzes.GetAll;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Instructor;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Contracts.Requests.Instructor;

namespace quiz_management_system.App.Controllers
{

    /// <summary>
    /// Handles instructor management operations.
    /// </summary>
    [ApiController]
    [Route("api/instructors")]
    [Tags("Instructors")]
    [Authorize(Roles = RoleGroups.Admins)]
    [ApiVersion("1.0")]

    public sealed class InstructorsController(ISender sender, IUserContext userContext) : ControllerBase
    {
        /// <summary>
        /// Creates a new instructor.
        /// </summary>
        /// <remarks>
        /// Accessible only to Admin users.
        /// Requires instructor profile details such as name, title, and department.
        /// </remarks>
        /// <param name="request">Instructor registration data.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Instructor created successfully.</response>
        /// <response code="400">Validation failure.</response>
        /// <response code="401">Unauthorized.</response>
        /// <response code="403">Forbidden — Admin role required.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost]
        [EndpointSummary("Creates a new instructor.")]
        [EndpointDescription("Allows an Admin to register a new instructor in the system.")]
        [ProducesResponseType(typeof(InstructorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<InstructorResponse>> CreateInstructor(
            [FromBody] CreateInstructorRequest request,
            CancellationToken ct)
        {
            var command = new CreateInstructorCommand(
                request.Email,
                request.FullName,
                request.Title,
                request.PhoneNumber,
                request.Department,
                request.OfficeLocation,
                request.Bio
            );

            var result = await sender.Send(command, ct);
            return result.ToActionResult<InstructorResponse>(HttpContext);
        }





        /// <summary>
        /// Retrieves quizzes assigned to the currently logged-in instructor.
        /// </summary>
        /// <remarks>
        /// Optionally filter by course. Results are paginated using cursor-based pagination.
        /// </remarks>
        /// <param name="courseId">Optional course ID to filter quizzes.</param>
        /// <param name="cursor">Cursor for pagination.</param>
        /// <param name="pageSize">Number of items per page (default 20).</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>Cursor-paginated list of quizzes for this instructor.</returns>
        [HttpGet("my-quizzes")]
        [ProducesResponseType(typeof(CursorPagedResponse<QuizListItemResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [EndpointSummary("Gets quizzes assigned to the logged-in instructor.")]
        [EndpointDescription("Returns the quizzes for the current instructor. Supports optional course filtering and pagination.")]
        public async Task<ActionResult<CursorPagedResponse<QuizListItemResponse>>> GetMyQuizzes(
            [FromQuery] Guid courseId,
            [FromQuery] string? cursor,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            // Get current instructor ID from user context
            var instructorId = userContext.UserId;

            // Build the filter request
            var query = new GetQuizzesQuery(
                courseId,
                instructorId,
                AcademicYearId: null, // optional
                Status: null,          // optional, get all statuses
                cursor,
                pageSize
            );

            var result = await sender.Send(query, ct);

            return result.ToActionResult(HttpContext);
        }
    }


}

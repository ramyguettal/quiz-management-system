using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.QuizSubmissions.AddMultipleQuestionAnswer;
using quiz_management_system.Application.Features.QuizSubmissions.AnswerShortAnswer;
using quiz_management_system.Application.Features.QuizSubmissions.GetCurrentSubmission;
using quiz_management_system.Application.Features.QuizSubmissions.GetSubmissionResults;
using quiz_management_system.Application.Features.QuizSubmissions.ReleaseResults;
using quiz_management_system.Application.Features.QuizSubmissions.StartSubmissions;
using quiz_management_system.Application.Features.QuizSubmissions.GetStudentSubmittedQuizzes;
using quiz_management_system.Application.Features.QuizSubmissions.SubmitQuiz;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Contracts.Requests.UserSubmissions;

namespace quiz_management_system.App.Controllers;

[Route("api/[controller]")]
[ApiController]
[ApiVersion("1.0")]
[Authorize]
public sealed class QuizSubmissionsController(ISender sender, IUserContext userContext) : ControllerBase
{
    // -----------------------------------------------------------
    // 0. Get My Submitted Quizzes (Student)
    // -----------------------------------------------------------

    /// <summary>
    /// Returns paginated list of quizzes the student has submitted or is currently taking.
    /// </summary>
    /// <remarks>
    /// Use status filter:
    /// - InProgress: Quizzes the student has started but not yet submitted
    /// - Submitted: Quizzes submitted but not yet closed
    /// - Released: Quizzes that are closed (results available)
    /// </remarks>
    /// <param name="request">Pagination and filter parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Paginated list of submitted quizzes.</returns>
    /// <response code="200">Successfully returned submissions.</response>
    [HttpGet("my-submissions")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(typeof(CursorPagedResponse<StudentSubmittedQuizResponse>), StatusCodes.Status200OK)]
    [EndpointSummary("Get my quiz submissions.")]
    [EndpointDescription("Returns paginated list of quizzes the student has submitted or is taking with optional filters.")]
    public async Task<ActionResult<CursorPagedResponse<StudentSubmittedQuizResponse>>> GetMySubmittedQuizzes(
        [FromQuery] GetStudentSubmittedQuizzesRequest request,
        CancellationToken ct)
    {
        var query = new GetStudentSubmittedQuizzesQuery(
            userContext.UserId!.Value,
            request.Cursor,
            request.PageSize,
            request.CourseId,
            request.Status);

        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }

    // -----------------------------------------------------------
    // 1. Start Quiz Submission (Student)
    // -----------------------------------------------------------

    /// <summary>
    /// Starts a new quiz submission for a student.
    /// </summary>
    /// <param name="request">Contains QuizId and StudentId.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The ID of the created submission.</returns>
    /// <response code="201">Submission created successfully.</response>
    /// <response code="404">Quiz or Student not found.</response>
    /// <response code="400">Quiz not available or student already has active submission.</response>
    [HttpPost("start")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Start a new quiz submission.")]
    [EndpointDescription("Creates a new submission for a student to begin taking a quiz.")]
    public async Task<ActionResult<Guid>> StartQuizSubmission(
        [FromBody] StartQuizSubmissionRequest request,
        CancellationToken ct)
    {
        var command = new StartQuizSubmissionCommand(request.QuizId, userContext.UserId!.Value);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Retrieves the current in-progress submission for a student.
    /// </summary>
    /// <remarks>
    /// Returns the quiz with all questions and the student's current answers (if any).
    /// This allows students to resume their quiz after closing the browser.
    /// </remarks>
    /// <param name="quizId">The quiz ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Quiz questions with pre-filled answers.</returns>
    /// <response code="200">Successfully returned submission with questions.</response>
    /// <response code="404">Submission not found or not in progress.</response>
    [HttpGet("quiz/{quizId:guid}/current")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(typeof(SubmissionEditResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Get current in-progress submission.")]
    [EndpointDescription("Returns quiz questions with the student's current answers for resuming.")]
    public async Task<ActionResult<SubmissionEditResponse>> GetCurrentSubmission(
        Guid quizId,
        CancellationToken ct)
    {
        var query = new GetCurrentSubmissionQuery(quizId, userContext.UserId.Value);
        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Submits an answer to a multiple choice question.
    /// </summary>
    /// <remarks>
    /// Supports selecting multiple options. If the question was already answered, 
    /// this will replace the previous answer (if editing is allowed).
    /// </remarks>
    /// <param name="request">Contains SubmissionId, QuestionId, and selected option IDs.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The ID of the created answer.</returns>
    /// <response code="201">Answer created successfully.</response>
    /// <response code="404">Submission or Question not found.</response>
    /// <response code="400">Invalid state (e.g., submission already submitted).</response>
    [HttpPost("answer/multiple-choice")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Answer a multiple choice question.")]
    [EndpointDescription("Submits one or more selected options for a multiple choice question.")]
    public async Task<ActionResult<Guid>> AnswerMultipleChoice(
        [FromBody] AnswerMultipleChoiceRequest request,
        CancellationToken ct)
    {
        var command = new AnswerMultipleChoiceCommand(
            request.SubmissionId,
            request.QuestionId,
            request.SelectedOptionIds);

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Submits an answer to a short answer question.
    /// </summary>
    /// <param name="request">Contains SubmissionId, QuestionId, and answer text.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The ID of the created answer.</returns>
    /// <response code="201">Answer created successfully.</response>
    /// <response code="404">Submission or Question not found.</response>
    /// <response code="400">Invalid state or empty answer text.</response>
    [HttpPost("answer/short-answer")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Answer a short answer question.")]
    [EndpointDescription("Submits text answer for a short answer question.")]
    public async Task<ActionResult<Guid>> AnswerShortAnswer(
        [FromBody] AnswerShortAnswerRequest request,
        CancellationToken ct)
    {
        var command = new AnswerShortAnswerCommand(
            request.SubmissionId,
            request.QuestionId,
            request.AnswerText);

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Finalizes and submits a quiz for grading.
    /// </summary>
    /// <remarks>
    /// After submission, the quiz will be automatically graded. 
    /// Students cannot modify answers after submission unless editing is allowed.
    /// </remarks>
    /// <param name="request">Contains the SubmissionId.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Quiz submitted successfully.</response>
    /// <response code="404">Submission not found.</response>
    /// <response code="400">Submission already submitted.</response>
    [HttpPost("submit")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Submit quiz for grading.")]
    [EndpointDescription("Finalizes the submission and triggers automatic grading.")]
    public async Task<IActionResult> SubmitQuiz(
        [FromBody] SubmitQuizRequest request,
        CancellationToken ct)
    {
        var command = new SubmitQuizCommand(request.SubmissionId);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    // -----------------------------------------------------------
    // 6. Get Submission Results (Student View)
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves the graded results for a submission.
    /// </summary>
    /// <remarks>
    /// Only available if:
    /// - Quiz has ShowResultsImmediately = true, OR
    /// - Instructor has released results
    /// </remarks>
    /// <param name="submissionId">The submission ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Complete submission results with scores and correct answers.</returns>
    /// <response code="200">Successfully returned results.</response>
    /// <response code="404">Submission not found.</response>
    /// <response code="400">Results not available yet.</response>
    [HttpGet("{submissionId:guid}/results")]
    [Authorize(Roles = DefaultRoles.Student)]
    [ProducesResponseType(typeof(SubmissionResultResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Get submission results.")]
    [EndpointDescription("Returns graded results if available to the student.")]
    public async Task<ActionResult<SubmissionResultResponse>> GetSubmissionResults(
        Guid submissionId,
        CancellationToken ct)
    {
        var query = new GetSubmissionResultsQuery(submissionId);
        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }
    /// <summary>
    /// Releases quiz results to all students.
    /// </summary>
    /// <remarks>
    /// This endpoint is only needed when ShowResultsImmediately = false.
    /// After calling this, all students can view their results.
    /// </remarks>
    /// <param name="quizId">The quiz ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Results released successfully.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="400">Quiz not closed or results already released.</response>
    [HttpPost("quiz/{quizId:guid}/release-results")]
    [Authorize(Roles = RoleGroups.Staff)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [EndpointSummary("Release quiz results to students.")]
    [EndpointDescription("Makes results visible to all students who took the quiz.")]
    public async Task<IActionResult> ReleaseResults(
        Guid quizId,
        CancellationToken ct)
    {
        var command = new ReleaseResultsCommand(quizId);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

}
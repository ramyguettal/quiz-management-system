using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.Quizzes.AddMultipleChoiceQuestion;
using quiz_management_system.Application.Features.Quizzes.AddShortQuestion;
using quiz_management_system.Application.Features.Quizzes.CreateQuiz;
using quiz_management_system.Application.Features.Quizzes.DeleteQuestion;
using quiz_management_system.Application.Features.Quizzes.DeleteQuiz;
using quiz_management_system.Application.Features.Quizzes.GetAll;
using quiz_management_system.Application.Features.Quizzes.GetQuizById;
using quiz_management_system.Application.Features.Quizzes.PublishQuiz;
using quiz_management_system.Application.Features.Quizzes.UpdateMultipleChoiceQuestion;
using quiz_management_system.Application.Features.Quizzes.UpdateQuiz;
using quiz_management_system.Application.Features.Quizzes.UpdateShortAnswerQuestion;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Contracts.Requests.Quiz;
using quiz_management_system.Contracts.Requests.Quiz.Questions;

namespace quiz_management_system.App.Controllers;

[Route("api/quizzes")]
[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Tags("Quizzes")]
[Produces("application/json")]
public sealed class QuizzesController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Creates a new quiz.
    /// </summary>
    /// <remarks>
    /// Creates a new quiz with the specified configuration. The quiz is created in Draft status
    /// and can be assigned to multiple groups. Questions must be added separately after creation.
    /// <br/><br/>
    /// <b>Note:</b> The quiz must have at least one question before it can be published.
    /// </remarks>
    /// <param name="request">The quiz creation details including title, course, availability dates, and settings.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// The unique identifier (GUID) of the newly created quiz.
    /// </returns>
    /// <response code="200">Quiz successfully created. Returns the quiz ID.</response>
    /// <response code="400">Invalid request data or validation errors.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Course not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Creates a new quiz.")]
    [EndpointDescription("Creates a new quiz in Draft status with the specified configuration and group assignments.")]
    [EndpointName("CreateQuiz")]
    public async Task<ActionResult<Guid>> CreateQuiz(
        [FromBody] CreateQuizRequest request,
        CancellationToken ct)
    {
        var command = new CreateQuizCommand(
            request.CourseId,
            request.Title,
            request.Description,
            request.AvailableFromUtc,
            request.AvailableToUtc,
            request.ShuffleQuestions,
            request.ShowResultsImmediately,
            request.AllowEditAfterSubmission,
            request.GroupIds
        );

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Updates an existing quiz.
    /// </summary>
    /// <remarks>
    /// Updates the configuration of an existing quiz. Cannot be updated if the quiz
    /// has already been published and students have started submitting.
    /// <br/><br/>
    /// <b>Updatable fields:</b>
    /// <list type="bullet">
    /// <item>Title and description</item>
    /// <item>Availability dates</item>
    /// <item>Display and submission settings</item>
    /// <item>Group assignments</item>
    /// </list>
    /// </remarks>
    /// <param name="quizId">The unique identifier of the quiz to update.</param>
    /// <param name="request">The updated quiz configuration.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the quiz was successfully updated.
    /// </returns>
    /// <response code="204">Quiz successfully updated.</response>
    /// <response code="400">Invalid request data or validation errors.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="409">Quiz cannot be modified (has submissions or already started).</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("{quizId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Updates an existing quiz.")]
    [EndpointDescription("Updates the configuration of a quiz. Cannot update quizzes with existing student submissions.")]
    [EndpointName("UpdateQuiz")]
    public async Task<IActionResult> UpdateQuiz(
        Guid quizId,
        [FromBody] UpdateQuizRequest request,
        CancellationToken ct)
    {
        var command = new UpdateQuizCommand(
            quizId,
            request.Title,
            request.Description,
            request.AvailableFromUtc,
            request.AvailableToUtc,
            request.ShuffleQuestions,
            request.ShowResultsImmediately,
            request.AllowEditAfterSubmission,
            request.GroupIds
        );

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Retrieves a single quiz by ID.
    /// </summary>
    /// <remarks>
    /// Returns the complete details of a quiz including all questions, choices, and group assignments.
    /// This endpoint provides the full quiz data needed for quiz management and taking.
    /// </remarks>
    /// <param name="quizId">The unique identifier of the quiz to retrieve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// The complete quiz details including questions and settings.
    /// </returns>
    /// <response code="200">Quiz successfully retrieved.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="403">User is not authorized to access this quiz.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("{quizId:guid}")]
    [ProducesResponseType(typeof(QuizResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves a quiz by ID.")]
    [EndpointDescription("Returns complete quiz details including all questions, choices, and configuration settings.")]
    [EndpointName("GetQuizById")]
    public async Task<ActionResult<QuizResponse>> GetQuiz(
        Guid quizId,
        CancellationToken ct)
    {
        var query = new GetQuizByIdQuery(quizId);
        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Retrieves a paginated list of quizzes with optional filtering.
    /// </summary>
    /// <remarks>
    /// Returns quizzes using cursor-based pagination for efficient scrolling.
    /// The newest quizzes are returned first. Results can be filtered by course,
    /// instructor, academic year, and status.
    /// <br/><br/>
    /// <b>Available filters:</b>
    /// <list type="bullet">
    /// <item>CourseId - Filter by specific course</item>
    /// <item>InstructorId - Filter by instructor's assigned groups</item>
    /// <item>AcademicYearId - Filter by academic year</item>
    /// <item>Status - Filter by quiz status (Draft, Published, Archived)</item>
    /// </list>
    /// </remarks>
    /// <param name="request">Filter and pagination parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// A cursor-paginated list of quiz summaries.
    /// </returns>
    /// <response code="200">Quizzes successfully retrieved.</response>
    /// <response code="400">Invalid filter parameters.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(CursorPagedResponse<QuizListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves a filtered list of quizzes.")]
    [EndpointDescription("Returns quizzes using cursor-based pagination with optional filtering by course, instructor, year, and status.")]
    [EndpointName("GetQuizzes")]
    public async Task<ActionResult<CursorPagedResponse<QuizListItemResponse>>> GetQuizzes(
        [FromQuery] QuizFilterRequest request,
        CancellationToken ct)
    {
        var query = new GetQuizzesQuery(
            request.CourseId,
            request.InstructorId,
            request.AcademicYearId,
            request.Status,
            request.TimeQuizStatus,
            request.Cursor,
            request.PageSize
        );

        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Adds a multiple-choice question to a quiz.
    /// </summary>
    /// <remarks>
    /// Adds a new multiple-choice question with options to an existing quiz.
    /// At least one option must be marked as correct. Questions can be timed
    /// and options can be shuffled for each student.
    /// <br/><br/>
    /// <b>Requirements:</b>
    /// <list type="bullet">
    /// <item>Quiz must be in Draft status</item>
    /// <item>At least 2 options required</item>
    /// <item>Exactly one option must be marked as correct</item>
    /// <item>Points must be greater than 0</item>
    /// </list>
    /// </remarks>
    /// <param name="quizId">The unique identifier of the quiz.</param>
    /// <param name="request">The question details including text, points, options, and settings.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// The unique identifier (GUID) of the newly created question.
    /// </returns>
    /// <response code="200">Question successfully added. Returns the question ID.</response>
    /// <response code="400">Invalid request data or validation errors.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="409">Quiz is published or has submissions.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("{quizId:guid}/questions/multiple-choice")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Adds a multiple-choice question to a quiz.")]
    [EndpointDescription("Creates a new multiple-choice question with configurable options, correct answer, and timing settings.")]
    [EndpointName("AddMultipleChoiceQuestion")]
    public async Task<ActionResult<Guid>> AddMultipleChoiceQuestion(
        Guid quizId,
        [FromBody] AddMultipleChoiceQuestionRequest request,
        CancellationToken ct)
    {
        var command = new AddMultipleChoiceQuestionCommand(
            quizId,
            request.Text,
            request.Points,
            request.Options
        );

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Adds a short-answer question to a quiz.
    /// </summary>
    /// <remarks>
    /// Adds a new short-answer (text response) question to an existing quiz.
    /// These questions require manual grading by instructors unless an exact
    /// expected answer is provided for auto-grading.
    /// <br/><br/>
    /// <b>Requirements:</b>
    /// <list type="bullet">
    /// <item>Quiz must be in Draft status</item>
    /// <item>Question text is required</item>
    /// <item>Points must be greater than 0</item>
    /// <item>Expected answer is optional (for auto-grading)</item>
    /// </list>
    /// </remarks>
    /// <param name="quizId">The unique identifier of the quiz.</param>
    /// <param name="request">The question details including text, points, and optional expected answer.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// The unique identifier (GUID) of the newly created question.
    /// </returns>
    /// <response code="200">Question successfully added. Returns the question ID.</response>
    /// <response code="400">Invalid request data or validation errors.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="409">Quiz is published or has submissions.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("{quizId:guid}/questions/short-answer")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Adds a short-answer question to a quiz.")]
    [EndpointDescription("Creates a new short-answer question that requires text input from students. Supports optional auto-grading with expected answers.")]
    [EndpointName("AddShortAnswerQuestion")]
    public async Task<ActionResult<Guid>> AddShortAnswerQuestion(
        Guid quizId,
        [FromBody] AddShortAnswerQuestionRequest request,
        CancellationToken ct)
    {
        var command = new AddShortAnswerQuestionCommand(
            quizId,
            request.Text,
            request.Points,
            request.ExpectedAnswer
        );

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Updates an existing multiple-choice question.
    /// </summary>
    /// <remarks>
    /// Updates the configuration of an existing multiple-choice question.
    /// Cannot be updated if the quiz is published or has student submissions.
    /// <br/><br/>
    /// <b>Note:</b> All options must be provided in the update - this replaces
    /// the existing options entirely.
    /// </remarks>
    /// <param name="questionId">The unique identifier of the question to update.</param>
    /// <param name="request">The updated question details.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the question was successfully updated.
    /// </returns>
    /// <response code="204">Question successfully updated.</response>
    /// <response code="400">Invalid request data or validation errors.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Question not found.</response>
    /// <response code="409">Quiz is published or has submissions.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("questions/multiple-choice/{questionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Updates a multiple-choice question.")]
    [EndpointDescription("Updates an existing multiple-choice question. Cannot update questions in published quizzes with submissions.")]
    [EndpointName("UpdateMultipleChoiceQuestion")]
    public async Task<IActionResult> UpdateMultipleChoiceQuestion(
        Guid questionId,
        [FromBody] UpdateMultipleChoiceQuestionRequest request,
        CancellationToken ct)
    {
        var command = new UpdateMultipleChoiceQuestionCommand(
            questionId,
            request.Text,
            request.Points,
            request.Options
        );

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Updates an existing short-answer question.
    /// </summary>
    /// <remarks>
    /// Updates the configuration of an existing short-answer question.
    /// Cannot be updated if the quiz is published or has student submissions.
    /// </remarks>
    /// <param name="questionId">The unique identifier of the question to update.</param>
    /// <param name="request">The updated question details.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the question was successfully updated.
    /// </returns>
    /// <response code="204">Question successfully updated.</response>
    /// <response code="400">Invalid request data or validation errors.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Question not found.</response>
    /// <response code="409">Quiz is published or has submissions.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("questions/short-answer/{questionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Updates a short-answer question.")]
    [EndpointDescription("Updates an existing short-answer question. Cannot update questions in published quizzes with submissions.")]
    [EndpointName("UpdateShortAnswerQuestion")]
    public async Task<IActionResult> UpdateShortAnswerQuestion(
        Guid questionId,
        [FromBody] UpdateShortAnswerQuestionRequest request,
        CancellationToken ct)
    {
        var command = new UpdateShortAnswerQuestionCommand(
            questionId,
            request.Text,
            request.Points,
            request.ExpectedAnswer
        );

        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Deletes a question from a quiz.
    /// </summary>
    /// <remarks>
    /// Permanently removes a question and all its associated data from a quiz.
    /// Cannot delete questions from published quizzes with student submissions.
    /// <br/><br/>
    /// <b>Note:</b> This action is irreversible. All associated choices and data will be permanently deleted.
    /// </remarks>
    /// <param name="questionId">The unique identifier of the question to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the question was successfully deleted.
    /// </returns>
    /// <response code="204">Question successfully deleted.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Question not found.</response>
    /// <response code="409">Quiz is published or has submissions.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("questions/{questionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deletes a question from a quiz.")]
    [EndpointDescription("Permanently removes a question and all associated data. Cannot delete from published quizzes with submissions.")]
    [EndpointName("DeleteQuestion")]
    public async Task<IActionResult> DeleteQuestion(
        Guid questionId,
        CancellationToken ct)
    {
        var command = new DeleteQuestionCommand(questionId);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Deletes a quiz and all its associated data.
    /// </summary>
    /// <remarks>
    /// Permanently removes a quiz and all related data including questions, choices,
    /// group assignments, and submissions. Cannot delete published quizzes with
    /// student submissions to maintain academic integrity.
    /// <br/><br/>
    /// <b>Deleted data includes:</b>
    /// <list type="bullet">
    /// <item>Quiz configuration and settings</item>
    /// <item>All questions and answer choices</item>
    /// <item>Group assignments</item>
    /// <item>Submission records (if no submissions exist)</item>
    /// </list>
    /// <br/>
    /// <b>Note:</b> This action is irreversible.
    /// </remarks>
    /// <param name="id">The unique identifier of the quiz to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the quiz was successfully deleted.
    /// </returns>
    /// <response code="204">Quiz successfully deleted.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="409">Quiz has submissions or is published.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deletes a quiz.")]
    [EndpointDescription("Permanently removes a quiz and all associated data. Cannot delete quizzes with student submissions.")]
    [EndpointName("DeleteQuiz")]
    public async Task<IActionResult> DeleteQuiz(
        Guid id,
        CancellationToken ct)
    {
        var command = new DeleteQuizCommand(id);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Publishes a quiz making it available to students.
    /// </summary>
    /// <remarks>
    /// Changes the quiz status from Draft to Published, making it available for students
    /// to access based on the configured availability dates. A quiz must meet certain
    /// requirements before it can be published.
    /// <br/><br/>
    /// <b>Publishing requirements:</b>
    /// <list type="bullet">
    /// <item>Quiz must be in Draft status</item>
    /// <item>Must have at least one question</item>
    /// <item>Must be assigned to at least one group</item>
    /// <item>All questions must have valid points and answers</item>
    /// <item>Availability dates must be properly configured</item>
    /// </list>
    /// <br/>
    /// <b>Note:</b> Once published, the quiz cannot be deleted if students have submitted responses.
    /// </remarks>
    /// <param name="quizId">The unique identifier of the quiz to publish.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the quiz was successfully published.
    /// </returns>
    /// <response code="204">Quiz successfully published.</response>
    /// <response code="400">Quiz does not meet publishing requirements.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="409">Quiz is already published.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("{quizId:guid}/publish")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Publishes a quiz.")]
    [EndpointDescription("Changes quiz status to Published, making it available to students based on availability dates. Must meet all publishing requirements.")]
    [EndpointName("PublishQuiz")]
    public async Task<IActionResult> PublishQuiz(
        Guid quizId,
        CancellationToken ct)
    {
        var command = new PublishQuizCommand(quizId);
        var result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }
}
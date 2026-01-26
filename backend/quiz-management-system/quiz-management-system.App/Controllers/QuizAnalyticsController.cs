using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.QuizAnalytics.DTOs;
using quiz_management_system.Application.QuizAnalytics.Queries;

namespace quiz_management_system.App.Controllers;

[ApiController]
[Route("api/quizzes/{quizId:guid}/analytics")]
[ApiVersion("1.0")]
[Authorize(Roles = DefaultRoles.Instructor)]
[Tags("Quiz Analytics")]
[Produces("application/json")]
public sealed class QuizAnalyticsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Retrieves complete analytics for a specific quiz.
    /// </summary>
    /// <remarks>
    /// This endpoint provides comprehensive analytics data including:
    /// <br/>
    /// - **Statistics**: Total submissions, average score, pass rate, and completion rate
    /// <br/>
    /// - **Student Submissions**: Detailed list of all student attempts with scores and timing
    /// <br/>
    /// - **Question Analysis**: Performance metrics per question including success rates and difficulty
    /// <br/>
    /// - **Score Distribution**: Grade breakdown (A, B, C, D, F) across all graded submissions
    /// <br/><br/>
    /// <b>Note:</b> Statistics calculations are based only on graded submissions.
    /// Pass rate is calculated as the percentage of students scoring 50% or higher.
    /// </remarks>
    /// <param name="quizId">The unique identifier of the quiz.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// Complete analytics data for the specified quiz including statistics, submissions, 
    /// question analysis, and score distribution.
    /// </returns>
    /// <response code="200">Analytics successfully retrieved.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Quiz not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(QuizAnalyticsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves complete quiz analytics.")]
    [EndpointDescription(
        "Returns comprehensive analytics including statistics, student submissions, question performance, and score distribution.")]
    [EndpointName("GetQuizAnalytics")]
    public async Task<ActionResult<QuizAnalyticsResponse>> GetQuizAnalytics(
        Guid quizId,
        CancellationToken ct = default)
        =>
        (await sender.Send(new GetQuizAnalyticsQuery(quizId), ct))
            .ToActionResult(HttpContext);


    ///// <summary>
    ///// Get only quiz statistics (the 4 top cards)
    ///// </summary>
    //[HttpGet("statistics")]
    //[ProducesResponseType(typeof(QuizStatistics), StatusCodes.Status200OK)]
    //public async Task<IActionResult> GetQuizStatistics(Guid quizId)
    //{
    //    var query = new GetQuizAnalyticsQuery(quizId);
    //    var result = await _mediator.Send(query);

    //    if (result.IsFailure)
    //        return NotFound(new { error = result.TryGetError().Message });

    //    return Ok(result.TryGetValue().Statistics);
    //}

    ///// <summary>
    ///// Get only student submissions
    ///// </summary>
    //[HttpGet("submissions")]
    //[ProducesResponseType(typeof(List<StudentSubmissionDto>), StatusCodes.Status200OK)]
    //public async Task<IActionResult> GetStudentSubmissions(Guid quizId)
    //{
    //    var query = new GetQuizAnalyticsQuery(quizId);
    //    var result = await _mediator.Send(query);

    //    if (result.IsFailure)
    //        return NotFound(new { error = result.TryGetError().Message });

    //    return Ok(result.TryGetValue().StudentSubmissions);
    //}

    ///// <summary>
    ///// Get only question analysis
    ///// </summary>
    //[HttpGet("questions")]
    //[ProducesResponseType(typeof(List<QuestionAnalysisDto>), StatusCodes.Status200OK)]
    //public async Task<IActionResult> GetQuestionAnalysis(Guid quizId)
    //{
    //    var query = new GetQuizAnalyticsQuery(quizId);
    //    var result = await _mediator.Send(query);

    //    if (result.IsFailure)
    //        return NotFound(new { error = result.TryGetError().Message });

    //    return Ok(result.TryGetValue().QuestionAnalysis);
    //}

    ///// <summary>
    ///// Get only score distribution
    ///// </summary>
    //[HttpGet("score-distribution")]
    //[ProducesResponseType(typeof(ScoreDistribution), StatusCodes.Status200OK)]
    //public async Task<IActionResult> GetScoreDistribution(Guid quizId)
    //{
    //    var query = new GetQuizAnalyticsQuery(quizId);
    //    var result = await _mediator.Send(query);

    //    if (result.IsFailure)
    //        return NotFound(new { error = result.TryGetError().Message });

    //    return Ok(result.TryGetValue().ScoreDistribution);
    //}
}
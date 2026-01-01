using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.Dashboard;
using quiz_management_system.Contracts.Reponses.Dashboards;

namespace quiz_management_system.App.Controllers;

[Route("api/dashboard")]
[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Tags("Dashboard")]
[Produces("application/json")]
public sealed class DashboardController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Retrieves dashboard statistics.
    /// </summary>
    /// <remarks>
    /// Returns key statistics for the dashboard including counts of courses, quizzes, students, and other summary data.
    /// This endpoint provides an overview of the system metrics for administrative purposes.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// A <see cref="DashboardStatsResponse"/> containing aggregated statistics for the dashboard.
    /// </returns>
    /// <response code="200">Dashboard stats successfully retrieved.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="403">User is not authorized to view dashboard statistics.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves dashboard statistics.")]
    [EndpointDescription("Provides aggregated statistics for courses, quizzes, students, and other dashboard metrics.")]
    [EndpointName("GetDashboardStats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetDashboardStats(CancellationToken ct)
    {
        var query = new GetDashboardStatsQuery();
        var result = await sender.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }
}

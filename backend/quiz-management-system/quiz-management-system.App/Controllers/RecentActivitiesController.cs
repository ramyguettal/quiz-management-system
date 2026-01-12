using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.RecentActivities.Commands.DeleteRecentActivities;
using quiz_management_system.Application.Features.RecentActivities.Queries.GetRecentActivities;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.RecentActivity;
using quiz_management_system.Contracts.Requests.RecentActivity;
using quiz_management_system.Domain.Common;

namespace quiz_management_system.App.Controllers;

/// <summary>
/// Manages recent activities for admin audit trail.
/// </summary>
[ApiController]
[Route("api/recent-activities")]
[Tags("Recent Activities")]
[ApiVersion("1.0")]
[Authorize(Roles = RoleGroups.Admins)]
public sealed class RecentActivitiesController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets a cursor-paginated list of recent activities.
    /// </summary>
    /// <remarks>
    /// Returns activities ordered by most recent first using cursor-based pagination.
    /// Only accessible by admins.
    /// </remarks>
    /// <param name="cursor">Optional cursor for pagination (ISO 8601 timestamp)</param>
    /// <param name="pageSize">Number of items per page (default: 20, max: 50)</param>
    /// <param name="activityType">Optional filter by activity type</param>
    /// <param name="ct">Cancellation token</param>
    /// <response code="200">Returns cursor-paginated list of recent activities.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden — missing Admin role.</response>
    [HttpGet]
    [EndpointSummary("Gets cursor-paginated recent activities")]
    [EndpointDescription("Returns a cursor-paginated list of recent system activities for admin audit trail.")]
    [ProducesResponseType(typeof(CursorPagedResponse<RecentActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CursorPagedResponse<RecentActivityResponse>>> GetRecentActivities(
        [FromQuery] string? cursor = null,
        [FromQuery] int pageSize = 20,
        [FromQuery] ActivityType? activityType = null,
        CancellationToken ct = default)
    {
        var query = new GetRecentActivitiesQuery(cursor, pageSize, activityType);
        var result = await sender.Send(query, ct);
        return result.ToActionResult<CursorPagedResponse<RecentActivityResponse>>(HttpContext);
    }

    /// <summary>
    /// Deletes multiple recent activities by their IDs.
    /// </summary>
    /// <remarks>
    /// Permanently removes the specified activities. Only accessible by admins.
    /// </remarks>
    /// <param name="request">List of activity IDs to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Returns the number of deleted activities.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden — missing Admin role.</response>
    [HttpDelete]
    [EndpointSummary("Deletes multiple recent activities")]
    [EndpointDescription("Permanently removes the specified activities from the audit trail.")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<int>> DeleteRecentActivities(
        [FromBody] DeleteRecentActivitiesRequest request,
        CancellationToken ct)
    {
        var command = new DeleteRecentActivitiesCommand(request.Ids);
        var result = await sender.Send(command, ct);
        return result.ToActionResult<int>(HttpContext);
    }
}

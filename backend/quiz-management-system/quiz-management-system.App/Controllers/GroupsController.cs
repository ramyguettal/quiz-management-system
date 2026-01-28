using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.Groups.Queries.GetGroups;
using quiz_management_system.Contracts.Reponses.Groups;

namespace quiz_management_system.App.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiVersion("1.0")]
public class GroupsController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Get all groups with their assigned academic years.
    /// </summary>
    /// <param name="yearId">Optional academic year ID to filter groups by.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <remarks>
    /// Returns a list of all groups enriched with their academic year information.
    /// Optionally filter by academic year using the yearId query parameter.
    /// This endpoint is cached for 24 hours to improve performance.
    /// </remarks>
    /// <returns>List of <see cref="GroupWithAcademicYearResponse"/> objects</returns>
    /// <response code="200">Returns the list of groups</response>
    [HttpGet]
    [OutputCache(Duration = 86400, VaryByQueryKeys = ["yearId"], Tags = ["groups"])]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<GroupWithAcademicYearResponse>>> GetGroups(
        [FromQuery] Guid? yearId,
        CancellationToken ct)
    {
        var query = new GetAllGroupsQuery(yearId);
        var result = await mediator.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }
}
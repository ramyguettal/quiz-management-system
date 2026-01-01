using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.Groups.Queries.GetGroups;
using quiz_management_system.Contracts.Reponses.Groups;

namespace quiz_management_system.App.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiVersion("1.0")]

public class GroupsController(IMediator _mediator) : ControllerBase
{
    /// <summary>
    /// Get all groups with their assigned academic years.
    /// </summary>
    /// <remarks>
    /// Returns a list of all groups enriched with their academic year information.
    /// This endpoint is cached for 24 hours to improve performance.
    /// </remarks>
    /// <returns>List of <see cref="GroupWithAcademicYearResponse"/> objects</returns>
    /// <response code="200">Returns the list of groups</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<GroupWithAcademicYearResponse>>> GetGroups(CancellationToken ct)
    {
        var query = new GetAllGroupsQuery();
        var result = await _mediator.Send(query, ct);

        return result.ToActionResult(HttpContext);
    }
}
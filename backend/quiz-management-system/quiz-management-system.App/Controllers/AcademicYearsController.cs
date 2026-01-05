using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.AcademicYearFolder.Queries;
using quiz_management_system.Contracts.Requests;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

[Route("api/[controller]")]
[ApiController]
[ApiVersion("1.0")]
[Authorize]
public sealed class AcademicYearsController(ISender sender) : ControllerBase
{
    // -----------------------------------------------------------
    // 1. Get all academic years
    // -----------------------------------------------------------

    /// <summary>
    /// Retrieves all academic years available in the system.
    /// </summary>
    /// <remarks>
    /// This endpoint is cached for 24 hours.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of academic years.</returns>
    /// <response code="200">Successfully returned academic years.</response>
    [HttpGet]
    [Authorize(Roles = RoleGroups.Admins)]
    [ProducesResponseType(typeof(IReadOnlyList<AcademicYearResponse>), StatusCodes.Status200OK)]
    [EndpointSummary("Get all academic years (cached for 24 hours).")]
    [EndpointDescription("Returns all academic years in the system. Cached to improve performance.")]
    public async Task<ActionResult<IReadOnlyList<AcademicYearResponse>>> GetAllAcademicYears(
        CancellationToken ct)
    {
        Result<IReadOnlyList<AcademicYearResponse>> result =
            await sender.Send(new GetAllAcademicYearsQuery(), ct);

        return result.ToActionResult(HttpContext);
    }
}
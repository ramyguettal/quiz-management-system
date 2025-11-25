using Makayen.App.Helpers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.CreateStudent;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

[ApiController]
[Route("api/students")]
[Tags("Students")]
[Produces("application/json")]
[Authorize]
public sealed class StudentsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Creates a new student account.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StudentResponse), 200)]
    [Authorize(Roles = RoleGroups.Admins)]
    public async Task<ActionResult<StudentResponse>> CreateStudent(
        [FromBody] CreateStudentRequest request,
        CancellationToken ct)
    {
        var command = new CreateStudentCommand(
            request.Email,
            request.FullName,
            request.AcademicYear,
            request.GroupNumber,
            request.AverageGrade
        );

        Result<StudentResponse> result = await sender.Send(command, ct);
        return result.ToActionResult<StudentResponse>(HttpContext);
    }
}

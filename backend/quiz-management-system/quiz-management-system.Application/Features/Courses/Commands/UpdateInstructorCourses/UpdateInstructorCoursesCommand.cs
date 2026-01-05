using MediatR;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateInstructorCourses;

public sealed record UpdateInstructorCoursesCommand(
    Guid InstructorId,
    IReadOnlyList<Guid> CourseIds
) : IRequest<Result<IReadOnlyList<CourseResponse>>>;

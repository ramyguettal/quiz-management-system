using MediatR;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetCoursesByInstructor;

public sealed record GetCoursesByInstructorQuery(Guid InstructorId)
    : IRequest<Result<IReadOnlyList<CourseResponse>>>;

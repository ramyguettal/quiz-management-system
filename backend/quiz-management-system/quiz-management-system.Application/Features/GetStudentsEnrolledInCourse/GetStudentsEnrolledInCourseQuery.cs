using MediatR;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.GetStudentsEnrolledInCourse;

public sealed record GetStudentsEnrolledInInstructorCoursesQuery(
    Guid CourseId
) : IRequest<Result<IReadOnlyList<CourseStudentResponse>>>;
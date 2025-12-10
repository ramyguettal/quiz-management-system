using MediatR;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetMyCourses;

public sealed record GetMyCoursesQuery
    : IRequest<Result<IReadOnlyList<CourseResponse>>>;

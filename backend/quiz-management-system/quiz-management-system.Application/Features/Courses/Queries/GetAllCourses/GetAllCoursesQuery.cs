using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;

public sealed record GetAllCoursesQuery()
    : ICachedQuery<Result<IReadOnlyList<CourseResponse>>>
{
    public string CacheKey => "courses:all";
    public string[] Tags => new[] { "courses" };
    public TimeSpan Expiration => TimeSpan.FromHours(24);
}

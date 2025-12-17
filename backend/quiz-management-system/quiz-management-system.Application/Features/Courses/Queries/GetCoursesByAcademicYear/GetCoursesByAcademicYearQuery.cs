using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetCoursesByAcademicYear;

public sealed record GetCoursesByAcademicYearQuery(Guid AcademicYearId)
    : ICachedQuery<Result<IReadOnlyList<CourseResponse>>>
{
    public string CacheKey => $"courses:year:{AcademicYearId}";
    public string[] Tags => new[] { "courses" };
    public TimeSpan Expiration => TimeSpan.FromHours(24);
}

using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Requests;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.AcademicYearFolder.Queries;

public sealed record GetAllAcademicYearsQuery()
    : ICachedQuery<Result<IReadOnlyList<AcademicYearResponse>>>
{
    public string CacheKey => "academic-years:all";
    public string[] Tags => new[] { "academic-years" };
    public TimeSpan Expiration => TimeSpan.FromHours(24);
}

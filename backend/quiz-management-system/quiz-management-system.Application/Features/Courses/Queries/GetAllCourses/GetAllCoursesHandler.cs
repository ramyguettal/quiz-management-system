using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;

public sealed class GetAllCoursesHandler
    : IRequestHandler<GetAllCoursesQuery, Result<IReadOnlyList<CourseResponse>>>
{
    private readonly IAppDbContext context;

    public GetAllCoursesHandler(IAppDbContext context)
    {
        this.context = context;
    }

    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        GetAllCoursesQuery request,
        CancellationToken ct)
    {
        List<CourseResponse> courses = await context.Courses
            .AsNoTracking()
            .Include(c => c.AcademicYear)
            .Select(c => new CourseResponse(
                c.Id,
                c.AcademicYearId,
                c.Title,
                c.AcademicYear.Number
            ))
            .ToListAsync(ct);

        return Result.Success<IReadOnlyList<CourseResponse>>(courses);
    }
}
using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;

public sealed class GetAllCoursesHandler(IAppDbContext context)
    : IRequestHandler<GetAllCoursesQuery, Result<IReadOnlyList<CourseResponse>>>
{



    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        GetAllCoursesQuery request,
        CancellationToken ct)
    {

        var studentCountsByYear =
    context.Students
        .GroupBy(s => s.AcademicYearId)
        .Select(g => new
        {
            AcademicYearId = g.Key,
            Count = g.Count()
        });

        List<CourseResponse> courses = await context.Courses
     .AsNoTracking()
     .Select(c => new CourseResponse(
         c.Id,
         c.AcademicYearId,
         c.Title,
         c.Description,
         c.Code,
         c.AcademicYear.Number,
         studentCountsByYear
             .Where(sc => sc.AcademicYearId == c.AcademicYearId)
             .Select(sc => sc.Count)
             .FirstOrDefault()

     ))
     .ToListAsync(ct);

        return Result.Success<IReadOnlyList<CourseResponse>>(courses);
    }
}
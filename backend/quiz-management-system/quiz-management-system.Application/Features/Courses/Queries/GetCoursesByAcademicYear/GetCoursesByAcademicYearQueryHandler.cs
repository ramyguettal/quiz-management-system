using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetCoursesByAcademicYear;

public sealed class GetCoursesByAcademicYearQueryHandler(IAppDbContext context)
    : IRequestHandler<GetCoursesByAcademicYearQuery, Result<IReadOnlyList<CourseResponse>>>
{

    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        GetCoursesByAcademicYearQuery request,
        CancellationToken cancellationToken)
    {
        //validate academic year exists
        bool yearExists = await context.AcademicYears
            .AsNoTracking()
            .AnyAsync(y => y.Id == request.AcademicYearId, cancellationToken);

        if (!yearExists)
        {
            return Result.Failure<IReadOnlyList<CourseResponse>>(
                DomainError.NotFound(nameof(AcademicYear), request.AcademicYearId));
        }

        List<CourseResponse> courses = await context.Courses
            .AsNoTracking()
            .Where(c => c.AcademicYearId == request.AcademicYearId)
            .Include(c => c.AcademicYear)
            .Select(c => new CourseResponse(
                c.Id,
                c.AcademicYearId,
                c.Description,
                c.Code,
                c.Title,
                c.AcademicYear.Number
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<CourseResponse>>(courses);
    }
}

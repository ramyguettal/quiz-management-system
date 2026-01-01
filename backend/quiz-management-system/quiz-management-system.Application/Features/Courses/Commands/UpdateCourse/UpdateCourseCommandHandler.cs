using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateCourse;

public sealed class UpdateCourseCommandHandler(IMemoryCache cache, IAppDbContext db)
    : IRequestHandler<UpdateCourseCommand, Result<CourseResponse>>
{

    public async Task<Result<CourseResponse>> Handle(
        UpdateCourseCommand request,
        CancellationToken ct)
    {
        var course = await db.Courses
            .Include(c => c.AcademicYear)
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, ct);

        if (course is null)
        {
            return Result.Failure<CourseResponse>(
                DomainError.NotFound(nameof(course), request.CourseId));
        }

        AcademicYear? year = await db.AcademicYears
            .FirstOrDefaultAsync(y => y.Id == request.AcademicYearId, ct);

        if (year is null)
        {
            return Result.Failure<CourseResponse>(
                DomainError.NotFound(nameof(AcademicYear), request.AcademicYearId));
        }

        var titleResult = course.UpdateTitle(request.Title);
        if (titleResult.IsFailure)
            return Result.Failure<CourseResponse>(titleResult.TryGetError());

        var yearResult = course.UpdateAcademicYear(year);
        if (yearResult.IsFailure)
            return Result.Failure<CourseResponse>(yearResult.TryGetError());

        await db.SaveChangesAsync(ct);
        cache.Remove(GetAllCoursesQuery.GetCacheKey());
        return Result.Success(new CourseResponse(
            course.Id,
            course.AcademicYearId,
            course.Title,
            year.Number
        ));
    }
}
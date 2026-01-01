using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using quiz_management_system.Application.Features.Courses.Commands.CreateCourse;
using quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

public sealed class CreateCourseCommandHandler(IMemoryCache cache, IAppDbContext db)
    : IRequestHandler<CreateCourseCommand, Result<CourseResponse>>
{
    public async Task<Result<CourseResponse>> Handle(
        CreateCourseCommand request,
        CancellationToken ct)
    {
        bool codeExists = await db.Courses
            .AnyAsync(c => c.Code == request.Code, ct);

        if (codeExists)
        {
            return Result.Failure<CourseResponse>(
                DomainError.InvalidState(nameof(Course),
                    $"Course code '{request.Code}' already exists."));
        }

        AcademicYear? year = await db.AcademicYears
            .FirstOrDefaultAsync(y => y.Id == request.AcademicYearId, ct);

        if (year is null)
        {
            return Result.Failure<CourseResponse>(
                DomainError.NotFound(nameof(AcademicYear), request.AcademicYearId));
        }

        var courseResult = Course.Create(
            Guid.NewGuid(),
            request.Title,
            request.Description,
            request.Code,
            year);

        if (courseResult.IsFailure)
            return Result.Failure<CourseResponse>(courseResult.TryGetError());

        Course course = courseResult.TryGetValue();

        db.Courses.Add(course);
        await db.SaveChangesAsync(ct);

        cache.Remove(GetAllCoursesQuery.GetCacheKey());

        return Result.Success(new CourseResponse(
            course.Id,
            course.AcademicYearId,
            course.Title,
            course.Description,
            course.Code,
            year.Number,
            0
        ));
    }
}
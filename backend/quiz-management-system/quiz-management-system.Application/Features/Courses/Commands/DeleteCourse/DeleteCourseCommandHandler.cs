using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Commands.DeleteCourse;

public sealed class DeleteCourseCommandHandler(IMemoryCache cache, IAppDbContext db)
    : IRequestHandler<DeleteCourseCommand, Result>
{


    public async Task<Result> Handle(
        DeleteCourseCommand request,
        CancellationToken ct)
    {
        int affectedRows = await db.Courses
            .Where(course => course.Id == request.CourseId)
            .ExecuteDeleteAsync(ct);

        if (affectedRows == 0)
        {
            return Result.Failure(
                DomainError.NotFound("Course not found."));
        }
        cache.Remove(GetAllCoursesQuery.GetCacheKey());
        return Result.Success();
    }
}
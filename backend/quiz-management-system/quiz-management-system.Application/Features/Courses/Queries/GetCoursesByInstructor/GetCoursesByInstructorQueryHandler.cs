using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetCoursesByInstructor;

public sealed class GetCoursesByInstructorQueryHandler(IAppDbContext context)
    : IRequestHandler<GetCoursesByInstructorQuery, Result<IReadOnlyList<CourseResponse>>>
{



    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        GetCoursesByInstructorQuery request,
        CancellationToken cancellationToken)
    {

        bool exists = await context.Instructors
          .AsNoTracking()
          .AnyAsync(i => i.Id == request.InstructorId, cancellationToken);

        if (!exists)
            return Result.Failure<IReadOnlyList<CourseResponse>>(
                UserError.NotFound("Instructor not found"));

        List<CourseResponse> courses = await context.InstructorCourses
            .AsNoTracking()
            .Where(ic => ic.InstructorId == request.InstructorId)
            .Select(ic => new CourseResponse(
                ic.Course.Id,
                ic.Course.AcademicYearId,
                ic.Course.Title,
                ic.Course.Description,
                ic.Course.Code,
                ic.Course.AcademicYear.Number
            ))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<CourseResponse>>(courses);
    }
}

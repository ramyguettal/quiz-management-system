using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Application.Features.Courses.Queries.GetMyCourses;

public sealed class GetMyCoursesQueryHandler(IAppDbContext db, IUserContext userContext)
    : IRequestHandler<GetMyCoursesQuery, Result<IReadOnlyList<CourseResponse>>>
{
    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        GetMyCoursesQuery request,
        CancellationToken cancellationToken)
    {
        Guid? userId = userContext.UserId;

        if (userId is null)
        {
            return Result.Failure<IReadOnlyList<CourseResponse>>(UserError.NotFound());
        }


        DomainUser? user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        if (user is null)
        {
            return Result.Failure<IReadOnlyList<CourseResponse>>(UserError.NotFound());
        }


        if (user.Role == Role.Student)
        {
            Guid? academicYearId = await db.Students
                .AsNoTracking()
                .Where(s => s.Id == userId.Value)
                .Select(s => (Guid?)s.AcademicYearId)
                .FirstOrDefaultAsync(cancellationToken);

            if (!academicYearId.HasValue)
            {
                return Result.Failure<IReadOnlyList<CourseResponse>>(
                    DomainError.NotFound(nameof(AcademicYear)));
            }

            List<CourseResponse> courses = await db.Courses
                .AsNoTracking()
                .Where(c => c.AcademicYearId == academicYearId.Value)
                .Include(c => c.AcademicYear)
                .Select(c => new CourseResponse(
                    c.Id,
                    c.AcademicYearId,
                    c.Title,
                    c.AcademicYear.Number
                ))
                .ToListAsync(cancellationToken);

            return Result.Success<IReadOnlyList<CourseResponse>>(courses);
        }

        // -------------------------------------------------------
        // INSTRUCTOR
        // -------------------------------------------------------
        if (user.Role == Role.Instructor)
        {
            List<CourseResponse> courses = await db.InstructorCourses
                .AsNoTracking()
                .Where(ic => ic.InstructorId == userId.Value)
                .Select(ic => new CourseResponse(
                    ic.Course.Id,
                    ic.Course.AcademicYearId,
                    ic.Course.Title,
                    ic.Course.AcademicYear.Number
                ))
                .ToListAsync(cancellationToken);

            return Result.Success<IReadOnlyList<CourseResponse>>(courses);
        }

        // -------------------------------------------------------
        // OTHER ROLES (Admin, etc.)
        // -------------------------------------------------------
        return Result.Success<IReadOnlyList<CourseResponse>>(Array.Empty<CourseResponse>());
    }
}

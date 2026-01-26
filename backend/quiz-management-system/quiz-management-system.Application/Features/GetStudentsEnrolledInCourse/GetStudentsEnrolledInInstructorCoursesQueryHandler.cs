using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.GetStudentsEnrolledInCourse;

public sealed class GetStudentsEnrolledInInstructorCoursesQueryHandler(IAppDbContext db, IUserContext userContext)
    : IRequestHandler<GetStudentsEnrolledInInstructorCoursesQuery, Result<IReadOnlyList<CourseStudentResponse>>>
{

    public async Task<Result<IReadOnlyList<CourseStudentResponse>>> Handle(
        GetStudentsEnrolledInInstructorCoursesQuery request,
        CancellationToken ct)
    {
        if (userContext.UserId is null)
        {
            return Result.Failure<IReadOnlyList<CourseStudentResponse>>(
                UserError.Unauthorized());
        }

        var students = await db.Students
            .AsNoTracking()
            // Student is enrolled in the course via AcademicYear
            .Where(s =>
                s.AcademicYear.Courses.Any(c => c.Id == request.CourseId))
            .Select(s => new CourseStudentResponse(
                s.Id,
                s.FullName,
                s.Email,
                // COUNT submissions for this course (LEFT JOIN)
                s.Submissions
                    .Count(sub => sub.Quiz.CourseId == request.CourseId)
            ))
            .ToListAsync(ct);

        return Result.Success<IReadOnlyList<CourseStudentResponse>>(students);
    }
}
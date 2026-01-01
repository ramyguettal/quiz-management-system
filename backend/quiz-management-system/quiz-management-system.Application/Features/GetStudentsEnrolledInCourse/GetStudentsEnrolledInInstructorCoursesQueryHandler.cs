using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.GetStudentsEnrolledInCourse;

public sealed class GetStudentsEnrolledInInstructorCoursesQueryHandler(IAppDbContext db, ISender sender, IUserContext userContext)
    : IRequestHandler<GetStudentsEnrolledInInstructorCoursesQuery, Result<IReadOnlyList<CourseStudentResponse>>>
{


    public async Task<Result<IReadOnlyList<CourseStudentResponse>>> Handle(
        GetStudentsEnrolledInInstructorCoursesQuery request,
        CancellationToken ct)
    {
        // 1️⃣ Authorization
        if (userContext.UserId is null)
        {
            return Result.Failure<IReadOnlyList<CourseStudentResponse>>(
                UserError.Unauthorized());
        }



        // 2 Get students via submissions → quiz → course
        var students = await db.QuizSubmissions
            .AsNoTracking()
            .Where(s => s.Quiz.CourseId == request.CourseId)
            .GroupBy(s => new
            {
                s.Student.Id,
                s.Student.FullName,
                s.Student.Email
            })
            .Select(g => new CourseStudentResponse(
                g.Key.Id,
                g.Key.FullName,
                g.Key.Email,
                g.Select(x => x.QuizId).Distinct().Count()
            ))
            .ToListAsync(ct);

        return Result.Success<IReadOnlyList<CourseStudentResponse>>(students);
    }
}
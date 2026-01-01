using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Contracts.Reponses.Dashboards;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Application.Features.Dashboard;

public sealed class GetInstructorDashboardStatsQueryHandler(IAppDbContext db, ISender sender, IUserContext userContext)
    : IRequestHandler<GetInstructorDashboardStatsQuery, Result<AdminDashboardStatsResponse>>
{
    public async Task<Result<AdminDashboardStatsResponse>> Handle(
     GetInstructorDashboardStatsQuery request,
     CancellationToken ct)
    {
        if (userContext.UserId is null)
            return Result.Failure<AdminDashboardStatsResponse>(UserError.Unauthorized());

        // 1️⃣ Get courses via existing handler
        Result<IReadOnlyList<CourseResponse>> coursesResult =
            await sender.Send(new GetAllCoursesQuery(), ct);

        if (coursesResult.IsFailure)
            return Result.Failure<AdminDashboardStatsResponse>(coursesResult.TryGetError());

        var courses = coursesResult.TryGetValue()
            .OrderBy(c => c.AcademicYearNumber)
            .ToList();

        // 2️⃣ Instructor-specific quiz stats
        var quizStats = await db.Quizzes
            .Where(q => q.CreatedBy == userContext.UserId.Value)
            .GroupBy(q => q.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        int publishedQuizzes = quizStats
            .FirstOrDefault(x => x.Status == QuizStatus.Published)?.Count ?? 0;

        int draftQuizzes = quizStats
            .FirstOrDefault(x => x.Status == QuizStatus.Draft)?.Count ?? 0;

        int closedQuizzes = quizStats
            .FirstOrDefault(x => x.Status == QuizStatus.Closed)?.Count ?? 0;

        // 3️⃣ Total students & instructors
        int totalStudents = await db.Students.CountAsync(ct);
        int totalInstructors = await db.Instructors.CountAsync(ct);

        // 4️⃣ Compose response
        var response = new AdminDashboardStatsResponse(
            TotalCourses: courses.Count,
            PublishedQuizzes: publishedQuizzes,
            DraftQuizzes: draftQuizzes,
            ClosedQuizzes: closedQuizzes,
            TotalStudents: totalStudents,
            TotalInstructors: totalInstructors,
            CourseResponses: courses
        );

        return Result.Success(response);
    }


}


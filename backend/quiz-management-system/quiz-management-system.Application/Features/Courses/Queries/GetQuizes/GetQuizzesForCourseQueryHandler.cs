using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

public class GetQuizzesForCourseQueryHandler(IAppDbContext _context)
    : IRequestHandler<GetQuizzesForCourseQuery, Result<CourseQuizzesOverview>>
{
    public async Task<Result<CourseQuizzesOverview>> Handle(
        GetQuizzesForCourseQuery request,
        CancellationToken ct)
    {
        // Verify course exists
        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, ct);

        if (course is null)
            return Result.Failure<CourseQuizzesOverview>(
                DomainError.NotFound(nameof(Course), request.CourseId));

        // Get all quizzes for the course
        var quizzes = await _context.Quizzes
            .Where(q => q.CourseId == request.CourseId)
            .Include(q => q.Questions)
            .Include(q => q.Submissions)
            .OrderByDescending(q => q.CreatedAtUtc)
            .Select(q => new QuizListItemMiniResponse(
                q.Id,
                q.Title,
                q.AvailableFromUtc,
                q.AvailableToUtc ?? q.AvailableFromUtc.AddHours(1),
                q.CreatedAtUtc,
                q.Status,
                q.Questions.Count,
                q.Submissions.Count,
                q.ResultsReleased
            ))
            .ToListAsync(ct);

        var overview = new CourseQuizzesOverview(
            course.Id,
            course.Title,
            course.Description,
            course.Code,
            quizzes
        );

        return Result.Success(overview);
    }
}
using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Enums;
using quiz_management_system.Domain.Users.StudentsFolder;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Application.Features.Dashboard;

public sealed record GetStudentDashboardQuery : IRequest<Result<StudentDashboardResponse>>;




public sealed class GetStudentDashboardQueryHandler(
    IAppDbContext db,
    IUserContext userContext)
    : IRequestHandler<GetStudentDashboardQuery, Result<StudentDashboardResponse>>
{
    private const int MAX_AVAILABLE_QUIZZES = 10;
    private const int MAX_RECENT_NOTIFICATIONS = 5;

    public async Task<Result<StudentDashboardResponse>> Handle(
        GetStudentDashboardQuery request,
        CancellationToken ct)
    {
        if (userContext.UserId is null)
            return Result.Failure<StudentDashboardResponse>(UserError.Unauthorized());

        Guid studentId = userContext.UserId.Value;

        // Get student with their group IDs
        var student = await db.Students
            .AsNoTracking()
            .Include(s => s.AcademicYear)
            .FirstOrDefaultAsync(s => s.Id == studentId, ct);

        if (student is null)
            return Result.Failure<StudentDashboardResponse>(
                DomainError.NotFound(nameof(Student), studentId));

        // Get student's group IDs
        var groupId = await db.GroupStudents
            .AsNoTracking()
            .Where(gs => gs.StudentId == studentId)
            .Select(s => s.GroupId)
            .FirstAsync();


        // Calculate stats
        var stats = await CalculateStats(studentId, groupId, ct);

        // Get available quizzes
        var availableQuizzes = await GetAvailableQuizzes(studentId, groupId, ct);

        // Get recent notifications
        var recentNotifications = await GetRecentNotifications(studentId, ct);

        var response = new StudentDashboardResponse(
            Stats: stats,
            AvailableQuizzes: availableQuizzes,
            RecentNotifications: recentNotifications
        );

        return Result.Success(response);
    }

    private async Task<StudentDashboardStats> CalculateStats(
        Guid studentId,
        Guid groupId,
        CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        // Count active quizzes (published, within date range, in student's groups)
        int activeQuizzes = await db.Quizzes
            .AsNoTracking()
            .Where(q =>
                q.Status == QuizStatus.Published &&
                q.AvailableFromUtc <= now &&
                (q.AvailableToUtc == null || q.AvailableToUtc > now) &&
                q.Groups.Any(q => q.GroupId == groupId)
                )
            .CountAsync(ct);

        // Get all student submissions
        var submissions = await db.QuizSubmissions
            .AsNoTracking()
            .Where(s => s.StudentId == studentId)
            .ToListAsync(ct);

        // Count completed quizzes (submitted or graded)
        int completedQuizzes = submissions
            .Count(s => s.Status == SubmissionStatus.Submitted ||
                       s.Status == SubmissionStatus.Graded);

        // Calculate average score from graded submissions
        var gradedSubmissions = submissions
            .Where(s => s.Status == SubmissionStatus.Graded)
            .ToList();

        decimal averageScore = gradedSubmissions.Any()
            ? Math.Round(gradedSubmissions.Average(s => s.Percentage), 0)
            : 0;

        // Calculate score change (compare last 5 vs previous 5)
        string averageScoreChange = CalculateScoreChange(gradedSubmissions);

        // Count unread notifications
        int unreadNotifications = await db.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == studentId && !n.IsRead, ct);

        return new StudentDashboardStats(
            ActiveQuizzes: activeQuizzes,
            CompletedQuizzes: completedQuizzes,
            AverageScore: averageScore,
            AverageScoreChange: averageScoreChange,
            UnreadNotifications: unreadNotifications
        );
    }

    private string CalculateScoreChange(List<Domain.UserSubmission.QuizSubmission> gradedSubmissions)
    {
        if (gradedSubmissions.Count < 2)
            return "+0%";

        // Order by graded date
        var ordered = gradedSubmissions
            .OrderByDescending(s => s.GradedAtUtc)
            .ToList();

        // Take last 5 and previous 5
        var recent = ordered.Take(Math.Min(5, ordered.Count)).ToList();
        var previous = ordered.Skip(recent.Count).Take(5).ToList();

        if (!previous.Any())
            return "+0%";

        decimal recentAvg = recent.Average(s => s.Percentage);
        decimal previousAvg = previous.Average(s => s.Percentage);
        decimal change = recentAvg - previousAvg;

        string sign = change >= 0 ? "+" : "";
        return $"{sign}{Math.Round(change, 0)}%";
    }

    private async Task<List<AvailableQuizResponse>> GetAvailableQuizzes(
        Guid studentId,
       Guid groupId,
        CancellationToken ct)
    {
        if (groupId == null)
            return new List<AvailableQuizResponse>();

        var now = DateTimeOffset.UtcNow;

        // Get quizzes available to student's groups
        var quizzes = await db.Quizzes
            .AsNoTracking()
            .Include(q => q.Groups)
            .Where(q =>
                q.Status == QuizStatus.Published &&
                q.Groups.Any(qg => qg.GroupId == groupId))
            .OrderBy(q => q.AvailableFromUtc)
            .Take(MAX_AVAILABLE_QUIZZES)
            .Select(q => new
            {
                q.Id,
                q.Title,
                q.AvailableFromUtc,
                q.AvailableToUtc,
                q.CreatedBy
            })
            .ToListAsync(ct);

        // Get instructor names
        var instructorIds = quizzes
            .Select(q => q.CreatedBy)
            .Distinct()
            .ToHashSet();

        var instructors = await db.Instructors
            .AsNoTracking()
            .Where(i => instructorIds.Contains(i.Id))
            .Select(i => new { i.Id, i.FullName })
            .ToDictionaryAsync(i => i.Id, i => i.FullName, ct);

        // Check if student has already submitted
        var submittedQuizIds = await db.QuizSubmissions
            .AsNoTracking()
            .Where(s => s.StudentId == studentId)
            .Select(s => s.QuizId)
            .ToHashSetAsync();

        return quizzes
            .Where(q => !submittedQuizIds.Contains(q.Id)) // Exclude already submitted
            .Select(q =>
            {
                bool isActive = q.AvailableFromUtc <= now &&
                               (q.AvailableToUtc == null || q.AvailableToUtc > now);

                bool isUpcoming = q.AvailableFromUtc > now;

                TimeQuizStatus status = isActive ? TimeQuizStatus.Active : isUpcoming ? TimeQuizStatus.Upcoming : TimeQuizStatus.Ended;
                DateTimeOffset deadline = q.AvailableToUtc ?? q.AvailableFromUtc;

                instructors.TryGetValue(q.CreatedBy, out var instructorName);

                return new AvailableQuizResponse(
                    Id: q.Id,
                    Title: q.Title,
                    InstructorName: instructorName ?? "Unknown",
                    Status: status,
                    Deadline: deadline,
                    CanStart: isActive
                );
            })
            .ToList();
    }

    private async Task<List<RecentNotificationResponse>> GetRecentNotifications(
        Guid studentId,
        CancellationToken ct)
    {
        var notifications = await db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == studentId)
            .OrderByDescending(n => n.CreatedUtc)
            .Take(MAX_RECENT_NOTIFICATIONS)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Body,
                n.CreatedUtc
            })
            .ToListAsync(ct);

        var now = DateTimeOffset.UtcNow;

        return notifications
            .Select(n => new RecentNotificationResponse(
                Id: n.Id,
                Title: n.Title,
                Body: n.Body,
                CreatedAt: n.CreatedUtc
            ))
            .ToList();
    }


}
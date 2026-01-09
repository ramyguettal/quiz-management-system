using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Configuration;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.PushNotifications.Enums;
using quiz_management_system.Domain.QuizesFolder.Enums;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Infrastructure.Jobs;

/// <summary>
/// Hangfire job that runs when a quiz deadline is reached (AvailableToUtc).
/// Closes the quiz, sends "Quiz Ended" notifications, and optionally releases results.
/// </summary>
public sealed class QuizAutoCloseJob : IQuizAutoCloseJob, ITransientService
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ResendTemplates _templates;
    private readonly ILogger<QuizAutoCloseJob> _logger;

    public QuizAutoCloseJob(
        IAppDbContext context,
        INotificationService notificationService,
        IOptions<ResendTemplates> templates,
        ILogger<QuizAutoCloseJob> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _templates = templates.Value;
        _logger = logger;
    }

    public async Task ExecuteAsync(Guid quizId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("QuizAutoCloseJob executing for quiz {QuizId}", quizId);

        // Load quiz for closing (needs tracking)
        var quiz = await _context.Quizzes
            .Include(q => q.Course)
            .FirstOrDefaultAsync(q => q.Id == quizId, cancellationToken);

        if (quiz is null)
        {
            _logger.LogWarning("Quiz {QuizId} not found", quizId);
            return;
        }

        if (quiz.Status != QuizStatus.Published)
        {
            _logger.LogInformation("Quiz {QuizId} is not in Published status, skipping close", quizId);
            return;
        }

        // Close the quiz
        var closeResult = quiz.Close();
        if (closeResult.IsFailure)
        {
            _logger.LogWarning("Failed to close quiz {QuizId}: {Error}", quizId, closeResult.TryGetError());
            return;
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Quiz {QuizId} closed successfully", quizId);

        // Get students for notifications in a single query
        var students = await _context.QuizGroups
            .AsNoTracking()
            .Where(qg => qg.QuizId == quizId)
            .SelectMany(qg => qg.Group.Students)
            .Select(gs => new
            {
                gs.Student.Id,
                gs.Student.Email,
                gs.Student.FullName,
                gs.Student.EmailNotifications
            })
            .Distinct()
            .ToListAsync(cancellationToken);

        if (students.Count > 0)
        {
            // Send batch emails to students with email notifications enabled
            var emailStudents = students.Where(s => s.EmailNotifications).ToList();
            if (emailStudents.Count > 0)
            {
                var emails = emailStudents.Select(s => new BatchEmailRequest(
                    To: s.Email,
                    Subject: $"⏰ Quiz Ended: {quiz.Title}",
                    TemplateId: _templates.QuizEnded,
                    Variables: new Dictionary<string, object>
                    {
                        ["StudentName"] = s.FullName,
                        ["QuizTitle"] = quiz.Title,
                        ["CourseName"] = quiz.Course.Title,
                        ["EndedAt"] = DateTimeOffset.UtcNow.ToString("MMMM dd, yyyy 'at' HH:mm 'UTC'"),
                        ["Year"] = DateTime.UtcNow.Year.ToString()
                    }
                )).ToList();

                try
                {
                    await _notificationService.SendBatchEmailsAsync(emails, cancellationToken);
                    _logger.LogInformation("Sent {Count} quiz ended emails for quiz {QuizId}", emails.Count, quizId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send quiz ended emails for quiz {QuizId}", quizId);
                }
            }

            // Create all notifications at once using AddRange
            var notifications = students.Select(s => DomainNotification.Create(
                userId: s.Id,
                title: "Quiz Ended",
                body: $"The quiz '{quiz.Title}' has ended.",
                type: NotificationType.QuizEnded,
                data: new Dictionary<string, string>
                {
                    ["quizId"] = quiz.Id.ToString(),
                    ["courseId"] = quiz.CourseId.ToString()
                }
            )).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Created {Count} quiz ended notifications for quiz {QuizId}", notifications.Count, quizId);
        }

        // If ShowResultsImmediately, grade submissions and release results
        if (quiz.ShowResultsImmediately)
        {
            // Grade all submitted but ungraded submissions
            var ungradedSubmissions = await _context.QuizSubmissions
                .Include(s => s.Answers)
                .Where(s => s.QuizId == quizId && s.Status == SubmissionStatus.Submitted)
                .ToListAsync(cancellationToken);

            foreach (var submission in ungradedSubmissions)
            {
                submission.Grade();
            }

            if (ungradedSubmissions.Count > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Graded {Count} submissions for quiz {QuizId}", ungradedSubmissions.Count, quizId);
            }

            // Release results (triggers QuizResultsReleasedEvent)
            var releaseResult = quiz.ReleaseResults();
            if (releaseResult.IsSuccess)
            {
                await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Released results for quiz {QuizId}", quizId);
            }
        }
    }
}

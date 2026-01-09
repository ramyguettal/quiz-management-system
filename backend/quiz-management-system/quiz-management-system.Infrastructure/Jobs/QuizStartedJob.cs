using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Configuration;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.PushNotifications.Enums;
using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Infrastructure.Jobs;

/// <summary>
/// Hangfire job that runs when a quiz starts (AvailableFromUtc reached).
/// Sends "Quiz Started" notifications to students.
/// </summary>
public sealed class QuizStartedJob : IQuizStartedJob, ITransientService
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ResendTemplates _templates;
    private readonly ILogger<QuizStartedJob> _logger;

    public QuizStartedJob(
        IAppDbContext context,
        INotificationService notificationService,
        IOptions<ResendTemplates> templates,
        ILogger<QuizStartedJob> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _templates = templates.Value;
        _logger = logger;
    }

    public async Task ExecuteAsync(Guid quizId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("QuizStartedJob executing for quiz {QuizId}", quizId);

        // Single optimized query
        var quizData = await _context.Quizzes
            .AsNoTracking()
            .Where(q => q.Id == quizId)
            .Select(q => new
            {
                q.Id,
                q.Title,
                q.CourseId,
                CourseName = q.Course.Title,
                q.Status,
                q.AvailableToUtc,
                Students = q.Groups
                    .SelectMany(qg => qg.Group.Students)
                    .Select(gs => new
                    {
                        gs.Student.Id,
                        gs.Student.Email,
                        gs.Student.FullName,
                        gs.Student.EmailNotifications
                    })
                    .Distinct()
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (quizData is null)
        {
            _logger.LogWarning("Quiz {QuizId} not found", quizId);
            return;
        }

        if (quizData.Status != QuizStatus.Published)
        {
            _logger.LogInformation("Quiz {QuizId} is not in Published status, skipping", quizId);
            return;
        }

        if (quizData.Students.Count == 0)
        {
            _logger.LogInformation("No students for quiz {QuizId}", quizId);
            return;
        }

        // Send batch emails to students with email notifications enabled
        var emailStudents = quizData.Students.Where(s => s.EmailNotifications).ToList();
        if (emailStudents.Count > 0)
        {
            var emails = emailStudents.Select(s => new BatchEmailRequest(
                To: s.Email,
                Subject: $"🚀 Quiz Started: {quizData.Title}",
                TemplateId: _templates.QuizStarted,
                Variables: new Dictionary<string, object>
                {
                    ["StudentName"] = s.FullName,
                    ["QuizTitle"] = quizData.Title,
                    ["CourseName"] = quizData.CourseName,
                    ["EndDate"] = quizData.AvailableToUtc?.ToString("MMMM dd, yyyy 'at' HH:mm 'UTC'") ?? "No deadline",
                    ["QuizLink"] = $"https://quizflow.online/quizzes/{quizData.Id}/start",
                    ["Year"] = DateTime.UtcNow.Year.ToString()
                }
            )).ToList();

            try
            {
                await _notificationService.SendBatchEmailsAsync(emails, cancellationToken);
                _logger.LogInformation("Sent {Count} quiz started emails for quiz {QuizId}", emails.Count, quizId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send quiz started emails for quiz {QuizId}", quizId);
            }
        }

        // Create all notifications at once using AddRange
        var notifications = quizData.Students.Select(s => DomainNotification.Create(
            userId: s.Id,
            title: "Quiz Started!",
            body: $"The quiz '{quizData.Title}' has started. Good luck!",
            type: NotificationType.QuizStarted,
            data: new Dictionary<string, string>
            {
                ["quizId"] = quizData.Id.ToString(),
                ["courseId"] = quizData.CourseId.ToString()
            }
        )).ToList();

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Created {Count} quiz started notifications for quiz {QuizId}", notifications.Count, quizId);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Configuration;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Events;
using quiz_management_system.Domain.PushNotifications.Enums;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Application.EventHandlers;

/// <summary>
/// Handles quiz results released event - sends results notifications to students.
/// </summary>
public sealed class QuizResultsReleasedEventHandler : INotificationHandler<QuizResultsReleasedEvent>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ResendTemplates _templates;
    private readonly ILogger<QuizResultsReleasedEventHandler> _logger;

    public QuizResultsReleasedEventHandler(
        IAppDbContext context,
        INotificationService notificationService,
        IOptions<ResendTemplates> templates,
        ILogger<QuizResultsReleasedEventHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _templates = templates.Value;
        _logger = logger;
    }

    public async Task Handle(QuizResultsReleasedEvent notification, CancellationToken cancellationToken)
    {
        // Single query to get quiz and all graded submissions with student info
        var quizData = await _context.Quizzes
            .AsNoTracking()
            .Where(q => q.Id == notification.QuizId)
            .Select(q => new
            {
                q.Id,
                q.Title,
                CourseName = q.Course.Title
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (quizData is null)
        {
            _logger.LogWarning("Quiz {QuizId} not found for results released event", notification.QuizId);
            return;
        }

        // Get all graded submissions with student info in a single query
        var submissions = await _context.QuizSubmissions
            .AsNoTracking()
            .Where(s => s.QuizId == notification.QuizId && s.Status == SubmissionStatus.Graded)
            .Select(s => new
            {
                s.Id,
                s.StudentId,
                StudentEmail = s.Student.Email,
                StudentName = s.Student.FullName,
                s.Student.EmailNotifications,
                s.ScaledScore,
                s.Percentage
            })
            .ToListAsync(cancellationToken);

        if (submissions.Count == 0)
        {
            _logger.LogInformation("No graded submissions for quiz {QuizId}", notification.QuizId);
            return;
        }

        // Send batch emails to students with email notifications enabled
        var emailSubmissions = submissions.Where(s => s.EmailNotifications).ToList();
        if (emailSubmissions.Count > 0)
        {
            var emails = emailSubmissions.Select(s => new BatchEmailRequest(
                To: s.StudentEmail,
                Subject: $"📊 Your Results for: {quizData.Title}",
                TemplateId: _templates.QuizResultsReleased,
                Variables: new Dictionary<string, object>
                {
                    ["StudentName"] = s.StudentName,
                    ["QuizTitle"] = quizData.Title,
                    ["CourseName"] = quizData.CourseName,
                    ["Score"] = $"{s.ScaledScore:F2}/20",
                    ["Percentage"] = $"{s.Percentage:F1}%",
                    ["ResultsLink"] = $"https://quizflow.online/submissions/{s.Id}/results",
                    ["Year"] = DateTime.UtcNow.Year.ToString()
                }
            )).ToList();

            try
            {
                await _notificationService.SendBatchEmailsAsync(emails, cancellationToken);
                _logger.LogInformation("Sent {Count} results emails for quiz {QuizId}", emails.Count, notification.QuizId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send results emails for quiz {QuizId}", notification.QuizId);
            }
        }

        // Create all domain notifications at once using AddRange
        var notifications = submissions.Select(s => DomainNotification.Create(
            userId: s.StudentId,
            title: "Quiz Results Available",
            body: $"Your results for '{quizData.Title}' are now available. Score: {s.ScaledScore:F2}/20 ({s.Percentage:F1}%)",
            type: NotificationType.QuizResultsReleased,
            data: new Dictionary<string, string>
            {
                ["quizId"] = quizData.Id.ToString(),
                ["submissionId"] = s.Id.ToString(),
                ["score"] = s.ScaledScore.ToString("F2")
            }
        )).ToList();

        await _context.Notifications.AddRangeAsync(notifications,cancellationToken);
        
        // Disable domain events to prevent recursion when saving notifications
        _context.DisableDomainEvents = true;
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        finally
        {
            _context.DisableDomainEvents = false;
        }
        
        _logger.LogInformation("Created {Count} results notifications for quiz {QuizId}", notifications.Count, notification.QuizId);
    }
}

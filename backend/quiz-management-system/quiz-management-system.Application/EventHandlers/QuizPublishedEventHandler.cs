using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Configuration;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Events;
using quiz_management_system.Domain.PushNotifications.Enums;

namespace quiz_management_system.Application.EventHandlers;

/// <summary>
/// Handles quiz published event - schedules background jobs and sends notifications.
/// </summary>
public sealed class QuizPublishedEventHandler : INotificationHandler<QuizPublishedEvent>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ResendTemplates _templates;
    private readonly ILogger<QuizPublishedEventHandler> _logger;

    public QuizPublishedEventHandler(
        IAppDbContext context,
        INotificationService notificationService,
        IBackgroundJobClient backgroundJobClient,
        IOptions<ResendTemplates> templates,
        ILogger<QuizPublishedEventHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _backgroundJobClient = backgroundJobClient;
        _templates = templates.Value;
        _logger = logger;
    }

    public async Task Handle(QuizPublishedEvent notification, CancellationToken cancellationToken)
    {
        // Load quiz with all needed data in a single query
        var quizData = await _context.Quizzes
            .AsNoTracking()
            .Where(q => q.Id == notification.QuizId)
            .Select(q => new
            {
                q.Id,
                q.Title,
                q.CourseId,
                CourseName = q.Course.Title,
                q.CreatedBy,
                q.AvailableFromUtc,
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
            _logger.LogWarning("Quiz {QuizId} not found for published event", notification.QuizId);
            return;
        }

        // Get instructor name
        var instructorName = await _context.Instructors
            .Where(i => i.Id == quizData.CreatedBy)
            .Select(i => i.FullName)
            .FirstOrDefaultAsync(cancellationToken) ?? "Instructor";

        // Schedule QuizStartedJob at AvailableFromUtc
        var startDelay = quizData.AvailableFromUtc - DateTimeOffset.UtcNow;
        if (startDelay > TimeSpan.Zero)
        {
            _backgroundJobClient.Schedule<IQuizStartedJob>(
                job => job.ExecuteAsync(quizData.Id, CancellationToken.None),
                startDelay);
            _logger.LogInformation("Scheduled QuizStartedJob for quiz {QuizId} at {StartTime}", quizData.Id, quizData.AvailableFromUtc);
        }

        // Schedule QuizAutoCloseJob at AvailableToUtc (if set)
        if (quizData.AvailableToUtc.HasValue)
        {
            var closeDelay = quizData.AvailableToUtc.Value - DateTimeOffset.UtcNow;
            if (closeDelay > TimeSpan.Zero)
            {
                _backgroundJobClient.Schedule<IQuizAutoCloseJob>(
                    job => job.ExecuteAsync(quizData.Id, CancellationToken.None),
                    closeDelay);
                _logger.LogInformation("Scheduled QuizAutoCloseJob for quiz {QuizId} at {EndTime}", quizData.Id, quizData.AvailableToUtc);
            }
        }

        if (quizData.Students.Count == 0)
        {
            _logger.LogInformation("No students in assigned groups for quiz {QuizId}", quizData.Id);
            return;
        }

        // Filter students with email notifications and prepare batch emails
        var emailStudents = quizData.Students.Where(s => s.EmailNotifications).ToList();
        if (emailStudents.Count > 0)
        {
            var emails = emailStudents.Select(s => new BatchEmailRequest(
                To: s.Email,
                Subject: $"📚 New Quiz Available: {quizData.Title}",
                TemplateId: _templates.QuizUpcoming,
                Variables: new Dictionary<string, object>
                {
                    ["StudentName"] = s.FullName,
                    ["QuizTitle"] = quizData.Title,
                    ["CourseName"] = quizData.CourseName,
                    ["InstructorName"] = instructorName,
                    ["StartDate"] = quizData.AvailableFromUtc.ToString("MMMM dd, yyyy 'at' HH:mm 'UTC'"),
                    ["EndDate"] = quizData.AvailableToUtc?.ToString("MMMM dd, yyyy 'at' HH:mm 'UTC'") ?? "No deadline",
                    ["Year"] = DateTime.UtcNow.Year.ToString()
                }
            )).ToList();

            try
            {
                await _notificationService.SendBatchEmailsAsync(emails, cancellationToken);
                _logger.LogInformation("Sent {Count} quiz upcoming emails for quiz {QuizId}", emails.Count, quizData.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send quiz upcoming emails for quiz {QuizId}", quizData.Id);
            }
        }

        // Create all domain notifications at once using AddRange
        var notifications = quizData.Students.Select(s => DomainNotification.Create(
            userId: s.Id,
            title: "New Quiz Available",
            body: $"A new quiz '{quizData.Title}' is available in {quizData.CourseName}. Starts on {quizData.AvailableFromUtc:MMM dd, yyyy}.",
            type: NotificationType.QuizUpcoming,
            data: new Dictionary<string, string>
            {
                ["quizId"] = quizData.Id.ToString(),
                ["courseId"] = quizData.CourseId.ToString()
            }
        )).ToList();

        _context.Notifications.AddRange(notifications);
        
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
        
        _logger.LogInformation("Created {Count} quiz upcoming notifications for quiz {QuizId}", notifications.Count, quizData.Id);
    }
}

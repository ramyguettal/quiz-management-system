using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.RecentActivity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.RecentActivities.Queries.GetRecentActivities;

public sealed class GetRecentActivitiesQueryHandler(IAppDbContext db)
    : IRequestHandler<GetRecentActivitiesQuery, Result<CursorPagedResponse<RecentActivityResponse>>>
{
    public async Task<Result<CursorPagedResponse<RecentActivityResponse>>> Handle(
        GetRecentActivitiesQuery request,
        CancellationToken ct)
    {
        // Parse cursor (using CreatedAtUtc as cursor)
        DateTimeOffset cursor;
        if (string.IsNullOrWhiteSpace(request.Cursor))
        {
            cursor = DateTimeOffset.UtcNow;
        }
        else if (!DateTimeOffset.TryParse(request.Cursor, out cursor))
        {
            cursor = DateTimeOffset.UtcNow;
        }

        // Validate and set page size (max 50)
        int size = request.PageSize is <= 0 or > 50 ? 20 : request.PageSize;

        // Build base query
        var query = db.RecentActivities
            .AsNoTracking()
            .Where(a => a.CreatedAtUtc < cursor);

        // Apply activity type filter if provided
        if (request.ActivityType.HasValue)
        {
            query = query.Where(a => a.ActivityType == request.ActivityType.Value);
        }

        // Get activities ordered by most recent first
        var activities = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .ThenByDescending(a => a.Id)
            .Take(size)
            .ToListAsync(ct);

        // Handle empty results
        if (activities.Count == 0)
        {
            return Result.Success(
                new CursorPagedResponse<RecentActivityResponse>(
                    Items: Array.Empty<RecentActivityResponse>(),
                    NextCursor: null,
                    HasNextPage: false));
        }

        // Map to response DTOs
        var now = DateTimeOffset.UtcNow;
        var items = activities.Select(a => new RecentActivityResponse(
            a.Id,
            a.ActivityType,
            FormatActivityTypeName(a.ActivityType),
            a.Description,
            a.PerformedById,
            a.PerformedByName,
            a.PerformedByRole,
            a.TargetEntityId,
            a.TargetEntityType,
            a.TargetEntityName,
            a.CreatedAtUtc,
            FormatTimeAgo(a.CreatedAtUtc, now)
        )).ToList();

        // Calculate next cursor
        string? nextCursor = activities.Count == size
            ? activities.Last().CreatedAtUtc.ToString("o")
            : null;

        // Build response
        return Result.Success(
            new CursorPagedResponse<RecentActivityResponse>(
                Items: items,
                NextCursor: nextCursor,
                HasNextPage: nextCursor is not null));
    }

    /// <summary>
    /// Formats the activity type enum to a human-readable name.
    /// </summary>
    private static string FormatActivityTypeName(Domain.Common.ActivityType type)
    {
        return type switch
        {
            Domain.Common.ActivityType.StudentCreated => "Student Created",
            Domain.Common.ActivityType.InstructorCreated => "Instructor Created",
            Domain.Common.ActivityType.AdminCreated => "Admin Created",
            Domain.Common.ActivityType.UserDeactivated => "User Deactivated",
            Domain.Common.ActivityType.UserActivated => "User Activated",
            Domain.Common.ActivityType.QuizCreated => "Quiz Created",
            Domain.Common.ActivityType.QuizUpdated => "Quiz Updated",
            Domain.Common.ActivityType.QuizPublished => "Quiz Published",
            Domain.Common.ActivityType.QuizDeleted => "Quiz Deleted",
            Domain.Common.ActivityType.InstructorCoursesUpdated => "Instructor Courses Updated",
            _ => type.ToString()
        };
    }

    /// <summary>
    /// Formats a DateTimeOffset to a human-readable "time ago" string.
    /// </summary>
    private static string FormatTimeAgo(DateTimeOffset dateTime, DateTimeOffset now)
    {
        var timeSpan = now - dateTime;

        if (timeSpan.TotalSeconds < 60)
            return "just now";
        if (timeSpan.TotalMinutes < 60)
        {
            int minutes = (int)timeSpan.TotalMinutes;
            return minutes == 1 ? "1 minute ago" : $"{minutes} minutes ago";
        }
        if (timeSpan.TotalHours < 24)
        {
            int hours = (int)timeSpan.TotalHours;
            return hours == 1 ? "1 hour ago" : $"{hours} hours ago";
        }
        if (timeSpan.TotalDays < 7)
        {
            int days = (int)timeSpan.TotalDays;
            return days == 1 ? "1 day ago" : $"{days} days ago";
        }
        if (timeSpan.TotalDays < 30)
        {
            int weeks = (int)(timeSpan.TotalDays / 7);
            return weeks == 1 ? "1 week ago" : $"{weeks} weeks ago";
        }
        if (timeSpan.TotalDays < 365)
        {
            int months = (int)(timeSpan.TotalDays / 30);
            return months == 1 ? "1 month ago" : $"{months} months ago";
        }

        int years = (int)(timeSpan.TotalDays / 365);
        return years == 1 ? "1 year ago" : $"{years} years ago";
    }
}

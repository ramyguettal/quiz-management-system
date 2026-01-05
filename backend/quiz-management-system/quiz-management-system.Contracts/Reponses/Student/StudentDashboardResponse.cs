using quiz_management_system.Contracts.Requests.Student;

namespace quiz_management_system.Contracts.Reponses.Student;

public sealed record StudentDashboardResponse(
    StudentDashboardStats Stats,
    List<AvailableQuizResponse> AvailableQuizzes,
    List<RecentNotificationResponse> RecentNotifications
);

// Top stats cards
public sealed record StudentDashboardStats(
    int ActiveQuizzes,           // Ready to take (Published + Active)
    int CompletedQuizzes,        // Total attempts submitted/graded
    decimal AverageScore,        // Average percentage across all graded submissions
    string AverageScoreChange,   // e.g., "+7%" or "-3%"
    int UnreadNotifications      // Count of unread notifications
);

// Available quiz item
public sealed record AvailableQuizResponse(
    Guid Id,
    string Title,
    string InstructorName,
    TimeQuizStatus Status,               // "Active", "Upcoming"
    DateTimeOffset Deadline,     // AvailableToUtc or AvailableFromUtc
    bool CanStart                // True if Active, false if Upcoming
);

// Recent notification item
public sealed record RecentNotificationResponse(
    Guid Id,
    string Title,
    string Body,
    DateTimeOffset CreatedAt              // e.g., "2 hours ago", "1 day ago"
);
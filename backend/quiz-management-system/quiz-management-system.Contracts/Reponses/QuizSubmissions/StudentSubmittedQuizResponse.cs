using quiz_management_system.Contracts.Requests.UserSubmissions;

namespace quiz_management_system.Contracts.Reponses.QuizSubmissions;

/// <summary>
/// Lightweight response for a student's quiz submission (in-progress or submitted).
/// </summary>
public sealed record StudentSubmittedQuizResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    string CourseName,
    string? InstructorName,
    DateTimeOffset AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    DateTimeOffset? SubmittedAtUtc,
    DateTimeOffset StartedAtUtc,
    SubmissionStatusFilter Status,
    bool IsReleased,
    decimal? ScaledScore,
    decimal? Percentage
);

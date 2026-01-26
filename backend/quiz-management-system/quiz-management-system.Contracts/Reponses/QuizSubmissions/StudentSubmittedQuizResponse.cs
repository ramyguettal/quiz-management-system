namespace quiz_management_system.Contracts.Reponses.QuizSubmissions;

/// <summary>
/// Lightweight response for a student's submitted quiz.
/// </summary>
public sealed record StudentSubmittedQuizResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    string CourseName,
    string? InstructorName,
    DateTimeOffset AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    DateTimeOffset SubmittedAtUtc,
    bool IsReleased,
    decimal? ScaledScore,
    decimal? Percentage
);

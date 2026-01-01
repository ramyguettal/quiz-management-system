namespace quiz_management_system.Contracts.Requests.Quiz;

public record CreateQuizRequest(
    Guid CourseId,
    string Title,
    string Description,
    DateTimeOffset AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    bool ShuffleQuestions,
    bool ShowResultsImmediately,
    bool AllowEditAfterSubmission,
    List<Guid> GroupIds
);

namespace quiz_management_system.Contracts.Requests.Quiz;

public record UpdateQuizRequest(
    string Title,
    string Description,
    DateTimeOffset AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    bool ShuffleQuestions,
    bool ShowResultsImmediately,
    bool AllowEditAfterSubmission,
    List<Guid> GroupIds
);

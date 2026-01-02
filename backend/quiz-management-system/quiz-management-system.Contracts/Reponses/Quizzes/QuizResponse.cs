using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Contracts.Reponses.Quizzes;

public record QuizResponse(
    Guid Id,
    string Title,
    string Description,
    Guid CourseId,
    string CourseName,
    DateTimeOffset AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    bool ShuffleQuestions,
    bool ShowResultsImmediately,
    bool AllowEditAfterSubmission,
    string Status,
    bool ResultsReleased,
    List<QuestionDto> Questions,
    List<GroupResponse> Groups,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset LastModifiedUtc
);


public record QuestionDto(
    Guid Id,
    string Type,
    string Text,
    int Points,
    int Order,
    bool? ShuffleOptions, // For MultipleChoice
    List<OptionDto>? Options, // For MultipleChoice
    string? ExpectedAnswer // For ShortAnswer
);

public record OptionDto(
    Guid Id,
    string Text,
    bool IsCorrect
);

public record GroupResponse(
    Guid Id,
    string GroupNumber
);


public sealed record QuizListItemResponse(
    Guid Id,
    string Title,
    string? Description,
    Guid CourseId,
    string CourseName,
    string? AcademicYearName,
    DateTimeOffset? AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    QuizStatus Status,
    bool ResultsReleased,
    int QuestionCount,
    int GroupCount,
    IReadOnlyList<GroupResponse> Groups,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? LastModifiedUtc
);




public record QuizListItemMiniResponse(
    DateTimeOffset StartTime,
    DateTimeOffset EndTime,
    DateTimeOffset CreatedOn,
    QuizStatus Status,        // Published, Draft, Closed
    int QuestionsCount,
    int AttemptsCount
);

public record CourseQuizzesOverview(
    Guid CourseId,
    string Title,
    string Description,
    string Code,
    List<QuizListItemMiniResponse> Quizzes
);
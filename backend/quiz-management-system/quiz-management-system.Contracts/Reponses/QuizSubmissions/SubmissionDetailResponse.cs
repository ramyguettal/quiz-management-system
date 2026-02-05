using quiz_management_system.Contracts.Requests;

namespace quiz_management_system.Contracts.Reponses.QuizSubmissions;


public record SubmissionDetailResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    Guid StudentId,
    string StudentName,
    DateTimeOffset StartedAtUtc,
    string Status,
    decimal MaxScore,
    List<AnswerDto> Answers
);

public record AnswerDto(
    Guid AnswerId,
    Guid QuestionId,
    string QuestionType, // "MultipleChoice" or "ShortAnswer"
    DateTimeOffset AnsweredAtUtc,
    List<Guid>? SelectedOptionIds, // For MultipleChoice (can be multiple)
    string? AnswerText // For ShortAnswer
);

// ============================================================
// SUBMISSION RESULT RESPONSE (After grading)
// ============================================================

public record SubmissionResultResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    Guid StudentId,
    string StudentName,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset SubmittedAtUtc,
    DateTimeOffset GradedAtUtc,
    decimal RawScore,
    decimal MaxScore,
    decimal ScaledScore, // Out of 20
    decimal Percentage,
    List<AnswerResultDto> AnswerResults
);

public record AnswerResultDto(
    Guid QuestionId,
    string QuestionText,
    string QuestionType,
    int QuestionOrder,
    int QuestionPoints,
    decimal PointsEarned,
    bool IsCorrect,
    // For Multiple Choice - ALL options with full details
    List<OptionResultDetail>? AllOptions,
    List<Guid>? SelectedOptionIds,
    List<Guid>? CorrectOptionIds,
    // For Short Answer
    string? StudentAnswerText,
    decimal? SimilarityScore,
    string? ExpectedAnswerText
);

public record OptionResultDetail(
    Guid OptionId,
    string OptionText,
    bool IsCorrect,
    bool IsSelected
);

// ============================================================
// SUBMISSION EDIT RESPONSE (Quiz with pre-filled answers)
// ============================================================

public record SubmissionEditResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    string QuizDescription,
    DateTimeOffset StartedAtUtc,
    bool AllowEditAfterSubmission,
    List<QuestionWithAnswerDto> Questions
);

public record QuestionWithAnswerDto(
    Guid QuestionId,
    string QuestionType,
    string Text,
    int Points,
    int Order,
    List<StudentOptionDto>? Options, // For MultipleChoice
    string? ExpectedAnswer, // For ShortAnswer (for instructor view only)

    List<Guid>? CurrentSelectedOptionIds, // For MultipleChoice (can be multiple)
    string? CurrentAnswerText // For ShortAnswer
);
